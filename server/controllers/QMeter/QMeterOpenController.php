<?php
// controllers/QMeter/QMeterOpenController.php

require_once './models/QMeter/QMeterOpen.php';

class QMeterOpenController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new QMeterOpen($pdo);
    }

    public function getQMeterOpenList()
    {
        $qMeterOpenList = $this->model->getAllQMeterOpen();
        echo json_encode($qMeterOpenList);
    }

    public function getQMeterOpen($id)
    {
        $qMeterOpen = $this->model->getQMeterOpenById($id);
        echo json_encode($qMeterOpen);
    }

    public function createQMeterOpen()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createQMeterOpen($data);
        echo json_encode(['status' => 'QMeterOpen entry created']);
    }

    public function updateQMeterOpen($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateQMeterOpen($id, $data);
        echo json_encode(['status' => 'QMeterOpen entry updated']);
    }

    public function deleteQMeterOpen($id)
    {
        $this->model->deleteQMeterOpen($id);
        echo json_encode(['status' => 'QMeterOpen entry deleted']);
    }
}
?>
