<?php
// models/Attachment.php

class Attachment
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllAttachments()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_attachments`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAttachmentById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `lc_attachments` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createAttachment($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `lc_attachments` (`message_id`, `file_path`, `file_type`) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['message_id'],
            $data['file_path'],
            $data['file_type']
        ]);
    }

    public function updateAttachment($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `lc_attachments` SET `message_id` = ?, `file_path` = ?, `file_type` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['message_id'],
            $data['file_path'],
            $data['file_type'],
            $id
        ]);
    }

    public function deleteAttachment($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `lc_attachments` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
