<?php
// routes/AnnouncementRoutes.php

require_once __DIR__ . '/../controllers/AnnouncementController.php';

$pdo = $GLOBALS['pdo'];
$announcementController = new AnnouncementController($pdo);

return [
    'GET /announcements/' => [$announcementController, 'getAll'],
    'GET /announcements/{id}/' => [$announcementController, 'getById'],
    'POST /announcements/' => [$announcementController, 'create'],
    'PUT /announcements/{id}/' => [$announcementController, 'update'],
    'DELETE /announcements/{id}/' => [$announcementController, 'delete'],

    // In case request paths contain /api/
    'GET /api/announcements/' => [$announcementController, 'getAll'],
    'GET /api/announcements/{id}/' => [$announcementController, 'getById'],
    'POST /api/announcements/' => [$announcementController, 'create'],
    'PUT /api/announcements/{id}/' => [$announcementController, 'update'],
    'DELETE /api/announcements/{id}/' => [$announcementController, 'delete'],
];
