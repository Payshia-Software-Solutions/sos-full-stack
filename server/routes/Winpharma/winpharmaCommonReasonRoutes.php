<?php
// routes/Winpharma/winpharmaCommonReasonRoutes.php

require_once './controllers/Winpharma/WinpharmaCommonReasonController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$WinpharmaCommonReasonController = new WinpharmaCommonReasonController($pdo);

// Define appointment routes
return [
    'GET /winpharma_common_resons/' => [$WinpharmaCommonReasonController, 'getWinpharmaCommonReasons'],
    'GET /winpharma_common_resons/{id}/' => [$WinpharmaCommonReasonController, 'getWinpharmaCommonReason'],
    'POST /winpharma_common_resons/' => [$WinpharmaCommonReasonController, 'createWinpharmaCommonReason'],
    'PUT /winpharma_common_resons/{id}/' => [$WinpharmaCommonReasonController, 'updateWinpharmaCommonReason'],
    'DELETE /winpharma_common_resons/{id}/' => [$WinpharmaCommonReasonController, 'deleteWinpharmaCommonReason']
];

?>