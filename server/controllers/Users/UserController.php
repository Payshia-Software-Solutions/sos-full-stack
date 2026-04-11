<?php
require_once './models/Users/User.php';

class UserController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new User($pdo);
    }

    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    public function getRecordById($id)
    {
        $record = $this->model->getRecordById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
        }
    }

    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        $user = $this->model->getRecordByUsername($data['username']);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        // Verify password
        if (!password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        // Login success - remove password from response
        unset($user['password']);

        echo json_encode([
            'message' => 'Login successful',
            'user' => $user
        ]);
    }

    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createRecord($data);
        http_response_code(201);
        echo json_encode(['message' => 'Record created successfully']);
    }

    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateRecord($id, $data);
        echo json_encode(['message' => 'Record updated successfully']);
    }

    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }

    public function getUserCount()
    {
        $count = $this->model->getUserCount();
        echo json_encode(['user_count' => $count]);
    }

    // get user by username,fname,lname
    public function getRecordByUsernameOrName($value)
    {
        $record = $this->model->getRecordByUsernameOrName($value);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
        }
    }

    public function getStaffUsers()
    {
        $staffUsers = $this->model->getStaffUsers();
        echo json_encode($staffUsers);
    }
}
