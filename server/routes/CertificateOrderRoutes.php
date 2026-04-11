<?php
// routes/CertificateOrderRoutes.php

require_once './controllers/CertificateOrderController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$certificateOrderController = new CertificateOrderController($pdo);

// Define an array of routes
return [
    // GET all certificate orders
    'GET /certificate-orders/$' => function () use ($certificateOrderController) {
        return $certificateOrderController->getOrders();
    },

    // GET all certificate orders by course code
    'GET /certificate-orders/course/([A-Za-z0-9]+)/$' => function ($courseCode) use ($certificateOrderController) {
        return $certificateOrderController->getOrdersByCourseCode($courseCode);
    },

    // GET all certificate orders by student number
    'GET /certificate-orders/student/([A-Za-z0-9]+)/$' => function ($studentNumber) use ($certificateOrderController) {
        return $certificateOrderController->getOrdersByStudentNumber($studentNumber);
    },

    // GET a single certificate order by ID
    'GET /certificate-orders/(\d+)/$' => function ($order_id) use ($certificateOrderController) {
        return $certificateOrderController->getOrder($order_id);
    },

    // GET a single certificate order by certificate ID
    'GET /certificate-orders/certificate/([A-Za-z0-9]+)/$' => function ($certificate_id) use ($certificateOrderController) {
        return $certificateOrderController->getOrderByCertificateId($certificate_id);
    },

    // POST create a new certificate order
    'POST /certificate-orders/$' => function () use ($certificateOrderController) {
        return $certificateOrderController->createOrder();
    },

    // PUT update a certificate order
    'PUT /certificate-orders/(\d+)/$' => function ($order_id) use ($certificateOrderController) {
        return $certificateOrderController->updateOrder($order_id);
    },

    'PUT /certificate-orders/update-courses/(\d+)/$' => function ($orderId) use ($certificateOrderController) {
        return $certificateOrderController->updateCourses($orderId);
    },

    // DELETE a certificate order
    'DELETE /certificate-orders/(\d+)/$' => function ($order_id) use ($certificateOrderController) {
        return $certificateOrderController->deleteOrder($order_id);
    },


];
