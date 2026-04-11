<?php
// controllers/Winpharma/WinpharmaCommonReasonController.php

require_once './models/Winpharma/WinpharmaCommonReason.php';


class WinpharmaCommonReasonController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new WinpharmaCommonReason($pdo);
    }

    public function getWinpharmaCommonReasons()
    {
        $WinpharmaCommonReasons = $this->model->getAllWinpharmaCommonReasons();
        echo json_encode($WinpharmaCommonReasons);
    }

    public function getWinpharmaCommonReason($id)
    {
        $WinpharmaCommonReason = $this->model->getWinpharmaCommonReasonById($id);
        echo json_encode($WinpharmaCommonReason);
    }
    
    public function createWinpharmaCommonReason()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createWinpharmaCommonReason($data);
        echo json_encode(['status' => 'WinpharmaCommonReason created']);
    }

    public function updateWinpharmaCommonReason($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateWinpharmaCommonReason($id, $data);
        echo json_encode(['status' => 'WinpharmaCommonReason updated']);
    }

    public function deleteWinpharmaCommonReason($id)
    {
        $this->model->deleteWinpharmaCommonReason($id);
        echo json_encode(['status' => 'WinpharmaCommonReason deleted']);
    }
}