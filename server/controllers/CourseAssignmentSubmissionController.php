<?php
// controllers/CourseAssignmentSubmissionController.php

require_once './models/CourseAssignmentSubmission.php';

class CourseAssignmentSubmissionController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CourseAssignmentSubmission($pdo);
    }

    public function getSubmissions()
    {
        $submissions = $this->model->getAllSubmissions();
        echo json_encode($submissions);
    }

    public function getSubmissionsByCourse($course_code)
    {
        $submissions = $this->model->getSubmissionsByCourse($course_code);
        echo json_encode($submissions);
    }

    public function getSubmission($id)
    {
        $submission = $this->model->getSubmissionById($id);
        echo json_encode($submission);
    }

    public function getSubmissionsByUser($username)
    {
        $submissions = $this->model->getSubmissionsByUser($username);
        echo json_encode($submissions);
    }

    public function getSubmissionByUser($username, $id)
    {
        $submission = $this->model->getSubmissionByUser($username, $id);
        echo json_encode($submission);
    }

    public function getSubmissionByUserAndAssignment($username, $assignment_id)
    {
        $submission = $this->model->getSubmissionByUserAndAssignment($username, $assignment_id);
        echo json_encode($submission);
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
