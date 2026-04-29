<?php
// models/Winpharma/WinParmaSubmission.php

class WinPharmaSubmission
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllWinPharmaSubmissions($course_code = null)
    {
        $sql = "SELECT s.*, r.resource_title 
                FROM `win_pharma_submission` s
                LEFT JOIN `win_pharma_level_resources` r ON s.resource_id = r.resource_id";
        
        $params = [];
        if ($course_code) {
            $sql .= " WHERE s.course_code = ?";
            $params[] = $course_code;
        }

        $sql .= " ORDER BY 
                    CASE 
                        WHEN LOWER(TRIM(s.grade_status)) = 'pending' THEN 0 
                        WHEN LOWER(TRIM(s.grade_status)) = 'sp-pending' THEN 1
                        ELSE 2 
                    END ASC,
                    CASE 
                        WHEN LOWER(TRIM(s.grade_status)) IN ('pending', 'sp-pending') THEN s.date_time 
                    END ASC,
                    s.update_at DESC,
                    s.submission_id DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function GetSubmissionLevelCount($UserName, $batchCode)
    {

        $stmt = $this->pdo->prepare("SELECT COUNT(DISTINCT `level_id`) AS `LevelCount` FROM `win_pharma_submission` WHERE `index_number` LIKE ? AND `course_code` LIKE ? ");

        $stmt->execute([$UserName, $batchCode]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function getWinpharmaCompletedResourceIds($UserName, $winpharmaCurrentTopLevel)
    {
        $ResourceIds = [];

        $sql = "SELECT `resource_id` 
                FROM `win_pharma_submission` 
                WHERE `index_number` = :UserName 
                AND `grade_status` = 'Completed' 
                AND `level_id` = :winpharmaCurrentTopLevel";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':UserName' => $UserName,
            ':winpharmaCurrentTopLevel' => $winpharmaCurrentTopLevel
        ]);

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $ResourceIds[$row['resource_id']] = $row['resource_id']; // Maintain key-value structure
        }

        return $ResourceIds;
    }


    public function getTasks($LevelCode)
    {
        $ArrayResult = [];

        $sql = "SELECT `resource_id`, `level_id`, `resource_title`, `resource_data`, 
                   `created_by`, `task_cover`, `is_active` 
            FROM `win_pharma_level_resources` 
            WHERE `level_id` = :LevelCode";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':LevelCode' => $LevelCode]);

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $ArrayResult[$row['resource_id']] = $row; // Keep resource_id as the key
        }

        return $ArrayResult;
    }


    public function getTopLevelAllUsersCompleted($CourseCode)
    {
        $topLevels = []; // Array to store top levels for all users

        $sql = "SELECT `index_number`, MAX(`level_id`) AS `top_level`
            FROM `win_pharma_submission`
            WHERE `course_code` = :CourseCode 
              AND `grade_status` = 'Completed' 
            GROUP BY `index_number`";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':CourseCode' => $CourseCode]);

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $topLevels[$row['index_number']] = $row['top_level']; // Store top level for each user
        }

        return $topLevels;
    }

    public function getCourseTopLevel($course_code)
    {
        $level_id = -1;

        $sql = "SELECT `level_id`
            FROM `win_pharma_level`
            WHERE `course_code` = :course_code
            ORDER BY `level_id`
            LIMIT 1";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':course_code' => $course_code]);

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $level_id = $row['level_id'];
        }

        return $level_id;
    }

    public function getAllTasks()
    {
        $ArrayResult = [];

        $sql = "SELECT `resource_id`, `level_id`, `resource_title`, `resource_data`, `created_by`, `task_cover`, `is_active`
            FROM `win_pharma_level_resources`";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($tasks as $task) {
            $ArrayResult[$task['resource_id']] = $task;
        }

        return $ArrayResult;
    }


    public function getWinpharmaResultsAll($UserName, $CourseCode)
    {
        $winpharmaLevels = $this->GetLevels($CourseCode);
        $courseTopLevel = $this->getCourseTopLevel($CourseCode);
        $winpharmaTopLevels = $this->GetTopLevelAllUsersCompleted($CourseCode);

        $winpharmaCurrentTopLevel = $winpharmaTopLevels[$UserName] ?? $courseTopLevel;

        // Fetch all completed submissions at once
        $completedSubmissions = [];
        foreach ($winpharmaLevels as $level) {
            $levelId = $level['level_id'];
            $completedSubmissions[$levelId] = $this->GetWinpharmaCompletedResourceIds($UserName, $levelId);
        }

        // Calculate task counts & submission count in one loop
        $submissionCount = 0;
        $totalLevels = 0;
        $taskCounts = [];

        foreach ($winpharmaLevels as $level) {
            $levelId = $level['level_id'];
            $tasks = $this->GetTasks($levelId);

            $submissionsByUser = $this->GetWinpharmaCompletedResourceIds($UserName, $levelId);

            $taskCounts[$levelId] = [
                'levelTasks' => count($tasks),
                'levelTaskSubmissions' => count($submissionsByUser)
            ];
            $totalLevels += count($tasks);

            // Avoid unnecessary function calls
            $submissionCount += count($completedSubmissions[$levelId] ?? []);
        }

        // Avoid division by zero
        $totalGrade = ($totalLevels > 0) ? ($submissionCount / $totalLevels) : 0;
        $gradePercentage = $totalGrade * 100;

        return [
            'UserName' => $UserName,
            'winpharmaCurrentTopLevel' => $winpharmaCurrentTopLevel,
            'gradePercentage' => $gradePercentage,
            'submissionCount' => $submissionCount,
            'totalGrade' => $totalGrade,
            'taskCounts' => $taskCounts,
            'totalLevels' => $totalLevels
        ];
    }





    public function getLevels($CourseCode)
    {
        $ArrayResult = [];

        $sql = "SELECT `level_id`, `course_code`, `level_name`, `is_active`, `created_at`, `created_by` 
                FROM `win_pharma_level` 
                WHERE `course_code` LIKE ? 
                ORDER BY `level_id`";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$CourseCode]);

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $ArrayResult[$row['level_id']] = $row;
        }

        return $ArrayResult;
    }

    // Fetch WinPharma Results
    public function getWinPharmaResults($UserName, $batchCode)
    {
        $levels = $this->getLevels($batchCode);
        $submissionCount = $this->getSubmissionLevelCount($UserName, $batchCode);
        $totalLevels = count($levels);


        if ($totalLevels > 0) {
            $percentage = ($submissionCount['LevelCount'] / $totalLevels) * 100;
        } else {
            $percentage = 0;
        }

        return [
            'total_levels' => $totalLevels,
            'submitted_levels' => $submissionCount,
            'completion_percentage' => $percentage
        ];
    }

    public function getWinPharmaSubmissionById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_submission` WHERE `submission_id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createWinPharmaSubmission($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `win_pharma_submission` (`index_number`, `level_id`, `resource_id`, `submission`, `grade`, `grade_status`, `date_time`, `attempt`, `course_code`, `reason`, `update_by`, `update_at`, `recorrection_count`, `payment_status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['index_number'],
            $data['level_id'],
            $data['resource_id'],
            $data['submission'],
            $data['grade'],
            $data['grade_status'],
            $data['date_time'],
            $data['attempt'],
            $data['course_code'],
            $data['reason'],
            $data['update_by'],
            $data['update_at'],
            $data['recorrection_count'],
            $data['payment_status']

        ]);
    }


    public function updateWinPharmaSubmission($id, $data)
    {
        // Only update fields that are provided in the $data array
        $fields = [];
        $params = [];
        
        $updatableFields = [
            'grade', 'grade_status', 'reason', 'update_by', 'update_at', 
            'submission', 'index_number', 'level_id', 'resource_id', 
            'date_time', 'attempt', 'course_code', 'recorrection_count', 'payment_status'
        ];

        foreach ($updatableFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "`$field` = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $params[] = $id;
        $sql = "UPDATE `win_pharma_submission` SET " . implode(', ', $fields) . " WHERE `submission_id` = ?";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public function deleteWinPharmaSubmission($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `win_pharma_submission` WHERE `submission_id` = ?");
        $stmt->execute([$id]);
    }

    public function getSubmissionsByFilters($UserName, $batchCode)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_submission` WHERE `index_number` LIKE ? AND `course_code` LIKE ?");
        $stmt->execute([$UserName, $batchCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBatchGradingStats($batchCode)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                COUNT(*) as total_submissions,
                COUNT(CASE WHEN LOWER(TRIM(grade_status)) = 'pending' THEN 1 END) as total_to_grade,
                COUNT(CASE WHEN LOWER(TRIM(grade_status)) = 'completed' THEN 1 END) as total_completed,
                COUNT(CASE WHEN LOWER(TRIM(grade_status)) = 'try again' THEN 1 END) as total_try_again,
                COUNT(CASE WHEN LOWER(TRIM(grade_status)) = 'rejected' THEN 1 END) as total_rejected,
                COUNT(CASE WHEN LOWER(TRIM(grade_status)) = 'sp-pending' THEN 1 END) as total_special
            FROM `win_pharma_submission` 
            WHERE `course_code` = ?
        ");
        $stmt->execute([$batchCode]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getGraderPerformance($courseCode)
    {
        $sql = "SELECT 
                    s.update_by AS grader_username,
                    u.fname AS first_name,
                    u.lname AS last_name,
                    COUNT(CASE WHEN LOWER(TRIM(s.grade_status)) = 'pending' THEN 1 END) AS pending_count,
                    COUNT(CASE WHEN LOWER(TRIM(s.grade_status)) = 'completed' THEN 1 END) AS completed_count,
                    COUNT(CASE WHEN LOWER(TRIM(s.grade_status)) = 'try again' THEN 1 END) AS try_again_count,
                    COUNT(CASE WHEN LOWER(TRIM(s.grade_status)) = 'rejected' THEN 1 END) AS rejected_count,
                    COUNT(CASE WHEN LOWER(TRIM(s.grade_status)) = 'sp-pending' THEN 1 END) AS special_count,
                    COUNT(*) AS total_graded,
                    COALESCE(cs.per_rate, 0) AS commission_rate,
                    (COUNT(CASE WHEN LOWER(TRIM(s.grade_status)) = 'completed' THEN 1 END) * COALESCE(cs.per_rate, 0)) AS total_earnings
                FROM `win_pharma_submission` s
                LEFT JOIN `users` u ON s.update_by = u.username
                LEFT JOIN `commision_setup` cs ON cs.task_reference = 'WinpharmaGrading'
                WHERE s.course_code = ? 
                  AND s.update_by IS NOT NULL 
                  AND s.update_by != 'System' 
                  AND s.update_by != ''
                  AND u.userlevel != 'Student'
                GROUP BY s.update_by, cs.per_rate, u.fname, u.lname";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
