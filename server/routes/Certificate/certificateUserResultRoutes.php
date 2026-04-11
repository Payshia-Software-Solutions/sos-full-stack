<?php
require_once './controllers/Certificate/CertificateUserResultContrller.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo']; // Ensure $pdo is initialized in your application
$certificateUserResultController = new CertificateUserResultController($pdo);

// Define routes
return [

    'GET /certificate-user-result/' => [$certificateUserResultController, 'getAllRecords'],
    'GET /certificate-user-result/{id}/' => [$certificateUserResultController, 'getRecordById'],
    'GET /certificate-user-result/{username}/{course_code}/{title_id}/' => [$certificateUserResultController, 'getRecordByKeys'],
    'POST /certificate-user-result/' => [$certificateUserResultController, 'createRecord'],
    'PUT /certificate-user-result/{id}/' => [$certificateUserResultController, 'updateRecord'],
    'DELETE /certificate-user-result/{id}/' => [$certificateUserResultController, 'deleteRecord'],
    // Correct route definition
    'PUT /certificate-user-result/{username}/{course_code}/{title_id}/' => [$certificateUserResultController, 'updateCertificateResult'],



];
