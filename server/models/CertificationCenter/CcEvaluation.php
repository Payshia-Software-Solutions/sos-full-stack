<?php
// models/CertificationCenter/CcEvaluation.php
require './models/Orders/DeliveryOrder.php';
require_once './models/StudentCertificates/UserCertificatePrintStatus.php';


class CcEvaluation extends DeliveryOrder
{
    private $pdo;
    protected $lastError;
    private $certificatePrintStatus;

    public function __construct($pdo)
    {
        parent::__construct($pdo);
        $this->pdo = $pdo; // Initialize UserCertificatePrintStatus
        $this->certificatePrintStatus = new UserCertificatePrintStatus($pdo);
    }

    public function GetRecoveredPatientsByCourse($CourseCode, $loggedUser)
    {
        $recoveredCount = 0;

        // Fetch all relevant data at once using a JOIN to combine `care_center_course` and `care_start`
        $stmt = $this->pdo->prepare("
            SELECT ccc.`id`, ccc.`CourseCode`, ccc.`prescription_id`, cs.`patient_status`, cs.`time`
            FROM `care_center_course` ccc
            LEFT JOIN `care_start` cs ON ccc.`prescription_id` = cs.`PresCode` AND cs.`student_id` = ?
            WHERE ccc.`CourseCode` LIKE ? AND ccc.`status` = 'Active' AND cs.`patient_status` IN ('Pending', 'Recovered')
        ");
        $stmt->execute([$loggedUser, $CourseCode]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as $row) {
            $patientStatus = $row['patient_status'];

            // Check if the status is "Recovered"
            if ($patientStatus === "Recovered") {
                $recoveredCount++;
            }
        }

        return [
            'title' => "Ceylon Pharmacy",
            'userName' => $loggedUser,
            "recoveredCount" => $recoveredCount
        ];
    }

    public function HunterMedicinesCount()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) as medicine_count FROM `hunter_medicine` WHERE `active_status` NOT LIKE 'Deleted'");
        return $stmt->fetchColumn();
    }

    public function HunterSavedAnswersAggregated($studentNumber)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                SUM(CASE WHEN `answer_status` = 'Correct' THEN 1 ELSE 0 END) AS correct_count,
                SUM(CASE WHEN `answer_status` = 'Wrong' THEN 1 ELSE 0 END) AS incorrect_count,
                SUM(CASE WHEN `answer_status` = 'Correct' AND `score_type` = 'Jem' THEN 1 ELSE 0 END) AS gem_count,
                SUM(CASE WHEN `answer_status` = 'Correct' AND `score_type` = 'Coin' THEN 1 ELSE 0 END) AS coin_count
            FROM 
                `hunter_saveanswer` 
            WHERE 
                `index_number` = ?
        ");
        $stmt->execute([$studentNumber]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Optimized HunterProgress method
    public function HunterProgress($loggedUser, $attemptPerMedicine = 10)
    {
        // Fetch medicine count in one query
        $medicineCount = $this->HunterMedicinesCount();

        // Fetch saved answers data in one query
        $savedCounts = $this->HunterSavedAnswersAggregated($loggedUser);

        $correctCount = $savedCounts['correct_count'] ?? 0;
        $wrongCount = $savedCounts['incorrect_count'] ?? 0;
        $gemCount = $savedCounts['gem_count'] ?? 0;
        $coinCount = $savedCounts['coin_count'] ?? 0;

        // Calculate derived values
        $pendingCount = max(0, $medicineCount * $attemptPerMedicine - $correctCount);

        if ($coinCount >= 50) {
            $gemCount += intdiv($coinCount, 50);
            $coinCount %= 50;
        }

        $progressValue = ($medicineCount > 0)
            ? min(100, ($correctCount / ($medicineCount * $attemptPerMedicine)) * 100)
            : 0;

        return [
            'title' => "Pharma Hunter",
            'userName' => $loggedUser,
            'correctCount' => $correctCount,
            'pendingCount' => $pendingCount,
            'wrongCount' => $wrongCount,
            'gemCount' => $gemCount,
            'coinCount' => $coinCount,
            'ProgressValue' => $progressValue
        ];
    }


    // Hunter Pro
    // Get the number of Hunter Pro attempts allowed
    private function getHunterProAttempts()
    {
        $stmt = $this->pdo->query("SELECT `value` FROM `settings` WHERE `setting` = 'HunterProAttempt' LIMIT 1");
        return (int) $stmt->fetchColumn();
    }

    // Get the count of correct attempts for a user
    private function getHPCorrectAttempts($indexNumber)
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) AS correct_count 
            FROM `hp_save_answer` 
            WHERE `index_number` = ? AND `answer_status` = 'Correct'
        ");
        $stmt->execute([$indexNumber]);
        return (int) $stmt->fetchColumn();
    }

    // Get all submissions grouped by medicine for a user
    private function getAllSubmissionsByMedicine($indexNumber)
    {
        $stmt = $this->pdo->prepare("
            SELECT `medicine_id`, COUNT(`medicine_id`) AS attempt_count 
            FROM `hp_save_answer` 
            WHERE `index_number` = ? 
            GROUP BY `medicine_id`
        ");
        $stmt->execute([$indexNumber]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get all submissions for a user
    private function getAllSubmissions($indexNumber)
    {
        $stmt = $this->pdo->prepare("
            SELECT `medicine_id`, `answer_status` 
            FROM `hp_save_answer` 
            WHERE `index_number` = ?
        ");
        $stmt->execute([$indexNumber]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }



    // Calculate Hunter Pro progress
    public function getHunterProProgress($courseCode, $indexNumber)
    {
        try {
            // Get Medicines Count
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) AS medicine_count 
                FROM `hp_course_medicine` 
                WHERE `status` = 'Active' AND `CourseCode` = ?
            ");
            $stmt->execute([$courseCode]);
            $medicineCount = (int) $stmt->fetchColumn();

            if ($medicineCount === 0) {
                return [
                    'report-title' => "Pharma Hunter Pro",
                    'studentNumber' => $indexNumber,
                    'courseCode' => $courseCode, // Course Code
                    'progressValue' => 0,
                    'pendingCount' => 0,
                    'correctCount' => 0,
                    'gemCount' => 0,
                    'coinCount' => 0,
                    'results' => [
                        'progressPercentage' => 0,
                        'pendingCount' => 0,
                        'correctCount' => 0,
                        'gemCount' => 0,
                        'coinCount' => 0
                    ]
                ];
            }

            // Get Hunter Pro Attempts
            $attemptsPerMedicine = $this->getHunterProAttempts();

            // Get correct attempts and submissions
            $correctAttempts = $this->getHPCorrectAttempts($indexNumber);
            $allSubmissionsByMedicine = $this->getAllSubmissionsByMedicine($indexNumber);
            $allSubmissions = $this->getAllSubmissions($indexNumber);

            // Calculate total coin and gem counts
            $totalCoin = $totalGem = 0;
            foreach ($allSubmissionsByMedicine as $submission) {
                $medicineId = $submission['medicine_id'];
                $savedItems = array_filter($allSubmissions, fn($item) => $item['medicine_id'] === $medicineId);

                $correctItems = array_filter($savedItems, fn($item) => $item['answer_status'] === 'Correct');
                $incorrectItems = array_filter($savedItems, fn($item) => $item['answer_status'] === 'In-Correct');

                if (count($correctItems) >= count($incorrectItems)) {
                    $gemCount = count($correctItems) - count($incorrectItems);
                    $coinCount = count($incorrectItems);
                } else {
                    $gemCount = 0;
                    $coinCount = count($correctItems);
                }

                $totalCoin += $coinCount;
                $totalGem += $gemCount;
            }

            // Convert coins to gems
            $totalGem += intdiv($totalCoin, 50);
            $totalCoin %= 50;

            // Calculate progress
            $pendingCount = max(0, ($medicineCount * $attemptsPerMedicine) - $correctAttempts);
            $progressValue = min(100, ($correctAttempts / ($medicineCount * $attemptsPerMedicine)) * 100);

            return [
                'title' => "Pharma Hunter Pro",
                'studentNumber' => $indexNumber,
                'courseCode' => $courseCode,
                'medicineCount' => $medicineCount,
                'attemptsPerMedicine' => $attemptsPerMedicine,
                'totalAttempts' => $medicineCount * $attemptsPerMedicine,
                'results' => [
                    'progressPercentage' => $progressValue,
                    'pendingCount' => $pendingCount,
                    'correctCount' => $correctAttempts,
                    'gemCount' => $totalGem,
                    'coinCount' => $totalCoin
                ]

            ];
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }


    // Assignments


    /**
     * Fetch assignments by course code.
     */
    public function fetchAssignmentsByCourseId($course_code)
    {
        try {
            $query = "SELECT * FROM `assignment` WHERE `course_code` = :course_code";
            $stmt = $this->pdo->prepare($query);
            $stmt->bindParam(':course_code', $course_code, PDO::PARAM_STR);
            $stmt->execute();

            $resultArray = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $resultArray[$row['assignment_id']] = $row;
            }
            return $resultArray;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return null;
        }
    }

    /**
     * Fetch assignment submissions by student ID.
     */
    public function fetchSubmissionsByStudentId($student_id)
    {
        try {
            $query = "SELECT * FROM `assignment_submittion` WHERE `created_by` = :student_id";
            $stmt = $this->pdo->prepare($query);
            $stmt->bindParam(':student_id', $student_id, PDO::PARAM_STR);
            $stmt->execute();

            $resultArray = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $resultArray[$row['assignment_id']] = $row;
            }
            return $resultArray;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            return ['error' => $this->lastError];
        }
    }

    /**
     * Calculate grading information for a course and student.
     */
    public function calculateAssignmentsGrades($course_code, $student_id)
    {
        $assignments = $this->fetchAssignmentsByCourseId($course_code);
        $submissions = $this->fetchSubmissionsByStudentId($student_id);

        $totalGrade = 0;
        $result = [];

        foreach ($assignments as $assignment) {
            $submissionInfo = $submissions[$assignment['assignment_id']] ?? [];
            $gradeValue = !empty($submissionInfo) ? $submissionInfo['grade'] : 0;
            $gradeValue = (float) $gradeValue;

            $totalGrade += $gradeValue;

            $result[] = [
                'assignment_id' => $assignment['assignment_id'],
                'assignment_name' => $assignment['assignment_name'],
                'grade' => number_format($gradeValue, 2),
            ];
        }

        $assignmentCount = count($assignments) > 0 ? count($assignments) : 1;
        $averageGrade = number_format($totalGrade / $assignmentCount, 2);

        return [
            'assignments' => $result,
            'average_grade' => $averageGrade,
        ];
    }


    // Get Student Balance
    /**
     * Get LMS Batches.
     *
     * @return array
     */
    public function getLmsBatches()
    {
        $ArrayResult = [];

        try {
            $sql = "SELECT `id`, `course_name`, `course_code`, `instructor_id`, `course_description`, `course_duration`, `course_fee`, `registration_fee`, `other`, `created_at`, `created_by`, `update_by`, `update_at`, `enroll_key`, `display`, `CertificateImagePath`, `course_img`, `certification`, `mini_description` FROM `course` ORDER BY `id` DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as $row) {
                $ArrayResult[$row['course_code']] = $row;
            }
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }

        return $ArrayResult;
    }


    /**
     * Get student balance.
     *
     * @param string $userName
     * @return array
     */
    public function GetStudentBalance($userName)
    {
        $totalPaymentAmount = $TotalStudentPaymentRecords = $studentBalance = $TotalRegistrationFee = 0;
        $paymentRecords = $this->getStudentPaymentDetails($userName);
        $studentEnrollments = $this->getUserEnrollments($userName);
        $courseList = $this->getLmsBatches();

        if (!empty($studentEnrollments)) {
            foreach ($studentEnrollments as $selectedArray) {
                $totalCourseFee = 0;
                $courseDetails = $courseList[$selectedArray['course_code']];
                $totalCourseFee = $courseDetails['course_fee'] + $courseDetails['registration_fee'];
                $TotalRegistrationFee += $courseDetails['registration_fee'];
                $totalPaymentAmount += $totalCourseFee;
            }
        }

        if (!empty($paymentRecords)) {
            foreach ($paymentRecords as $selectedArray) {
                $paymentRecord = 0;
                $paymentRecord = ($selectedArray['paid_amount'] + $selectedArray['discount_amount']);
                $TotalStudentPaymentRecords += $paymentRecord;
            }
        }

        $studentBalance = $totalPaymentAmount - $TotalStudentPaymentRecords;

        // Construct Result Array
        return [
            'title' => "Student Payment Details",
            'userName' => $userName,
            'totalPaymentAmount' => $totalPaymentAmount,
            'TotalStudentPaymentRecords' => $TotalStudentPaymentRecords,
            'studentBalance' => $studentBalance,
            'TotalRegistrationFee' => $TotalRegistrationFee,
            'paymentRecords' => $paymentRecords,
        ];
    }


    public function GetStudentBalanceCourseCode($userName, $CourseCode)
    {
        $totalPaymentAmount = $TotalStudentPaymentRecords = $studentBalance = $TotalRegistrationFee = 0;
        $paymentRecords = $this->getStudentPaymentDetails($userName);
        $studentEnrollments = $this->getUserEnrollments($userName);
        $courseList = $this->getLmsBatches();

        if (!empty($studentEnrollments)) {
            foreach ($studentEnrollments as $selectedArray) {
                if ($selectedArray['course_code'] !== $CourseCode) {
                    continue; // Skip if course code does not match
                }
                $totalCourseFee = 0;
                $courseDetails = $courseList[$selectedArray['course_code']];
                $totalCourseFee = $courseDetails['course_fee'] + $courseDetails['registration_fee'];
                $TotalRegistrationFee += $courseDetails['registration_fee'];
                $totalPaymentAmount += $totalCourseFee;
            }
        }

        if (!empty($paymentRecords)) {
            foreach ($paymentRecords as $selectedArray) {
                if ($selectedArray['course_code'] !== $CourseCode) {
                    continue; // Skip if course code does not match
                }
                $paymentRecord = 0;
                $paymentRecord = ($selectedArray['paid_amount'] + $selectedArray['discount_amount']);
                $TotalStudentPaymentRecords += $paymentRecord;
            }
        }

        $studentBalance = $totalPaymentAmount - $TotalStudentPaymentRecords;

        // Construct Result Array
        return [
            'title' => "Student Payment Details",
            'userName' => $userName,
            'totalPaymentAmount' => $totalPaymentAmount,
            'TotalStudentPaymentRecords' => $TotalStudentPaymentRecords,
            'studentBalance' => $studentBalance,
            'TotalRegistrationFee' => $TotalRegistrationFee,
            'paymentRecords' => $paymentRecords,
        ];
    }


    /**
     * Get user enrollments.
     *
     * @param string $userName
     * @return array
     */
    public function getUserEnrollments($userName)
    {
        $ArrayResult = [];
        try {
            $studentId = $this->GetLmsStudentsByUserName($userName)['student_id'];
            $sql = "SELECT 
    sc.id,
    sc.course_code,
    sc.student_id,
    sc.enrollment_key,
    sc.created_at,
    c.parent_course_id
FROM 
    student_course sc
JOIN 
    course c ON sc.course_code = c.course_code
WHERE 
    sc.student_id LIKE ?
ORDER BY 
    sc.id DESC;
";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$studentId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as $row) {
                $ArrayResult[] = $row;
            }
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }

        return $ArrayResult;
    }

    /**
     * Get student payment details.
     *
     * @param string $userName
     * @return array
     */
    public function getStudentPaymentDetails($userName)
    {
        $ArrayResult = [];

        try {
            $studentId = $this->GetLmsStudentsByUserName($userName)['student_id'];
            $sql = "SELECT * FROM `student_payment` WHERE `student_id` LIKE ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$studentId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as $row) {
                $ArrayResult[$row['receipt_number']] = $row;
            }
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }

        return $ArrayResult;
    }

    /**
     * Get student details by username.
     *
     * @param string $userName
     * @return array
     */
    public function GetLmsStudentsByUserName($userName)
    {
        $ArrayResult = [];
        try {
            global $link;
            $sql = "SELECT `id`, `student_id`, `username`, `civil_status`, `first_name`, `last_name`, `gender`, `address_line_1`, `address_line_2`, `city`, `district`, `postal_code`, `telephone_1`, `telephone_2`, `nic`, `e_mail`, `birth_day`, `updated_by`, `updated_at`, `full_name`, `name_with_initials`, `name_on_certificate` FROM `user_full_details` WHERE `username` LIKE ? ORDER BY `id` DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$userName]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $ArrayResult[$row['username']] = $row;
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }

        return $ArrayResult[$userName] ?? null;
    }

    public function getUserEnrollmentsFullDetails($userName)
    {
        $ArrayResult = [];
        try {
            $studentId = $this->GetLmsStudentsByUserName($userName)['student_id'];
            $sql = "SELECT 
                    sc.`id`, 
                    sc.`course_code`, 
                    sc.`student_id`, 
                    sc.`enrollment_key`, 
                    sc.`created_at`, 
                    c.`course_name` AS `batch_name`,
                    c.`parent_course_id` AS `parent_course_id`,
                    c.`criteria_list` AS `criteria_list`,
                    p.`course_name` AS `parent_course_name`
                FROM 
                    `student_course` AS sc
                INNER JOIN 
                    `course` AS c 
                    ON sc.`course_code` = c.`course_code`
                LEFT JOIN 
                    `parent_main_course` AS p 
                    ON c.`parent_course_id` = p.`id`
                WHERE 
                    sc.`student_id` LIKE ?
                ORDER BY 
                    sc.`id` DESC
        ";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$studentId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as $row) {
                $recoveredPatients = $this->GetRecoveredPatientsByCourse($row['course_code'], $userName);
                $hunterProgress = $this->HunterProgress($userName);
                $hunterProProgress =  $this->getHunterProProgress($row['course_code'], $userName);
                $assignmentGrades = $this->calculateAssignmentsGrades($row['course_code'], $userName);
                $deliveryOrders = $this->getRecordByIndexNumberAndCourse($userName, $row['course_code']);
                $certificateRecords = $this->certificatePrintStatus->getRecordsByStudentNumberCourseCode($userName, $row['course_code']);
                $studentBalance = $this->GetStudentBalanceCourseCode($userName, $row['course_code']);

                // Append the data to the course details
                $row['ceylon_pharmacy'] = $recoveredPatients;
                $row['pharma_hunter'] = $hunterProgress;
                $row['pharma_hunter_pro'] = $hunterProProgress;
                $row['assignment_grades'] = $assignmentGrades;
                $row['deliveryOrders'] = $deliveryOrders;
                $row['certificateRecords'] = $certificateRecords;
                $row['studentBalance'] = $studentBalance['studentBalance'];

                // echo "Balance - " . $studentBalance['studentBalance'];

                $criteriaIds = [];

                if (!empty($row['criteria_list'])) {
                    $criteriaIds = array_map('trim', explode(',', $row['criteria_list']));
                }

                if (!empty($criteriaIds)) {
                    $placeholders = implode(',', array_fill(0, count($criteriaIds), '?'));
                    $criteriaStmt = $this->pdo->prepare("SELECT * FROM `cc_criteria_list` WHERE id IN ($placeholders)");
                    $criteriaStmt->execute($criteriaIds);
                    $criteriaList = $criteriaStmt->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($criteriaList as &$criteria) {
                        $criteriaResult = [
                            'completed' => false,
                            'currentValue' => 0,
                            'requiredValue' => (int) ($criteria['moq'] ?? 0)
                        ];

                        switch ((int) $criteria['id']) {
                            case 1: // Pharmer Hunter Game
                                $criteriaResult['currentValue'] = (int) ($row['pharma_hunter']['correctCount'] ?? 0);
                                break;

                            case 2: // Ceylon Pharmacy
                                $criteriaResult['currentValue'] = (int) ($row['ceylon_pharmacy']['recoveredCount'] ?? 0);
                                break;

                            case 3: // Assignment 01
                                $criteriaResult['currentValue'] = isset($row['assignment_grades']['assignments'][0]['grade']) ? (float) $row['assignment_grades']['assignments'][0]['grade'] : 0;
                                break;

                            case 4: // Assignment 02
                                $criteriaResult['currentValue'] = isset($row['assignment_grades']['assignments'][1]['grade']) ? (float) $row['assignment_grades']['assignments'][1]['grade'] : 0;
                                break;

                            case 5: // Assignment 03
                                $criteriaResult['currentValue'] = isset($row['assignment_grades']['assignments'][2]['grade']) ? (float) $row['assignment_grades']['assignments'][2]['grade'] : 0;
                                break;

                            case 6: // Due Payments
                                $criteriaResult['currentValue'] = (float) ($studentBalance['studentBalance']);
                                break;
                            case 7: // Pharmer Hunter Pro
                                $criteriaResult['currentValue'] = (int) ($row['pharma_hunter_pro']['results']['correctCount'] ?? 0);
                                break;
                            case 8: // Ceylon Pharmacy Advanced
                                $criteriaResult['currentValue'] = (int) ($row['ceylon_pharmacy']['results']['correctCount'] ?? 0);
                                break;
                        }

                        if ((int) $criteria['id'] === 6) {
                            // For Due Payments, check if balance is zero
                            $criteriaResult['completed'] = ($criteriaResult['currentValue'] <= 0);
                        } else {
                            $criteriaResult['completed'] = ($criteriaResult['currentValue'] >= $criteriaResult['requiredValue']);
                        }

                        $criteria['evaluation'] = $criteriaResult;
                    }
                    unset($criteria); // important to unset reference

                    // 🌟 Now after evaluating all criteria, check eligibility
                    $allCriteriaCompleted = true;
                    $failedCriteriaReasons = [];

                    foreach ($criteriaList as $criteria) {
                        if (empty($criteria['evaluation']['completed']) || $criteria['evaluation']['completed'] !== true) {
                            $allCriteriaCompleted = false;
                            $reason = "Failed criteria ID {$criteria['id']}";
                            if (!empty($criteria['list_name'])) {
                                $reason .= " ({$criteria['list_name']})";
                            }
                            $failedCriteriaReasons[] = $reason;
                        }
                    }

                    $row['certificate_eligibility'] = $allCriteriaCompleted;

                    if (!$allCriteriaCompleted) {
                        $row['certificate_eligibility_reasons'] = $failedCriteriaReasons;
                    }

                    $row['criteria_details'] = $criteriaList;
                } else {
                    $row['criteria_details'] = [];
                    $row['certificate_eligibility'] = false;
                    $row['certificate_eligibility_reasons'] = ["No criteria available"];
                }

                // Add the updated row to the result array
                $ArrayResult[$row['course_code']] = $row;
            }
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }

        return $ArrayResult;
    }
}
