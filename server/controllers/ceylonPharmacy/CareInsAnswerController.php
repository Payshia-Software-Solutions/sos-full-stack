<?php
// controllers/ceylonPharmacy/CareInsAnswerController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CareInsAnswer.php';

class CareInsAnswerController
{
    private $careInsAnswerModel;

    public function __construct($pdo)
    {
        $this->careInsAnswerModel = new CareInsAnswer($pdo);
    }

    public function getAll()
    {
        $answers = $this->careInsAnswerModel->getAll();
        echo json_encode($answers);
    }

    public function getById($id)
    {
        $answer = $this->careInsAnswerModel->getById($id);
        if ($answer) {
            echo json_encode($answer);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Answer not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $lastId = $this->careInsAnswerModel->create($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Answer created successfully',
                'id' => $lastId
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $this->careInsAnswerModel->update($id, $data);
            echo json_encode(['message' => 'Answer updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careInsAnswerModel->delete($id);
        echo json_encode(['message' => 'Answer deleted successfully']);
    }

    public function findCorrectSubmission($studentNumber, $presCode, $coverCode)
    {
        $submission = $this->careInsAnswerModel->findCorrectSubmission($studentNumber, $presCode, $coverCode);
        if ($submission) {
            echo json_encode($submission);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No correct submission found']);
        }
    }
}
