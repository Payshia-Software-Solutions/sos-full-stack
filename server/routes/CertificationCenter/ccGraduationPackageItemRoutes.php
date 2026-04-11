<?php
// routes/CertificationCenter/ccGraduationPackageItemRoutes.php

require_once './controllers/CertificationCenter/CcGraduationPackageItemController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$ccGraduationPackageItemController = new CcGraduationPackageItemController($pdo);

// Define graduation package item routes
return [
    'GET /cc_graduation_package_items/' => [$ccGraduationPackageItemController, 'getCcGraduationPackageItems'],
    'GET /cc_graduation_package_items/{id}/' => [$ccGraduationPackageItemController, 'getCcGraduationPackageItem'],
    'POST /cc_graduation_package_items/' => [$ccGraduationPackageItemController, 'createCcGraduationPackageItem'],
    'PUT /cc_graduation_package_items/{id}/' => [$ccGraduationPackageItemController, 'updateCcGraduationPackageItem'],
    'DELETE /cc_graduation_package_items/{id}/' => [$ccGraduationPackageItemController, 'deleteCcGraduationPackageItem']
];
