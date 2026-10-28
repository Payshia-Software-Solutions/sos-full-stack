<?php

require_once './controllers/BatchScheduleController.php';

$batchScheduleController = new BatchScheduleController($pdo);

return [
    // Class Schedules
    'GET /batch-schedules' => [$batchScheduleController, 'getActiveSchedules'],
    'GET /batch-schedules/admin' => [$batchScheduleController, 'getAllAdminSchedules'],
    'POST /batch-schedules' => [$batchScheduleController, 'createSchedule'],
    'PUT /batch-schedules/{id}' => [$batchScheduleController, 'updateSchedule'],

    // Educational Qualifications
    'GET /educational-qualifications' => [$batchScheduleController, 'getActiveQualifications'],
    'GET /educational-qualifications/admin' => [$batchScheduleController, 'getAllAdminQualifications'],
    'POST /educational-qualifications' => [$batchScheduleController, 'createQualification'],
    'PUT /educational-qualifications/{id}' => [$batchScheduleController, 'updateQualification'],
];
