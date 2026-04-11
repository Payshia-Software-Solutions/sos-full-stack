<?php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareAnswerSubmitController.php';

$pdo = $GLOBALS['pdo'];
$careAnswerSubmitController = new CareAnswerSubmitController($pdo);

return [
    'GET /care-answer-submits/$' => function () use ($careAnswerSubmitController) {
        $careAnswerSubmitController->getAll();
    },
    'GET /care-answer-submits/(\d+)/$' => function ($id) use ($careAnswerSubmitController) {
        $careAnswerSubmitController->getById($id);
    },
    'POST /care-answer-submits/$' => function () use ($careAnswerSubmitController) {
        $careAnswerSubmitController->create();
    },
    'POST /care-answer-submits/validate/$' => function () use ($careAnswerSubmitController) {
        $careAnswerSubmitController->validateAndCreate();
    },
    'PUT /care-answer-submits/(\d+)/$' => function ($id) use ($careAnswerSubmitController) {
        $careAnswerSubmitController->update($id);
    },
    'DELETE /care-answer-submits/(\d+)/$' => function ($id) use ($careAnswerSubmitController) {
        $careAnswerSubmitController->delete($id);
    },
    'GET /care-answer-submits/check/([a-zA-Z0-9_\\-]+)/([a-zA-Z0-9_\\-]+)/([a-zA-Z0-9_\\-]+)/$' => function ($studentNumber, $presId, $coverId) use ($careAnswerSubmitController) {
        $careAnswerSubmitController->findCorrectSubmission($studentNumber, $presId, $coverId);
    },
];
