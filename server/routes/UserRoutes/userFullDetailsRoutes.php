<?php
// routes/userFullDetailsRoutes.php

require_once './controllers/UserFullDetailsController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$userFullDetailsController = new UserFullDetailsController($pdo);

// Define user full details routes 
return [
    'GET /userFullDetails/' => [$userFullDetailsController, 'getAllUsers'],
    'GET /userFullDetails/{id}/' => [$userFullDetailsController, 'getUserById'],
    'GET /userFullDetails/username/{username}/' => [$userFullDetailsController, 'getUserByUserName'],
    'PUT /userFullDetails/update-certificate-name/{username}/' => [$userFullDetailsController, 'updateCertificateNameByUserName'],
    'POST /userFullDetails/' => [$userFullDetailsController, 'createUser'],
    'PUT /userFullDetails/{id}/' => [$userFullDetailsController, 'updateUser'],
    'DELETE /userFullDetails/{id}/' => [$userFullDetailsController, 'deleteUser']
];
