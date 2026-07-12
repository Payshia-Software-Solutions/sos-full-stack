<?php

class DpadModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getActivePrescriptions()
    {
        $sql = "SELECT * FROM `prescription` WHERE `prescription_status` LIKE 'Active'";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSubmittedAnswersByUser($loggedUser)
    {
        $sql = "SELECT `id`, `answer_id`, `pres_id`, `cover_id`, `date`, `name`, `drug_name`, `drug_type`, `drug_qty`, `morning_qty`, 
                `afternoon_qty`, `evening_qty`, `night_qty`, `meal_type`, `using_type`, `at_a_time`, `hour_qty`, `additional_description`, 
                `created_at`, `created_by`, `answer_status`, `score` 
                FROM `prescription_answer_submission` WHERE `created_by` = :loggedUser";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['loggedUser' => $loggedUser]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPrescriptionCoversDpad($prescriptionId)
    {
        $sql = "SELECT `drugs_list` FROM `prescription` WHERE `prescription_id` = :prescriptionId";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['prescriptionId' => $prescriptionId]);

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return explode(', ', $row['drugs_list']);
        }
        return [];
    }

    public function getSubmittedAnswersCount($loggedUser, $prescriptionId, $status, $medicineCount, $savedAnswers)
    {
        $count = 0;
        for ($i = 1; $i <= $medicineCount; $i++) {
            $coverId = 'Cover' . $i;

            $savedCovers = array_filter($savedAnswers, function ($answer) use ($prescriptionId, $status, $coverId) {
                return $answer['pres_id'] === $prescriptionId && $answer['answer_status'] === $status && $answer['cover_id'] === $coverId;
            });

            $count += count($savedCovers);
        }
        return $count;
    }

    public function calculateOverallGradeDpad($loggedUser, $courseCode = null)
    {
        $correctCount = $inCorrectCount = $correctScore = $inCorrectScore = $overallGrade = 0;

        if ($courseCode) {
            $prescriptions = $this->getActivePrescriptionsByCourse($courseCode);
        } else {
            $prescriptions = $this->getActivePrescriptions();
        }
        $scorePerPrescription = 10;
        $savedAnswers = $this->getSubmittedAnswersByUser($loggedUser);

        $totalEnvelopes = 0;
        foreach ($prescriptions as $selectedArray) {
            $prescriptionId = $selectedArray['prescription_id'];
            $medicineEnvelopes = $this->getPrescriptionCoversDpad($prescriptionId);

            if ($medicineEnvelopes) {
                $medicineCount = count($medicineEnvelopes);
                $totalEnvelopes += $medicineCount;

                $correctCount += $this->getSubmittedAnswersCount($loggedUser, $prescriptionId, 'Correct', $medicineCount, $savedAnswers);
                $inCorrectCount += $this->getSubmittedAnswersCount($loggedUser, $prescriptionId, 'In-Correct', $medicineCount, $savedAnswers);
            }
        }

        $correctScore = $correctCount * $scorePerPrescription;
        $inCorrectScore = $inCorrectCount * -1;

        $prescriptionCount = count($prescriptions);

        if ($prescriptionCount > 0 && $totalEnvelopes > 0) {
            $overallGrade = (($correctScore + $inCorrectScore) / ($totalEnvelopes * $scorePerPrescription)) * 100;
        }

        return [
            'overallGrade' => $overallGrade,
            'correctScore' => $correctScore,
            'inCorrectScore' => $inCorrectScore,
            'prescriptionCount' => $prescriptionCount,
            'totalEnvelopes' => $totalEnvelopes
        ];
    }

    public function getPrescriptionDetails($prescriptionId)
    {
        $sql = "SELECT * FROM `prescription` WHERE `prescription_id` = :prescriptionId";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['prescriptionId' => $prescriptionId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function submitAnswer($loggedUser, $data)
    {
        $prescriptionID = $data['prescriptionID'] ?? '';
        $coverID = $data['coverID'] ?? '';

        // Check if there is already a Correct submission
        $checkSql = "SELECT `answer_id` FROM `prescription_answer_submission` 
                     WHERE `cover_id` = :coverID AND `pres_id` = :prescriptionID 
                     AND `answer_status` = 'Correct' AND `created_by` = :loggedUser";
        $checkStmt = $this->pdo->prepare($checkSql);
        $checkStmt->execute([
            'coverID' => $coverID,
            'prescriptionID' => $prescriptionID,
            'loggedUser' => $loggedUser
        ]);

        if ($checkStmt->fetch()) {
            return ['status' => 'error', 'message' => 'Already Saved Correct Attempt'];
        }

        // Fetch correct answer
        $ansSql = "SELECT * FROM `prescription_answer` WHERE `pres_id` = :prescriptionID AND `cover_id` = :coverID";
        $ansStmt = $this->pdo->prepare($ansSql);
        $ansStmt->execute(['prescriptionID' => $prescriptionID, 'coverID' => $coverID]);
        $correctAnswer = $ansStmt->fetch(PDO::FETCH_ASSOC);

        if (!$correctAnswer) {
            return ['status' => 'error', 'message' => 'No answer key configured for this prescription cover.'];
        }

        $fields = [
            'date', 'name', 'drug_name', 'drug_type', 'drug_qty',
            'morning_qty', 'afternoon_qty', 'evening_qty', 'night_qty',
            'meal_type', 'using_type', 'at_a_time', 'hour_qty', 'additional_description'
        ];

        $incorrectFields = [];

        foreach ($fields as $field) {
            $submittedVal = trim($data[$field] ?? '');
            $correctVal = trim($correctAnswer[$field] ?? '');

            if (strcasecmp($submittedVal, $correctVal) !== 0) {
                $incorrectFields[] = $field;
            }
        }

        if (empty($incorrectFields)) {
            $answer_status = "Correct";
            $score = 10;
        } else {
            $score = -1;
            $answer_status = "In-Correct";
        }

        // Generate submit code UA...
        $countSql = "SELECT COUNT(answer_id) as count FROM prescription_answer_submission";
        $countStmt = $this->pdo->query($countSql);
        $countRow = $countStmt->fetch(PDO::FETCH_ASSOC);
        $previous_code = $countRow ? (int)$countRow['count'] : 0;
        $newSubmitCode = "UA" . ($previous_code + 1);

        // Insert submission
        $insSql = "INSERT INTO `prescription_answer_submission` 
                   (`answer_id`, `pres_id`, `cover_id`, `date`, `name`, `drug_name`, `drug_type`, `drug_qty`, 
                    `morning_qty`, `afternoon_qty`, `evening_qty`, `night_qty`, `meal_type`, `using_type`, 
                    `at_a_time`, `hour_qty`, `additional_description`, `created_by`, `answer_status`, `score`) 
                   VALUES 
                   (:answer_id, :pres_id, :cover_id, :date, :name, :drug_name, :drug_type, :drug_qty, 
                    :morning_qty, :afternoon_qty, :evening_qty, :night_qty, :meal_type, :using_type, 
                    :at_a_time, :hour_qty, :additional_description, :created_by, :answer_status, :score)";

        $insStmt = $this->pdo->prepare($insSql);
        $exec = $insStmt->execute([
            'answer_id' => $newSubmitCode,
            'pres_id' => $prescriptionID,
            'cover_id' => $coverID,
            'date' => $data['date'] ?? '',
            'name' => $data['name'] ?? '',
            'drug_name' => $data['drug_name'] ?? '',
            'drug_type' => $data['drug_type'] ?? '',
            'drug_qty' => $data['drug_qty'] ?? '',
            'morning_qty' => $data['morning_qty'] ?? '',
            'afternoon_qty' => $data['afternoon_qty'] ?? '',
            'evening_qty' => $data['evening_qty'] ?? '',
            'night_qty' => $data['night_qty'] ?? '',
            'meal_type' => $data['meal_type'] ?? '',
            'using_type' => $data['using_type'] ?? '',
            'at_a_time' => $data['at_a_time'] ?? '',
            'hour_qty' => $data['hour_qty'] ?? '',
            'additional_description' => $data['additional_description'] ?? '',
            'created_by' => $loggedUser,
            'answer_status' => $answer_status,
            'score' => $score
        ]);

        if ($exec) {
            return [
                'status' => 'success',
                'message' => $answer_status === 'Correct' ? 'Answer is Correct!' : 'Answer has some incorrect fields.',
                'incorrect_values' => $incorrectFields,
                'answer_status' => $answer_status
            ];
        } else {
            return ['status' => 'error', 'message' => 'Failed to save answer submission.'];
        }
    }

    public function getAllPrescriptions()
    {
        $sql = "SELECT * FROM `prescription` ORDER BY `id` DESC";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function savePrescription($data)
    {
        $prescriptionID = $data['prescriptionID'] ?? '0';
        $patientName = $data['patientName'] ?? '';
        $prescriptionStatus = $data['prescriptionStatus'] ?? 'Active';
        $patientDate = $data['patientDate'] ?? '';
        $patientAge = $data['patientAge'] ?? 0;
        $usingMethod = $data['usingMethod'] ?? '';
        $doctorName = $data['doctorName'] ?? '';
        $drugDescription = $data['drugDescription'] ?? '';
        
        $drugsList = $data['drugsList'] ?? [];
        if (is_string($drugsList)) {
            $drugsList = json_decode($drugsList, true) ?? [];
        }
        $drugListArray = implode(', ', $drugsList);

        $drugsWrittenList = $data['drugsWrittenList'] ?? [];
        if (is_string($drugsWrittenList)) {
            $drugsWrittenList = json_decode($drugsWrittenList, true) ?? [];
        }
        $drugWrittenListArray = implode(', ', $drugsWrittenList);

        if ($prescriptionID !== '0' && !empty($prescriptionID)) {
            // Update
            $sql = "UPDATE `prescription` SET
                    `prescription_name` = :prescription_name,
                    `prescription_status` = :prescription_status,
                    `Pres_Name` = :Pres_Name,
                    `pres_date` = :pres_date,
                    `Pres_Age` = :Pres_Age,
                    `Pres_Method` = :Pres_Method,
                    `doctor_name` = :doctor_name,
                    `notes` = :notes,
                    `drugs_list` = :drugs_list,
                    `drugs_written_list` = :drugs_written_list
                    WHERE `prescription_id` = :prescription_id";
            
            $stmt = $this->pdo->prepare($sql);
            $exec = $stmt->execute([
                'prescription_name' => $patientName,
                'prescription_status' => $prescriptionStatus,
                'Pres_Name' => $patientName,
                'pres_date' => $patientDate,
                'Pres_Age' => $patientAge,
                'Pres_Method' => $usingMethod,
                'doctor_name' => $doctorName,
                'notes' => $drugDescription,
                'drugs_list' => $drugListArray,
                'drugs_written_list' => $drugWrittenListArray,
                'prescription_id' => $prescriptionID
            ]);
            
            if ($exec) {
                return ['status' => 'success', 'message' => 'Prescription updated successfully', 'prescriptionID' => $prescriptionID];
            } else {
                return ['status' => 'error', 'message' => 'Failed to update prescription'];
            }
        } else {
            // Insert
            $nextIdSql = "SELECT MAX(CAST(SUBSTRING(`prescription_id`, 4) AS UNSIGNED)) + 1 AS next_id FROM `prescription`";
            $nextIdRow = $this->pdo->query($nextIdSql)->fetch(PDO::FETCH_ASSOC);
            $nextId = $nextIdRow['next_id'] ?? 1;
            $newPrescriptionId = 'PRE' . $nextId;

            $sql = "INSERT INTO `prescription` 
                    (`prescription_name`, `prescription_status`, `Pres_Name`, `pres_date`, `Pres_Age`, `Pres_Method`, `doctor_name`, `notes`, `drugs_list`, `drugs_written_list`, `prescription_id`)
                    VALUES 
                    (:prescription_name, :prescription_status, :Pres_Name, :pres_date, :Pres_Age, :Pres_Method, :doctor_name, :notes, :drugs_list, :drugs_written_list, :prescription_id)";
            
            $stmt = $this->pdo->prepare($sql);
            $exec = $stmt->execute([
                'prescription_name' => $patientName,
                'prescription_status' => $prescriptionStatus,
                'Pres_Name' => $patientName,
                'pres_date' => $patientDate,
                'Pres_Age' => $patientAge,
                'Pres_Method' => $usingMethod,
                'doctor_name' => $doctorName,
                'notes' => $drugDescription,
                'drugs_list' => $drugListArray,
                'drugs_written_list' => $drugWrittenListArray,
                'prescription_id' => $newPrescriptionId
            ]);

            if ($exec) {
                return ['status' => 'success', 'message' => 'Prescription saved successfully', 'prescriptionID' => $newPrescriptionId];
            } else {
                return ['status' => 'error', 'message' => 'Failed to save prescription'];
            }
        }
    }

    public function updatePrescriptionStatus($prescriptionID, $status)
    {
        if (empty($prescriptionID)) {
            return ['status' => 'error', 'message' => 'Prescription ID is required'];
        }

        $sql = "UPDATE `prescription` SET `prescription_status` = :status WHERE `prescription_id` = :id";
        $stmt = $this->pdo->prepare($sql);
        $exec = $stmt->execute([
            'status' => $status,
            'id' => $prescriptionID
        ]);

        if ($exec) {
            return ['status' => 'success', 'message' => 'Status updated successfully'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to update status'];
        }
    }

    public function saveAnswerKey($createdBy, $data)
    {
        $presID = $data['prescriptionID'] ?? '';
        $coverID = $data['coverID'] ?? '';
        $date = $data['date'] ?? '';
        $name = $data['name'] ?? '';
        $drugName = $data['drug_name'] ?? '';
        $drugType = $data['drug_type'] ?? '';
        $drugQty = $data['drug_qty'] ?? '';
        $morningQty = $data['morning_qty'] ?? '';
        $afternoonQty = $data['afternoon_qty'] ?? '';
        $eveningQty = $data['evening_qty'] ?? '';
        $nightQty = $data['night_qty'] ?? '';
        $mealType = $data['meal_type'] ?? '';
        $usingType = $data['using_type'] ?? '';
        $atATime = $data['at_a_time'] ?? '';
        $hourQty = $data['hour_qty'] ?? '';
        $additionalDescription = $data['additional_description'] ?? '';
        
        $currentTime = date('Y-m-d H:i:s');

        $chkSql = "SELECT id FROM prescription_answer WHERE pres_id = :pres_id AND cover_id = :cover_id";
        $chkStmt = $this->pdo->prepare($chkSql);
        $chkStmt->execute(['pres_id' => $presID, 'cover_id' => $coverID]);
        
        if ($chkStmt->fetch()) {
            $sql = "UPDATE prescription_answer SET 
                    `name` = :name, 
                    `drug_name` = :drug_name, 
                    `drug_type` = :drug_type, 
                    `drug_qty` = :drug_qty, 
                    `morning_qty` = :morning_qty, 
                    `afternoon_qty` = :afternoon_qty, 
                    `evening_qty` = :evening_qty, 
                    `night_qty` = :night_qty, 
                    `meal_type` = :meal_type, 
                    `using_type` = :using_type, 
                    `at_a_time` = :at_a_time, 
                    `hour_qty` = :hour_qty, 
                    `additional_description` = :additional_description, 
                    `created_at` = :created_at, 
                    `created_by` = :created_by,  
                    `date` = :date 
                    WHERE pres_id = :pres_id AND cover_id = :cover_id";
            
            $stmt = $this->pdo->prepare($sql);
            $exec = $stmt->execute([
                'name' => $name,
                'drug_name' => $drugName,
                'drug_type' => $drugType,
                'drug_qty' => $drugQty,
                'morning_qty' => $morningQty,
                'afternoon_qty' => $afternoonQty,
                'evening_qty' => $eveningQty,
                'night_qty' => $nightQty,
                'meal_type' => $mealType,
                'using_type' => $usingType,
                'at_a_time' => $atATime,
                'hour_qty' => $hourQty,
                'additional_description' => $additionalDescription,
                'created_at' => $currentTime,
                'created_by' => $createdBy,
                'date' => $date,
                'pres_id' => $presID,
                'cover_id' => $coverID
            ]);

            if ($exec) {
                return ['status' => 'success', 'message' => 'Answer Key updated successfully'];
            } else {
                return ['status' => 'error', 'message' => 'Failed to update answer key'];
            }
        } else {
            $cntSql = "SELECT COUNT(`id`) AS `entry_count` FROM `prescription_answer`";
            $cntRow = $this->pdo->query($cntSql)->fetch(PDO::FETCH_ASSOC);
            $entryCount = $cntRow['entry_count'] ?? 0;
            $answer_id = "ANS" . ($entryCount + 1);

            $sql = "INSERT INTO prescription_answer 
                    (`answer_id`, pres_id, cover_id, `date`, `name`, drug_name, drug_type, drug_qty, morning_qty, afternoon_qty, evening_qty, night_qty, meal_type, using_type, at_a_time, hour_qty, additional_description, created_at, created_by) 
                    VALUES 
                    (:answer_id, :pres_id, :cover_id, :date, :name, :drug_name, :drug_type, :drug_qty, :morning_qty, :afternoon_qty, :evening_qty, :night_qty, :meal_type, :using_type, :at_a_time, :hour_qty, :additional_description, :created_at, :created_by)";
            
            $stmt = $this->pdo->prepare($sql);
            $exec = $stmt->execute([
                'answer_id' => $answer_id,
                'pres_id' => $presID,
                'cover_id' => $coverID,
                'date' => $date,
                'name' => $name,
                'drug_name' => $drugName,
                'drug_type' => $drugType,
                'drug_qty' => $drugQty,
                'morning_qty' => $morningQty,
                'afternoon_qty' => $afternoonQty,
                'evening_qty' => $eveningQty,
                'night_qty' => $nightQty,
                'meal_type' => $mealType,
                'using_type' => $usingType,
                'at_a_time' => $atATime,
                'hour_qty' => $hourQty,
                'additional_description' => $additionalDescription,
                'created_at' => $currentTime,
                'created_by' => $createdBy
            ]);

            if ($exec) {
                return ['status' => 'success', 'message' => 'Answer Key saved successfully'];
            } else {
                return ['status' => 'error', 'message' => 'Failed to save answer key'];
            }
        }
    }

    public function getAnswerKey($prescriptionId, $coverId)
    {
        $sql = "SELECT * FROM prescription_answer WHERE pres_id = :pres_id AND cover_id = :cover_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['pres_id' => $prescriptionId, 'cover_id' => $coverId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    // ─── Course Assignment Methods ─────────────────────────────────────────────

    /**
     * Assign a prescription to a course (upsert via UNIQUE KEY).
     */
    public function assignToCourse($prescriptionId, $courseCode, $assignedBy = null)
    {
        $sql = "INSERT IGNORE INTO `dpad_course_prescriptions`
                    (`prescription_id`, `course_code`, `assigned_by`)
                VALUES
                    (:prescription_id, :course_code, :assigned_by)";
        $stmt = $this->pdo->prepare($sql);
        $exec = $stmt->execute([
            'prescription_id' => $prescriptionId,
            'course_code'     => $courseCode,
            'assigned_by'     => $assignedBy,
        ]);
        return $exec
            ? ['status' => 'success', 'message' => 'Prescription assigned to course']
            : ['status' => 'error',   'message' => 'Failed to assign prescription'];
    }

    /**
     * Remove a prescription from a course.
     */
    public function unassignFromCourse($prescriptionId, $courseCode)
    {
        $sql = "DELETE FROM `dpad_course_prescriptions`
                WHERE `prescription_id` = :prescription_id
                  AND `course_code` = :course_code";
        $stmt = $this->pdo->prepare($sql);
        $exec = $stmt->execute([
            'prescription_id' => $prescriptionId,
            'course_code'     => $courseCode,
        ]);
        return $exec
            ? ['status' => 'success', 'message' => 'Prescription unassigned from course']
            : ['status' => 'error',   'message' => 'Failed to unassign prescription'];
    }

    /**
     * Get all course_codes assigned to a given prescription (for admin UI).
     */
    public function getCoursesByPrescription($prescriptionId)
    {
        $sql = "SELECT `course_code` FROM `dpad_course_prescriptions`
                WHERE `prescription_id` = :prescription_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['prescription_id' => $prescriptionId]);
        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'course_code');
    }

    /**
     * Get active prescriptions assigned to a specific course (for student page).
     */
    public function getActivePrescriptionsByCourse($courseCode)
    {
        $sql = "SELECT p.*
                FROM `prescription` p
                INNER JOIN `dpad_course_prescriptions` dcp
                    ON p.`prescription_id` = dcp.`prescription_id`
                WHERE p.`prescription_status` = 'Active'
                  AND dcp.`course_code` = :course_code";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['course_code' => $courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all course assignments (for admin bulk assignment UI).
     */
    public function getAllCourseAssignments()
    {
        $sql = "SELECT * FROM `dpad_course_prescriptions`";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

