<?php
// routes/web.php

// Set CORS headers for every response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("X-Page-Title: API Service");
// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

ini_set('memory_limit', '256M');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Access environment variables
$authToken = $_ENV['SMS_AUTH_TOKEN'];
$senderId = $_ENV['SMS_SENDER_ID'];

// Define the path to the template file
$templatePath = __DIR__ . '/../templates/welcome_sms_template.txt';
$convocationTemplatePath = __DIR__ . '/../templates/convocation-payment-message.txt';

// Include route files
$assignmentRoutes = require './routes/Assignment/AssignmentRoutes.php';
$submissionRoutes = require './routes/Assignment/submissionRoutes.php';
$appointmentRoutes = require './routes/OtherRoutes/appointmentRoutes.php';
$courseAssignmentRoutes = require './routes/OtherRoutes/courseAssignmentRoutes.php';
$courseAssignmentSubmissionRoutes = require './routes/OtherRoutes/courseAssignmentSubmissionRoutes.php';
$reportRoutes = require './routes/OtherRoutes/reportRoutes.php';
$studentCourseRoutes = require './routes/OtherRoutes/studentCourseRoutes.php';
$userRoutes = require './routes/UserRoutes/userRoutes.php';
$userFullDetailsRoutes = require './routes/UserRoutes/userFullDetailsRoutes.php';
$companyRoutes = require './routes/OtherRoutes/companyRoutes.php';
$hpSaveAnswerRoutes = require './routes/HunterPro/hpSaveAnswerRoutes.php';
$hpCourseMedicineRoutes = require './routes/HunterPro/hpCourseMedicineRoutes.php';
$hpMedicinesRoutes = require './routes/HunterPro/hpMedicinesRoutes.php';
$hpCategoriesRoutes = require './routes/HunterPro/hpCategoriesRoutes.php';
$hpDosageFormsRoutes = require './routes/HunterPro/hpDosageFormsRoutes.php';
$hpDrugTypesRoutes = require './routes/HunterPro/hpDrugTypesRoutes.php';
$hpRacksRoutes = require './routes/HunterPro/hpRacksRoutes.php';
$appointmentCategoryRoutes = require './routes/OtherRoutes/appointmentCategoryRoutes.php';
$hunterSettingRoutes = require './routes/Hunter/hunterSettingRoutes.php';
$hunterCategoryRoutes = require './routes/Hunter/hunterCategoryRoutes.php';
$hunterCourseRoutes = require './routes/Hunter/hunterCourseRoutes.php';
$hunterDosageRoutes = require './routes/Hunter/hunterDosageRoutes.php';
$hunterDrugGroupRoutes = require './routes/Hunter/hunterDrugGroupRoutes.php';
$hunterMedicineRoutes = require './routes/Hunter/hunterMedicineRoutes.php';
$hunterRacksRoutes = require './routes/Hunter/hunterRacksRoutes.php';
$hunterSaveAnswerRoutes = require './routes/Hunter/hunterSaveAnswerRoutes.php';
$hunterStoreRoutes = require './routes/Hunter/hunterStoreRoutes.php';
$lectureRoutes = require './routes/OtherRoutes/lectureRoutes.php';
$careInstructionRoutes = require './routes/Care/careInstructionRoutes.php';
$careInstructionPreRoutes = require './routes/Care/careInstructionPreRoutes.php';
$chatRoutes = require './routes/Chats/chatRoutes.php';
$attachmentRoutes = require './routes/Chats/attachmentRoutes.php';
$messageRoutes = require './routes/Chats/messageRoutes.php';
$communityPostCategoryRoutes = require './routes/Community/communityPostCategoryRoutes.php';
$communityPostRoutes = require './routes/Community/communityPostRoutes.php';
$communityPostReplyRoutes = require './routes/Community/communityPostReplyRoutes.php';
$communityPostReplyRatingsRoutes = require './routes/Community/communityPostReplyRatingsRoutes.php';
$communityKnowledgebaseRoutes = require './routes/Community/communityKnowledgebaseRoutes.php';
$paymentReasonRoutes = require './routes/Payment/paymentReasonRoutes.php';
$paymentRequestRoutesOld = require './routes/Payment/paymentRequestRoutes.php';
$courseRoutes = require './routes/Course/courseRoutes.php';
$studentPaymentRoutes = require './routes/Student/studentPaymentRoutes.php';
$supportTicketRoutes = require './routes/TicketRoutes/supportTicketRoutes.php';
$activityLogRoutes = require './routes/OtherRoutes/activitylogsRoutes.php';
$levelRoutes = require './routes/OtherRoutes/levelRoutes.php';
$prescriptionRoutes = require './routes/Prescription/prescriptionRoutes.php';
$prescriptionAnswerRoutes = require './routes/Prescription/prescriptionAnswerRoutes.php';
$prescriptionAnswerSubmissionRoutes = require './routes/Prescription/prescriptionAnswerSubmissionRoutes.php';
$prescriptionContentRoutes = require './routes/Prescription/prescriptionContentRoutes.php';
$winpharmaCommonReasonRoutes = require './routes/Winpharma/winpharmaCommonReasonRoutes.php';
$winPharmaLevelRoutes = require './routes/Winpharma/winPharmaLevelRoutes.php';
$winPharmaLevelResourceRoutes = require './routes/Winpharma/winPharmaLevelResourceRoutes.php';
$winPharmaSubmissionRoutes = require './routes/Winpharma/winPharmaSubmissionRoutes.php';
$qMeterRoutes = require './routes/QMeter/qMeterRoutes.php';
$qMeterOpenRoutes = require './routes/QMeter/qMeterOpenRoutes.php';
$qMeterSubmitRoutes = require './routes/QMeter/qMeterSubmitRoutes.php';
$ccCriteriaGroupRoutes = require './routes/CertificationCenter/ccCriteriaGroupRoutes.php';
$ccCriteriaListRoutes = require './routes/CertificationCenter/ccCriteriaListRoutes.php';
$ccGraduationPackageItemRoutes = require './routes/CertificationCenter/ccGraduationPackageItemRoutes.php';
$ccCertificateListRoutes = require './routes/CertificationCenter/ccCertificateListRoutes.php';
$ccGraduationPackageRoutes = require './routes/CertificationCenter/ccGraduationPackageRoutes.php';
$ccCertificateOrderRoutes = require './routes/CertificationCenter/ccCertificationOrderRoutes.php';
$certtficateUserResultRoutes = require './routes/Certificate/certificateUserResultRoutes.php';
$certificateEvaluationRoutes = require './routes/CertificationCenter/ccEvaluationRoutes.php';
$parentMainCourseRoutes = require './routes/Course/ParentMainCourseRoutes.php';
$courseModuleRoutes = require './routes/Course/CourseModuleRoutes.php';
$courseOutcomeRoutes = require './routes/Course/CourseOutcomeRoutes.php';
$courseOverviewRoutes = require './routes/Course/courseOverviewRoutes.php';
$tempLmsUserRoutes = require './routes/UserRoutes/tempLmsUserRoutes.php';
$editProfileTempRoutes = require './routes/UserRoutes/editProfileTempRoutes.php';
$CityRoutes = require './routes/CityRoutes.php';
$StudentValuesRoutes = require './routes/Student/StudentValuesRoutes.php';
$CertificateVerificationRoutes = require './routes/CertificationCenter/CertificateVerificationRoutes.php';
$CeylonPharmacyCriteria = require './routes/CertificateCenter/certificateRoutes.php';
$DeliveryOrdersRoutes = require './routes/Orders/DeliveryOrdersRoutes.php';
$UserCertificatePrintStatusRoutes = require './routes/UserCertificatePrintStatusRoutes/UserCertificatePrintStatusRoutes.php';
$ContactRoutes = require './routes/Contact/ContactRoutes.php';
$EventsPageRoutes = require './routes/EventsPageRoutes.php';
$EmailRoutes = require './routes/EmailRoutes.php';
$TestimonialRoutes = require './routes/TestimonialRoutes.php';
$DistrictsRoutes = require './routes/District/DistrictsRoutes.php';
$ECertificateRoutes = require './routes/ecertificates/ECertificateRoutes.php';
$paymentRequestRoutes = require './routes/PaymentRequests/paymentRequestRoutes.php';
$DeliverySettingRoutes = require './routes/DeliverySettingRoutes.php';
$DpadRoutes = require './routes/Dpad/DpadRoutes.php';
$SMSRoutes = require './routes/SMSRoutes.php';
$bankRoutes = require './routes/bankRoutes.php';
$ConvocationRegistrationRoutes  = require './routes/ConvocationRegistrationRoutes.php';
$convocationRegistrationByConvocationRoutes = require './routes/convocationRegistrationByConvocationRoutes.php';
$PackageRoutes  = require './routes/PackageRoutes.php';
$CertificateOrderRoutes = require './routes/CertificateOrderRoutes.php';
$convocationRoutes = require './routes/convocationRoutes.php';
$convocationStatusRoutes = require './routes/convocationStatusRoutes.php';
$convocationStudentInfoRoutes = require './routes/convocationStudentInfoRoutes.php';
$transactionPaymentRoutes = require './routes/transactionPaymentRoutes.php';
$WordListRoutes = require './routes/WordListRoutes.php';
$EnWordSubmissionRoutes = require './routes/EnWordSubmissionRoutes.php';
$UserCertificatePrintStatusRoutesNew = require './routes/UserCertificatePrintStatusRoutesNew.php';
$studentEnrollmentRoutes = require './routes/studentEnrollmentRoutes.php';
$StudentPaymentRoutes = require './routes/StudentPaymentRoutes.php';
$CommisionSetupRoutes = require './routes/CommisionSetupRoutes.php';
$CourseContentTitleRoutes = require './routes/CourseContentTitleRoutes.php';
$CourseContentRoutes = require './routes/CourseContentRoutes.php';
$carePatientRoutes = require './routes/ceylonPharmacy/CarePatientRoutes.php';
$careAnswerRoutes = require './routes/ceylonPharmacy/CareAnswerRoutes.php';
$careAnswerSubmitRoutes = require './routes/ceylonPharmacy/CareAnswerSubmitRoutes.php';
$careCenterCourseRoutes = require './routes/ceylonPharmacy/CareCenterCourseRoutes.php';
$careCenterRecoveryRoutes = require './routes/ceylonPharmacy/CareCenterRecoveryRoutes.php';
$careContentRoutes = require './routes/ceylonPharmacy/CareContentRoutes.php';
$carePaymentRoutes = require './routes/ceylonPharmacy/CarePaymentRoutes.php';
$carePrescriptionRoutes = require './routes/ceylonPharmacy/carePrescriptionRoutes.php';
$carePaymentAnswerRoutes = require './routes/ceylonPharmacy/carePaymentAnswerRoutes.php';
$careSavedAnswersRoutes = require './routes/ceylonPharmacy/careSavedAnswersRoutes.php';
$careStartRoutes = require './routes/ceylonPharmacy/careStartRoutes.php';
$CareInstructionRoutesUpdated = require './routes/ceylonPharmacy/CareInstructionRoutes.php';
$careInstructionPreRoutes = require './routes/ceylonPharmacy/careInstructionPreRoutes.php';
$careInsAnswerRoutes = require './routes/ceylonPharmacy/careInsAnswerRoutes.php';
$masterProductRoutes = require './routes/ceylonPharmacy/MasterProductRoutes.php';
$sentenceBuilderLevelRoutes = require './routes/sentenceBuilderLevelRoutes.php';
$sentenceBuilderSentenceRoutes = require './routes/sentenceBuilderSentenceRoutes.php';
$sentenceBuilderStudentAnswerRoutes = require './routes/sentenceBuilderStudentAnswerRoutes.php';
$certificatePrintStatusRoutes = require './routes/CertificatePrintStatusRoutes.php';
$bookingUpdatesRoutes = require './routes/BookingUpdatesRoutes.php';
$mediMindLevelRoutes = require './routes/MediMind/MediMindLevelRoutes.php';
$mediMindQuestionRoutes = require './routes/MediMind/MediMindQuestionRoutes.php';
$mediMindQuestAnswerRoutes = require './routes/MediMind/MediMindQuestAnswerRoutes.php';
$mediMindLevelQuestionRoutes = require './routes/MediMind/MediMindLevelQuestionRoutes.php';
$mediMindMedicineRoutes = require './routes/MediMind/MediMindMedicineRoutes.php';
$mediMindAnswerRoutes = require './routes/MediMind/MediMindAnswerRoutes.php';
$mediMindStudentAnswerRoutes = require './routes/MediMind/MediMindStudentAnswerRoutes.php';
$mediMindLevelMedicineRoutes = require './routes/MediMind/MediMindLevelMedicineRoutes.php';
$mediMindCourseLevelRoutes = require './routes/MediMind/MediMindCourseLevelRoutes.php';
$birthdaySettingsRoutes = require './routes/BirthdaySettingsRoutes.php';
$blogRoutes = require './routes/BlogRoutes.php';
$pharmaReaderRoutes = require './routes/pharmaReaderRoutes.php';
$smsTemplateRoutes = require './routes/smsTemplateRoutes.php';
$transcriptTemplateRoutes = require './routes/TranscriptTemplateRoutes.php';
$leadRoutes = require './routes/Lead/LeadRoutes.php';
// Combine all routes
$routes = array_merge(
    $userRoutes,
    $careInstructionPreRoutes,
    $transactionPaymentRoutes,
    $assignmentRoutes,
    $submissionRoutes,
    $appointmentRoutes,
    $courseAssignmentRoutes,
    $courseAssignmentSubmissionRoutes,
    $hpSaveAnswerRoutes,
    $reportRoutes,
    $courseRoutes,
    $UserCertificatePrintStatusRoutes,
    $userFullDetailsRoutes,
    $companyRoutes,
    $hpCourseMedicineRoutes,
    $hpMedicinesRoutes,
    $hpCategoriesRoutes,
    $hpDosageFormsRoutes,
    $hpDrugTypesRoutes,
    $hpRacksRoutes,
    $appointmentCategoryRoutes,
    $hunterSettingRoutes,
    $hunterCategoryRoutes,
    $hunterCourseRoutes,
    $hunterDosageRoutes,
    $hunterDrugGroupRoutes,
    $hunterMedicineRoutes,
    $hunterRacksRoutes,
    $hunterSaveAnswerRoutes,
    $hunterStoreRoutes,
    $lectureRoutes,
    $careInstructionRoutes,
    $CareInstructionRoutesUpdated,
    $careInstructionPreRoutes,
    $chatRoutes,
    $attachmentRoutes,
    $messageRoutes,
    $communityPostCategoryRoutes,
    $communityPostRoutes,
    $communityKnowledgebaseRoutes,
    $communityPostReplyRoutes,
    $communityPostReplyRatingsRoutes,
    $paymentReasonRoutes,
    $paymentRequestRoutesOld,
    $courseRoutes,
    $studentPaymentRoutes,
    $supportTicketRoutes,
    $activityLogRoutes,
    $levelRoutes,
    $prescriptionRoutes,
    $prescriptionAnswerRoutes,
    $prescriptionAnswerSubmissionRoutes,
    $prescriptionContentRoutes,
    $winpharmaCommonReasonRoutes,
    $winPharmaLevelRoutes,
    $winPharmaLevelResourceRoutes,
    $winPharmaSubmissionRoutes,
    $qMeterRoutes,
    $qMeterOpenRoutes,
    $qMeterSubmitRoutes,
    $ccCriteriaGroupRoutes,
    $ccCriteriaListRoutes,
    $ccGraduationPackageItemRoutes,
    $ccCertificateListRoutes,
    $ccGraduationPackageRoutes,
    $ccCertificateOrderRoutes,
    $CeylonPharmacyCriteria,
    $certtficateUserResultRoutes,
    $certificateEvaluationRoutes,
    $parentMainCourseRoutes,
    $courseModuleRoutes,
    $courseOutcomeRoutes,
    $courseOverviewRoutes,
    $tempLmsUserRoutes,
    $editProfileTempRoutes,
    $CityRoutes,
    $StudentValuesRoutes,
    $CertificateVerificationRoutes,
    $DeliveryOrdersRoutes,
    $DistrictsRoutes,
    $ECertificateRoutes,
    $ContactRoutes,
    $paymentRequestRoutes,
    $DpadRoutes,
    $SMSRoutes,
    $bankRoutes,
    $studentCourseRoutes,
    $EventsPageRoutes,
    $EmailRoutes,
    $TestimonialRoutes,
    $EventsPageRoutes,
    $ConvocationRegistrationRoutes,
    $convocationRegistrationByConvocationRoutes,
    $PackageRoutes,
    $CertificateOrderRoutes,
    $convocationRoutes,
    $convocationStatusRoutes,
    $WordListRoutes,
    $EnWordSubmissionRoutes,
    $UserCertificatePrintStatusRoutesNew,
    $studentEnrollmentRoutes,
    $DeliverySettingRoutes,
    $StudentPaymentRoutes,
    $CommisionSetupRoutes,
    $CourseContentTitleRoutes,
    $CourseContentRoutes,
    $carePatientRoutes,
    $careAnswerRoutes,
    $careAnswerSubmitRoutes,
    $careCenterCourseRoutes,
    $careCenterRecoveryRoutes,
    $careContentRoutes,
    $carePaymentRoutes,
    $carePrescriptionRoutes,
    $carePaymentAnswerRoutes,
    $careSavedAnswersRoutes,
    $careStartRoutes,
    $careInsAnswerRoutes,
    $masterProductRoutes,
    $sentenceBuilderLevelRoutes,
    $sentenceBuilderSentenceRoutes,
    $sentenceBuilderStudentAnswerRoutes,
    $certificatePrintStatusRoutes,
    $bookingUpdatesRoutes,
    $mediMindLevelRoutes,
    $mediMindQuestionRoutes,
    $mediMindQuestAnswerRoutes,
    $mediMindLevelQuestionRoutes,
    $mediMindMedicineRoutes,
    $mediMindAnswerRoutes,
    $mediMindStudentAnswerRoutes,
    $mediMindLevelMedicineRoutes,
    $mediMindCourseLevelRoutes,
    $birthdaySettingsRoutes,
    $convocationStudentInfoRoutes,
    $blogRoutes,
    $pharmaReaderRoutes,
    $smsTemplateRoutes,
    $transcriptTemplateRoutes,
    $leadRoutes
);


