<?php
// controllers/CeylonPharmacyCriteriaController.php

require_once './models/CertificateCenter/CeylonPharmacyCriteria.php';

class CeylonPharmacyCriteriaController
{
    private $CeylonPharmacyCriteria;

    public function __construct($pdo)
    {
        $this->CeylonPharmacyCriteria = new CeylonPharmacyCriteria($pdo);
    }

    public function getRecoveredPatientsByCourse($request)
    {
        $CourseCode = $request['CourseCode'] ?? '';
        $LoggedUser = $request['LoggedUser'] ?? '';

        if (empty($CourseCode) || empty($LoggedUser)) {
            http_response_code(400);
            echo json_encode(["error" => "CourseCode and loggedUser are required."]);
            return;
        }

        try {
            $result = $this->CeylonPharmacyCriteria->getRecoveredPatientsByCourse($CourseCode, $LoggedUser);
            http_response_code(200);
            echo json_encode(["recoveredCount" => $result]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while processing your request.", "details" => $e->getMessage()]);
        }
    }
}
