<?php

require_once './controllers/PharmaReaderController.php';

$pdo = $GLOBALS['pdo'];
$controller = new PharmaReaderController($pdo);

return [
    // Get all prescriptions (admin list)
    'GET /pharma-reader/prescriptions/$' => function () use ($controller) {
        return $controller->getAllPrescriptions();
    },

    // Get all prescriptions for a course
    'GET /pharma-reader/prescriptions/course/([a-zA-Z0-9_-]+)/$' => function ($courseCode) use ($controller) {
        return $controller->getAllPrescriptions($courseCode);
    },

    // Get a prescription by ID
    'GET /pharma-reader/prescriptions/(\d+)/$' => function ($id) use ($controller) {
        return $controller->getPrescriptionById($id);
    },

    // Get a random unanswered prescription for a student with difficulty and course
    'GET /pharma-reader/prescription/random/([a-zA-Z0-9_\-]+)/([a-zA-Z]+)/course/([a-zA-Z0-9_-]+)/$' => function ($userId, $difficulty, $courseCode) use ($controller) {
        return $controller->getRandomUnansweredPrescription($userId, $difficulty, $courseCode);
    },

    // Get a random unanswered prescription for a student with difficulty (no course)
    'GET /pharma-reader/prescription/random/([a-zA-Z0-9_\-]+)/([a-zA-Z]+)/$' => function ($userId, $difficulty) use ($controller) {
        return $controller->getRandomUnansweredPrescription($userId, $difficulty);
    },

    // Create a new prescription
    'POST /pharma-reader/prescription/$' => function () use ($controller) {
        return $controller->createPrescription();
    },

    // Update a prescription by ID
    'PUT /pharma-reader/prescription/(\d+)/$' => function ($id) use ($controller) {
        return $controller->updatePrescription($id);
    },

    // Delete a prescription by ID
    'DELETE /pharma-reader/prescription/(\d+)/$' => function ($id) use ($controller) {
        return $controller->deletePrescription($id);
    },

    // Submit a student answer attempt
    'POST /pharma-reader/attempt/$' => function () use ($controller) {
        return $controller->submitAttempt();
    },

    // Get student grades
    'GET /pharma-reader/grades/([a-zA-Z0-9_\-]+)/$' => function ($userId) use ($controller) {
        return $controller->getUserGrades($userId);
    },

    // Upload prescription image
    'POST /pharma-reader/upload-image/$' => function () use ($controller) {
        return $controller->uploadImage();
    },

    // Get Admin Settings (global)
    'GET /pharma-reader/settings/$' => function () use ($controller) {
        return $controller->getSettings();
    },

    // Get Admin Settings for a course
    'GET /pharma-reader/settings/course/([a-zA-Z0-9_-]+)/$' => function ($courseCode) use ($controller) {
        return $controller->getSettings($courseCode);
    },

    // Save Admin Settings (global)
    'POST /pharma-reader/settings/$' => function () use ($controller) {
        return $controller->saveSettings();
    },

    // Save Admin Settings for a course
    'POST /pharma-reader/settings/course/([a-zA-Z0-9_-]+)/$' => function ($courseCode) use ($controller) {
        return $controller->saveSettings($courseCode);
    },

    // Get User Progress by difficulty for a specific course
    'GET /pharma-reader/progress/([a-zA-Z0-9_\-]+)/course/([a-zA-Z0-9_-]+)/$' => function ($userId, $courseCode) use ($controller) {
        return $controller->getProgress($userId, $courseCode);
    },

    // Get User Progress by difficulty
    'GET /pharma-reader/progress/([a-zA-Z0-9_\-]+)/$' => function ($userId) use ($controller) {
        return $controller->getProgress($userId);
    },

    // ─── Course Assignments ─────────────────────────────────────────────

    // Assign a prescription to a course
    'POST /pharma-reader/course-assignments/assign/$' => function () use ($controller) {
        return $controller->assignToCourse();
    },

    // Unassign a prescription from a course
    'POST /pharma-reader/course-assignments/unassign/$' => function () use ($controller) {
        return $controller->unassignFromCourse();
    },

    // Get all course assignments
    'GET /pharma-reader/course-assignments/$' => function () use ($controller) {
        return $controller->getAllCourseAssignments();
    }
];
