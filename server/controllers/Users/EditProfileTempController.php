<?php

require_once './models/Users/EditProfileTemp.php';

class EditProfileTempController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new EditProfileTemp($pdo);
    }

    public function getPending()
    {
        $requests = $this->model->getPendingRequests();
        echo json_encode($requests);
    }

    public function getStatus($username)
    {
        $request = $this->model->getRequestByUsername($username);
        echo json_encode($request ? $request : null);
    }

    public function submitRequest()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['username'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
            return;
        }

        try {
            $insertId = $this->model->createOrUpdateRequest($data['username'], $data);
            echo json_encode(['status' => 'Request submitted successfully', 'id' => $insertId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function approve($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $adminUsername = $data['admin_username'] ?? 'Admin';

        try {
            $success = $this->model->approveRequest($id, $adminUsername);
            if ($success) {
                echo json_encode(['status' => 'Request approved and profile updated']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Request not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function reject($id)
    {
        try {
            $success = $this->model->rejectRequest($id);
            if ($success) {
                echo json_encode(['status' => 'Request rejected successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Request not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
