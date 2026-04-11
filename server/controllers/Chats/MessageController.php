<?php
require_once './models/Chats/LcMessage.php';

class MessageController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Message($pdo);
    }

    public function getMessages()
    {
        $messages = $this->model->getAllMessages();
        echo json_encode($messages);
    }

    public function getMessage($id)
    {
        $message = $this->model->getMessageById($id);
        if ($message) {
            echo json_encode($message);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Message not found']);
        }
    }

    public function getMessageByChatId($id)
    {
        $chat = $this->model->getMessageByChatId($id);
        if ($chat) {
            echo json_encode($chat);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Chat not found']);
        }
    }

    public function getLastMessage($chat_id)
    {
        $chat = $this->model->getLastMessage($chat_id);
        if ($chat) {
            echo json_encode($chat);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Chat not found']);
        }
    }


    public function createMessage()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['chat_id']) && isset($data['sender_id']) && isset($data['message_text'])) {
            $this->model->createMessage($data);
            http_response_code(201);
            echo json_encode(['message' => 'Message created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function updateMessage($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['chat_id']) && isset($data['sender_id']) && isset($data['message_text'])) {
            $this->model->updateMessage($id, $data);
            echo json_encode(['message' => 'Message updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function deleteMessage($id)
    {
        $this->model->deleteMessage($id);
        echo json_encode(['message' => 'Message deleted successfully']);
    }
}
