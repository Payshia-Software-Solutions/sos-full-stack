<?php

require_once './models/Reports.php';

class ReportsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Reports($pdo);
    }

    public function getUserInfo($username)
    {
        $res = $this->model->getUserInfo($username);
        echo json_encode($res);
    }

    public function getStudentContactsByBatch($batch_id)
    {
        $res = $this->model->getStudentContactsByBatch($batch_id);
        echo json_encode(['status' => 'success', 'data' => $res]);
    }

    public function getWinPharmaReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getWinPharmaReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getDpadReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getDpadReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getQuizReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getQuizReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getPharmaHunterReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getPharmaHunterReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getPharmaHunterProReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getPharmaHunterProReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getCourseAssignmentReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getCourseAssignmentReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getCeylonPharmacyReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getCeylonPharmacyReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getPharmaReaderReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getPharmaReaderReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getAssignmentReport($batch_id)
    {
        header('Content-Type: application/json');
        try {
            $res = $this->model->getAssignmentReportByBatch($batch_id);
            echo json_encode(['status' => 'success', 'data' => $res]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function saveAssignmentGrade()
    {
        header('Content-Type: application/json');
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            $assignmentId = $body['assignment_id'] ?? ($_POST['assignment_id'] ?? '');
            $studentNumber = $body['student_number'] ?? ($_POST['student_number'] ?? '');
            $gradeValue = $body['grade'] ?? ($_POST['grade'] ?? '');

            $res = $this->model->saveAssignmentGrade($assignmentId, $studentNumber, $gradeValue);
            echo json_encode($res);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}

