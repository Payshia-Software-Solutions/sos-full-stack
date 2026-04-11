<?php
// controllers/QMeter/QMeterSubmitController.php

require_once './models/QMeter/QMeterSubmit.php';

class QMeterSubmitController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new QMeterSubmit($pdo);
    }

    public function getQMeterSubmits()
    {
        $QMeterSubmits = $this->model->getAllQMeterSubmits();
        echo json_encode($QMeterSubmits);
    }

    public function getQMeterSubmit($id)
    {
        $QMeterSubmit = $this->model->getQMeterSubmitById($id);
        echo json_encode($QMeterSubmit);
    }

    public function createQMeterSubmit()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createQMeterSubmit($data);
        echo json_encode(['status' => 'QMeterSubmit created']);
    }

    public function updateQMeterSubmit($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateQMeterSubmit($id, $data);
        echo json_encode(['status' => 'QMeterSubmit updated']);
    }

    public function deleteQMeterSubmit($id)
    {
        $this->model->deleteQMeterSubmit($id);
        echo json_encode(['status' => 'QMeterSubmit deleted']);
    }
}
