<?php

require_once './controllers/CourseContentController.php';
require_once './controllers/CourseContentUploadController.php';

$pdo = $GLOBALS['pdo'];
$courseContentController = new CourseContentController($pdo);
$courseContentUploadController = new CourseContentUploadController();

return [
    'GET /course-content/course/([a-zA-Z0-9_\-]+)/$' => fn($course_code) => $courseContentController->getByCourseCode($course_code),
    'POST /course-content/upload/$' => fn() => $courseContentUploadController->uploadFile(),
    'POST /course-content/$' => fn() => $courseContentController->create(),
    'PUT /course-content/(\d+)/$' => fn($id) => $courseContentController->update($id),
    'DELETE /course-content/(\d+)/$' => fn($id) => $courseContentController->delete($id),
];
