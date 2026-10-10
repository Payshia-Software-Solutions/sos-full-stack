<?php
class TicketMessage
{
    private $pdo;
    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM ticket_messages ORDER BY created_at ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getByTicketId($ticketId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
        $stmt->execute([$ticketId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO ticket_messages (ticket_id, from_role, text, time, created_at, img_url, created_by) VALUES (?, ?, ?, ?, NOW(), ?, ?)");
        $stmt->execute([
            $data['ticket_id'],
            $data['from_role'],
            $data['text'],
            $data['time'],
            $data['img_url'] ?? null,
            $data['created_by']
        ]);

        // Get last inserted ID
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [];

        if (isset($data['ticket_id'])) {
            $fields[] = "ticket_id = ?";
            $params[] = $data['ticket_id'];
        }
        if (isset($data['from_role'])) {
            $fields[] = "from_role = ?";
            $params[] = $data['from_role'];
        }
        if (isset($data['text'])) {
            $fields[] = "text = ?";
            $params[] = $data['text'];
        }
        if (isset($data['time'])) {
            $fields[] = "time = ?";
            $params[] = $data['time'];
        }
        if (isset($data['img_url'])) {
            $fields[] = "img_url = ?";
            $params[] = $data['img_url'];
        }

        if (empty($fields)) {
            return 0; // Nothing to update
        }

        $params[] = $id;

        $sql = "UPDATE ticket_messages SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM ticket_messages WHERE id = ?");
        $stmt->execute([$id]);
    }

    public function updateReadStatus($id, $readStatus)
    {
        $stmt = $this->pdo->prepare("UPDATE ticket_messages SET read_status = ? WHERE id = ?");
        $stmt->execute([$readStatus, $id]);
        return $stmt->rowCount();
    }

    public function getUnreadMessages($id, $readStatus, $fromRole)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? AND read_status = ? AND from_role = ? ORDER BY created_at ASC");
        $stmt->execute([$id, $readStatus, $fromRole]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
