<?php

require_once './models/StudentPayment.php';

class StudentPaymentControllerNew
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new StudentPaymentNew($pdo);
    }

    // Get all student payments
    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    // Get student payment by ID
    public function getById($id)
    {
        $payment = $this->model->getById($id);
        if ($payment) {
            echo json_encode($payment);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Payment record not found']);
        }
    }

    // Create new student payment
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['course_code'], $data['student_id'], $data['paid_amount'], $data['discount_amount'], $data['payment_status'], $data['payment_type'], $data['paid_date'], $data['created_by'])) {
            $id = $this->model->create($data);
            http_response_code(201);
            echo json_encode(['message' => 'Payment created successfully', 'id' => $id]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    // Update student payment
    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['course_code'], $data['student_id'], $data['paid_amount'], $data['discount_amount'], $data['payment_status'], $data['payment_type'], $data['paid_date'], $data['created_by'])) {
            $existing = $this->model->getById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Payment record not found']);
                return;
            }

            $this->model->update($id, $data);
            echo json_encode(['message' => 'Payment updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    // Delete student payment
    public function delete($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Payment record not found']);
            return;
        }

        $this->model->delete($id);
        echo json_encode(['message' => 'Payment deleted successfully']);
    }
}
