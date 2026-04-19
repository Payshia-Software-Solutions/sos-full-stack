<?php
// routes/ConvocationRegistrationRoutes.php

require_once './controllers/ConvocationRegistrationController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$convocationRegistrationController = new ConvocationRegistrationController($pdo, $convocationTemplatePath);

// Define an array of routes
return [
    // GET all registrations
    'GET /convocation-registrations/$' => function () use ($convocationRegistrationController) {
        return $convocationRegistrationController->getRegistrations();
    },

    'GET /convocation-registrations/get-counts-by-sessions/(\d+)/$' => function ($ceremonyId) use ($convocationRegistrationController) {
        return $convocationRegistrationController->getCountsBySessions($ceremonyId);
    },
    'GET /convocation-registrations/get-additional-seats-by-sessions/(\d+)/ceremony/(\d+)/$' => function ($sessionId, $ceremonyId) use ($convocationRegistrationController) {
        return $convocationRegistrationController->getAdditionalSeatsCountsBySessions($sessionId, $ceremonyId);
    },

    // GET a single registration by ID
    'GET /convocation-registrations/(\d+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->getRegistration($registration_id);
    },
    // GET a single registration by student number (alphanumeric)
    'GET /convocation-registrations/check-duplicate/([A-Za-z0-9]+)/$' => function ($studentNumber) use ($convocationRegistrationController) {
        return $convocationRegistrationController->validateDuplicate($studentNumber);
    },

    // GET a single registration by reference number (same as ID)
    'GET /convocation-registrations/check-hash/$' => function () use ($convocationRegistrationController) {
        $hashValue = $_GET['hashValue'] ?? null;
        if (!$hashValue) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameter: hashValue']);
            return;
        }
        return $convocationRegistrationController->checkHashDupplicate($hashValue);
    },

    // GET a single registration by reference number (same as ID)
    'GET /convocation-registrations/$' => function () use ($convocationRegistrationController) {
        $reference_number = $_GET['referenceNumber'] ?? null;
        if ($reference_number) {
            return $convocationRegistrationController->getRegistrationByReference($reference_number);
        }
        return $convocationRegistrationController->getRegistrations();
    },

    // Trigger SMS notification for ceremony number
    // GET /convocation-registrations/notify-ceremony?referenceNumber=12345
    'GET /convocation-registrations/notify-ceremony/$' => function () use ($convocationRegistrationController) {
        $reference_number = $_GET['referenceNumber'] ?? null;
        if (!$reference_number) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameter: referenceNumber']);
            return;
        }

        echo json_encode($convocationRegistrationController->notifyCeremonyNumber($reference_number));
    },



    // POST create a new registration
    'POST /convocation-registrations/$' => function () use ($convocationRegistrationController) {
        return $convocationRegistrationController->createRegistration();
    },

    // PUT update a registration
    'PUT /convocation-registrations/(\d+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updateRegistration($registration_id);
    },

    // PUT update payment only
    'PUT /convocation-registrations/payment/(\d+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updatePayment($registration_id);
    },

    // PUT update payment only
    'POST /convocation-registrations/(\d+)/update-session/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updateSession($registration_id);
    },

    // PUT update payment only
    'POST /convocation-registrations/(\d+)/update-additional-seats/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updateAdditionalSeats($registration_id);
    },

    // PUT update payment only
    'POST /convocation-registrations/(\d+)/update-package/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updatePackages($registration_id);
    },

    // DELETE a registration
    'DELETE /convocation-registrations/(\d+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->deleteRegistration($registration_id);
    },

    // DELETE a payment entry from a convocation booking
    'DELETE /convocation-registrations/(\d+)/payment/(\d+)/$' => function ($registration_id, $transaction_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->deleteConvocationPayment($registration_id, $transaction_id);
    },

    'GET /convocation-registrations-certificate/$' => function () use ($convocationRegistrationController) {
        $courseCode = $_GET['courseCode'] ?? null;
        $viewSession = $_GET['viewSession'] ?? null;

        if ($courseCode && $viewSession) {
            return $convocationRegistrationController->GetListbyCourseAndSession($courseCode, $viewSession);
        } elseif ($courseCode) {
            return $convocationRegistrationController->GetListbyCourse($courseCode);
        } elseif ($viewSession) {
            return $convocationRegistrationController->GetListbySession($viewSession);
        }

        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters: courseCode or viewSession']);
    },

    // PUT update ceremony number only
    'PUT /convocation-registrations/ceremony-number/([A-Za-z0-9]+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updateCeremonyNumber($registration_id);
    },

    'PUT /convocation-registrations/certificate-print-status/([A-Za-z0-9]+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updateCertificatePrintStatus($registration_id);
    },

    'PUT /convocation-registrations/advanced-certificate-print-status/([A-Za-z0-9]+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updateAdvancedCertificatePrintStatus($registration_id);
    },

    'GET /convocation-registrations/get-balances/([A-Za-z0-9]+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->GetStudentDueAmount($registration_id);
    },

    'GET /convocation-registrations/get-balances-student-number/([A-Za-z0-9]+)/$' => function ($student_number) use ($convocationRegistrationController) {
        return $convocationRegistrationController->GetStudentDueAmountByStudentNumber($student_number);
    },

    'GET /convocation-registrations/get-records-student-number/([A-Za-z0-9]+)/$' => function ($student_number) use ($convocationRegistrationController) {
        return $convocationRegistrationController->getRegistrationByStudentNumber($student_number);
    },

    'GET /convocation-registrations/get-ceremony-number/([A-Za-z0-9]+)/$' => function ($student_number) use ($convocationRegistrationController) {
        return $convocationRegistrationController->GetCeremonyNumberByStudentNumber($student_number);
    },


    // PUT update course List
    'PUT /convocation-registrations/update-courses/([A-Za-z0-9]+)/$' => function ($registration_id) use ($convocationRegistrationController) {
        return $convocationRegistrationController->updateCourses($registration_id);
    },
];
