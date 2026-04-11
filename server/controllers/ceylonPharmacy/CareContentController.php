<?php
// controllers/ceylonPharmacy/CareContentController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CareContent.php';

class CareContentController
{
    private $careContentModel;

    public function __construct($pdo)
    {
        $this->careContentModel = new CareContent($pdo);
    }

    public function getAll()
    {
        $contents = $this->careContentModel->getAllCareContents();
        echo json_encode($contents);
    }

    public function getById($id)
    {
        $content = $this->careContentModel->getCareContentById($id);
        if ($content) {
            echo json_encode($content);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Content not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $lastId = $this->careContentModel->createCareContent($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Content created successfully',
                'id' => $lastId
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $this->careContentModel->updateCareContent($id, $data);
            echo json_encode(['message' => 'Content updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function updateByPresCodeAndCoverId($presCode, $coverId)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $this->careContentModel->updateCareContentByPresCodeAndCoverId($presCode, $coverId, $data);
            echo json_encode(['message' => 'Content updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careContentModel->deleteCareContent($id);
        echo json_encode(['message' => 'Content deleted successfully']);
    }

    public function deleteByPresCodeAndCoverId($presCode, $coverId)
    {
        $this->careContentModel->deleteCareContentByPresCodeAndCoverId($presCode, $coverId);
        echo json_encode(['message' => 'Content deleted successfully']);
    }

    public function getByPresCode($presCode)
    {
        $content = $this->careContentModel->getCareContentByPresCode($presCode);
        if ($content) {
            echo json_encode($content);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Content not found']);
        }
    }
}
