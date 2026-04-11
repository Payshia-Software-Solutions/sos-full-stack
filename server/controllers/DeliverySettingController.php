<?php

require_once './models/DeliverySetting.php';

class DeliverySettingController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new DeliverySetting($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    public function getById($id)
    {
        $record = $this->model->getById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['course_id'], $data['delivery_title'], $data['is_active'], $data['icon'], $data['value'])) {
            $id = $this->model->create($data);
            http_response_code(201);
            echo json_encode(['message' => 'Record created', 'id' => $id]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['course_id'], $data['delivery_title'], $data['is_active'], $data['icon'], $data['value'])) {
            $existing = $this->model->getById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Record not found']);
                return;
            }

            $this->model->update($id, $data);
            echo json_encode(['message' => 'Record updated']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
            return;
        }

        $this->model->delete($id);
        echo json_encode(['message' => 'Record deleted']);
    }

    public function getByCourseId($courseId)
    {
        $records = $this->model->getByCourseId($courseId);

        if ($records) {
            echo json_encode($records);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No records found for course_id ' . $courseId]);
        }
    }
}
