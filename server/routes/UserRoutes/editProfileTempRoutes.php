<?php

require_once './controllers/Users/EditProfileTempController.php';

$pdo = $GLOBALS['pdo'];
$editProfileTempController = new EditProfileTempController($pdo);

return [
    'GET /profile-edits/pending' => [$editProfileTempController, 'getPending'],
    'GET /profile-edits/status/{username}' => [$editProfileTempController, 'getStatus'],
    'POST /profile-edits' => [$editProfileTempController, 'submitRequest'],
    'POST /profile-edits/{id}/approve' => [$editProfileTempController, 'approve'],
    'POST /profile-edits/{id}/reject' => [$editProfileTempController, 'reject']
];
