<?php

require_once __DIR__ . '/../models/SentenceBuilderLevel.php';

class SentenceBuilderLevelController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new SentenceBuilderLevel($pdo);
    }

    public function getAll()
    {
        $levels = $this->model->getAll();
        echo json_encode($levels);
    }

    public function getById($id)
    {
        $level = $this->model->getById($id);
        echo json_encode($level);
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['level_number']) && isset($data['pattern'])) {
            try {
                $id = $this->model->create($data);
                http_response_code(201);
                echo json_encode(['id' => $id, 'message' => 'Record created successfully']);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['level_number']) && isset($data['pattern'])) {
            try {
                $this->model->update($id, $data);
                echo json_encode(['message' => 'Record updated successfully']);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        try {
            $this->model->delete($id);
            echo json_encode(['message' => 'Record deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
