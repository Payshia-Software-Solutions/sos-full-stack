<?php
// routes/CertificationCenter/ccCriteriaListRoutes.php

require_once './controllers/CertificationCenter/CcCriteriaListController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$ccCriteriaListController = new CcCriteriaListController($pdo);

// Define routes
return [
    'GET /cc_criteria_list/' => [$ccCriteriaListController, 'getCriteriaLists'],
    'GET /cc_criteria_list/{id}/' => [$ccCriteriaListController, 'getCriteriaList'],
    'POST /cc_criteria_list/' => [$ccCriteriaListController, 'createCriteriaList'],
    'PUT /cc_criteria_list/{id}/' => [$ccCriteriaListController, 'updateCriteriaList'],
    'DELETE /cc_criteria_list/{id}/' => [$ccCriteriaListController, 'deleteCriteriaList']
];
