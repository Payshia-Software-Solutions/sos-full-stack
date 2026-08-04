<?php
require_once './controllers/Lead/LeadController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$leadController = new LeadController($pdo);

// Define routes
return [
    // Get all leads
    'GET /leads/' => [$leadController, 'getAll'],

    // Get KPI stats
    'GET /leads/stats/' => [$leadController, 'getStats'],

    // Get a lead by ID
    'GET /leads/{id}/' => [$leadController, 'get'],

    // Create a new lead
    'POST /leads/' => [$leadController, 'create'],

    // Update a lead by ID
    'PUT /leads/{id}/' => [$leadController, 'update'],

    // Delete a lead by ID
    'DELETE /leads/{id}/' => [$leadController, 'delete'],

    // Add a log entry for a lead
    'POST /leads/{id}/logs/' => [$leadController, 'addLog']
];
