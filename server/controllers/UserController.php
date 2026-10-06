<?php
// controllers/UserController.php

require_once './models/User.php';

class UserController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new User($pdo);
    }

    public function getUsers()
    {
        $users = $this->model->getAllUsers();
        echo json_encode($users);
    }

    public function getUser($id)
    {
        $user = $this->model->getUserById($id);
        echo json_encode($user);
    }

    public function getUserByUsername($username)
    {
        $user = $this->model->getByUsername($username);
        echo json_encode($user);
    }

    public function createUser()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createUser($data);
        echo json_encode(['status' => 'User created']);
    }

    public function updateUser($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateUser($id, $data);
        echo json_encode(['status' => 'User updated']);
    }

    public function UpdateUserByUsername($username)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateUserByUsername($username, $data);
        echo json_encode(['status' => 'User updated']);
    }


    public function deleteUser($id)
    {
        $this->model->deleteUser($id);
        echo json_encode(['status' => 'User deleted']);
    }

    public function getUserCount()
    {
        $count = $this->model->getUserCount();
        echo json_encode(['user_count' => $count]);
    }


    //   // get user by username,fname,lname
    //   public function getRecordByUsernameOrName($value)
    //   {
    //       // Ensure the value is properly sanitized for wildcard search
    //       $record = $this->model->getRecordByUsernameOrName($value);

    //       if ($record) {
    //           echo json_encode($record);
    //       } else {
    //           http_response_code(404);
    //           echo json_encode(['error' => 'Record not found']);
    //       }
    //   }
    public function getRecordByUsernameOrName($value)
    {
        // Ensure the value is properly sanitized for wildcard search
        $record = $this->model->getRecordByUsernameOrName($value);

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
        // var_dump($data);

        if (!$data || !isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        $user = $this->model->getByUsername($data['username']);

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

        // Check if account is inactive/deactivated
        if (isset($user['status']) && strtolower(trim($user['status'])) === 'inactive') {
            http_response_code(403);
            echo json_encode(['error' => 'Your account has been deactivated. Please contact administration to reactivate.']);
            return;
        }

        // Login success - remove password from response
        unset($user['password']);

        echo json_encode([
            'message' => 'Login successful',
            'user' => $user
        ]);
    }

    public function deactivateMyAccount()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['username'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
            return;
        }

        $username = $data['username'];
        $user = $this->model->getByUsername($username);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        // Verify password if provided
        if (!empty($data['password'])) {
            if (!password_verify($data['password'], $user['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Incorrect password. Deactivation failed.']);
                return;
            }
        }

        $this->model->deactivateUserByUsername($username);

        echo json_encode([
            'success' => true,
            'message' => 'Your account has been deactivated successfully.'
        ]);
    }

    public function updateStatus()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['username']) || empty($data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and status are required']);
            return;
        }

        $username = $data['username'];
        $status = ucfirst(strtolower($data['status']));

        if (!in_array($status, ['Active', 'Inactive'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status. Must be Active or Inactive']);
            return;
        }

        $user = $this->model->getByUsername($username);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        $this->model->updateUserStatus($username, $status);

        echo json_encode([
            'success' => true,
            'message' => "User account set to $status successfully",
            'username' => $username,
            'status' => $status
        ]);
    }

    public function getStaffUsers()
    {
        $staffUsers = $this->model->getStaffUsers();
        echo json_encode($staffUsers);
    }
}
