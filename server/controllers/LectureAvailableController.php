<?php
require_once './models/LectureAvailable.php';
require_once './models/User.php';

class LectureAvailableController
{
    private $model;
    private $userModel;

    public function __construct($pdo)
    {
        $this->model = new LectureAvailable($pdo);
        $this->userModel = new User($pdo);
    }

    public function getAllLectures()
    {
        $lectures = $this->model->getAllLectures();
        echo json_encode($lectures);
    }

    public function getAvailableLectures()
    {
        $availableLectures = $this->model->getAvailableLecturesWithUserNames();
        
        echo json_encode($availableLectures); // Return the result as JSON
    }
    


    public function getLectureById($id)
    {
        $lecture = $this->model->getLectureById($id);
        if ($lecture) {
            echo json_encode($lecture);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Lecture not found']);
        }
    }

    public function createLecture()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createLecture($data);
        http_response_code(201);
        echo json_encode(['message' => 'Lecture created successfully']);
    }

    public function updateLecture($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateLecture($id, $data);
        echo json_encode(['message' => 'Lecture updated successfully']);
    }

    public function deleteLecture($id)
    {
        $this->model->deleteLecture($id);
        echo json_encode(['message' => 'Lecture deleted successfully']);
    }
}