<?php
// controllers/QMeter/QMeterController.php

require_once './models/QMeter/QMeter.php';

class QMeterController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new QMeter($pdo);
    }

    public function getQMeters()
    {
        $qMeters = $this->model->getAllQMeters();
        echo json_encode($qMeters);
    }

    public function getQMeter($id)
    {
        $qMeter = $this->model->getQMeterById($id);
        echo json_encode($qMeter);
    }

    public function createQMeter()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createQMeter($data);
        echo json_encode(['status' => 'QMeter created']);
    }

    public function updateQMeter($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateQMeter($id, $data);
        echo json_encode(['status' => 'QMeter updated']);
    }

    public function deleteQMeter($id)
    {
        $this->model->deleteQMeter($id);
        echo json_encode(['status' => 'QMeter deleted']);
    }
}
?>
