<?php

require_once __DIR__ . '/../models/SentenceBuilderStudentAnswer.php';

class SentenceBuilderStudentAnswerController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new SentenceBuilderStudentAnswer($pdo);
    }

    public function getAll()
    {
        $answers = $this->model->getAll();
        echo json_encode($answers);
    }

    public function getById($id)
    {
        $answer = $this->model->getById($id);
        echo json_encode($answer);
    }

    public function getByStudentNumber($student_number)
    {
        $answers = $this->model->getByStudentNumber($student_number);
        if ($answers) {
            echo json_encode($answers);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Answers not found for this student']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['student_number']) && isset($data['sentence_id']) && isset($data['submitted_answer']) && isset($data['is_correct'])) {
            try {
                $id = $this->model->create($data);
                http_response_code(201);
                echo json_encode(['id' => $id, 'message' => 'Record created successfully']);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['student_number']) && isset($data['sentence_id']) && isset($data['submitted_answer']) && isset($data['is_correct'])) {
            try {
                $this->model->update($id, $data);
                echo json_encode(['message' => 'Record updated successfully']);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        try {
            $this->model->delete($id);
            echo json_encode(['message' => 'Record deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
