<?php
// models/Message.php

class Message
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllMessages()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_messages`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }



    public function getLastMessage($chat_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_messages` WHERE `chat_id` = ? ORDER BY `id` DESC LIMIT 1");
        $stmt->execute([$chat_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getMessageById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_messages` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getMessageByChatId($chat_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_messages` WHERE `chat_id` = ? ORDER BY `id` ASC");
        $stmt->execute([$chat_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createMessage($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `lc_messages` (`chat_id`, `sender_id`, `message_text`, `message_type`, `message_status`) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['chat_id'],
            $data['sender_id'],
            $data['message_text'],
            $data['message_type'],
            $data['message_status']
        ]);
    }

    public function updateMessage($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `lc_messages` SET `chat_id` = ?, `sender_id` = ?, `message_text` = ?, `message_type` = ?, `message_status` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['chat_id'],
            $data['sender_id'],
            $data['message_text'],
            $data['message_type'],
            $data['message_status'],
            $id
        ]);
    }



    public function deleteMessage($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `lc_messages` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
