<?php
// routes/levelRoutes.php

require_once './controllers/LevelController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$LevelController = new LevelController($pdo);

// Define appointment routes
return [
    'GET /levels/' => [$LevelController, 'getLevels'],
    'GET /levels/{id}/' => [$LevelController, 'getLevelById'],
    'POST /levels/' => [$LevelController, 'createLevel'],
    'PUT /levels/{id}/' => [$LevelController, 'updateLevel'],
    'DELETE /levels/{id}/' => [$LevelController, 'deleteLevel']
];