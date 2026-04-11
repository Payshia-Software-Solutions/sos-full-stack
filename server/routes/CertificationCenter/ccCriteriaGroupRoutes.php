<?php
// routes/CertificationCenter/ccCriteriaGroupRoutes.php

require_once './controllers/CertificationCenter/CcCriteriaGroupController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$CcCriteriaGroupController = new CcCriteriaGroupController($pdo);

// Define criteria group routes
return [
    'GET /cc_criteria_group/' => [$CcCriteriaGroupController, 'getCriteriaGroups'],
    'GET /cc_criteria_group/{id}/' => [$CcCriteriaGroupController, 'getCriteriaGroup'],
    'POST /cc_criteria_group/' => [$CcCriteriaGroupController, 'createCriteriaGroup'],
    'PUT /cc_criteria_group/{id}/' => [$CcCriteriaGroupController, 'updateCriteriaGroup'],
    'DELETE /cc_criteria_group/{id}/' => [$CcCriteriaGroupController, 'deleteCriteriaGroup']
];
