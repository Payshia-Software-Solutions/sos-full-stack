<?php

class CertificateVerification
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function GetLmsStudentsByUserName($userName)
    {
        try {
            $sql = "SELECT * FROM `user_full_details` WHERE `username` = ? ORDER BY `id` DESC LIMIT 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$userName]);
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }

    public function getUserEnrollments($userName)
    {
        try {
            $student = $this->GetLmsStudentsByUserName($userName);
            if (!$student) {
                return ["error" => "User not found"];
            }

            $studentId = $student['student_id'];
            $sql = "SELECT * FROM `student_course` WHERE `student_id` = ? ORDER BY `id` DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$studentId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }

    public function GetResultByUserName($userName)
    {
        $ArrayResult = [];
        try {
            // Retrieve the user's LMS details
            $indexnumber = $this->GetLmsStudentsByUserName($userName)['username'] ?? $userName;
        
            // Fetch all results for the user based on the index number
            $sql = "SELECT `index_number`, `course_code`, `title_id`, `created_at`, `created_by`, `result` FROM `certificate_user_result` WHERE `index_number` = ? ORDER BY `id` DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$indexnumber]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
            if (empty($rows)) {
                return ["error" => "No results found for the index number: " . $indexnumber];
            }
        
            // Initialize an array to store the results
            $ArrayResult[$userName] = [];
        
            // Iterate over each course result
            foreach ($rows as $row) {
                // Initialize grading variables
                $finalPercentage = "Not Graded";
                $finalGrade = "Not Graded";
                $gradeResult = "Not Graded";
                $starCount = 0;
                $courseCode = $row['course_code'];
                $titleId = $row['title_id'];
                $createdAt = $row['created_at'];
                $createdBy = $row['created_by'];
    
                // Fetch the final grade and result
                $finalPercentage = $row['result'];
        
                // Determine the final grade
                if ($finalPercentage == "Not Graded") {
                    $finalGrade = "Not Graded";
                } elseif ($finalPercentage >= 90) {
                    $finalGrade = "A+";
                } elseif ($finalPercentage >= 80) {
                    $finalGrade = "A";
                } elseif ($finalPercentage >= 75) {
                    $finalGrade = "A-";
                } elseif ($finalPercentage >= 70) {
                    $finalGrade = "B+";
                } elseif ($finalPercentage >= 65) {
                    $finalGrade = "B";
                } elseif ($finalPercentage >= 60) {
                    $finalGrade = "B-";
                } elseif ($finalPercentage >= 55) {
                    $finalGrade = "C+";
                } elseif ($finalPercentage >= 45) {
                    $finalGrade = "C";
                } elseif ($finalPercentage >= 40) {
                    $finalGrade = "C-";
                } elseif ($finalPercentage >= 35) {
                    $finalGrade = "D+";
                } elseif ($finalPercentage >= 30) {
                    $finalGrade = "D";
                } else {
                    $finalGrade = "E";
                }
        
                // Determine the grade result and star count
                if ($finalPercentage == "Not Graded") {
                    $gradeResult = "Not Graded";
                    $starCount = 0;
                } elseif ($finalPercentage >= 80) {
                    $gradeResult = "Excellent";
                    $starCount = 5;
                } elseif ($finalPercentage >= 75) {
                    $gradeResult = "Good";
                    $starCount = 4;
                } elseif ($finalPercentage >= 60) {
                    $gradeResult = "Pretty Good";
                    $starCount = 3;
                } elseif ($finalPercentage >= 40) {
                    $gradeResult = "Poor";
                    $starCount = 2;
                } else {
                    $gradeResult = "Weak";
                    $starCount = 1;
                }
        
                // Store the results for this course, including additional requested fields
                $ArrayResult[$userName][] = [
                    "indexNumber" => $row['index_number'],
                    "courseCode" => $courseCode,
                    "titleId" => $titleId,
                    "createdAt" => $createdAt,
                    "createdBy" => $createdBy,
                    "finalGrade" => $finalGrade,
                    "gradeResult" => $gradeResult,
                    "starCount" => $starCount,
                ];
            }
        
            // Return the aggregated results
            return $ArrayResult;
        
        } catch (PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    

    // public function getGradeDetails($userName, $courseCode = null)
    // {
    //     try {
    //         $student = $this->GetLmsStudentsByUserName($userName);
    //         if (!$student) {
    //             return ["error" => "User not found"];
    //         }

    //         $indexNumber = $student['username'];
    //         $sql = "SELECT `result`, `course_code` FROM `certificate_user_result` WHERE `index_number` = ?";
    //         if ($courseCode) {
    //             $sql .= " AND `course_code` = ?";
    //         }

    //         $stmt = $this->pdo->prepare($sql);
    //         $stmt->execute($courseCode ? [$indexNumber, $courseCode] : [$indexNumber]);
    //         $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //         if (!$rows) {
    //             return ["error" => "No result found for the given index number and course code"];
    //         }

    //         $result = $rows[0]['result'];
    //         $courseCode = $rows[0]['course_code'];

    //         // Grading logic
    //         $finalGrade = "Not Graded";
    //         if (is_numeric($result)) {
    //             if ($result >= 90) $finalGrade = "A+";
    //             elseif ($result >= 80) $finalGrade = "A";
    //             elseif ($result >= 75) $finalGrade = "A-";
    //             elseif ($result >= 70) $finalGrade = "B+";
    //             elseif ($result >= 65) $finalGrade = "B";
    //             elseif ($result >= 60) $finalGrade = "B-";
    //             elseif ($result >= 55) $finalGrade = "C+";
    //             elseif ($result >= 45) $finalGrade = "C";
    //             elseif ($result >= 40) $finalGrade = "C-";
    //             elseif ($result >= 35) $finalGrade = "D+";
    //             elseif ($result >= 30) $finalGrade = "D";
    //             else $finalGrade = "E";
    //         }

    //         return [
    //             "finalGrade" => $finalGrade,
    //             "courseCode" => $courseCode,
    //             "result" => $result,
    //         ];
    //     } catch (PDOException $e) {
    //         return ["error" => $e->getMessage()];
    //     }
    // }
}
