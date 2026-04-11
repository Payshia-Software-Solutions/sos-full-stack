<?php
// controllers/EnWordSubmissionController.php

require_once './models/EnWordSubmission.php';
require_once './models/WordList.php';

class EnWordSubmissionController
{
    private $model;
    private $wordModel;

    public function __construct($pdo)
    {
        $this->model = new EnWordSubmission($pdo);
        $this->wordModel = new WordList($pdo);
    }

    public function getSubmissions()
    {
        $data = $this->model->getAllSubmissions();
        echo json_encode($data);
    }

    public function getSubmission($id)
    {
        $data = $this->model->getSubmissionById($id);
        if ($data) {
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Submission not found']);
        }
    }

    public function getByStudent($student_number)
    {
        $data = $this->model->getSubmissionsByStudent($student_number);
        echo json_encode($data);
    }

    public function getByStudentGrades($student_number)
    {
        $data = $this->model->getCorrectAndIncorrectCounts($student_number);
        $activeWords = $this->wordModel->getActiveAllWords();

        if ($data && isset($data['correct_count'])) {
            // Count correct submissions by word_id
            $correct_count = $data['correct_count'];
            $incorrect_count = $data['incorrect_count'];

            $totalWords = 0;
            foreach ($activeWords as $word) {
                $type = $word['word_type'];

                if ($type === 'Basic') {
                    $totalWords += 10;
                } elseif ($type === 'Intermediate') {
                    $totalWords += 15;
                } elseif ($type === 'Advanced') {
                    $totalWords += 20;
                } else {
                    $masteredCount = 0; // Default value if type is not recognized
                }
            }

            $grade = $totalWords > 0 ? ($correct_count / $totalWords)  : 0;

            // Build response
            $response = [
                'total_words' => (int) $totalWords,
                'correct_count' => (int) $correct_count,
                'incorrect_count' => (int) $incorrect_count,
                'grade' => round((float) $grade, 2),
            ];

            echo json_encode($response);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No submissions found for this student']);
        }
    }


    public function createSubmission()
    {
        $data = $_POST;

        $requiredFields = ['word_id', 'student_number', 'atttempt_value', 'correct_status', 'created_by'];
        $missing = [];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) $missing[] = $field;
        }

        if (!empty($missing)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields', 'fields' => $missing]);
            return;
        }

        $id = $this->model->createSubmission(
            $data['word_id'],
            $data['student_number'],
            $data['atttempt_value'],
            $data['correct_status'],
            $data['created_by']
        );

        http_response_code(201);
        echo json_encode(['message' => 'Submission created', 'id' => $id]);
    }

    public function deleteSubmission($id)
    {
        $deleted = $this->model->deleteSubmission($id);
        if ($deleted) {
            echo json_encode(['message' => 'Submission deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Submission not found']);
        }
    }

    public function submitAnswer()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $wordId = $_POST['word_id'] ?? null;
            $studentNumber = $_POST['student_number'] ?? null;
            $attemptValue = $_POST['attempt_value'] ?? null;
            $createdBy = $_POST['created_by'] ?? 'system';

            if (!$wordId || !$studentNumber) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Missing required fields.'
                ]);
                return;
            }

            // Fetch the correct word from DB
            $word = $this->wordModel->getWordById($wordId);
            if (!$word) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Word not found.'
                ]);
                return;
            }

            $correctAnswer = trim(strtolower($word['word_name']));
            $submittedAnswer = trim(strtolower($attemptValue));

            $correctStatus = ($correctAnswer === $submittedAnswer) ? 'Correct' : 'Incorrect';

            $data = [
                'word_id' => $wordId,
                'student_number' => $studentNumber,
                'atttempt_value' => $attemptValue,
                'correct_status' => $correctStatus,
                'created_by' => $createdBy
            ];
            // Save to submission table
            $saved = $this->model->createSubmission(
                $data['word_id'],
                $data['student_number'],
                $data['atttempt_value'],
                $data['correct_status'],
                $data['created_by']
            );

            if ($saved) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Answer submitted successfully.',
                    'correct_status' => $correctStatus
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Failed to submit answer.'
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid request method.'
            ]);
        }
    }
}
