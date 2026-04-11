<?php
// models/Chat.php

class Chat
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllChats()
    {
        $sql = "
        SELECT 
            c.id AS chat_id,
            c.name AS user_name,
            COALESCE(lm.message_text, 'No messages yet') AS last_message,
            COALESCE(DATE_FORMAT(lm.created_at, '%h:%i %p'), 'N/A') AS last_message_time,
            false AS online_status, 
            0 AS unread_count,
            c.created_by
        FROM 
            lc_chats c
        LEFT JOIN 
            (SELECT chat_id, message_text, created_at 
             FROM lc_messages 
             WHERE (chat_id, id) IN 
                   (SELECT chat_id, MAX(id) 
                    FROM lc_messages 
                    GROUP BY chat_id)
            ) lm
        ON c.id = lm.chat_id            
        ORDER BY 
            lm.created_at DESC;
    ";
        // Order
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getChatById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_chats` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getChatByUser($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_chats` WHERE `created_by` = ?");
        $stmt->execute([$username]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllRecentChats($username)
    {
        $sql = "
            SELECT 
                c.id AS chat_id,
                c.name AS user_name,
                COALESCE(lm.message_text, 'No messages yet') AS last_message,
                COALESCE(DATE_FORMAT(lm.created_at, '%h:%i %p'), 'N/A') AS last_message_time,
                false AS online_status, 
                0 AS unread_count,
                c.created_by
            FROM 
                lc_chats c
            LEFT JOIN 
                (SELECT chat_id, message_text, created_at 
                 FROM lc_messages 
                 WHERE (chat_id, id) IN 
                       (SELECT chat_id, MAX(id) 
                        FROM lc_messages 
                        GROUP BY chat_id)
                ) lm
            ON c.id = lm.chat_id            
            WHERE 
                `created_by` = ?
            ORDER BY 
                lm.created_at DESC;
        ";
        // Order
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$username]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createChat($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `lc_chats` (`name`, `created_by`) VALUES (?, ?)");
        $stmt->execute([$data['name'], $data['created_by']]);

        // Return the last inserted ID
        return $this->pdo->lastInsertId();
    }

    public function updateChat($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `lc_chats` SET `name` = ?, `created_by` = ? WHERE `id` = ?");
        $stmt->execute([$data['name'], $data['created_by'], $id]);
    }

    public function deleteChat($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `lc_chats` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
