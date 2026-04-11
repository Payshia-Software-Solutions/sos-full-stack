<?php
// routes/chatRoutes.php

require_once './controllers/Chats/ChatController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$chatController = new ChatController($pdo);

// Define chat routes
return [
    'GET /chats/' => [$chatController, 'getChats'],
    'GET /get-recent-chats/{username}/' => [$chatController, 'getAllRecentChats'],
    'GET /chats/{id}/' => [$chatController, 'getChat'],
    'GET /chats/user/{username}/' => [$chatController, 'getChatByUser'],
    'POST /chats/' => [$chatController, 'createChat'],
    'PUT /chats/{id}/' => [$chatController, 'updateChat'],
    'DELETE /chats/{id}/' => [$chatController, 'deleteChat']
];
