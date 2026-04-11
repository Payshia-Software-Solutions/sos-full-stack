<?php
require_once __DIR__ . '/../../models/ceylonPharmacy/CareAnswerSubmit.php';
require_once __DIR__ . '/../../models/ceylonPharmacy/CareAnswer.php';

class CareAnswerSubmitController
{
    private $pdo;
    private $careAnswerSubmitModel;
    private $careAnswerModel;

    public function __construct($pdo)
    {
        $this->careAnswerSubmitModel = new CareAnswerSubmit($pdo);
        $this->careAnswerModel = new CareAnswer($pdo);
    }

    public function findCorrectSubmission($studentNumber, $presId, $coverId)
    {
        $submission = $this->careAnswerSubmitModel->findCorrectSubmission($coverId, $presId, $studentNumber);
        if ($submission) {
            echo json_encode($submission);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No correct submission found']);
        }
    }

    public function getAll()
    {
        $submits = $this->careAnswerSubmitModel->getAllCareAnswerSubmits();
        echo json_encode($submits);
    }

    public function getById($id)
    {
        $submit = $this->careAnswerSubmitModel->getCareAnswerSubmitById($id);
        if ($submit) {
            echo json_encode($submit);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Submit not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['answer_id'] = $this->careAnswerSubmitModel->generateNewAnswerId();
            $lastId = $this->careAnswerSubmitModel->createCareAnswerSubmit($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Submit created successfully',
                'id' => $lastId
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function validateAndCreate()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
            return;
        }

        $loggedUser = $data['created_by'];
        $userLevel = $data['user_level'];
        $prescriptionID = $data['pres_id'];
        $coverID = $data['cover_id'];

        if ($userLevel !== "Student") {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Access Denied']);
            return;
        }

        $correctAnswer = $this->careAnswerModel->getAnswerByPrescriptionAndCover($prescriptionID, $coverID);

        $incorrectFields = [];
        if ($correctAnswer) {
            // Iterate over the correct answer fields to ensure all are checked
            foreach ($correctAnswer as $field => $correctValue) {
                // Skip fields that should not be compared from the submission
                if ($field === 'id' || $field === 'answer_id' || $field === 'created_at' || $field === 'created_by') {
                    continue;
                }

                // Check if the field is missing in the submission or if the value doesn't match
                if (!isset($data[$field]) || $data[$field] != $correctValue) {
                    $incorrectFields[] = $field;
                }
            }
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'No correct answer found to validate against.']);
            return;
        }


        if (empty($incorrectFields)) {
            $data['answer_status'] = "Correct";
            $data['score'] = 10;
        } else {
            $data['answer_status'] = "In-Correct";
            $data['score'] = -1;
        }

        $existingCorrect = $this->careAnswerSubmitModel->findCorrectSubmission($coverID, $prescriptionID, $loggedUser);

        if ($existingCorrect) {
            http_response_code(409); // Conflict
            echo json_encode(['status' => 'error', 'message' => 'Already Saved Correct Attempt']);
            return;
        }

        $data['created_at'] = date('Y-m-d H:i:s');
        $data['answer_id'] = $this->careAnswerSubmitModel->generateNewAnswerId();

        // Remove user_level before inserting into the database to prevent the error
        unset($data['user_level']);

        $newId = $this->careAnswerSubmitModel->createCareAnswerSubmit($data);

        if ($newId) {
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Answer Saved',
                'id' => $newId,
                'incorrect_values' => $incorrectFields,
                'answer_status' => $data['answer_status']
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Something went wrong. Please try again later.',
                'incorrect_values' => $incorrectFields,
                'answer_status' => $data['answer_status']
            ]);
        }
    }


    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $this->careAnswerSubmitModel->updateCareAnswerSubmit($id, $data);
            echo json_encode(['message' => 'Submit updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careAnswerSubmitModel->deleteCareAnswerSubmit($id);
        echo json_encode(['message' => 'Submit deleted successfully']);
    }
}
