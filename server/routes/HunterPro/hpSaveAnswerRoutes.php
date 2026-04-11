<?php
// routes/hpSaveAnswerRoutes.php

require_once './controllers/HunterPro/HpSaveAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hpSaveAnswerController = new HpSaveAnswerController($pdo);

// Define routes for hp_save_answer
return [
    'GET /hp-answers/{offset}/{limit}/' => [$hpSaveAnswerController, 'getAllAnswers'],
    'GET /hp-answers/username/{username}/' => [$hpSaveAnswerController, 'getAnswerByUsername'],
    'GET /hp-saved-answers-counts/' => [$hpSaveAnswerController, 'getHunterSavedAnswers'],
    'GET /hp-answers/{id}/' => [$hpSaveAnswerController, 'getAnswer'],
    'POST /hp-answers/' => [$hpSaveAnswerController, 'createAnswer'],
    'PUT /hp-answers/{id}/' => [$hpSaveAnswerController, 'updateAnswer'],
    'DELETE /hp-answers/{id}/' => [$hpSaveAnswerController, 'deleteAnswer'],
];
