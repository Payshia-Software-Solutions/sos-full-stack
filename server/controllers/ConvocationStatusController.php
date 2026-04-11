<?php

require_once __DIR__ . '/../models/Convocation.php';

class ConvocationStatusController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Convocation($pdo);
    }

    public function updateAcceptBooking($id, $status)
    {
        try {
            $result = $this->model->updateAcceptBooking($id, $status);
            if ($result) {
                echo json_encode(['message' => 'Booking status updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Convocation not found or status not changed']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
