<?php
// routes/sentenceBuilderSentenceRoutes.php

require_once './controllers/SentenceBuilderSentenceController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$sentenceBuilderSentenceController = new SentenceBuilderSentenceController($pdo);

// Define an array of routes
return [
    // Get all sentences
    'GET /sentence-builder-sentences/$' => function () use ($sentenceBuilderSentenceController) {
        return $sentenceBuilderSentenceController->getAll();
    },

    // Get a sentence by ID
    'GET /sentence-builder-sentences/(\d+)/$' => function ($id) use ($sentenceBuilderSentenceController) {
        return $sentenceBuilderSentenceController->getById($id);
    },

    // Get sentences by level ID
    'GET /sentence-builder-sentences/level/(\d+)/$' => function ($level_id) use ($sentenceBuilderSentenceController) {
        return $sentenceBuilderSentenceController->getByLevelId($level_id);
    },

    // Create a new sentence
    'POST /sentence-builder-sentences/$' => function () use ($sentenceBuilderSentenceController) {
        return $sentenceBuilderSentenceController->create();
    },

    // Update a sentence by ID
    'PUT /sentence-builder-sentences/(\d+)/$' => function ($id) use ($sentenceBuilderSentenceController) {
        return $sentenceBuilderSentenceController->update($id);
    },

    // Delete a sentence by ID
    'DELETE /sentence-builder-sentences/(\d+)/$' => function ($id) use ($sentenceBuilderSentenceController) {
        return $sentenceBuilderSentenceController->delete($id);
    },
];