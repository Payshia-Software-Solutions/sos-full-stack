<?php
// controllers/ceylonPharmacy/MasterProductController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/MasterProduct.php';

class MasterProductController
{
    private $masterProductModel;

    public function __construct($pdo)
    {
        $this->masterProductModel = new MasterProduct($pdo);
    }

    public function getAll()
    {
        $products = $this->masterProductModel->getAllMasterProducts();
        echo json_encode($products);
    }

    public function getById($id)
    {
        $product = $this->masterProductModel->getMasterProductById($id);
        if ($product) {
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $lastId = $this->masterProductModel->createMasterProduct($data);
            if ($lastId) {
                http_response_code(201);
                echo json_encode([
                    'message' => 'Product created successfully',
                    'id' => $lastId
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create product']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $rowCount = $this->masterProductModel->updateMasterProduct($id, $data);
            if ($rowCount) {
                echo json_encode(['message' => 'Product updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found or no changes made']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function updateNameAndPrice($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['name']) && isset($data['price'])) {
            $this->masterProductModel->updateMasterProductNameAndPrice($id, $data['name'], $data['price']);
            echo json_encode(['message' => 'Product name and price updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $rowCount = $this->masterProductModel->deleteMasterProduct($id);
        if ($rowCount) {
            echo json_encode(['message' => 'Product deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    }
}
