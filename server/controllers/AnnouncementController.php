<?php
// controllers/AnnouncementController.php

require_once __DIR__ . '/../models/Announcement.php';

class AnnouncementController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Announcement($pdo);
    }

    public function getAll()
    {
        $announcements = $this->model->getAll();
        echo json_encode($announcements);
    }

    public function getById($id)
    {
        $record = $this->model->getById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Announcement not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['title']) || empty($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and content are required']);
            return;
        }

        $created = $this->model->create($data);
        http_response_code(201);
        echo json_encode($created);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }

        $updated = $this->model->update($id, $data);
        echo json_encode($updated);
    }

    public function delete($id)
    {
        $this->model->delete($id);
        echo json_encode(['message' => 'Announcement deleted successfully']);
    }
}
