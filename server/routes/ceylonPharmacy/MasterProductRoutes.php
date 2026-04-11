<?php
// routes/ceylonPharmacy/MasterProductRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/MasterProductController.php';

$pdo = $GLOBALS['pdo'];
$masterProductController = new MasterProductController($pdo);

return [
    'GET /master-products/$' => function () use ($masterProductController) {
        $masterProductController->getAll();
    },
    'GET /master-products/(\d+)/$' => function ($id) use ($masterProductController) {
        $masterProductController->getById($id);
    },
    'POST /master-products/$' => function () use ($masterProductController) {
        $masterProductController->create();
    },
    'PUT /master-products/(\d+)/$' => function ($id) use ($masterProductController) {
        $masterProductController->update($id);
    },
    'POST /master-products/(\d+)/update-name-and-price/$' => function ($id) use ($masterProductController) {
        $masterProductController->updateNameAndPrice($id);
    },
    'DELETE /master-products/(\d+)/$' => function ($id) use ($masterProductController) {
        $masterProductController->delete($id);
    },
];
