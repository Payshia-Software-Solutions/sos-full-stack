<?php
// routes/CertificationCenter/ccCertificateOrderRoutes.php

require_once './controllers/CertificationCenter/CcCertificateOrderController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$CcCertificateOrderController = new CcCertificateOrderController($pdo);

// Define certificate order routes
return [
    'GET /cc_certificate_order/' => [$CcCertificateOrderController, 'getAllOrders'],           // Route to get all orders
    'GET /cc_certificate_order/by-user/{username}' => [$CcCertificateOrderController, 'getAllOrdersByUsername'],           // Route to get all orders
    'GET /cc_certificate_order/{id}/' => [$CcCertificateOrderController, 'getOrderById'],       // Route to get order by ID
    'POST /cc_certificate_order/' => [$CcCertificateOrderController, 'createOrder'],           // Route to create a new order
    'PUT /cc_certificate_order/{id}/' => [$CcCertificateOrderController, 'updateOrder'],       // Route to update an order by ID
    'PUT /cc_certificate_order/{id}/status' => [$CcCertificateOrderController, 'updateCertificateStatus'], // Route to update only the certificate status
    'DELETE /cc_certificate_order/{id}/' => [$CcCertificateOrderController, 'deleteOrder']     // Route to delete an order by ID
];
