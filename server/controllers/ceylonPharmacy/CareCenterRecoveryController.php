<?php
// controllers/ceylonPharmacy/CareCenterRecoveryController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CareCenterRecovery.php';

class CareCenterRecoveryController
{
    private $careCenterRecoveryModel;

    public function __construct($pdo)
    {
        $this->careCenterRecoveryModel = new CareCenterRecovery($pdo);
    }

    public function getAll()
    {
        $recoveries = $this->careCenterRecoveryModel->getAllCareCenterRecoveries();
        echo json_encode($recoveries);
    }

    public function getById($id)
    {
        $recovery = $this->careCenterRecoveryModel->getCareCenterRecoveryById($id);
        if ($recovery) {
            echo json_encode($recovery);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Recovery not found']);
        }
    }
    public function getByStudentNumber($studentNumber)
    {
        $recoveries = $this->careCenterRecoveryModel->getCareCenterRecoveriesByStudentNumber($studentNumber);
        if ($recoveries) {
            echo json_encode($recoveries);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Recoveries not found for this student']);
        }
    }


    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $lastId = $this->careCenterRecoveryModel->createCareCenterRecovery($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Recovery created successfully',
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
            $this->careCenterRecoveryModel->updateCareCenterRecovery($id, $data);
            echo json_encode(['message' => 'Recovery updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careCenterRecoveryModel->deleteCareCenterRecovery($id);
        echo json_encode(['message' => 'Recovery deleted successfully']);
    }
}
