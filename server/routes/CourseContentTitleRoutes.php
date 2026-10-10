<?php
// --- routes/CourseContentTitleRoutes.php ---
require_once './controllers/CourseContentTitleController.php';

$pdo = $GLOBALS['pdo'];
$courseContentTitleController = new CourseContentTitleController($pdo);

return [
    // --- Course Content Titles ---
    'GET /course-content-titles/$' => fn() => $courseContentTitleController->getAll(),
    'GET /course-content-titles/(\d+)/$' => fn($id) => $courseContentTitleController->getById($id),
    'GET /course-content-titles/course/([a-zA-Z0-9_\-]+)/$' => fn($course_code) => $courseContentTitleController->getByCourseCode($course_code),
    'POST /course-content-titles/$' => fn() => $courseContentTitleController->create(),
    'PUT /course-content-titles/(\d+)/$' => fn($id) => $courseContentTitleController->update($id),
    'DELETE /course-content-titles/(\d+)/$' => fn($id) => $courseContentTitleController->delete($id),
];
