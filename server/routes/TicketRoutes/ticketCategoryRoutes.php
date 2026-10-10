<?php

require_once './controllers/TicketCategoryController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$ticketCategoryController = new TicketCategoryController($pdo);

// Define routes for ticket categories
return [
    'GET /ticket-categories/' => [$ticketCategoryController, 'getAll'],
    'GET /ticket-categories/active/' => [$ticketCategoryController, 'getActive'],
    'GET /ticket-categories/{id}/' => [$ticketCategoryController, 'getById'],
    'POST /ticket-categories/' => [$ticketCategoryController, 'create'],
    'PUT /ticket-categories/{id}/' => [$ticketCategoryController, 'update'],
    'DELETE /ticket-categories/{id}/' => [$ticketCategoryController, 'delete']
];
