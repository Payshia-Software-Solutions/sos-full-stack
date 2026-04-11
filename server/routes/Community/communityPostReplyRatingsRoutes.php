<?php
require_once './controllers/Community/CommunityPostReplyRatingsController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$communityReplyRatingsController = new CommunityPostReplyRatingsController($pdo);

// Define routes
return [
    'GET /community-post-reply-ratings/' => [$communityReplyRatingsController, 'getAllRecords'],
    'GET /community-post-reply-ratings/{reply_id}/' => [$communityReplyRatingsController, 'getRecordById'],
    'POST /community-post-reply-ratings/' => [$communityReplyRatingsController, 'createOrUpdateRecord'], // Updated to use createOrUpdateRecord
    'PUT /community-post-reply-ratings/{reply_id}/' => [$communityReplyRatingsController, 'updateRecord'], // You might want to remove this if the update is handled in createOrUpdateRecord
    'DELETE /community-post-reply-ratings/{reply_id}/' => [$communityReplyRatingsController, 'deleteRecord'],
    'GET /community-post-reply-ratings/check/{reply_id}/{created_by}/' => [$communityReplyRatingsController, 'checkUserRecord']
];
