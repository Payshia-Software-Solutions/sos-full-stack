<?php


class CeylonPharmacyCriteria
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getRecoveredPatientsByCourse($CourseCode, $LoggedUser)
    {
        $recoveredCount = 0;

        // Fetch all relevant data at once using a JOIN to combine `care_center_course` and `care_start`
        $stmt = $this->pdo->prepare("
            SELECT ccc.`id`, ccc.`CourseCode`, ccc.`prescription_id`, cs.`patient_status`, cs.`time`
            FROM `care_center_course` ccc
            LEFT JOIN `care_start` cs ON ccc.`prescription_id` = cs.`PresCode` AND cs.`student_id` = ?
            WHERE ccc.`CourseCode` LIKE ? AND ccc.`status` = 'Active' AND cs.`patient_status` IN ('Pending', 'Recovered')
        ");
        $stmt->execute([$LoggedUser, $CourseCode]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as $row) {
            $patientStatus = $row['patient_status'];

            // Check if the status is "Recovered"
            if ($patientStatus === "Recovered") {
                $recoveredCount++;
            }

            // // If the status is "Pending", check if it should be marked as "Died"
            // if ($patientStatus === "Pending") {
            //     $time = $row['time'];
            //     $end_time = date('Y-m-d H:i', strtotime($time . ' + 1 hour'));

            //     if (time() > strtotime($end_time)) {
            //         $patientStatus = "Died";
            //         // No need to update database, just track status
            //     }
            // }
        }

        return $recoveredCount;
    }
}
