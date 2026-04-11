<?php
require_once './controllers/TestimonialController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo']; // Assuming $pdo is already initialized globally
$testimonialController = new TestimonialsController($pdo);

// Define routes
return [
    'GET /testimonials' => [$testimonialController, 'getAllTestimonials'], // Get all testimonials
    'GET /testimonials/{id}' => [$testimonialController, 'getTestimonialById'], // Get testimonial by ID
    'POST /testimonials' => [$testimonialController, 'createTestimonial'], // Create a new testimonial
    'PUT /testimonials/{id}' => [$testimonialController, 'updateTestimonial'], // Update testimonial by ID
    'DELETE /testimonials/{id}' => [$testimonialController, 'deleteTestimonial'], // Delete testimonial by ID
];
