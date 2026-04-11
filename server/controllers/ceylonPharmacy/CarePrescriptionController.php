<?php
// controllers/ceylonPharmacy/CarePrescriptionController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CarePrescription.php';

class CarePrescriptionController
{
    private $carePrescriptionModel;

    public function __construct($pdo)
    {
        $this->carePrescriptionModel = new CarePrescription($pdo);
    }

    public function getAll()
    {
        $prescriptions = $this->carePrescriptionModel->getAllCarePrescriptions();
        echo json_encode($prescriptions);
    }

    public function getById($id)
    {
        $prescription = $this->carePrescriptionModel->getCarePrescriptionById($id);
        if ($prescription) {
            echo json_encode($prescription);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Prescription not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $lastId = $this->carePrescriptionModel->createCarePrescription($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Prescription created successfully',
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
            $this->carePrescriptionModel->updateCarePrescription($id, $data);
            echo json_encode(['message' => 'Prescription updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->carePrescriptionModel->deleteCarePrescription($id);
        echo json_encode(['message' => 'Prescription deleted successfully']);
    }
}
