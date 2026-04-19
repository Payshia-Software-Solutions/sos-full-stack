<?php
require_once './controllers/Orders/DeliveryOrderController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$deliveryOrderController = new DeliveryOrderController($pdo);

// Define routes
return [
    // Get all delivery orders or filter by various parameters
    'GET /delivery_orders/' => function () use ($deliveryOrderController) {
        $indexNumber = $_GET['indexNumber'] ?? null;
        $receivedStatus = $_GET['receivedStatus'] ?? null;
        $trackingNumber = $_GET['trackingNumber'] ?? null;
        $currentStatus = $_GET['currentStatus'] ?? null;

        if ($indexNumber && $receivedStatus) {
            $status = ($receivedStatus == 'true' ? 'Received' : 'Not Received');
            return $deliveryOrderController->getRecordByIndexNumberAndStatus($indexNumber, $status);
        } elseif ($indexNumber) {
            return $deliveryOrderController->getRecordByIndexNumber($indexNumber);
        } elseif ($trackingNumber) {
            return $deliveryOrderController->getRecordByTrackingNumber($trackingNumber);
        } elseif ($currentStatus) {
            return $deliveryOrderController->getRecordByCurrentStatus($currentStatus);
        }

        return $deliveryOrderController->getAllRecords();
    },

    // Get a delivery order by ID
    'GET /delivery_orders/{id}/' => [$deliveryOrderController, 'getRecordById'],

    // Create a new delivery order
    'POST /delivery_orders/' => [$deliveryOrderController, 'createRecord'],

    // Update a delivery order by ID
    'PUT /delivery_orders/{id}/' => [$deliveryOrderController, 'updateRecord'],

    'PUT /delivery_orders/update-status/{id}/' => [$deliveryOrderController, 'updateOrderStatus'],
    
    // Delete a delivery order by ID
    'DELETE /delivery_orders/{id}/' => [$deliveryOrderController, 'deleteRecord'],

];