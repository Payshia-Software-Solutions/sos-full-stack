<?php
require_once './controllers/Orders/DeliveryOrderController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$deliveryOrderController = new DeliveryOrderController($pdo);

// Define routes
return [
    // Get all delivery orders
    'GET /delivery_orders/' => [$deliveryOrderController, 'getAllRecords'],

    // Get a delivery order by ID
    'GET /delivery_orders/{id}/' => [$deliveryOrderController, 'getRecordById'],

    'GET /delivery_orders\?indexNumber=[\w]+/$' => function () use ($deliveryOrderController) {
        // Access query parameters using $_GET
        $indexNumber = isset($_GET['indexNumber']) ? $_GET['indexNumber'] : null;

        // Validate parameters
        if (!$indexNumber) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. indexNumber is required for this API']);
            return;
        }

        return $deliveryOrderController->getRecordByIndexNumber($indexNumber);
    },

    'GET /delivery_orders\?indexNumber=[\w]+&receivedStatus=[\w]+/$' => function () use ($deliveryOrderController) {
    // Access query parameters using $_GET
    $indexNumber = isset($_GET['indexNumber']) ? $_GET['indexNumber'] : null;
    $receivedStatus = isset($_GET['receivedStatus']) 
    ? ($_GET['receivedStatus'] == 'true' ? 'Received' : 'Not Received')  // Check if receivedStatus is 'true'
    : 'Not Received';  // Default to 'Not Received' if not provided

    // Validate parameters
    if (!$indexNumber) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters. indexNumber is required for this API']);
        return;
    }

    // Optionally, validate the receivedStatus if needed
    if (!in_array($receivedStatus, ['Received', 'Not Received', 'Shipped'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid receivedStatus value.']);
        return;
    }

    // Call the controller method with both parameters
    return $deliveryOrderController->getRecordByIndexNumberAndStatus($indexNumber, $receivedStatus);
},


    // Get a delivery order by Tracking Number
    'GET /delivery_orders\?trackingNumber=[\w]+/$' => function () use ($deliveryOrderController) {
        // Access query parameters using $_GET
        $trackingNumber = isset($_GET['trackingNumber']) ? $_GET['trackingNumber'] : null;

        // Validate parameters
        if (!$trackingNumber) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. trackingNumber is required for this API']);
            return;
        }

        return $deliveryOrderController->getRecordByTrackingNumber($trackingNumber);
    },



    // Create a new delivery order
    'POST /delivery_orders/' => [$deliveryOrderController, 'createRecord'],

    // Update a delivery order by ID
    'PUT /delivery_orders/{id}/' => [$deliveryOrderController, 'updateRecord'],

    'PUT /delivery_orders/update-status/{id}/' => [$deliveryOrderController, 'updateOrderStatus'],
    
    // Delete a delivery order by ID
    'DELETE /delivery_orders/{id}/' => [$deliveryOrderController, 'deleteRecord'],



    // In the routes file

    // Get a delivery order by Current Status
    'GET /delivery_orders\?currentStatus=[\w]+/$' => function () use ($deliveryOrderController) {
        // Access query parameters using $_GET
        $currentStatus = isset($_GET['currentStatus']) ? $_GET['currentStatus'] : null;

        // Validate parameters
        if (!$currentStatus) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. currentStatus is required for this API']);
            return;
        }

        return $deliveryOrderController->getRecordByCurrentStatus($currentStatus);
    },

];