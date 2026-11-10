<?php
// routes/Course/CoursePageRoutes.php

require_once __DIR__ . '/../../controllers/Course/CoursePageController.php';

$coursePageController = new CoursePageController($pdo);

return [
    // admin route first so it is never shadowed by the {slug} route
    'GET /api/course-pages/admin/{course_code}' => function ($courseCode) use ($coursePageController) {
        $coursePageController->getAdmin($courseCode);
    },
    'GET /api/course-pages/{slug}' => function ($slug) use ($coursePageController) {
        $coursePageController->getPublic($slug);
    },
    'PUT /api/course-pages/{course_code}' => function ($courseCode) use ($coursePageController) {
        $coursePageController->saveDraft($courseCode);
    },
    'POST /api/course-pages/{course_code}/publish' => function ($courseCode) use ($coursePageController) {
        $coursePageController->publish($courseCode);
    },
    'POST /api/course-pages/{course_code}/cover' => function ($courseCode) use ($coursePageController) {
        $coursePageController->uploadCover($courseCode);
    },
    'GET /api/site-content/{setting_name}' => function ($key) use ($coursePageController) {
        $coursePageController->getSiteContent($key);
    },
    'PUT /api/site-content/{setting_name}' => function ($key) use ($coursePageController) {
        $coursePageController->saveSiteContent($key);
    },
    'GET /run-course-page-migration/' => function () use ($coursePageController) {
        $coursePageController->migrate();
    },
];
