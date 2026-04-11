<?php

// Require the controller class for CeylonPharmacyCriteriaController
require_once './controllers/CertificateCenter/CeylonPharmacyCriteria.php';

// Instantiate the controller and pass the PDO instance for DB interaction
$pdo = $GLOBALS['pdo'];  // Assuming $GLOBALS['pdo'] holds the PDO instance
$CeylonPharmacyCriteriaController = new CeylonPharmacyCriteriaController($pdo);

// Define an array of routes
return [
    // Define a GET route to handle the "recovered-patients" endpoint with dynamic parameters
    'GET /certificate-criteria/recovered-patients/\?CourseCode=[\w]+&LoggedUser=[\w]+/$' => function () use ($CeylonPharmacyCriteriaController) {

        // Call the controller method with the query parameters
        return $CeylonPharmacyCriteriaController->getRecoveredPatientsByCourse($_GET);
    },

];
