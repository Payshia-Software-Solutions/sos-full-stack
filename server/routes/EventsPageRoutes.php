<?php
require_once './controllers/EventsPageController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$eventsPageController = new EventsPageController($pdo);

// Define routes
return [

    'GET /events-page' => [$eventsPageController, 'getAllEvents'],

    
    'GET /events-page/latest' => [$eventsPageController, 'getLastThreeEvents'],

    'GET /events-page/{slug}' => [$eventsPageController, 'getEventBySlug'],

    'GET /events-page/date/{event_date}' => [$eventsPageController, 'getEventsByDate'],

    'GET /events-page/get/count' => [$eventsPageController, 'countAllEvents'],

    'POST /events-page' => [$eventsPageController, 'createEvent'],

    'PUT /events-page/{slug}' => [$eventsPageController, 'updateEvent'],

    'DELETE /events-page/{slug}' => [$eventsPageController, 'deleteEvent'],

    // 'DELETE /events-page/delete/{id}' => [$eventsPageController, 'deleteEventById'],
];
