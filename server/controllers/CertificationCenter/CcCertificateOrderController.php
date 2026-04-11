<?php
// controllers/CertificationCenter/CcCertificateOrderController.php

require_once 'models/CertificationCenter/CcCertificateOrder.php';

class CcCertificateOrderController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CcCertificateOrder($pdo);
    }

    public function getAllOrders()
    {
        $orders = $this->model->getAllOrders();
        echo json_encode($orders);
    }

    public function getAllOrdersByUsername($username)
    {
        $orders = $this->model->getAllOrdersByUsername($username);
        echo json_encode($orders);
    }

    public function getOrderById($id)
    {
        $order = $this->model->getOrderById($id);
        if ($order) {
            echo json_encode($order);
        } else {
            echo json_encode(["error" => "Order not found"]);
        }
    }

    public function createOrder()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');


        $this->model->createOrder($data);

        http_response_code(201);
        echo json_encode(["message" => "Order created successfully"]);
    }

    public function updateOrder($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $data['updated_at'] = date('Y-m-d H:i:s');

        $this->model->updateOrder($id, $data);
        echo json_encode(["message" => "Order updated successfully"]);
    }

    public function deleteOrder($id)
    {
        $this->model->deleteOrder($id);
        echo json_encode(["message" => "Order deleted successfully"]);
    }


    public function updateCertificateStatus($id)
    {
        // Get the status from the request body
        $data = json_decode(file_get_contents("php://input"), true);

        // Ensure certificate status is set in the request
        if (!isset($data['certificate_status'])) {
            echo json_encode(["error" => "Certificate status is required"]);
            return;
        }

        $certificateStatus = $data['certificate_status'];

        // Call the model's updateCertificateStatus method
        $this->model->updateCertificateStatus($id, $certificateStatus);

        echo json_encode(["message" => "Certificate status updated successfully"]);
    }
}
