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

    public function calculateOverallGradeDpad($loggedUser)
    {
        $correctCount = $inCorrectCount = $correctScore = $inCorrectScore = $overallGrade = 0;

        $prescriptions = $this->getActivePrescriptions();
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
}
