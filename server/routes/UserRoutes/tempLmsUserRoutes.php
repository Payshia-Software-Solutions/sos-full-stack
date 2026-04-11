<?php
// routes/tempLmsUserRoutes.php

require_once './controllers/Users/templmsuserController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$tempLmsUserController = new TempLmsUserController($pdo, $templatePath);

// Define routes for TempLmsUser
return [
    'GET /temp-users' => [$tempLmsUserController, 'getAllUsers'],
    'GET /test-email' => [$tempLmsUserController, 'SendEmailTest'],
    'POST /temp-users' => [$tempLmsUserController, 'createUser'],
    'GET /temp-users/{id}' => [$tempLmsUserController, 'getUserById'],
    'PUT /temp-users/{id}' => [$tempLmsUserController, 'updateUser'],
    'DELETE /temp-users/{id}' => [$tempLmsUserController, 'deleteUser'],
    'GET /temp-users/count' => [$tempLmsUserController, 'countUsers'],
    'GET /temp-users/status/{status}' => [$tempLmsUserController, 'getUsersByApprovalStatus'],
    'GET /temp-users/course/{course}' => [$tempLmsUserController, 'getUsersByCourse'],

];
