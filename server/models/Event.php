<?php
// models/Event.php

class Event
{
    private $pdo;

    private const SELECT_COLUMNS = "id, title, slug, event_date, start_time, end_time, location, summary, description, image_url, registration_url, status, created_at, updated_at";

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllEvents()
    {
        $stmt = $this->pdo->query("SELECT " . self::SELECT_COLUMNS . " FROM upcoming_events ORDER BY event_date ASC, start_time ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEventById($id)
    {
        $stmt = $this->pdo->prepare("SELECT " . self::SELECT_COLUMNS . " FROM upcoming_events WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getEventBySlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT " . self::SELECT_COLUMNS . " FROM upcoming_events WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createEvent($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO upcoming_events (title, slug, event_date, start_time, end_time, location, summary, description, image_url, registration_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        return $stmt->execute($this->payload($data));
    }

    public function updateEvent($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE upcoming_events SET title = ?, slug = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, summary = ?, description = ?, image_url = ?, registration_url = ?, status = ? WHERE id = ?");
        $values = $this->payload($data);
        $values[] = $id;
        return $stmt->execute($values);
    }

    public function deleteEvent($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM upcoming_events WHERE id = ?");
        return $stmt->execute([$id]);
    }

    private function payload($data)
    {
        return [
            $data['title'],
            $data['slug'],
            $data['event_date'],
            $data['start_time'] ?? null,
            $data['end_time'] ?? null,
            $data['location'] ?? null,
            $data['summary'] ?? null,
            $data['description'] ?? null,
            $data['image_url'] ?? null,
            $data['registration_url'] ?? null,
            $data['status'] ?? 'published',
        ];
    }
}
