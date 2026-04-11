<?php
// controllers/ceylonPharmacy/CareInstructionController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CareInstruction.php';

class CareInstructionController
{
    private $careInstructionModel;

    public function __construct($pdo)
    {
        $this->careInstructionModel = new CareInstruction($pdo);
    }

    public function getAll()
    {
        $instructions = $this->careInstructionModel->getAllCareInstructions();
        echo json_encode($instructions);
    }

    public function getById($id)
    {
        $instruction = $this->careInstructionModel->getCareInstructionById($id);
        if ($instruction) {
            echo json_encode($instruction);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Instruction not found']);
        }
    }
    public function getInstructionsByPrescriptionAndCover($presCode, $coverId)
    {
        $instructions = $this->careInstructionModel->getInstructionsByPrescriptionAndCover($presCode, $coverId);
        if ($instructions) {
            echo json_encode($instructions);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Instructions not found']);
        }
    }

    public function getShuffledInstructions($presCode, $coverId)
    {
        $correctInstructions = $this->careInstructionModel->getInstructionsByPrescriptionAndCover($presCode, $coverId);
        $wrongInstructions = $this->careInstructionModel->getWrongInstructions($coverId);

        $allInstructions = array_merge($correctInstructions, $wrongInstructions);
        shuffle($allInstructions);

        echo json_encode($allInstructions);
    }


    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['pres_code'], $data['cover_id'], $data['instructions']) && is_array($data['instructions'])) {
            $newInstructionIds = $this->careInstructionModel->createCareInstruction($data);
            if ($newInstructionIds !== false) {
                http_response_code(201);
                echo json_encode([
                    'message' => 'Instructions created/updated successfully',
                    'inserted_ids' => $newInstructionIds
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create instructions']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input. pres_code, cover_id, and an array of instructions are required.']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $this->careInstructionModel->updateCareInstruction($id, $data);
            echo json_encode(['message' => 'Instruction updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careInstructionModel->deleteCareInstruction($id);
        echo json_encode(['message' => 'Instruction deleted successfully']);
    }
}
