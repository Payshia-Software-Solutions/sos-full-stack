<?php

class Ticket
{
    private $pdo;
    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }
    public function getAll()
    {
        return $this->pdo->query("SELECT * FROM tickets ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tickets WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByUsername($user_name)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tickets WHERE student_name = ?");
        $stmt->execute([$user_name]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $sql = "
        INSERT INTO tickets (
            subject, description, priority, status, created_at,
            student_name, student_avatar, assigned_to,
            assignee_avatar, is_locked, locked_by_staff_id, category, rating_value
        )
        VALUES (
            ?, ?, ?, ?, NOW(),
            ?, ?, ?, ?, ?, ?, ?, ?
        )";

        $stmt = $this->pdo->prepare($sql);

        // Use ?? null so any missing key becomes NULL
        $stmt->execute([
            $data['subject']            ?? null,
            $data['description']        ?? null,
            $data['priority']           ?? null,
            $data['status']             ?? null,
            $data['student_name']       ?? null,
            $data['student_avatar']     ?? null,
            $data['assigned_to']        ?? null,
            $data['assignee_avatar']    ?? null,
            $data['is_locked']          ?? 0,
            $data['locked_by_staff_id'] ?? null,
            $data['category'] ?? null,
            $data['rating_value'] ?? 0
        ]);

        // Get last inserted ID
        return $this->pdo->lastInsertId();
    }

    public function update($id, array $data)
    {
        $fields = [];
        $params = [];

        // Dynamically add fields to update based on the provided data
        if (isset($data['subject'])) {
            $fields[] = "subject = ?";
            $params[] = $data['subject'];
        }
        if (isset($data['description'])) {
            $fields[] = "description = ?";
            $params[] = $data['description'];
        }
        if (isset($data['priority'])) {
            $fields[] = "priority = ?";
            $params[] = $data['priority'];
        }
        if (isset($data['status'])) {
            $fields[] = "status = ?";
            $params[] = $data['status'];
        }
        if (isset($data['student_name'])) {
            $fields[] = "student_name = ?";
            $params[] = $data['student_name'];
        }
        if (isset($data['student_avatar'])) {
            $fields[] = "student_avatar = ?";
            $params[] = $data['student_avatar'];
        }
        if (isset($data['assigned_to'])) {
            $fields[] = "assigned_to = ?";
            $params[] = $data['assigned_to'];
        }
        if (isset($data['assignee_avatar'])) {
            $fields[] = "assignee_avatar = ?";
            $params[] = $data['assignee_avatar'];
        }
        if (isset($data['is_locked'])) {
            $fields[] = "is_locked = ?";
            $params[] = $data['is_locked'];
        }
        if (isset($data['locked_by_staff_id'])) {
            $fields[] = "locked_by_staff_id = ?";
            $params[] = $data['locked_by_staff_id'];
        }
        if (isset($data['category'])) {
            $fields[] = "category = ?";
            $params[] = $data['category'];
        }
        if (isset($data['attachments'])) {
            $fields[] = "attachments = ?";
            $params[] = $data['attachments'];
        }
        if (isset($data['rating_value'])) {
            $fields[] = "rating_value = ?";
            $params[] = $data['rating_value'];
        }

        if (empty($fields)) {
            return 0; // Nothing to update
        }

        // Add the ticket ID to the parameters for the WHERE clause
        $params[] = $id;

        // Prepare the SQL query with the dynamic fields
        $sql = "UPDATE tickets SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        // Return the number of rows affected
        return $stmt->rowCount();
    }

    public function updateAttachments($ticketId, $csvImageUrls)
    {
        $sql = "UPDATE tickets SET attachments = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$csvImageUrls, $ticketId]);
        return $stmt->rowCount(); // Return the number of rows affected
    }

    public function updateStatus($ticketId, $newStatus)
    {
        $stmt = $this->pdo->prepare("UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newStatus, $ticketId]);
    }

    public function assignTicket($ticketId, $assignedTo, $assigneeAvatar, $lockedByStaffId, $isLocked = 0)
    {
        $stmt = $this->pdo->prepare("
        UPDATE tickets 
        SET 
            assigned_to = ?, 
            assignee_avatar = ?, 
            is_locked = ?, 
            locked_by_staff_id = ?, 
            updated_at = NOW() 
        WHERE id = ?
    ");

        $stmt->execute([
            $assignedTo,
            $assigneeAvatar,
            $isLocked,
            $lockedByStaffId,
            $ticketId
        ]);
    }

    public function unlockTicket($id)
    {
        $stmt = $this->pdo->prepare("UPDATE tickets 
        SET is_locked = 0, locked_by_staff_id = NULL, updated_at = NOW() 
        WHERE id = ?");
        $stmt->execute([$id]);
    }


    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM tickets WHERE id = ?");
        $stmt->execute([$id]);
    }

    public function assignToStaff($data)
    {
        $stmt = $this->pdo->prepare("UPDATE tickets SET 
        assigned_to = ?, 
        assignee_avatar = ?, 
        is_locked = ?, 
        locked_by_staff_id = ? 
        WHERE id = ?");

        $stmt->execute([
            $data['assigned_to'],
            $data['assignee_avatar'],
            $data['is_locked'],
            $data['locked_by_staff_id'],
            $data['id'] // ID of the ticket to update
        ]);
    }

    public function getTicketsByCategory($category)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tickets WHERE category = ? ORDER BY created_at DESC");
        $stmt->execute([$category]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateRating($ticketId, $ratingValue)
    {
        $stmt = $this->pdo->prepare("UPDATE tickets SET rating_value = ? WHERE id = ?");
        $stmt->execute([$ratingValue, $ticketId]);
        return $stmt->rowCount(); // Return the number of rows affected
    }
}
