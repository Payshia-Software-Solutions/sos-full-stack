<?php

require_once './controllers/ConvocationStatusController.php';

$pdo = $GLOBALS['pdo'];
$convocationStatusController = new ConvocationStatusController($pdo);

return [
    'PUT /convocations/(\d+)/accept-booking/$' => function ($id) use ($convocationStatusController) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['accept_booking'])) {
            return $convocationStatusController->updateAcceptBooking($id, $data['accept_booking']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    },
];
