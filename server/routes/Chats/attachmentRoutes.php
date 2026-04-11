<?php
// routes/attachmentRoutes.php

require_once './controllers/Chats/AttachmentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$attachmentController = new AttachmentController($pdo);

// Define attachment routes
return [
    'GET /attachments/' => [$attachmentController, 'getAttachments'],
    'GET /attachments/{id}/' => [$attachmentController, 'getAttachment'],
    'POST /attachments/' => [$attachmentController, 'createAttachment'],
    'PUT /attachments/{id}/' => [$attachmentController, 'updateAttachment'],
    'DELETE /attachments/{id}/' => [$attachmentController, 'deleteAttachment']
];
