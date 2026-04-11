<?php

require_once './models/Company.php';
class CompanyController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Company($pdo);
    }

    public function getAllCompanies()
    {
        $companies = $this->model->getAllCompanies();
        echo json_encode($companies);
    }

    public function getCompanyById($id)
    {
        $company = $this->model->getCompanyById($id);
        if ($company) {
            echo json_encode($company);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Company not found']);
        }
    }

    public function createCompany()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createCompany($data);
        http_response_code(201);
        echo json_encode(['message' => 'Company created successfully']);
    }

    public function updateCompany($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateCompany($id, $data);
        echo json_encode(['message' => 'Company updated successfully']);
    }

    public function deleteCompany($id)
    {
        $this->model->deleteCompany($id);
        echo json_encode(['message' => 'Company deleted successfully']);
    }
}
