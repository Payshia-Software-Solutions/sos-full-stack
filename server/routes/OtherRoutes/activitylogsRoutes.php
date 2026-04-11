<?php
// routes/appointmentCategoryRoutes.php

require_once './controllers/ActivityLogController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$activityLogController = new ActivityLogController($pdo);

// Define routes
return [
    'GET /activitylogs/' => [$activityLogController, 'getAllRecords'],
    'GET /activitylogs/{id}' => [$activityLogController, 'getActivityLogById'],
    'POST /activitylogs/' => [$activityLogController, 'createActivityLog'],
    'PUT /activitylogs/{id}/' => [$activityLogController, 'updateActivityLog'],
    'DELETE /activitylogs/{id}/' => [$activityLogController, 'deleteActivityLog']
];
