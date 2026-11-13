<?php
// routes/EventRoutes.php

require_once __DIR__ . '/../controllers/EventController.php';

$eventController = new EventController($pdo);

return [
    'GET /api/events' => function () use ($eventController) {
        $eventController->getAllEvents();
    },
    'GET /api/events/{slug}' => function ($slug) use ($eventController) {
        $eventController->getEventBySlug($slug);
    },
    'GET /api/events/id/{id}' => function ($id) use ($eventController) {
        $eventController->getEventById($id);
    },
    'POST /api/events/upload-image' => function () use ($eventController) {
        $eventController->uploadImage();
    },
    'POST /api/events' => function () use ($eventController) {
        $eventController->createEvent();
    },
    'PUT /api/events/{id}' => function ($id) use ($eventController) {
        $eventController->updateEvent($id);
    },
    'DELETE /api/events/{id}' => function ($id) use ($eventController) {
        $eventController->deleteEvent($id);
    },
];
