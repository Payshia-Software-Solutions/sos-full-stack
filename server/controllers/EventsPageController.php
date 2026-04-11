<?php
require_once './models/EventsPage.php';

class EventsPageController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new EventsPage($pdo);
    }

    // Get all events
    public function getAllEvents()
    {
        $events = $this->model->getAllEvents();
        echo json_encode($events);
    }

    // Get an event by slug
    public function getEventBySlug($slug)
    {
        $event = $this->model->getEventBySlug($slug);
        if ($event) {
            echo json_encode($event);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
        }
    }

    // Create a new event
    public function createEvent()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['title']) || empty($data['event_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and Event Date are required']);
            return;
        }

        $eventCreated = $this->model->createEvent($data);

        if ($eventCreated) {
            echo json_encode(['message' => 'Event created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create event']);
        }
    }

    // Update an event by slug
    public function updateEvent($slug)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $updated = $this->model->updateEvent($slug, $data);
        if ($updated) {
            echo json_encode(['message' => 'Event updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
        }
    }

    // Delete an event by slug
    public function deleteEvent($slug)
    {
        $deleted = $this->model->deleteEvent($slug);
        if ($deleted) {
            echo json_encode(['message' => 'Event deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
        }
    }

    // Get events by date
    public function getEventsByDate($event_date)
    {
        $events = $this->model->getEventsByDate($event_date);
        echo json_encode($events);
    }


    // Get the last 3 events
public function getLastThreeEvents()
{
    $events = $this->model->getLastThreeEvents();
    echo json_encode($events);
}


}
