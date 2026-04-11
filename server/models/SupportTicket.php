<?php
// models/SupportTicket.php

class SupportTicket
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Fetch all active support tickets
    public function getAllTickets()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `support_ticket` WHERE `is_active` = 1");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single ticket by ID
    public function getTicketById($ticket_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `support_ticket` WHERE `ticket_id` = ?");
        $stmt->execute([$ticket_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Fetch a single ticket by User
    public function getTicketByUsername($user_name)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `support_ticket` WHERE `index_number` = ? ORDER BY `ticket_id` DESC");
        $stmt->execute([$user_name]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single ticket by User
    public function getMainTicketsByUsername($user_name)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `support_ticket` WHERE `index_number` = ? AND parent_id = 0 ORDER BY `ticket_id` DESC");
        $stmt->execute([$user_name]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single ticket by User
    public function getTicketReplies($ticket_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `support_ticket` WHERE `parent_id` = ?");
        $stmt->execute([$ticket_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // Create a new support ticket
    public function createTicket($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `support_ticket` (`index_number`, `subject`, `department`, `related_service`, `ticket`, `attachments`, `created_at`, `is_active`, `to_index_number`, `read_status`, `parent_id`, `rating_value`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['index_number'],
            $data['subject'],
            $data['department'],
            $data['related_service'],
            $data['ticket'],
            $data['attachments'],
            $data['created_at'],
            $data['is_active'],
            $data['to_index_number'],
            $data['read_status'],
            $data['parent_id'],
            $data['rating_value']
        ]);
    }

    // Update an existing ticket
    public function updateTicket($ticket_id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `support_ticket` SET `index_number` = ?, `subject` = ?, `department` = ?, `related_service` = ?, `ticket` = ?, `attachments` = ?, `is_active` = ?, `to_index_number` = ?, `read_status` = ?, `parent_id` = ?, `rating_value` = ? WHERE `ticket_id` = ?");
        $stmt->execute([
            $data['index_number'],
            $data['subject'],
            $data['department'],
            $data['related_service'],
            $data['ticket'],
            $data['attachments'],
            $data['is_active'],
            $data['to_index_number'],
            $data['read_status'],
            $data['parent_id'],
            $data['rating_value'],
            $ticket_id
        ]);
    }

    // Delete a ticket by ID
    public function deleteTicket($ticket_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `support_ticket` WHERE `ticket_id` = ?");
        $stmt->execute([$ticket_id]);
    }
}
