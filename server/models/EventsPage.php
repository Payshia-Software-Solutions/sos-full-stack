<?php

class EventsPage
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

  
    // Fetch all events
    public function getAllEvents()
    {
        $stmt = $this->pdo->query("SELECT * FROM events_page");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch an event by slug
    public function getEventBySlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM events_page WHERE slug = :slug");
        $stmt->execute(['slug' => $slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new event
    public function createEvent($data)
    {
        $data['created_at'] = date('Y-m-d H:i:s');
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'])));
        $data['slug'] = $this->generateUniqueSlug($slug);
    
        // Make sure only the required keys are passed
        $cleanData = [
            'event_date' => $data['event_date'] ?? null,
            'label' => $data['label'] ?? '',
            'title' => $data['title'],
            'mini_description' => $data['mini_description'] ?? '',
            'description' => $data['description'] ?? '',
            'slug' => $data['slug'],
            'phone' => $data['phone'] ?? '',
            'image_url' => $data['image_url'] ?? '',
            'created_at' => $data['created_at']
        ];
    
        $sql = "INSERT INTO events_page 
            (event_date, label, title, mini_description, description, slug, phone, image_url, created_at) 
            VALUES 
            (:event_date, :label, :title, :mini_description, :description, :slug, :phone, :image_url, :created_at)";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($cleanData);
    }
    

    // Update an event
    public function updateEvent($slug, $data)
    {
        $existingEvent = $this->getEventBySlug($slug);
        if (!$existingEvent) {
            throw new Exception("Event not found");
        }

        $updatedData = array_merge($existingEvent, $data);

        $sql = "UPDATE events_page SET 
                    event_date = :event_date, 
                    label = :label, 
                    title = :title, 
                    mini_description = :mini_description, 
                    description = :description, 
                    phone = :phone, 
                    image_url = :image_url, 
                    slug = :slug
                WHERE slug = :old_slug";
        
        $stmt = $this->pdo->prepare($sql);
        $updatedData['old_slug'] = $slug;
        $stmt->execute($updatedData);
    }

    // Delete an event by slug
    public function deleteEvent($slug)
    {
        $stmt = $this->pdo->prepare("DELETE FROM events_page WHERE slug = :slug");
        $stmt->execute(['slug' => $slug]);
        return $stmt->rowCount(); // returns number of deleted rows
    }

    // Fetch events by date
    public function getEventsByDate($event_date)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM events_page WHERE event_date = :event_date");
        $stmt->execute(['event_date' => $event_date]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Helper method to generate a unique slug
    private function generateUniqueSlug($slug)
    {
        $originalSlug = $slug;
        $counter = 1;

        while ($this->slugExists($slug)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    // Helper method to check if a slug exists
    private function slugExists($slug)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM events_page WHERE slug = :slug");
        $stmt->execute(['slug' => $slug]);
        return $stmt->fetchColumn() > 0;
    }


    // Fetch the last 3 created events
public function getLastThreeEvents()
{
    $stmt = $this->pdo->query("SELECT * FROM events_page ORDER BY created_at DESC LIMIT 3");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

}
