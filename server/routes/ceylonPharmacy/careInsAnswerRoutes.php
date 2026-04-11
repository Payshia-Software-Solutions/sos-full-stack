<?php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareInsAnswerController.php';

$pdo = $GLOBALS['pdo'];
$careInsAnswerController = new CareInsAnswerController($pdo);

return [
    'GET /care-ins-answers/$' => function () use ($careInsAnswerController) {
        $careInsAnswerController->getAll();
    },
    'GET /care-ins-answers/(\d+)/$' => function ($id) use ($careInsAnswerController) {
        $careInsAnswerController->getById($id);
    },
    'POST /care-ins-answers/$' => function () use ($careInsAnswerController) {
        $careInsAnswerController->create();
    },
    'PUT /care-ins-answers/(\d+)/$' => function ($id) use ($careInsAnswerController) {
        $careInsAnswerController->update($id);
    },
    'DELETE /care-ins-answers/(\d+)/$' => function ($id) use ($careInsAnswerController) {
        $careInsAnswerController->delete($id);
    },
    'GET /care-ins-answers/check/([a-zA-Z0-9_\\-]+)/([a-zA-Z0-9_\\-]+)/([a-zA-Z0-9_\\-]+)/$' => function ($studentNumber, $presCode, $coverCode) use ($careInsAnswerController) {
        $careInsAnswerController->findCorrectSubmission($studentNumber, $presCode, $coverCode);
    },
];
