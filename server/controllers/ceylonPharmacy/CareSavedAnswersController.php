<?php
// controllers/ceylonPharmacy/CareSavedAnswersController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CareSavedAnswers.php';

class CareSavedAnswersController
{
    private $careSavedAnswersModel;

    public function __construct($pdo)
    {
        $this->careSavedAnswersModel = new CareSavedAnswers($pdo);
    }

    public function getAll()
    {
        $answers = $this->careSavedAnswersModel->getAllCareSavedAnswers();
        echo json_encode($answers);
    }

    public function getById($id)
    {
        $answer = $this->careSavedAnswersModel->getCareSavedAnswersById($id);
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
            $lastId = $this->careSavedAnswersModel->createCareSavedAnswers($data);
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
            $this->careSavedAnswersModel->updateCareSavedAnswers($id, $data);
            echo json_encode(['message' => 'Answer updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careSavedAnswersModel->deleteCareSavedAnswers($id);
        echo json_encode(['message' => 'Answer deleted successfully']);
    }
}
