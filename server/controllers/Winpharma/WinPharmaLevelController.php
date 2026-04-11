<?php
// controllers/Winpharma/WinPharmaLevelController.php

require_once './models/Winpharma/WinPharmaLevel.php';

class WinPharmaLevelController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new WinPharmaLevel($pdo);
    }

    public function getWinPharmaLevels()
    {
        $WinPharmaLevels = $this->model->getAllWinPharmaLevels();
        echo json_encode($WinPharmaLevels);
    }

    public function getWinPharmaLevel($id)
    {
        $WinPharmaLevel = $this->model->getWinPharmaLevelById($id);
        echo json_encode($WinPharmaLevel);
    }
    
    public function createWinPharmaLevel()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createWinPharmaLevel($data);
        echo json_encode(['status' => 'WinPharmaLevel created']);
    }

    public function updateWinPharmaLevel($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateWinPharmaLevel($id, $data);
        echo json_encode(['status' => 'WinPharmaLevel updated']);
    }

    public function deleteWinPharmaLevel($id)
    {
        $this->model->deleteWinPharmaLevel($id);
        echo json_encode(['status' => 'WinPharmaLevel deleted']);
    }

    public function getWinPharmaLevelsByCourse($courseCode)
    {
        $levels = $this->model->getWinPharmaLevelsByCourse($courseCode);
        echo json_encode($levels);
    }
}