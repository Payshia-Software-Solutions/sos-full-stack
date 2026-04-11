<?php
// controllers/CareInstructionPreController.php

require_once './models/Care/CareInstructionPre.php';
require_once './models/Care/CareInstruction.php';

class CareInstructionPreController
{
    private $model;
    private $CareInstructionModel;

    public function __construct($pdo)
    {
        $this->model = new CareInstructionPre($pdo);
        $this->CareInstructionModel = new CareInstruction($pdo);
    }

    public function getCareInstructions()
    {
        $instructions = $this->model->getAllCareInstructions();
        echo json_encode($instructions);
    }

    public function getCareInstruction($id)
    {
        $instruction = $this->model->getCareInstructionById($id);
        echo json_encode($instruction);
    }

    public function createCareInstruction()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createCareInstruction($data);
        echo json_encode(['status' => 'Care instruction created']);
    }

    public function updateCareInstruction($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateCareInstruction($id, $data);
        echo json_encode(['status' => 'Care instruction updated']);
    }

    public function deleteCareInstruction($id)
    {
        $this->model->deleteCareInstruction($id);
        echo json_encode(['status' => 'Care instruction deleted']);
    }

    public function getInstructionsByRole($role)
    {
        if ($role === 'Admin') {
            // Admin role: get all care_instruction_pre
            $instructions = $this->model->getAllCareInstructions();
        } elseif ($role === 'Student') {
            // Student role: get all correct answers and 5 wrong answers
            $result = $this->CareInstructionModel->getAllCorrectAndWrongInstructions(5);
    
            $instructionsPre = $result['instructionsPre']; // Correct answers from care_instruction
            $instructionsWrong = $result['instructionsWrong']; // 5 wrong answers
    
            // Combine and shuffle
            $instructions = array_merge($instructionsPre, $instructionsWrong);
            shuffle($instructions);
    
            // Remove duplicates by 'id'
            $instructions = $this->removeDuplicateInstructionsById($instructions);
        } else {
            // Invalid role
            echo json_encode(['error' => 'Invalid role']);
            return;
        }
    
        echo json_encode($instructions);
    }

    public function getCorrectInstructions()
    {
        $result = $this->CareInstructionModel->getAllCorrectAndWrongInstructions(5);
        $instructionsPre = $result['instructionsPre']; // Correct answers from care_instruction
        $uniqueInstructions = $this->removeDuplicateInstructionsById($instructionsPre);

        echo json_encode($uniqueInstructions);
    } 
    
    private function removeDuplicateInstructionsById($instructions)
    {
        $uniqueInstructions = [];
        $ids = [];
    
        foreach ($instructions as $instruction) {
            if (!in_array($instruction['id'], $ids)) {
                $uniqueInstructions[] = $instruction;
                $ids[] = $instruction['id']; // Store 'id' to avoid duplicates
            }
        }
    
        return $uniqueInstructions;
    }
}