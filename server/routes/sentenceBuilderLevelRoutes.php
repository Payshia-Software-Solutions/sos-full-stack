<?php
// routes/sentenceBuilderLevelRoutes.php

require_once './controllers/SentenceBuilderLevelController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$sentenceBuilderLevelController = new SentenceBuilderLevelController($pdo);

// Define an array of routes
return [
    // Get all levels
    'GET /sentence-builder-levels/$' => function () use ($sentenceBuilderLevelController) {
        return $sentenceBuilderLevelController->getAll();
    },

    // Get a level by ID
    'GET /sentence-builder-levels/(\d+)/$' => function ($id) use ($sentenceBuilderLevelController) {
        return $sentenceBuilderLevelController->getById($id);
    },

    // Create a new level
    'POST /sentence-builder-levels/$' => function () use ($sentenceBuilderLevelController) {
        return $sentenceBuilderLevelController->create();
    },

    // Update a level by ID
    'PUT /sentence-builder-levels/(\d+)/$' => function ($id) use ($sentenceBuilderLevelController) {
        return $sentenceBuilderLevelController->update($id);
    },

    // Delete a level by ID
    'DELETE /sentence-builder-levels/(\d+)/$' => function ($id) use ($sentenceBuilderLevelController) {
        return $sentenceBuilderLevelController->delete($id);
    },
];