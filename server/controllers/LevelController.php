<?php
// controllers/LevelController.php

require_once './models/Levels.php';


class LevelController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Levels($pdo);
    }

    public function getLevels()
    {
        $appointments = $this->model->GetAllLevels();
        echo json_encode($appointments);
    }

    public function getLevelById($id)
    {
        $appointment = $this->model->getLevelById($id);
        echo json_encode($appointment);
    }

    public function createLevel()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createLevel($data);
        echo json_encode(['status' => 'Level created']);
    }

    public function updateLevel($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateLevel($id, $data);
        echo json_encode(['status' => 'Level updated']);
    }

    public function deleteLevel($id)
    {
        $this->model->deleteLevel($id);
        echo json_encode(['status' => 'Level deleted']);
    }
}