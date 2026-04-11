<?php

// controllers/CertificationCenter/UserCertificatePrintStatusController.php

require_once 'models/UserCertificatePrintStatusNew.php';
require_once './models/ConvocationRegistration.php';
require_once './models/SMSModel.php';

class UserCertificatePrintStatusControllerNew
{
    private $model;
    private $convocationRegistrationModel;

    public function __construct($pdo)
    {
        $this->model = new UserCertificatePrintStatusNew($pdo);
        $this->convocationRegistrationModel = new ConvocationRegistration($pdo);
    }

    public function getAllStatuses()
    {
        $statuses = $this->model->getAllStatuses();
        echo json_encode($statuses);
    }



    public function getStatusById($id)
    {
        $status = $this->model->getStatusById($id);
        if ($status) {
            echo json_encode($status);
        } else {
            echo json_encode(["error" => "Status not found"]);
        }
    }

    public function getStatusByCertificateId($certificate_id)
    {
        $status = $this->model->getStatusByCertificateId($certificate_id);
        if ($status) {
            echo json_encode($status);
        } else {
            echo json_encode(["error" => "Status not found"]);
        }
    }

    // controllers/CertificationCenter/UserCertificatePrintStatusController.php
    public function createStatus()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $parentCourseCode = $data['parentCourseCode'] ?? null;
        $reference_number = $data['referenceId'] ?? null;
        $source = $data['source'] ?? null;
        $certificateIdStatus = null;

        // The model now gives us the generated certificate_id
        $certificateId = $this->model->createStatus($data);

        if ($source == "courier") {
            // For other sources, we can handle them here if needed
            if ($parentCourseCode == "1") {
                $certificateIdStatus = $this->convocationRegistrationModel->updateCertificatePrintStatusCourier("Generated", $certificateId, $reference_number);
            } else if ($parentCourseCode == "2") {
                // Update the convocation registration with the new certificate_id
                $certificateIdStatus = $this->convocationRegistrationModel->updateAdvancedCertificatePrintStatusCourier("Generated", $certificateId, $reference_number);
            }
        } else {
            // Send SMS notification for convocation
            if ($parentCourseCode == "1") {
                // Update the convocation registration with the new certificate_id
                $certificateIdStatus = $this->convocationRegistrationModel->updateCertificatePrintStatus("Generated", $certificateId, $reference_number);
            } else if ($parentCourseCode == "2") {
                // Update the convocation registration with the new certificate_id
                $certificateIdStatus = $this->convocationRegistrationModel->updateAdvancedCertificatePrintStatus("Generated", $certificateId, $reference_number);
            }
        }

        http_response_code(201);
        echo json_encode([
            "message"        => "Status created successfully",
            "certificate_id" => $certificateId,
            "certificate_print_status" => $certificateIdStatus
        ]);
    }


    public function updateStatus($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $this->model->updateStatus($id, $data);
        echo json_encode(["message" => "Status updated successfully"]);
    }

    public function deleteStatus($id)
    {
        $this->model->deleteStatus($id);
        echo json_encode(["message" => "Status deleted successfully"]);
    }

    public function getByStudentNumberCourseCodeAndType($studentNumber, $courseCode, $type)
    {
        $result = $this->userCertificatePrintStatus->getByStudentNumberCourseCodeAndType($studentNumber, $courseCode, $type);
        header('Content-Type: application/json');
        echo json_encode($result);
    }
}
