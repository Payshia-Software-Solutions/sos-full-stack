<?php
// routes/messageRoutes.php

require_once './controllers/Chats/MessageController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$messageController = new MessageController($pdo);

// Define message routes
return [
    'GET /messages/' => [$messageController, 'getMessages'],
    'GET /messages/{id}/' => [$messageController, 'getMessage'],
    'GET /messages/chat/{id}/' => [$messageController, 'getMessageByChatId'],
    'GET /messages/get-last/{id}/' => [$messageController, 'getLastMessage'],
    'POST /messages/' => [$messageController, 'createMessage'],
    'PUT /messages/{id}/' => [$messageController, 'updateMessage'],
    'DELETE /messages/{id}/' => [$messageController, 'deleteMessage']
];
