<?php

require_once './controllers/ConvocationRegistrationByConvocationController.php';

return [
    'GET /convocation-registrations/convocation/{id}/'=> function ($id) use ($pdo) {
        $controller = new ConvocationRegistrationByConvocationController($pdo);
        $controller->getRegistrationsByConvocationId($id);
    },
];
