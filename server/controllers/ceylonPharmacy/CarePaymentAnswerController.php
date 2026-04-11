<?php
// controllers/ceylonPharmacy/CarePaymentAnswerController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CarePaymentAnswer.php';

class CarePaymentAnswerController
{
    private $carePaymentAnswerModel;

    public function __construct($pdo)
    {
        $this->carePaymentAnswerModel = new CarePaymentAnswer($pdo);
    }

    public function getAll()
    {
        $answers = $this->carePaymentAnswerModel->getAllCarePaymentAnswers();
        echo json_encode($answers);
    }

    public function getById($id)
    {
        $answer = $this->carePaymentAnswerModel->getCarePaymentAnswerById($id);
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
            $lastId = $this->carePaymentAnswerModel->createCarePaymentAnswer($data);
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
            $this->carePaymentAnswerModel->updateCarePaymentAnswer($id, $data);
            echo json_encode(['message' => 'Answer updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->carePaymentAnswerModel->deleteCarePaymentAnswer($id);
        echo json_encode(['message' => 'Answer deleted successfully']);
    }

    public function getCorrectAnswers($presCode, $studentId)
    {
        $answers = $this->carePaymentAnswerModel->getCorrectAnswers($presCode, $studentId);
        echo json_encode($answers);
    }
}
