<?php
// routes/Winpharma/winPharmaLevelResourceRoutes.php

require_once './controllers/Winpharma/WinPharmaLevelResourceController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$WinPharmaLevelResourceController = new WinPharmaLevelResourceController($pdo);

// Define Winpharma Level Resource routes
return [
    'GET /win_pharma_level_resources/$' => function () use ($WinPharmaLevelResourceController) {
        $WinPharmaLevelResourceController->getWinPharmaLevelResources();
    },
    'GET /win_pharma_level_resources/(\d+)/$' => function ($id) use ($WinPharmaLevelResourceController) {
        $WinPharmaLevelResourceController->getWinPharmaLevelResource($id);
    },
    'GET /win_pharma_level_resources/level/(\d+)/$' => function ($id) use ($WinPharmaLevelResourceController) {
        $WinPharmaLevelResourceController->getWinPharmaLevelResourcesByLevel($id);
    },
    'POST /win_pharma_level_resources/$' => function () use ($WinPharmaLevelResourceController) {
        $WinPharmaLevelResourceController->createWinPharmaLevelResource();
    },
    // Support updating via POST + multipart/form-data (PHP does not populate $_POST/$_FILES for PUT multipart)
    'POST /win_pharma_level_resources/(\d+)/$' => function ($id) use ($WinPharmaLevelResourceController) {
        $WinPharmaLevelResourceController->updateWinPharmaLevelResource($id);
    },
    'PUT /win_pharma_level_resources/(\d+)/$' => function ($id) use ($WinPharmaLevelResourceController) {
        $WinPharmaLevelResourceController->updateWinPharmaLevelResource($id);
    },
    'DELETE /win_pharma_level_resources/(\d+)/$' => function ($id) use ($WinPharmaLevelResourceController) {
        $WinPharmaLevelResourceController->deleteWinPharmaLevelResource($id);
    }
];
