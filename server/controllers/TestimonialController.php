<?php
// controllers/TestimonialController.php

require_once './models/Testimonial.php';

class TestimonialsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Testimonials($pdo);
    }

    // Get all testimonials
    public function getAllTestimonials()
    {
        $testimonials = $this->model->getAllTestimonials();
        echo json_encode($testimonials);
    }

    // Get a testimonial by ID
    public function getTestimonialById($id)
    {
        $testimonial = $this->model->getTestimonialById($id);
        echo json_encode($testimonial);
    }

    // Create a new testimonial
    public function createTestimonial()
    {
        $data = json_decode(file_get_contents('php://input'), true); // Get POST data
        if ($this->validateTestimonialData($data)) {
            $this->model->createTestimonial($data);
            echo json_encode(['status' => 'Testimonial created']);
        } else {
            echo json_encode(['status' => 'Error', 'message' => 'Invalid data']);
        }
    }

    // Update a testimonial
    public function updateTestimonial($id)
    {
        $data = json_decode(file_get_contents('php://input'), true); // Get PUT data
        if ($this->validateTestimonialData($data)) {
            $this->model->updateTestimonial($id, $data);
            echo json_encode(['status' => 'Testimonial updated']);
        } else {
            echo json_encode(['status' => 'Error', 'message' => 'Invalid data']);
        }
    }

    // Delete a testimonial
    public function deleteTestimonial($id)
    {
        $this->model->deleteTestimonial($id);
        echo json_encode(['status' => 'Testimonial deleted']);
    }

    // Basic validation for testimonial data
    private function validateTestimonialData($data)
    {
        return isset($data['name'], $data['comment'], $data['rating']) && is_numeric($data['rating']) && $data['rating'] >= 1 && $data['rating'] <= 5;
    }
}
?>