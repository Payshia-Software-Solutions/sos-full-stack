<?php
require_once './controllers/StudentDocumentVerificationController.php';

$pdo = $GLOBALS['pdo'];
$kycController = new StudentDocumentVerificationController($pdo);

return [
    'GET /student-kyc/status/{username}/' => [$kycController, 'getStatusByStudent'],
    'POST /student-kyc/submit/' => [$kycController, 'submitDocuments'],
    'GET /admin/student-kyc/' => [$kycController, 'getAllRecords'],
    'GET /admin/student-kyc/{id}/' => [$kycController, 'getRecordById'],
    'POST /admin/student-kyc/{id}/verify/' => [$kycController, 'verifyRecord'],
    'POST /admin/student-kyc/user-status/{username}/' => [$kycController, 'updateUserVerificationStatus'],
];
