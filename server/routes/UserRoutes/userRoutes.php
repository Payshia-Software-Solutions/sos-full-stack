<?php
// routes/userRoutes.php

require_once './controllers/UserController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$userController = new UserController($pdo);

// Define user routes
return [
    'GET /users' => [$userController, 'getUsers'],
    'POST /users' => [$userController, 'createUser'],
    'GET /users/{id}' => [$userController, 'getUser'],
    'GET /users/count' => [$userController, 'getUserCount'],
    'GET /users/username/{username}' => [$userController, 'getUserByUsername'],
    'GET /users/search/{value}' => [$userController, 'getRecordByUsernameOrName'],
    'PUT /users/username/{username}' => [$userController, 'UpdateUserByUsername'],
    'PUT /users/{id}' => [$userController, 'updateUser'],
    'DELETE /users/{id}' => [$userController, 'deleteUser'],
    'POST /users/login' => [$userController, 'login'],
    'GET /users/staff/' => [$userController, 'getStaffUsers'],
];
