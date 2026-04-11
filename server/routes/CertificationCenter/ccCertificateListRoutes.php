<?php
// routes/CertificationCenter/ccCertificateListRoutes.php

require_once './controllers/CertificationCenter/CcCertificateListController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$ccCertificateListController = new CcCertificateListController($pdo);

// Define routes
return [
    'GET /cc_certificate_list/' => [$ccCertificateListController, 'getCertificates'],
    'GET /cc_certificate_list/{id}/' => [$ccCertificateListController, 'getCertificate'],
    'GET /cc_certificate_list/{list_name}/' => [$ccCertificateListController, 'getCertificateByListName'],
    'POST /cc_certificate_list/' => [$ccCertificateListController, 'createCertificate'],
    'PUT /cc_certificate_list/{id}/' => [$ccCertificateListController, 'updateCertificate'],
    'DELETE /cc_certificate_list/{id}/' => [$ccCertificateListController, 'deleteCertificate']
];
