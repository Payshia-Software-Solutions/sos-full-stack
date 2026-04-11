<?php

require_once './models/UserFullDetails.php';
class UserFullDetailsController
{
    public $model;

    public function __construct($pdo)
    {
        $this->model = new UserFullDetails($pdo);
    }

    public function getAllUsers()
    {
        $users = $this->model->getAllUsers();
        echo json_encode($users);
    }

    public function getUserById($id)
    {
        $user = $this->model->getUserById($id);
        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }

    public function getUserByUserName($username)
    {
        $user = $this->model->getUserByUserName($username);
        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }

    public function updateCertificateNameByUserName($username)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['name_on_certificate'])) {
            $this->model->updateCertificateNameByUserName($username, $data['name_on_certificate']);

            http_response_code(201);
            echo json_encode(['message' => 'Certificate name updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required field: name_on_certificate']);
        }
    }

    public function createUser()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createUser($data);
        http_response_code(201);
        echo json_encode(['message' => 'User created successfully']);
    }

    public function updateUser($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateUser($id, $data);
        echo json_encode(['message' => 'User updated successfully']);
    }

    public function deleteUser($id)
    {
        $this->model->deleteUser($id);
        echo json_encode(['message' => 'User deleted successfully']);
    }
}
