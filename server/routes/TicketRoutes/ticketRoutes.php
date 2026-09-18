<?php
require_once './controllers/TicketController.php';
require_once './controllers/TicketMessageController.php';

$pdoChat = $GLOBALS['pdoChat'] ?? $GLOBALS['pdo'];
$ticketController = new TicketController($pdoChat);
$ticketMessageController = new TicketMessageController($pdoChat);

return [
    // Tickets
    'GET /tickets/' => [$ticketController, 'getAll'],
    'GET /tickets/{id}/' => [$ticketController, 'getById'],
    'GET /tickets/username/{username}/' => [$ticketController, 'getByUsername'],
    'POST /tickets/' => [$ticketController, 'create'],
    'POST /tickets/{id}/' => [$ticketController, 'updateTicket'],
    'PUT /tickets/{id}/' => [$ticketController, 'updateTicket'],
    'POST /tickets/{id}/assign/' => [$ticketController, 'assignTicket'],
    'POST /tickets/{id}/unlock/' => [$ticketController, 'unlockTicket'],
    'POST /tickets/{id}/status/' => [$ticketController, 'updateStatus'],
    'DELETE /tickets/{id}/' => [$ticketController, 'delete'],
    'POST /tickets/update-rating/{id}/' => [$ticketController, 'updateRating'],
    'PUT /tickets/update-rating/{id}/' => [$ticketController, 'updateRating'],

    // Ticket Messages
    'GET /ticket-messages/' => [$ticketMessageController, 'getAll'],
    'GET /ticket-messages/by-ticket/{id}/' => [$ticketMessageController, 'getByTicketId'],
    'POST /ticket-messages/' => [$ticketMessageController, 'create'],
    'PUT /ticket-messages/update-read-status/{id}/' => [$ticketMessageController, 'updateReadStatus'],
    'POST /ticket-messages/get-unread-messages/{id}/' => [$ticketMessageController, 'getUnreadMessages'],
    'DELETE /ticket-messages/{id}/' => [$ticketMessageController, 'delete'],
];
