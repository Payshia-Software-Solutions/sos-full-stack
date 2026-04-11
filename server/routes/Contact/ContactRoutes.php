<?php
require_once './controllers/Contact/ContactController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$contactController = new ContactController($pdo);

// Define routes
return [
    // Get all contacts
    'GET /contacts/' => [$contactController, 'getAllContacts'],

    // Get a contact by ID
    'GET /contacts/{id}/' => [$contactController, 'getContactById'],

    // Create a new contact
    'POST /contacts/' => [$contactController, 'createContact'],

    // Update a contact by ID
    'PUT /contacts/{id}/' => [$contactController, 'updateContact'],

    // Delete a contact by ID
    'DELETE /contacts/{id}/' => [$contactController, 'deleteContact']
];
