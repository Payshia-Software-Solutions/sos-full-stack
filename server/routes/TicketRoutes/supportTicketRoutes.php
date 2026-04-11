<?php

require_once './controllers/SupportTicketController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$supportTicketController = new SupportTicketController($pdo);

// Define routes for support tickets
return [
    'GET /tickets/' => [$supportTicketController, 'getAllRecords'],
    'GET /tickets/{id}/' => [$supportTicketController, 'getRecordById'],
    'GET /tickets/replies/{id}/' => [$supportTicketController, 'getTicketReplies'],
    'GET /tickets/username/{username}/' => [$supportTicketController, 'getRecordByUsername'],
    'GET /get-main-tickets/username/{username}/' => [$supportTicketController, 'getMainTicketsByUsername'],
    'POST /tickets/' => [$supportTicketController, 'createRecord'],
    'PUT /tickets/{ticket_id}/' => [$supportTicketController, 'updateRecord'],
    'DELETE /tickets/{ticket_id}/' => [$supportTicketController, 'deleteRecord']
];
