<?php
// controllers/CareInstructionController.php

require_once './models/Care/CareInstruction.php';

class CareInstructionController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CareInstruction($pdo);
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
}