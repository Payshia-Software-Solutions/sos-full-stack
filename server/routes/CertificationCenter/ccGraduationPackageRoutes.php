<?php
// ./routes/CertificationCenter/ccGraduationPackageRoutes.php

require_once './controllers/CertificationCenter/CcGraduationPackageController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$ccGraduationPackageController = new CcGraduationPackageController($pdo);

// Define routes
return [
    'GET /cc_graduation_package/' => [$ccGraduationPackageController, 'getGraduationPackages'],
    'GET /cc_graduation_package/{id}/' => [$ccGraduationPackageController, 'getGraduationPackage'],
    'POST /cc_graduation_package/' => [$ccGraduationPackageController, 'createGraduationPackage'],
    'PUT /cc_graduation_package/{id}/' => [$ccGraduationPackageController, 'updateGraduationPackage'],
    'DELETE /cc_graduation_package/{id}/' => [$ccGraduationPackageController, 'deleteGraduationPackage']
];
