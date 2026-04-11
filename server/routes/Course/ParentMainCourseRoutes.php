<?php
require_once './controllers/Course/ParentMainCourseController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$parentMainCourseController = new ParentMainCourseController($pdo);

// Define routes
return [

    'GET /parent-main-course' => [$parentMainCourseController, 'getAllCourses'],


    'GET /parent-main-course/{slug}' => [$parentMainCourseController, 'getCourseBySlug'],
    'GET /parent-main-course/get-id/{id}' => [$parentMainCourseController, 'getCourseById'],
    'GET /parent-main-course/get-list/get' => [$parentMainCourseController, 'getCoursesByIds'],

    'GET /parent-main-course/get/active' => [$parentMainCourseController, 'getActiveCourses'],


    'GET /parent-main-course/get/count-by-mode' => [$parentMainCourseController, 'countCoursesByMode'],

    'GET /parent-main-course/code/{course_code}' => [$parentMainCourseController, 'getCourseByCourseCode'],

    'GET /parent-main-course/get/counts' => [$parentMainCourseController, 'countAllCourses'],


    'GET /parent-main-course/skill-level/{skill_level}' => [$parentMainCourseController, 'getCoursesBySkillLevel'],


    'POST /parent-main-course' => [$parentMainCourseController, 'createCourse'],


    'PUT /parent-main-course/{slug}' => [$parentMainCourseController, 'updateCourse'],


    'DELETE /parent-main-course/{slug}' => [$parentMainCourseController, 'deleteCourse'],


    'DELETE /parent-main-course/{id}' => [$parentMainCourseController, 'deleteCourseById'],


    'POST /parent-main-course/generate-slug/{course_code}' => [$parentMainCourseController, 'generateSlugByCourseCode'],

];
