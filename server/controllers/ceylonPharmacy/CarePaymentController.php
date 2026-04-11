<?php
// controllers/ceylonPharmacy/CarePaymentController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CarePayment.php';

class CarePaymentController
{
    private $carePaymentModel;

    public function __construct($pdo)
    {
        $this->carePaymentModel = new CarePayment($pdo);
    }

    public function getAll()
    {
        $payments = $this->carePaymentModel->getAllCarePayments();
        echo json_encode($payments);
    }

    public function getById($id)
    {
        $payment = $this->carePaymentModel->getCarePaymentById($id);
        if ($payment) {
            echo json_encode($payment);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Payment not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['PresCode'])) {
            $result = $this->carePaymentModel->createOrUpdatePayment($data);

            if ($result['status'] === 'created') {
                http_response_code(201); // Created
                echo json_encode([
                    'message' => 'Payment created successfully',
                    'id' => $result['id']
                ]);
            } elseif ($result['status'] === 'updated') {
                http_response_code(200); // OK
                echo json_encode([
                    'message' => 'Payment updated successfully',
                    'id' => $result['id']
                ]);
            } elseif ($result['status'] === 'unchanged') {
                http_response_code(200); // OK
                echo json_encode([
                    'message' => 'Payment value is already up to date.',
                    'id' => $result['id']
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input. PresCode is required.']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $this->carePaymentModel->updateCarePayment($id, $data);
            echo json_encode(['message' => 'Payment updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->carePaymentModel->deleteCarePayment($id);
        echo json_encode(['message' => 'Payment deleted successfully']);
    }

    public function getLastByPresCode($presCode)
    {
        $payment = $this->carePaymentModel->getLastRecordByPresCode($presCode);
        if ($payment) {
            echo json_encode($payment);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No payment found for the given PresCode']);
        }
    }
}
