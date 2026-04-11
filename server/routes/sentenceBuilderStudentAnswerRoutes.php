<?php
// routes/sentenceBuilderStudentAnswerRoutes.php

require_once './controllers/SentenceBuilderStudentAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$sentenceBuilderStudentAnswerController = new SentenceBuilderStudentAnswerController($pdo);

// Define an array of routes
return [
    // Get all answers
    'GET /sentence-builder-student-answers/$' => function () use ($sentenceBuilderStudentAnswerController) {
        return $sentenceBuilderStudentAnswerController->getAll();
    },

    // Get an answer by ID
    'GET /sentence-builder-student-answers/(\d+)/$' => function ($id) use ($sentenceBuilderStudentAnswerController) {
        return $sentenceBuilderStudentAnswerController->getById($id);
    },

    // Get answers by student number
    'GET /sentence-builder-student-answers/student/([\w-]+)/$' => function ($student_number) use ($sentenceBuilderStudentAnswerController) {
        return $sentenceBuilderStudentAnswerController->getByStudentNumber($student_number);
    },

    // Create a new answer
    'POST /sentence-builder-student-answers/$' => function () use ($sentenceBuilderStudentAnswerController) {
        return $sentenceBuilderStudentAnswerController->create();
    },

    // Update an answer by ID
    'PUT /sentence-builder-student-answers/(\d+)/$' => function ($id) use ($sentenceBuilderStudentAnswerController) {
        return $sentenceBuilderStudentAnswerController->update($id);
    },

    // Delete an answer by ID
    'DELETE /sentence-builder-student-answers/(\d+)/$' => function ($id) use ($sentenceBuilderStudentAnswerController) {
        return $sentenceBuilderStudentAnswerController->delete($id);
    },
];