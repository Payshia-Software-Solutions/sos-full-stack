<?php
// routes/WordListRoutes.php

require_once './controllers/WordListController.php';

$pdo = $GLOBALS['pdo'];
$wordListController = new WordListController($pdo);

return [
    'GET /word-list/$' => function () use ($wordListController) {
        return $wordListController->getWords();
    },
    'GET /word-list/(\d+)/$' => function ($id) use ($wordListController) {
        return $wordListController->getWord($id);
    },

    'GET /word-list/get-word-for-game/([A-Za-z0-9]+)/$' => function ($studentNumber) use ($wordListController) {
        return $wordListController->getWordForGame($studentNumber);
    },
    'POST /word-list/$' => function () use ($wordListController) {
        return $wordListController->createWord();
    },
    'POST /word-list/(\d+)/$' => function ($id) use ($wordListController) {
        return $wordListController->updateWord($id);
    },
    'DELETE /word-list/(\d+)/$' => function ($id) use ($wordListController) {
        return $wordListController->deleteWord($id);
    },
];
