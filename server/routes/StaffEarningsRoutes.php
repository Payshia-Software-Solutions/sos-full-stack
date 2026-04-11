<?php
// --- routes/StaffEarningsRoutes.php ---
require_once './controllers/StaffEarningsController.php';

$pdo = $GLOBALS['pdo'];
$staffEarningsController = new StaffEarningsController($pdo);

return [
    // --- Staff Earnings ---
    'GET /api/staff-earnings/$' => fn() => $staffEarningsController->getAll(),
    'GET /api/staff-earnings/(\d+)/$' => fn($id) => $staffEarningsController->getById($id),
    'POST /api/staff-earnings/$' => fn() => $staffEarningsController->create(),
    'PUT /api/staff-earnings/(\d+)/$' => fn($id) => $staffEarningsController->update($id),
    'DELETE /api/staff-earnings/(\d+)/$' => fn($id) => $staffEarningsController->delete($id),
];
