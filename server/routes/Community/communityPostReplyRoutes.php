<?php
require_once './controllers/Community/CommunityPostReplyController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$communityPostReplyController = new CommunityPostReplyController($pdo);

// Define routes
return [
    'GET /community-post-reply/' => [$communityPostReplyController, 'getAllRecords'],
    'GET /community-post-reply/{id}/' => [$communityPostReplyController, 'getRecordById'],
    'POST /community-post-reply/' => [$communityPostReplyController, 'createRecord'],
    'PUT /community-post-reply/{id}/' => [$communityPostReplyController, 'updateRecord'],
    'DELETE /community-post-reply/{id}/' => [$communityPostReplyController, 'deleteRecord'],
    'GET /community-post-reply/statistics' => [$communityPostReplyController, 'getReplyStatistics'],
    'GET /community-post-reply/{post_id}/{created_by}/' => [$communityPostReplyController, 'getRecordsByPostId']
];