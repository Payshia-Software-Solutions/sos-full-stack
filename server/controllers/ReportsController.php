<?php

require_once './models/Reports.php';

class ReportsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Reports($pdo);
    }

    public function getUserInfo($username)
    {
        $res = $this->model->getUserInfo($username);
        echo json_encode($res);
    }

    public function getStudentContactsByBatch($batch_id)
    {
        $res = $this->model->getStudentContactsByBatch($batch_id);
        echo json_encode(['status' => 'success', 'data' => $res]);
    }
}
