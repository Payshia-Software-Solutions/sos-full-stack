<?php
require_once './models/Course/ParentMainCourse.php';

class ParentMainCourseController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new ParentMainCourse($pdo);
    }

    // Get all course records
    public function getAllCourses()
    {
        $courses = $this->model->getAllCourses();
        echo json_encode($courses);
    }

    // Get a single course by slug
    public function getCourseBySlug($slug)
    {
        $course = $this->model->getCourseBySlug($slug);
        if ($course) {
            echo json_encode($course);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
        }
    }

    // Get a single course by course_code
    public function getCourseById($id)
    {
        $course = $this->model->getCourseById($id);
        if ($course) {
            echo json_encode($course);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
        }
    }

    public function getCoursesByIds()
    {
        // Get the ids query parameter
        $ids = isset($_GET['ids']) ? $_GET['ids'] : '';

        if (empty($ids)) {
            http_response_code(400);
            echo json_encode(['error' => 'No course IDs provided']);
            return;
        }

        // Split the comma-separated ids into an array
        $idArray = explode(',', $ids);

        // Fetch courses
        $courses = $this->model->getCoursesByIds($idArray);

        if ($courses === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch courses']);
            return;
        }

        // Format response
        $response = array_map(function ($course) {
            return [
                'id' => $course['id'],
                'course_name' => $course['course_name']
            ];
        }, $courses);

        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode($response);
    }


    // Get a single course by course_code
    public function getCourseByCourseCode($course_code)
    {
        $course = $this->model->getCourseByCourseCode($course_code);
        if ($course) {
            echo json_encode($course);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
        }
    }

    // Create a new course record
    public function createCourse()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $courseCode = $data['course_code'] ?? null;

        if (!$courseCode) {
            http_response_code(400);
            echo json_encode(['error' => 'Course code is required']);
            return;
        }

        $courseCreated = $this->model->createCourse($data);

        if ($courseCreated) {

            $slug = $this->model->createSlugIfNotExists($courseCode);
            echo json_encode(['message' => 'Course created successfully', 'slug' => $slug]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create course']);
        }
    }

    // Update an existing course record by slug
    public function updateCourse($slug)
    {
        $data = json_decode(file_get_contents("php://input"), true);


        $this->model->updateCourse($slug, $data);

        // Regenerate slug if course_name is updated
        if (!empty($data['course_name'])) {
            $course = $this->model->getCourseBySlug($slug);
            if ($course) {
                $newSlug = $this->model->createSlugIfNotExists($course['course_code']);
                echo json_encode(['message' => 'Course updated successfully', 'new_slug' => $newSlug]);
                return;
            }
        }

        echo json_encode(['message' => 'Course updated successfully']);
    }

    // Generate a slug if not present (using course_code)
    public function generateSlugByCourseCode($course_code)
    {
        $slug = $this->model->createSlugIfNotExists($course_code);
        if ($slug) {
            echo json_encode(['slug' => $slug]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found or slug generation failed']);
        }
    }



    // Delete a course record by slug
    public function deleteCourse($slug)
    {
        $this->model->deleteCourse($slug);
        echo json_encode(['message' => 'Course deleted successfully']);
    }

    // Delete a course record by ID
    public function deleteCourseById($id)
    {
        $deleted = $this->model->deleteCourseById($id);
        if ($deleted) {
            echo json_encode(['message' => 'Course deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
        }
    }

    // Get all active courses
    public function getActiveCourses()
    {
        $activeCourses = $this->model->getActiveCourses();
        echo json_encode($activeCourses);
    }

    // Count courses by mode (Free or Paid)
    public function countCoursesByMode()
    {
        $courseCounts = $this->model->countCoursesByMode();
        echo json_encode($courseCounts);
    }
    // count alll courses
    public function countAllCourses()
    {
        $count = $this->model->countAllCourses();
        echo json_encode(['total_courses' => $count]);
    }
    // Get courses by skill level
    public function getCoursesBySkillLevel($skill_level)
    {
        $courses = $this->model->getCoursesBySkillLevel($skill_level);
        echo json_encode($courses);
    }
}
