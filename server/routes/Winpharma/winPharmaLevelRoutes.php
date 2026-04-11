<?php
// routes/Winpharma/winPharmaLevelRoutes.php

require_once './controllers/Winpharma/WinPharmaLevelController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$WinPharmaLevelController = new WinPharmaLevelController($pdo);

// Define Winpharma Level routes
return [
    'GET /win_pharma_level/$' => function () use ($WinPharmaLevelController) {
        $WinPharmaLevelController->getWinPharmaLevels();
    },
    'GET /win_pharma_level/(\d+)/$' => function ($id) use ($WinPharmaLevelController) {
        $WinPharmaLevelController->getWinPharmaLevel($id);
    },
    'GET /win_pharma_level/course/([a-zA-Z0-9_\-]+)/$' => function ($courseCode) use ($WinPharmaLevelController) {
        $WinPharmaLevelController->getWinPharmaLevelsByCourse($courseCode);
    },
    'POST /win_pharma_level/$' => function () use ($WinPharmaLevelController) {
        $WinPharmaLevelController->createWinPharmaLevel();
    },
    'PUT /win_pharma_level/(\d+)/$' => function ($id) use ($WinPharmaLevelController) {
        $WinPharmaLevelController->updateWinPharmaLevel($id);
    },
    'DELETE /win_pharma_level/(\d+)/$' => function ($id) use ($WinPharmaLevelController) {
        $WinPharmaLevelController->deleteWinPharmaLevel($id);
    }
];