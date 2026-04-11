<?php
// --- routes/CommisionSetupRoutes.php ---
require_once './controllers/CommisionSetupController.php';

$pdo = $GLOBALS['pdo'];
$commisionSetupController = new CommisionSetupController($pdo);

return [
    // --- Commission Setup ---
    'GET /api/commision-setup/$' => fn() => $commisionSetupController->getAll(),
    'GET /api/commision-setup/(\d+)/$' => fn($id) => $commisionSetupController->getById($id),
    'POST /api/commision-setup/$' => fn() => $commisionSetupController->create(),
    'PUT /api/commision-setup/(\d+)/$' => fn($id) => $commisionSetupController->update($id),
    'DELETE /api/commision-setup/(\d+)/$' => fn($id) => $commisionSetupController->delete($id),
];
