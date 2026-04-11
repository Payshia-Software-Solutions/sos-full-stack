<?php
// --- routes/CourseContentTitleRoutes.php ---
require_once './controllers/CourseContentTitleController.php';

$pdo = $GLOBALS['pdo'];
$courseContentTitleController = new CourseContentTitleController($pdo);

return [
    // --- Course Content Titles ---
    'GET /api/course-content-titles/$' => fn() => $courseContentTitleController->getAll(),
    'GET /api/course-content-titles/(\d+)/$' => fn($id) => $courseContentTitleController->getById($id),
    'POST /api/course-content-titles/$' => fn() => $courseContentTitleController->create(),
    'PUT /api/course-content-titles/(\d+)/$' => fn($id) => $courseContentTitleController->update($id),
    'DELETE /api/course-content-titles/(\d+)/$' => fn($id) => $courseContentTitleController->delete($id),
];
