<?php
// ./controllers/CertificationCenter/CcGraduationPackageController.php'

require_once './models/CertificationCenter/CcGraduationPackage.php';

class CcGraduationPackageController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CcGraduationPackage($pdo);
    }

    public function getGraduationPackages()
    {
        $graduationPackages = $this->model->getAllGraduationPackages();
        echo json_encode($graduationPackages);
    }

    public function getGraduationPackage($id)
    {
        $graduationPackage = $this->model->getGraduationPackageById($id);
        echo json_encode($graduationPackage);
    }

    public function createGraduationPackage()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createGraduationPackage($data);
        echo json_encode(['status' => 'CcGraduationPackage Package created']);
    }

    public function updateGraduationPackage($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateGraduationPackage($id, $data);
        echo json_encode(['status' => 'CcGraduationPackage Package updated']);
    }

    public function deleteGraduationPackage($id)
    {
        $this->model->deleteGraduationPackage($id);
        echo json_encode(['status' => 'CcGraduationPackage Package deleted']);
    }
}
