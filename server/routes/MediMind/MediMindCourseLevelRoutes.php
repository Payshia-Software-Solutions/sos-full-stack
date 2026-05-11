<?php
require_once __DIR__ . '/../../controllers/MediMindCourseLevelController.php';

$pdo = $GLOBALS['pdo'];
$controller = new MediMindCourseLevelController($pdo);

return [
    'GET /medi-mind-course-levels/' => [$controller, 'getAllAssignments'],
    'GET /medi-mind-course-levels/course/{course_code}/' => [$controller, 'getByCourse'],
    'POST /medi-mind-course-levels/student-levels/' => [$controller, 'getLevelsForStudent'],
    'POST /medi-mind-course-levels/assign/' => [$controller, 'assignLevel'],
    'POST /medi-mind-course-levels/unassign/' => [$controller, 'unassignLevel'],
    'GET /medi-mind-course-levels/report/{course_code}/' => [$controller, 'getBatchProgressReport'],
];
