<?php
require_once './models/ecertificates/ECertificate.php';

class ECertificateController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new ECertificate($pdo);
    }

    // Get all certificates
    public function getAllCertificates()
    {
        $certificates = $this->model->getAllCertificates();
        echo json_encode($certificates);
    }

    // Get a certificate by ID
    public function getCertificateById($id)
    {
        $certificate = $this->model->getCertificateById($id);
        if ($certificate) {
            echo json_encode($certificate);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Certificate not found']);
        }
    }

    // Get certificates by student number
    public function getCertificatesByStudentNumber($student_number)
    {
        $certificates = $this->model->getCertificatesByStudentNumber($student_number);
        echo json_encode($certificates);
    }


    

    // Get certificates by course code
    public function getCertificatesByCourseCode($course_code)
    {
        $certificates = $this->model->getCertificatesByCourseCode($course_code);
        echo json_encode($certificates);
    }

    // Create a new certificate
    public function createCertificate()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->isValidCertificateData($data)) {
            $data['created_at'] = date('Y-m-d H:i:s'); // Automatically set created_at
            $this->model->createCertificate($data);
            http_response_code(201);
            echo json_encode(['message' => 'Certificate created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid certificate data']);
        }
    }

    // Update a certificate by ID
    public function updateCertificate($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->isValidCertificateData($data)) {
            $this->model->updateCertificate($id, $data);
            echo json_encode(['message' => 'Certificate updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid certificate data']);
        }
    }

    // Delete a certificate by ID
    public function deleteCertificate($id)
    {
        $this->model->deleteCertificate($id);
        echo json_encode(['message' => 'Certificate deleted successfully']);
    }

    // Validate certificate data
    private function isValidCertificateData($data)
    {
        return isset($data['student_number'], $data['course_code'], $data['generated_image_name'], $data['created_by']);
    }
 //get userid and course code 
 public function getCertificatesByStudentNumberAndCourseCode($student_number, $course_code)
 {
     // Debugging: Output the received parameters
     error_log("Received student_number: $student_number");
     error_log("Received course_code: $course_code");
 
     // Call the model to fetch data
     $certificates = $this->model->getCertificatesByStudentNumberAndCourseCode($student_number, $course_code);
 
     // Check if any records are returned
     if (empty($certificates)) {
         echo json_encode(['message' => 'No certificates found']);
     } else {
         echo json_encode($certificates);
     }
 }
 

}
