<?php
require_once './controllers/Hunter/HunterSaveAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterSaveAnswerController = new HunterSaveAnswerController($pdo);

// Define routes
return [
    'GET /hunter_saveanswer/' => [$hunterSaveAnswerController, 'getAllRecords'],
    'GET /hunter_saveanswer/{id}/' => [$hunterSaveAnswerController, 'getRecordById'],
    'POST /hunter_saveanswer/' => [$hunterSaveAnswerController, 'createRecord'],
    'PUT /hunter_saveanswer/{id}/' => [$hunterSaveAnswerController, 'updateRecord'],
    'DELETE /hunter_saveanswer/{id}/' => [$hunterSaveAnswerController, 'deleteRecord'],
    'GET /hunter_saveanswer/' => [$hunterSaveAnswerController, 'getAllSavedAnswers'],
    'GET /hunter_saveanswer/{username}/' => [$hunterSaveAnswerController, 'HunterSavedAnswersByUser'],


];
