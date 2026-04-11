<?php
require_once './models/Chats/LcChat.php';

class ChatController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Chat($pdo);
    }

    public function getChats()
    {
        $chats = $this->model->getAllChats();
        echo json_encode($chats);
    }

    public function getChat($id)
    {
        $chat = $this->model->getChatById($id);
        if ($chat) {
            echo json_encode($chat);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Chat not found']);
        }
    }

    public function getChatByUser($username)
    {
        $chat = $this->model->getChatByUser($username);
        if ($chat) {
            echo json_encode($chat);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Chat not found']);
        }
    }

    public function getAllRecentChats($username)
    {
        $chat = $this->model->getAllRecentChats($username);
        if ($chat) {
            echo json_encode($chat);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Chat not found']);
        }
    }

    public function createChat()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['name'])) {
            // Create chat and get the last inserted ID
            $lastId = $this->model->createChat($data);

            http_response_code(201);
            echo json_encode([
                'message' => 'Chat created successfully',
                'return_chat_id' => $lastId
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function updateChat($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['name'])) {
            $this->model->updateChat($id, $data);
            echo json_encode(['message' => 'Chat updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function deleteChat($id)
    {
        $this->model->deleteChat($id);
        echo json_encode(['message' => 'Chat deleted successfully']);
    }
}
