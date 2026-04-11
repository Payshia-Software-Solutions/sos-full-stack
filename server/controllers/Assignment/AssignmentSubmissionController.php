<?php
// controllers/Assignment/AssignmentSubmissionController.php

require_once './models/Assignment/AssignmentSubmission.php';

class AssignmentSubmissionController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new AssignmentSubmission($pdo);
    }

    public function getSubmissions()
    {
        $submissions = $this->model->getAllSubmissions();
        echo json_encode($submissions);
    }

    public function getAllSubmissionsGroupedByStudent()
    {
        $submissions = $this->model->getAllSubmissionsGroupedByStudent();
        echo json_encode($submissions);
    }

    public function getAverageGradeByStudentAndCourse($studentId, $courseCode)
    {
        $averageGrade = $this->model->getAverageGradeByStudentAndCourse($studentId, $courseCode);
        echo json_encode($averageGrade);
    }

    public function getSubmission($id)
    {
        $submission = $this->model->getSubmissionById($id);
        echo json_encode($submission);
    }

    public function getSubmissionsByAssignmentId($assignmentId)
    {
        $submissions = $this->model->getSubmissionsByAssignmentId($assignmentId);
        echo json_encode($submissions);
    }

    public function getSubmissionsByStudentNumber($studenetNumber)
    {
        $submissions = $this->model->getSubmissionsByStudentNumber($studenetNumber);
        echo json_encode($submissions);
    }

    public function createSubmission()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createSubmission($data);
        echo json_encode(['status' => 'Submission created']);
    }

    public function updateSubmission($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateSubmission($id, $data);
        echo json_encode(['status' => 'Submission updated']);
    }

    public function deleteSubmission($id)
    {
        $this->model->deleteSubmission($id);
        echo json_encode(['status' => 'Submission deleted']);
    }
}
