<?php

require_once './models/HunterPro/HpSaveAnswer.php';

class HpSaveAnswerController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new HpSaveAnswer($pdo);
    }

    public function getAllAnswers($offset, $limit)
    {
        $answers = $this->model->getAllAnswers($offset, $limit);
        echo json_encode($answers);
    }

    public function getHunterSavedAnswers()
    {
        $answers = $this->model->HunterSavedAnswers();
        echo json_encode($answers);
    }

    public function getAnswer($id)
    {
        $answer = $this->model->getAnswerById($id);
        echo json_encode($answer);
    }

    public function getAnswerByUsername($index_number)
    {
        $answer = $this->model->getAnswerByUsername($index_number);
        echo json_encode($answer);
    }

    public function createAnswer()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createAnswer($data);
        echo json_encode(['status' => 'Answer created']);
    }

    public function updateAnswer($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateAnswer($id, $data);
        echo json_encode(['status' => 'Answer updated']);
    }

    public function deleteAnswer($id)
    {
        $this->model->deleteAnswer($id);
        echo json_encode(['status' => 'Answer deleted']);
    }
}
