<?php
// controllers/ceylonPharmacy/CareInstructionPreController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CareInstructionPre.php';

class CareInstructionPreController
{
    private $careInstructionPreModel;

    public function __construct($pdo)
    {
        $this->careInstructionPreModel = new CareInstructionPre($pdo);
    }

    public function getAll()
    {
        $instructions = $this->careInstructionPreModel->getAll();
        echo json_encode($instructions);
    }

    public function getById($id)
    {
        $instruction = $this->careInstructionPreModel->getById($id);
        if ($instruction) {
            echo json_encode($instruction);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Instruction not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $lastId = $this->careInstructionPreModel->create($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Instruction created successfully',
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
            $this->careInstructionPreModel->update($id, $data);
            echo json_encode(['message' => 'Instruction updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careInstructionPreModel->delete($id);
        echo json_encode(['message' => 'Instruction deleted successfully']);
    }
}
