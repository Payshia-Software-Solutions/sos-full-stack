<?php
// controllers/CertificateOrderController.php

require_once './models/CertificateOrder.php';

class CertificateOrderController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new CertificateOrder($pdo);
        $this->ftpConfig = include('./config/ftp.php');
    }

    private function ensureDirectoryExists($ftp_conn, $dir)
    {
        $parts = explode('/', $dir);
        $path = '';
        foreach ($parts as $part) {
            if (empty($part)) {
                continue;
            }
            $path .= '/' . $part;
            if (!@ftp_chdir($ftp_conn, $path)) {
                if (!ftp_mkdir($ftp_conn, $path)) {
                    throw new Exception("Could not create directory: $path on FTP server.");
                }
            }
        }
    }

    private function uploadPaymentSlipToFTP($file)
    {
        try {
            ini_set('memory_limit', '256M');

            $ftp_server = $this->ftpConfig['ftp_server'];
            $ftp_username = $this->ftpConfig['ftp_username'];
            $ftp_password = $this->ftpConfig['ftp_password'];
            $ftp_target_dir = '/content-provider/uploads/certificate-payment-slips/';

            if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Invalid file upload.");
            }

            $tempDir = './tmp';
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0777, true);
            }

            $tempPath = $tempDir . '/' . basename($file['name']);
            if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
                throw new Exception("Failed to move uploaded file to temporary directory.");
            }

            $ftp_conn = ftp_connect($ftp_server);
            if (!$ftp_conn) {
                throw new Exception("Could not connect to FTP server.");
            }

            if (!ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
                ftp_close($ftp_conn);
                throw new Exception("Could not login to FTP server.");
            }

            ftp_pasv($ftp_conn, true);

            $this->ensureDirectoryExists($ftp_conn, $ftp_target_dir);

            $remoteFilePath = $ftp_target_dir . basename($file['name']);
            if (!ftp_put($ftp_conn, $remoteFilePath, $tempPath, FTP_BINARY)) {
                throw new Exception("Failed to upload image to FTP: $remoteFilePath");
            }

            unlink($tempPath);
            ftp_close($ftp_conn);

            return ['status' => 'success', 'message' => 'Image uploaded successfully.', 'path' => basename($file['name'])];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }


    // GET all certificate orders
    public function getOrders()
    {
        $orders = $this->model->getAllOrders();
        echo json_encode($orders);
    }

    // GET all certificate orders by course code
    public function getOrdersByCourseCode($courseCode)
    {
        $orders = $this->model->getOrdersWithCourseCode($courseCode);
        if ($orders) {
            echo json_encode($orders);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No orders found for this course code']);
        }
    }

    // GET a single certificate order by ID
    public function getOrder($order_id)
    {
        $order = $this->model->getOrderById($order_id);
        if ($order) {
            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
        }
    }

    // GET a single certificate order by Certificate ID
    public function getOrderByCertificateId($certificate_id)
    {
        $order = $this->model->getOrderByCertificateId($certificate_id);
        if ($order) {
            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
        }
    }

    // GET all certificate orders by student number
    public function getOrdersByStudentNumber($studentNumber)
    {
        $orders = $this->model->getOrdersByStudentNumber($studentNumber);
        if ($orders) {
            echo json_encode($orders);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No orders found for this student number']);
        }
    }

    // POST create a new certificate order (no id in input)
    public function createOrder()
    {
        $data = $_POST;

        $requiredFields = [
            'created_by',
            'mobile',
            'address_line1',
            'address_line2',
            'city_id',
            'district',
            'type',
            'payment_amount',
            'package_id',
            'certificate_id',
            'certificate_status'
        ];

        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                $missingFields[] = $field;
            }
        }

        if (!empty($missingFields)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields', 'missing_fields' => $missingFields]);
            return;
        }

        $paymentSlipPath = null;
        if (isset($_FILES['payment_slip']) && $_FILES['payment_slip']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->uploadPaymentSlipToFTP($_FILES['payment_slip']);

            if ($uploadResult['status'] === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message']]);
                return;
            }

            $paymentSlipPath = $uploadResult['path'];
        }

        $courseIds = isset($data['course_id']) && is_array($data['course_id']) ? $data['course_id'] : [];
        $courseIdsString = implode(',', $courseIds);

        $order_id = $this->model->createOrder(
            $data['created_by'],
            $courseIdsString,
            $data['mobile'],
            $data['address_line1'],
            $data['address_line2'],
            $data['city_id'],
            $data['district'],
            $data['type'],
            $data['payment_amount'],
            $data['package_id'],
            $data['certificate_id'],
            $data['certificate_status'],
            $data['cod_amount'] ?? 0,
            $data['is_active'] ?? 1,
            $data['garlent'] ?? 0,
            $data['scroll'] ?? 0,
            $data['certificate_file'] ?? 0,
            $paymentSlipPath
        );

        http_response_code(201);
        echo json_encode([
            'reference_number' => $order_id,
            'message' => 'Order created successfully',
        ]);
    }

    // PUT update a certificate order
    public function updateOrder($order_id)
    {
        $data = $_POST;

        if (!isset($data['created_by']) || !isset($data['course_code']) || !isset($data['certificate_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $paymentSlipPath = null;
        if (isset($_FILES['payment_slip']) && $_FILES['payment_slip']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->uploadPaymentSlipToFTP($_FILES['payment_slip']);

            if ($uploadResult['status'] === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message']]);
                return;
            }

            $paymentSlipPath = $uploadResult['path'];
        }

        $success = $this->model->updateOrder(
            $order_id,
            $data['created_by'],
            $data['course_code'],
            $data['mobile'],
            $data['address_line1'],
            $data['address_line2'],
            $data['city_id'],
            $data['district'],
            $data['type'],
            $data['payment_amount'],
            $data['package_id'],
            $data['certificate_id'],
            $data['certificate_status'],
            $data['cod_amount'] ?? 0,
            $data['is_active'] ?? 1,
            $data['garlent'] ?? 0,
            $data['scroll'] ?? 0,
            $data['certificate_file'] ?? 0,
            $paymentSlipPath
        );

        if ($success) {
            echo json_encode(['message' => 'Order updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found or update failed']);
        }
    }

    // DELETE a certificate order
    public function deleteOrder($order_id)
    {
        $success = $this->model->deleteOrder($order_id);
        if ($success) {
            echo json_encode(['message' => 'Order deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found or deletion failed']);
        }
    }

    // PUT update courses in a certificate order
    public function updateCourses($orderId)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['course_code'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing course_code']);
            return;
        }

        if (is_array($data['course_code'])) {
            $courseIds = $data['course_code'];
        } else {
            $courseIds = array_map('trim', explode(',', $data['course_code']));
        }

        $courseIdsString = implode(',', array_filter($courseIds));

        $success = $this->model->updateCourses($orderId, $courseIdsString);
        if ($success) {
            echo json_encode(['message' => 'Courses updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found or update failed']);
        }
    }
}
