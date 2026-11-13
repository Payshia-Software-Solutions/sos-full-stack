<?php
// controllers/EventController.php

require_once __DIR__ . '/../models/Event.php';

class EventController
{
    private $eventModel;

    public function __construct($pdo)
    {
        $this->eventModel = new Event($pdo);
    }

    public function getAllEvents()
    {
        $events = $this->eventModel->getAllEvents();
        echo json_encode(['success' => true, 'events' => $events]);
    }

    public function getEventBySlug($slug)
    {
        $event = $this->eventModel->getEventBySlug($slug);
        if ($event) {
            echo json_encode(['success' => true, 'event' => $event]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Event not found']);
        }
    }

    public function getEventById($id)
    {
        $event = $this->eventModel->getEventById($id);
        if ($event) {
            echo json_encode(['success' => true, 'event' => $event]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Event not found']);
        }
    }

    public function createEvent()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$this->validate($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title, slug and event date are required']);
            return;
        }

        if ($this->eventModel->getEventBySlug($data['slug'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Slug already exists']);
            return;
        }

        if ($this->eventModel->createEvent($data)) {
            echo json_encode(['success' => true, 'message' => 'Event created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create event']);
        }
    }

    public function updateEvent($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$this->validate($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title, slug and event date are required']);
            return;
        }

        $existing = $this->eventModel->getEventBySlug($data['slug']);
        if ($existing && $existing['id'] != $id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Slug already exists']);
            return;
        }

        if ($this->eventModel->updateEvent($id, $data)) {
            echo json_encode(['success' => true, 'message' => 'Event updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update event']);
        }
    }

    public function deleteEvent($id)
    {
        if ($this->eventModel->deleteEvent($id)) {
            echo json_encode(['success' => true, 'message' => 'Event deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete event']);
        }
    }

    public function uploadImage()
    {
        if (!isset($_FILES['image'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No image provided']);
            return;
        }

        $file = $_FILES['image'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File upload error']);
            return;
        }

        $ftpConfig = include(__DIR__ . '/../config/ftp.php');
        $uploadDirectory = '/content-provider/uploads/events/';

        $ftpConn = ftp_connect($ftpConfig['ftp_server']);
        if (!$ftpConn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'FTP connection failed']);
            return;
        }

        if (!ftp_login($ftpConn, $ftpConfig['ftp_username'], $ftpConfig['ftp_password'])) {
            ftp_close($ftpConn);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'FTP login failed']);
            return;
        }

        ftp_pasv($ftpConn, true);

        // Ensure the upload directory exists
        $parts = explode('/', trim($uploadDirectory, '/'));
        $path = '';
        foreach ($parts as $part) {
            $path .= '/' . $part;
            if (!@ftp_chdir($ftpConn, $path)) {
                ftp_mkdir($ftpConn, $path);
            }
        }
        ftp_chdir($ftpConn, '/');

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('event_') . '.' . $extension;
        $remoteFilePath = $uploadDirectory . $filename;

        if (ftp_put($ftpConn, $remoteFilePath, $file['tmp_name'], FTP_BINARY)) {
            ftp_close($ftpConn);
            echo json_encode(['success' => true, 'url' => $filename]);
        } else {
            ftp_close($ftpConn);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to upload file to FTP']);
        }
    }

    private function validate($data)
    {
        return is_array($data)
            && !empty($data['title'])
            && !empty($data['slug'])
            && !empty($data['event_date'])
            && strtotime($data['event_date']) !== false;
    }
}
