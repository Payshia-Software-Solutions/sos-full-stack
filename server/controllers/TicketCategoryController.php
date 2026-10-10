<?php
require_once './models/TicketCategory.php';

class TicketCategoryController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new TicketCategory($pdo);
    }

    // Get all categories (Admin)
    public function getAll()
    {
        try {
            $records = $this->model->getAll();
            echo json_encode($records);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Get active categories (Student & Staff Desk)
    public function getActive()
    {
        try {
            $records = $this->model->getAllActive();
            echo json_encode($records);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Get single category by ID
    public function getById($id)
    {
        try {
            $record = $this->model->getById($id);
            if ($record) {
                echo json_encode($record);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Create category
    public function create()
    {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!$data || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Category name is required']);
            return;
        }

        if (empty($data['category_key'])) {
            // Generate category_key from name if not provided
            $data['category_key'] = preg_replace('/[^a-zA-Z0-9]/', '', ucwords($data['name']));
        }

        try {
            $newId = $this->model->create($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Category created successfully',
                'id' => $newId
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Update category
    public function update($id)
    {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!$data || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Category name is required']);
            return;
        }

        if (empty($data['category_key'])) {
            $data['category_key'] = preg_replace('/[^a-zA-Z0-9]/', '', ucwords($data['name']));
        }

        try {
            $this->model->update($id, $data);
            echo json_encode(['message' => 'Category updated successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Delete category
    public function delete($id)
    {
        try {
            $this->model->delete($id);
            echo json_encode(['message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
