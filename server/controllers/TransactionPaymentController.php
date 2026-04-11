<?php
// controllers/Transaction/TransactionPaymentController.php

require_once './models/TransactionPayment.php';

class TransactionPaymentController
{
    public  $model;

    public function __construct($pdo)
    {
        $this->model = new TransactionPayment($pdo);
    }

    public function getAllPayments()
    {
        $payments = $this->model->getAllPayments();
        echo json_encode($payments);
    }

    public function generateTransactionId()
    {
        $prefix = "TXN";
        $timePart = substr(time(), -6); // last 6 digits of timestamp
        $randomPart = strtoupper(substr(bin2hex(random_bytes(2)), 0, 3)); // 3 alphanumeric
        return $prefix . $timePart . $randomPart;
    }


    public function getPayment($id)
    {
        $payment = $this->model->getPaymentById($id);
        echo json_encode($payment);
    }

    public function getPaymentsByStudentNumber($studentNumber)
    {
        $payments = $this->model->getPaymentsByStudentNumber($studentNumber);
        echo json_encode($payments);
    }

    public function getPaymentsByStudentNumberAndReference($studentNumber, $referKey)
    {
        $payments = $this->model->getPaymentsByStudentNumberAndReference($studentNumber, $referKey);
        echo json_encode($payments);
    }

    public function createPayment()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $data['transaction_id'] = $this->generateTransactionId();
        $data['rec_time'] = date('Y-m-d H:i:s');
        $data['created_by'] = 'system'; // or use session/user info
        $data['created_at'] = date('Y-m-d H:i:s');

        if ($this->model->createPayment($data)) {
            echo json_encode(['status' => 'Payment created', 'transaction_id' => $data['transaction_id']]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create payment']);
        }
    }

    public function updatePayment($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updatePayment($id, $data);
        echo json_encode(['status' => 'Payment updated']);
    }

    public function deletePayment($id)
    {
        $this->model->deletePayment($id);
        echo json_encode(['status' => 'Payment deleted']);
    }

    public function inactivePayment($id)
    {
        $this->model->inactivePayment($id);
        echo json_encode(['status' => 'Payment marked as inactive']);
    }
}
