<?php
require_once './models/District/Districts.php';

class DistrictsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Districts($pdo);
    }

    // Get all districts
    public function getAllDistricts()
    {
        $districts = $this->model->getAllDistricts();
        echo json_encode($districts);
    }

    // Get a single district by ID
    public function getDistrictById($id)
    {
        $district = $this->model->getDistrictById($id);
        if ($district) {
            echo json_encode($district);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'District not found']);
        }
    }

    // Get districts by province_id
    public function getDistrictsByProvinceId($provinceId)
    {
        $districts = $this->model->getDistrictsByProvinceId($provinceId);
        if (!empty($districts)) {
            echo json_encode($districts);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No districts found for the given province']);
        }
    }

    // Create a new district
    public function createDistrict()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateDistrictData($data)) {
            $this->model->createDistrict($data);
            http_response_code(201);
            echo json_encode(['message' => 'District created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
        }
    }

    // Update an existing district by ID
    public function updateDistrict($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateDistrictData($data)) {
            $this->model->updateDistrict($id, $data);
            echo json_encode(['message' => 'District updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
        }
    }

    // Delete a district by ID
    public function deleteDistrict($id)
    {
        $deleted = $this->model->deleteDistrict($id);
        if ($deleted) {
            echo json_encode(['message' => 'District deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'District not found']);
        }
    }

    // Validate district data
    private function validateDistrictData($data)
    {
        return isset($data['province_id'], $data['name_en'], $data['name_si'], $data['name_ta']) &&
               is_numeric($data['province_id']) &&
               !empty($data['name_en']) &&
               !empty($data['name_si']) &&
               !empty($data['name_ta']);
    }
}
