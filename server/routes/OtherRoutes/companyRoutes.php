<?php
// routes/companyRoutes.php

require_once './controllers/CompanyController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$companyController = new CompanyController($pdo);

// Define company routes
return [
    'GET /company/' => [$companyController, 'getAllCompanies'],
    'GET /company/{id}/' => [$companyController, 'getCompanyById'],
    'POST /company/' => [$companyController, 'createCompany'],
    'PUT /company/{id}/' => [$companyController, 'updateCompany'],
    'DELETE /company/{id}/' => [$companyController, 'deleteCompany']
];