// Define the home route with trailing slash
$routes['GET /run-medimind-migration-v2/'] = function () use ($pdo) {
    try {
        // 1. Add level_id column
        $pdo->exec("ALTER TABLE medi_mind_student_answers ADD COLUMN IF NOT EXISTS level_id INT AFTER medicine_id");
        
        // 2. Backfill level_id for existing records (try to find a level that contains the medicine)
        // This is a best-effort backfill.
        $pdo->exec("
            UPDATE medi_mind_student_answers sa
            SET level_id = (
                SELECT level_id 
                FROM medi_mind_level_mediciens lm 
                WHERE lm.medicine_id = sa.medicine_id 
                LIMIT 1
            )
            WHERE level_id IS NULL
        ");
        
        echo json_encode(['success' => true, 'message' => 'Migration V2 successful: level_id added and backfilled.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
};

$routes['GET /run-sms-migration/'] = function () use ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `sms_templates` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `template_name` VARCHAR(255) NOT NULL UNIQUE,
                `template_content` TEXT NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ");

        // Insert default templates and update existing ones if they differ
        $pdo->exec("
            INSERT INTO `sms_templates` (`template_name`, `template_content`) VALUES 
            ('account-activation-message', 'Dear {{FIRST_NAME}},\n\nYou have been successfully enrolled in {{COURSE_NAME}}.\nIndex No: {{GENERATED_USER_NAME}}\nTemporary Password: {{TEMP_PASSWORD}}\n\nLogin here: https://lms.pharmacollege.lk/login?UserName={{GENERATED_USER_NAME}}&TempPassword={{TEMP_PASSWORD}}\n\nHow to Order Study Pack - https://www.youtube.com/shorts/1xd3TAjbtYw\n\nCeylon Pharma College\nwww.pharmacollege.lk'),
            ('payment-update-message', 'Dear [STUDENT_NAME], we have received your payment of LKR [PAYMENT_AMOUNT] for [COURSE_NAME]. Receipt No: [RECEIPT_NUMBER]. Thank you! - Pharma College'),
            ('convocation-payment-approved', 'Dear student, your convocation payment has been approved.'),
            ('study-pack-not-order', 'Dear student, please order your study pack.'),
            ('ceremony-number-message', 'Dear {{FIRST_NAME}},\nYour ceremony registration was successfully completed.\nCeremony No: {{CEREMONY_NUMBER}}\n\n-Ceylon Pharma College'),
            ('name-on-certificate-message', 'Dear Student ({{STUDENT_NUMBER}}),\nYour certificate is ready to print. Name on certificate: {{NAME_ON_CERTIFICATE}}.\nThank You!'),
            ('ceremony-due-breakdown-message', 'Dear {{FIRST_NAME}},\nYour Ceremony Number is not processed due to unpaid balances:\nCourse: Rs. {{COURSE_BALANCE}}\nConvocation: Rs. {{CONVOCATION_BALANCE}}\nTotal: Rs. {{TOTAL_DUE}}\n\nPlease complete payment.\n-Ceylon Pharma College'),
            ('delivery-order-placed', 'Dear {index_number},\n\nWe have successfully received your delivery order for {delivery_item}.\nWe will process it shortly!\n\nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk'),
            ('delivery-order-packed', 'Dear {index_number},\n\nYour order is ready for delivery!\n\nProduct - {delivery_item} \nTracking Number - {tracking_number} \n\nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk'),
            ('delivery-order-dispatched', 'Dear {index_number},\n\nYour order has been handed over to the delivery partner!\n\nProduct - {delivery_item} \nTracking Number - {tracking_number} \nCOD Amount - {cod_amount} \nDelivery Partner - Royal Express Courier \n    \nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk'),
            ('delivery-order-received', 'Dear {index_number},\n\nYour delivery order for {delivery_item} has been marked as successfully received.\n\nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk')
            ON DUPLICATE KEY UPDATE `template_content` = VALUES(`template_content`)
        ");

        echo json_encode(['success' => true, 'message' => 'sms_templates table created and seeded successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
};

$routes['GET /'] = function () {
    // Serve the index.html file
    readfile('./views/index.html');
};

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($uri, '/');

// Ensure URI always has a trailing slash
if (substr($uri, -1) !== '/') {
    $uri .= '/';
}

// Determine if the application is running on localhost
if ($_SERVER['HTTP_HOST'] === 'localhost') {
    // Adjust URI if needed (only on localhost)
    $uri = str_replace('sos-full-stack/server', '', $uri);
} else {
    // Adjust URI if needed (if using a subdirectory)
    $uri = '/' . $uri;
}

// Set the header for JSON responses, except for HTML pages
if ($uri !== '/') {
    header('Content-Type: application/json');
}

// Debugging
error_log("Method: $method");
error_log("URI: $uri");
// echo $uri . '<br>';

// Route matching
foreach ($routes as $route => $handler) {
    list($routeMethod, $routeUri) = explode(' ', $route, 2);

    // Convert route URI to regex (without query parameters){trackingNumber} student_number
    $routeRegex = str_replace(
        ['{id}', '{reply_id}', '{post_id}', '{created_by}', '{username}', '{role}', '{assignment_id}', '{course_code}', '{offset}', '{limit}', '{setting_name}', '{loggedUser}', '{title_id}', '{slug}', '{module_code}', '{value}', '{studentId}', '{tracking_number}', '{index_number}', '{provinceId}', '{student_number}', '{questionId}', '{levelId}', '{medicineId}', '{batch_id}', '{status}'],
        ['(\d+)', '(\d+)', '(\d+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '(\d+)', '(\d+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-\/]+)', '([a-zA-Z0-9_\-\/]+)', '([a-zA-Z0-9_\-\/]+)', '([a-zA-Z0-9_\-\/]+)', '([a-zA-Z0-9_\-\/]+)', '(\d+)', '(\d+)', '(\d+)', '([a-zA-Z0-9_\-]+)', '([a-zA-Z0-9_\-\%\s]+)'],
        $routeUri
    );

    // Ensure route regex matches the path only, not query parameters
    $routeRegex = "#^" . rtrim($routeRegex, '/') . "/?$#";

    // Check if the method and path match
    if ($method === $routeMethod && preg_match($routeRegex, $uri, $matches)) {

        header("X-Page-Title: API Service");
        // Remove the full match
        array_shift($matches);

        // Debugging output
        error_log("Route matched: $route");

        // Call the handler with matched parameters
        call_user_func_array($handler, $matches);
        exit;
    }
}

// Default 404 response if no match is found
header("HTTP/1.1 404 Not Found");
echo json_encode(['error' => 'Route not found']);
