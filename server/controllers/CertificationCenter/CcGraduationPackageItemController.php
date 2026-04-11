<?php
// controllers/CertificationCenter/CcGraduationPackageItemController.php

require_once './models/CertificationCenter/CcGraduationPackageItem.php';

class CcGraduationPackageItemController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CcGraduationPackageItem($pdo);
    }

    public function getCcGraduationPackageItems()
    {
        $ccGraduationPackageItems = $this->model->getAllCcGraduationPackageItems();
        echo json_encode($ccGraduationPackageItems);
    }

    public function getCcGraduationPackageItem($id)
    {
        $ccGraduationPackageItem = $this->model->getCcGraduationPackageItemById($id);
        echo json_encode($ccGraduationPackageItem);
    }

    public function createCcGraduationPackageItem()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createCcGraduationPackageItem($data);
        echo json_encode(['status' => 'CcGraduationPackageItem created']);
    }

    public function updateCcGraduationPackageItem($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateCcGraduationPackageItem($id, $data);
        echo json_encode(['status' => 'CcGraduationPackageItem updated']);
    }

    public function deleteCcGraduationPackageItem($id)
    {
        $this->model->deleteCcGraduationPackageItem($id);
        echo json_encode(['status' => 'CcGraduationPackageItem deleted']);
    }
}
