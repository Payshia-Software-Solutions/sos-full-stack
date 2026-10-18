<?php

class Reports
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getUserInfo($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM user_full_details WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStudentContactsByBatch($batch_id)
    {
        $sql = "
            SELECT 
                u.id AS user_id, 
                u.username, 
                u.fname, 
                u.lname, 
                u.batch_id, 
                u.phone, 
                u.email,
                uf.address_line_1, 
                uf.address_line_2, 
                uf.city AS original_city, 
                uf.district AS original_district,
                uf.telephone_1, 
                uf.telephone_2,
                c.name_en AS city_name,
                d.name_en AS district_name
            FROM student_course sc
            INNER JOIN user_full_details uf ON sc.student_id = uf.student_id
            INNER JOIN users u ON u.username = uf.username
            LEFT JOIN cities c ON 
                (uf.city REGEXP '^[0-9]+$' AND c.id = CAST(uf.city AS UNSIGNED))
                OR 
                (uf.city NOT REGEXP '^[0-9]+$' AND LOWER(c.name_en) = LOWER(uf.city))
            LEFT JOIN districts d ON c.district_id = d.id
            WHERE sc.course_code = :batch_id AND u.status = 'Active'
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['batch_id' => $batch_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Replicates legacy GetLmsStudentsByUserId() from lms-functions.php
     * Provides 2-tier user lookup (users table fallback, user_full_details priority)
     * Keyed by both student_id (with and without slashes) and username (with and without slashes)
     */
    private function getLmsUserDetailsMap()
    {
        $map = [];

        // 1. Fetch user accounts from `users` table as baseline / fallback
        $stmtUsers = $this->pdo->query("SELECT id, userid, username, fname, lname FROM users");
        $users = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);
        foreach ($users as $uRow) {
            $fullName = trim(($uRow['fname'] ?? '') . ' ' . ($uRow['lname'] ?? ''));
            $fallbackData = [
                'id' => $uRow['id'],
                'student_id' => !empty($uRow['userid']) ? $uRow['userid'] : $uRow['username'],
                'username' => $uRow['username'],
                'first_name' => $uRow['fname'] ?? '',
                'last_name' => $uRow['lname'] ?? '',
                'full_name' => $fullName,
                'name_with_initials' => $fullName,
                'name_on_certificate' => $fullName,
            ];
            if (!empty($uRow['userid'])) {
                $map[$uRow['userid']] = $fallbackData;
                $cleanUserid = str_replace('/', '', $uRow['userid']);
                $map[$cleanUserid] = $fallbackData;
            }
            if (!empty($uRow['username'])) {
                $map[$uRow['username']] = $fallbackData;
                $cleanUsername = str_replace('/', '', $uRow['username']);
                $map[$cleanUsername] = $fallbackData;
            }
        }

        // 2. Overlay with user_full_details (takes priority for certificate name)
        $stmtDetails = $this->pdo->query("SELECT * FROM user_full_details ORDER BY id DESC");
        $details = $stmtDetails->fetchAll(PDO::FETCH_ASSOC);
        foreach ($details as $row) {
            if (!empty($row['student_id'])) {
                $map[$row['student_id']] = $row;
                $cleanStudentId = str_replace('/', '', $row['student_id']);
                $map[$cleanStudentId] = $row;
            }
            if (!empty($row['username'])) {
                $map[$row['username']] = $row;
                $cleanUsername = str_replace('/', '', $row['username']);
                $map[$cleanUsername] = $row;
            }
        }

        return $map;
    }

    public function getWinPharmaReportByBatch($batchCode)
    {
        // 1. Get levels for batch (Legacy: GetLevels)
        $stmtLevels = $this->pdo->prepare("SELECT level_id, course_code, level_name, is_active FROM win_pharma_level WHERE course_code LIKE ? ORDER BY level_id");
        $stmtLevels->execute([$batchCode]);
        $levels = $stmtLevels->fetchAll(PDO::FETCH_ASSOC);

        // 2. Get task count per level (Legacy: GetTasks / win_pharma_level_resources)
        $taskCounts = [];
        $totalTasks = 0;
        foreach ($levels as &$lvl) {
            $stmtTasks = $this->pdo->prepare("SELECT COUNT(*) FROM win_pharma_level_resources WHERE level_id LIKE ?");
            $stmtTasks->execute([$lvl['level_id']]);
            $count = (int)$stmtTasks->fetchColumn();
            $lvl['task_count'] = $count;
            $taskCounts[$lvl['level_id']] = $count;
            $totalTasks += $count;
        }

        // Course Top Level (first level of course)
        $courseTopLevel = !empty($levels) ? $levels[0]['level_id'] : -1;

        // 3. Get Top Completed Level for each user (Legacy: GetTopLevelAllUsersCompleted)
        $stmtTop = $this->pdo->prepare("
            SELECT index_number, MAX(level_id) AS top_level 
            FROM win_pharma_submission 
            WHERE course_code LIKE ? AND grade_status LIKE 'Completed' 
            GROUP BY index_number
        ");
        $stmtTop->execute([$batchCode]);
        $topRows = $stmtTop->fetchAll(PDO::FETCH_ASSOC);
        $winpharmaTopLevels = [];
        foreach ($topRows as $tr) {
            $winpharmaTopLevels[$tr['index_number']] = $tr['top_level'];
        }

        // 4. Get student enrollments for batch (Legacy: getAllUserEnrollmentsByCourse)
        $stmtEnroll = $this->pdo->prepare("SELECT id, course_code, student_id, enrollment_key, created_at FROM student_course WHERE course_code LIKE ? ORDER BY id DESC");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        // 5. Get user details map (Legacy: GetLmsStudentsByUserId)
        $userDetails = $this->getLmsUserDetailsMap();

        // 6. Get all completed submissions for this batch's levels
        $levelIds = array_column($levels, 'level_id');
        $studentSubmissions = [];
        if (!empty($levelIds)) {
            $inLevels = implode(',', array_fill(0, count($levelIds), '?'));
            $stmtSub = $this->pdo->prepare("
                SELECT index_number, level_id, resource_id 
                FROM win_pharma_submission 
                WHERE level_id IN ($inLevels) AND grade_status = 'Completed'
            ");
            $stmtSub->execute($levelIds);
            $submissions = $stmtSub->fetchAll(PDO::FETCH_ASSOC);

            foreach ($submissions as $sub) {
                $idx = $sub['index_number'];
                $lid = $sub['level_id'];
                $rid = $sub['resource_id'];
                $studentSubmissions[$idx][$lid][$rid] = true;
            }
        }

        // Map level names by ID
        $levelMap = [];
        foreach ($levels as $l) {
            $levelMap[$l['level_id']] = $l;
        }

        $reportData = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            // Top completed level
            if (!empty($selectedUsername) && isset($winpharmaTopLevels[$selectedUsername])) {
                $currentTopLevel = $winpharmaTopLevels[$selectedUsername];
            } else {
                $currentTopLevel = $courseTopLevel;
            }

            // Submissions by user
            $userSubs = $studentSubmissions[$selectedUsername] ?? ($studentSubmissions[$cleanStudent] ?? ($studentSubmissions[$selectedStudent] ?? []));

            $submissionCount = 0;
            $levelScores = [];
            foreach ($levels as $lvl) {
                $lid = $lvl['level_id'];
                $completedInLevel = isset($userSubs[$lid]) ? count($userSubs[$lid]) : 0;
                $levelScores[$lid] = [
                    'completed' => $completedInLevel,
                    'total' => $taskCounts[$lid] ?? 0
                ];
                $submissionCount += $completedInLevel;
            }

            $lastCompletedName = isset($levelMap[$currentTopLevel]['level_name']) ? $levelMap[$currentTopLevel]['level_name'] : '-';
            $percentage = $totalTasks > 0 ? round(($submissionCount / $totalTasks) * 100, 2) : 0;

            $reportData[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'last_completed_level' => $lastCompletedName,
                'level_scores' => $levelScores,
                'total_completed' => $submissionCount,
                'total_tasks' => $totalTasks,
                'percentage' => $percentage
            ];
        }

        return [
            'batch_code' => $batchCode,
            'levels' => $levels,
            'total_tasks' => $totalTasks,
            'students' => $reportData
        ];
    }

    public function getDpadReportByBatch($batchCode)
    {
        $scorePerPrescription = 10;

        // 1. Get active prescriptions with drugs_list (Legacy: GetActivePrescriptions & GetPrescriptionAllCoversDpad)
        $stmtPres = $this->pdo->query("SELECT prescription_id, prescription_name, drugs_list FROM prescription WHERE prescription_status = 'Active'");
        $prescriptions = $stmtPres->fetchAll(PDO::FETCH_ASSOC);

        $allEnvelopes = [];
        $totalEnvelopes = 0;
        foreach ($prescriptions as $p) {
            $pid = $p['prescription_id'];
            $drugsList = $p['drugs_list'] ?? '';
            // Legacy uses explode(', ', drugs_list)
            $drugListArray = !empty($drugsList) ? array_map('trim', explode(',', $drugsList)) : [];
            $allEnvelopes[$pid] = $drugListArray;
            $totalEnvelopes += count($drugListArray);
        }

        // 2. Get student enrollments for batch (Legacy: getAllUserEnrollmentsByCourse)
        $stmtEnroll = $this->pdo->prepare("SELECT id, course_code, student_id, enrollment_key, created_at FROM student_course WHERE course_code LIKE ? ORDER BY id DESC");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        // 3. User details map (Legacy: GetLmsStudentsByUserId)
        $userDetails = $this->getLmsUserDetailsMap();

        // 4. Collect enrolled student identifiers (Legacy: GetSubmittedAnswersByAllUser)
        $allStudentKeys = [];
        foreach ($userList as $enr) {
            $sid = $enr['student_id'] ?? '';
            $csid = str_replace('/', '', $sid);
            $info = $userDetails[$sid] ?? ($userDetails[$csid] ?? null);
            $un = !empty($info['username']) ? $info['username'] : $csid;
            if (!empty($un)) $allStudentKeys[$un] = true;
            if (!empty($sid)) $allStudentKeys[$sid] = true;
            if (!empty($csid)) $allStudentKeys[$csid] = true;
        }

        // Fetch submissions for enrolled students
        $allAnswers = [];
        if (!empty($allStudentKeys)) {
            $keyList = array_keys($allStudentKeys);
            $inKeys = implode(',', array_fill(0, count($keyList), '?'));
            $stmtAnswers = $this->pdo->prepare("
                SELECT id, pres_id, cover_id, created_by, answer_status 
                FROM prescription_answer_submission 
                WHERE created_by IN ($inKeys)
            ");
            $stmtAnswers->execute($keyList);
            $allAnswers = $stmtAnswers->fetchAll(PDO::FETCH_ASSOC);
        }

        // 5. Calculate grade for each student (Legacy: d-pad-report.php)
        $reportData = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            // Filter answers for this student
            $userAnswers = array_filter($allAnswers, function ($ans) use ($selectedUsername, $selectedStudent, $cleanStudent) {
                $cb = $ans['created_by'] ?? '';
                return $cb === $selectedUsername || $cb === $selectedStudent || $cb === $cleanStudent;
            });

            $correctCount = 0;
            $inCorrectCount = 0;

            foreach ($prescriptions as $p) {
                $pid = $p['prescription_id'] ?? '';
                $medicineEnvelopes = $allEnvelopes[$pid] ?? [];
                $medicineCount = count($medicineEnvelopes);

                if ($medicineCount > 0) {
                    for ($i = 1; $i <= $medicineCount; $i++) {
                        $coverId = 'Cover' . $i;
                        foreach ($userAnswers as $ans) {
                            if ($ans['pres_id'] === $pid && $ans['cover_id'] === $coverId) {
                                if ($ans['answer_status'] === 'Correct') $correctCount++;
                                if ($ans['answer_status'] === 'In-Correct') $inCorrectCount++;
                            }
                        }
                    }
                }
            }

            $correctScore = $correctCount * $scorePerPrescription;
            $inCorrectScore = $inCorrectCount * -1;
            $maxScore = $totalEnvelopes * $scorePerPrescription;
            $overallGrade = $maxScore > 0 ? round((($correctScore + $inCorrectScore) / $maxScore) * 100, 2) : 0;

            $reportData[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'correct_count' => $correctCount,
                'incorrect_count' => $inCorrectCount,
                'overall_grade' => $overallGrade
            ];
        }

        return [
            'batch_code' => $batchCode,
            'total_envelopes' => $totalEnvelopes,
            'prescription_count' => count($prescriptions),
            'students' => $reportData
        ];
    }

    /**
     * Get Quiz Assessment Report for a specific batch.
     * Matches legacy quiz-report.php and quiz_methods.php
     *
     * @param string $batchCode
     * @return array
     */
    public function getQuizReportByBatch($batchCode) {
        $batchCode = trim($batchCode);
        $gradePerCorrectAttempt = 10;
        $gradePerInCorrectAttempt = 5;

        // 1. Get Active Topics for this CourseCode (Legacy: GetQuizTopicsByCourse & GetQuizTopics)
        $stmtTopics = $this->pdo->prepare("
            SELECT qtc.id, qtc.topicID, qtc.CourseCode, qtc.active_status as course_topic_status,
                   qt.quiz_topicID, qt.topicName, qt.active_status as topic_status
            FROM quiz_topic_course qtc
            LEFT JOIN `quiz-topics` qt ON qt.quiz_topicID = qtc.topicID
            WHERE qtc.CourseCode = ? AND qtc.active_status = 'Active'
            ORDER BY qtc.id ASC
        ");
        $stmtTopics->execute([$batchCode]);
        $topicRows = $stmtTopics->fetchAll(PDO::FETCH_ASSOC);

        // 2. Fetch all active questions grouped by lesson_id (topicID) (Legacy: GetAllQuizzes)
        $stmtQuestions = $this->pdo->query("
            SELECT id, lesson_id, course_code, question_id, question, question_status
            FROM lesson_questions
            WHERE question_status = 'Active'
        ");
        $allQuestions = $stmtQuestions->fetchAll(PDO::FETCH_ASSOC);

        $questionsByTopic = [];
        foreach ($allQuestions as $q) {
            $lid = (string)$q['lesson_id'];
            if (!isset($questionsByTopic[$lid])) {
                $questionsByTopic[$lid] = [];
            }
            $questionsByTopic[$lid][] = $q;
        }

        // Build list of active topics with question counts
        $topics = [];
        foreach ($topicRows as $tr) {
            $tid = (string)$tr['topicID'];
            $qList = $questionsByTopic[$tid] ?? [];
            $topics[] = [
                'topic_id' => (int)$tr['topicID'],
                'topic_name' => !empty($tr['topicName']) ? $tr['topicName'] : 'Topic ' . $tr['topicID'],
                'question_count' => count($qList)
            ];
        }

        // 3. Get enrolled students (Legacy: getAllUserEnrollmentsByCourse)
        $stmtEnroll = $this->pdo->prepare("
            SELECT id, course_code, student_id, enrollment_key, created_at 
            FROM student_course 
            WHERE course_code LIKE ? 
            ORDER BY id DESC
        ");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        // 4. User details map (Legacy: GetLmsStudentsByUserId)
        $userDetails = $this->getLmsUserDetailsMap();

        // 5. Collect student identifiers to fetch submissions (Legacy: GetQuizSubmissionByAllUser)
        $allStudentKeys = [];
        foreach ($userList as $enr) {
            $sid = $enr['student_id'] ?? '';
            $csid = str_replace('/', '', $sid);
            $info = $userDetails[$sid] ?? ($userDetails[$csid] ?? null);
            $un = !empty($info['username']) ? $info['username'] : $csid;
            if (!empty($un)) $allStudentKeys[$un] = true;
            if (!empty($sid)) $allStudentKeys[$sid] = true;
            if (!empty($csid)) $allStudentKeys[$csid] = true;
        }

        $allSubmissions = [];
        if (!empty($allStudentKeys)) {
            $keyList = array_keys($allStudentKeys);
            $inKeys = implode(',', array_fill(0, count($keyList), '?'));
            $stmtSub = $this->pdo->prepare("
                SELECT id, user_id, question_id, selected_answer, score, answer_status, created_at
                FROM lesson_questions_submition
                WHERE user_id IN ($inKeys)
            ");
            $stmtSub->execute($keyList);
            $allSubmissions = $stmtSub->fetchAll(PDO::FETCH_ASSOC);
        }

        // Index submissions by user_id
        $submissionsByUser = [];
        foreach ($allSubmissions as $sub) {
            $uid = (string)$sub['user_id'];
            if (!isset($submissionsByUser[$uid])) {
                $submissionsByUser[$uid] = [];
            }
            $submissionsByUser[$uid][] = $sub;
        }

        // 6. Calculate grades for each student
        $students = [];
        $totalActiveTopics = count($topics);

        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            // Gather submissions matching student's username or ids
            $userSubs = array_merge(
                $submissionsByUser[$selectedUsername] ?? [],
                $submissionsByUser[$selectedStudent] ?? [],
                $submissionsByUser[$cleanStudent] ?? []
            );

            // Deduplicate submissions by id if any overlap
            $uniqueSubs = [];
            foreach ($userSubs as $us) {
                $uniqueSubs[$us['id']] = $us;
            }

            $topicScores = [];
            $sumQuizGrades = 0;

            foreach ($topics as $t) {
                $tid = (string)$t['topic_id'];
                $activeQuestions = $questionsByTopic[$tid] ?? [];
                $qCount = count($activeQuestions);

                $quizGrade = 0;

                if ($qCount > 0) {
                    $topicCorrectScore = 0;
                    $topicIncorrectScore = 0;

                    foreach ($activeQuestions as $q) {
                        $qid = $q['question_id'];
                        foreach ($uniqueSubs as $sub) {
                            if ($sub['question_id'] == $qid) {
                                if ($sub['answer_status'] === 'Correct') {
                                    $topicCorrectScore += $gradePerCorrectAttempt;
                                } else {
                                    $topicIncorrectScore += $gradePerInCorrectAttempt;
                                }
                            }
                        }
                    }

                    $netScore = $topicCorrectScore - $topicIncorrectScore;
                    $maxTopicScore = $qCount * $gradePerCorrectAttempt;
                    if ($maxTopicScore > 0) {
                        $quizGrade = round(($netScore / $maxTopicScore) * 100, 2);
                    }
                }

                $topicScores[$tid] = $quizGrade;
                $sumQuizGrades += $quizGrade;
            }

            $overallGrade = $totalActiveTopics > 0 
                ? round($sumQuizGrades / $totalActiveTopics, 2) 
                : 0;

            $students[] = [
                'student_id' => $selectedStudent,
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'topic_scores' => $topicScores,
                'overall_grade' => $overallGrade
            ];
        }

        return [
            'batch_code' => $batchCode,
            'topics' => $topics,
            'students' => $students
        ];
    }

    public function getPharmaHunterReportByBatch($batchCode)
    {
        $batchCode = trim($batchCode);
        $attemptPerMedicine = 10;

        // 1. Get Hunter Medicines (Legacy: HunterMedicines())
        $stmtMeds = $this->pdo->query("SELECT id, medicine_name FROM hunter_medicine WHERE active_status NOT LIKE 'Deleted'");
        $hunterMedicines = $stmtMeds ? $stmtMeds->fetchAll(PDO::FETCH_ASSOC) : [];
        $medicineCount = count($hunterMedicines);
        $totalPossibleAttempts = $medicineCount * $attemptPerMedicine;

        // 2. Get Saved Answers (Legacy: HunterSavedAnswers())
        $stmtSaved = $this->pdo->query("
            SELECT 
                index_number, 
                SUM(CASE WHEN answer_status LIKE 'Correct' THEN 1 ELSE 0 END) AS correct_count, 
                SUM(CASE WHEN answer_status LIKE 'Wrong' THEN 1 ELSE 0 END) AS incorrect_count, 
                SUM(CASE WHEN answer_status LIKE 'Correct' AND (score_type LIKE 'Jem' OR score_type LIKE 'Gem') THEN 1 ELSE 0 END) AS gem_count, 
                SUM(CASE WHEN answer_status LIKE 'Correct' AND score_type LIKE 'Coin' THEN 1 ELSE 0 END) AS coin_count 
            FROM hunter_saveanswer 
            GROUP BY index_number
        ");
        $savedRows = $stmtSaved ? $stmtSaved->fetchAll(PDO::FETCH_ASSOC) : [];
        $savedCounts = [];
        foreach ($savedRows as $r) {
            $savedCounts[$r['index_number']] = $r;
        }

        // 3. Get Enrolled Students
        $stmtEnroll = $this->pdo->prepare("
            SELECT id, course_code, student_id, enrollment_key, created_at 
            FROM student_course 
            WHERE course_code LIKE ? 
            ORDER BY id DESC
        ");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        if (empty($userList)) {
            $stmtCs = $this->pdo->prepare("
                SELECT cs.id, cs.course_id, cs.student_id, c.course_code 
                FROM course_students cs
                JOIN course c ON c.id = cs.course_id
                WHERE c.course_code LIKE ?
            ");
            $stmtCs->execute([$batchCode]);
            $csRows = $stmtCs->fetchAll(PDO::FETCH_ASSOC);
            foreach ($csRows as $cs) {
                $userList[] = [
                    'id' => $cs['id'],
                    'course_code' => $cs['course_code'],
                    'student_id' => $cs['student_id'],
                    'enrollment_key' => '',
                    'created_at' => ''
                ];
            }
        }

        // 4. User Details Map
        $userDetails = $this->getLmsUserDetailsMap();

        // 5. Compile Student Results
        $reportData = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            $correctCount = 0;
            $pendingCount = $medicineCount * $attemptPerMedicine;
            $wrongCount = 0;
            $gemCount = 0;
            $coinCount = 0;

            $uData = $savedCounts[$selectedUsername] ?? ($savedCounts[$cleanStudent] ?? ($savedCounts[$selectedStudent] ?? null));
            if ($uData) {
                $correctCount = (int)$uData['correct_count'];
                $pendingCount = max(0, ($medicineCount * $attemptPerMedicine) - $correctCount);
                $wrongCount = (int)$uData['incorrect_count'];
                $gemCount = (int)$uData['gem_count'];
                $coinCount = (int)$uData['coin_count'];

                if ($coinCount >= 50) {
                    $gemCount += intval($coinCount / 50);
                    $coinCount = $coinCount % 50;
                }
            }

            $reportData[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'correct_count' => $correctCount,
                'pending_count' => $pendingCount,
                'wrong_count' => $wrongCount,
                'gem_count' => $gemCount,
                'coin_count' => $coinCount
            ];
        }

        return [
            'batch_code' => $batchCode,
            'medicine_count' => $medicineCount,
            'attempt_per_medicine' => $attemptPerMedicine,
            'total_possible_attempts' => $totalPossibleAttempts,
            'students' => $reportData
        ];
    }

    public function getPharmaHunterProReportByBatch($batchCode)
    {
        $batchCode = trim($batchCode);
        $attemptPerMedicine = 10;

        // 1. Get Hunter Pro Medicines for this CourseCode (Legacy: GetProMedicines / hp_course_medicine)
        $stmtCourseMeds = $this->pdo->prepare("SELECT MediID FROM hp_course_medicine WHERE status LIKE 'Active' AND CourseCode LIKE ?");
        $stmtCourseMeds->execute([$batchCode]);
        $courseMeds = $stmtCourseMeds->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($courseMeds)) {
            $medicineCount = count($courseMeds);
        } else {
            // Fallback: If no batch-specific mapping, count all active medicines (Legacy: GetProAllMedicines)
            $stmtAllMeds = $this->pdo->query("SELECT COUNT(*) FROM hp_medicines WHERE is_active LIKE '1'");
            $medicineCount = $stmtAllMeds ? (int)$stmtAllMeds->fetchColumn() : 0;
        }

        $totalPossibleAttempts = $medicineCount * $attemptPerMedicine;

        // 2. Get Hunter Pro Saved Answers (Legacy: HunterSavedAnswers() on hp_save_answer)
        $stmtSaved = $this->pdo->query("
            SELECT 
                index_number, 
                SUM(CASE WHEN answer_status LIKE 'Correct' THEN 1 ELSE 0 END) AS correct_count, 
                SUM(CASE WHEN answer_status LIKE 'Wrong' THEN 1 ELSE 0 END) AS incorrect_count, 
                SUM(CASE WHEN answer_status LIKE 'Correct' AND (score_type LIKE 'Jem' OR score_type LIKE 'Gem') THEN 1 ELSE 0 END) AS gem_count, 
                SUM(CASE WHEN answer_status LIKE 'Correct' AND score_type LIKE 'Coin' THEN 1 ELSE 0 END) AS coin_count 
            FROM hp_save_answer 
            GROUP BY index_number
        ");
        $savedRows = $stmtSaved ? $stmtSaved->fetchAll(PDO::FETCH_ASSOC) : [];
        $savedCounts = [];
        foreach ($savedRows as $r) {
            $savedCounts[$r['index_number']] = $r;
        }

        // 3. Get Enrolled Students
        $stmtEnroll = $this->pdo->prepare("
            SELECT id, course_code, student_id, enrollment_key, created_at 
            FROM student_course 
            WHERE course_code LIKE ? 
            ORDER BY id DESC
        ");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        if (empty($userList)) {
            $stmtCs = $this->pdo->prepare("
                SELECT cs.id, cs.course_id, cs.student_id, c.course_code 
                FROM course_students cs
                JOIN course c ON c.id = cs.course_id
                WHERE c.course_code LIKE ?
            ");
            $stmtCs->execute([$batchCode]);
            $csRows = $stmtCs->fetchAll(PDO::FETCH_ASSOC);
            foreach ($csRows as $cs) {
                $userList[] = [
                    'id' => $cs['id'],
                    'course_code' => $cs['course_code'],
                    'student_id' => $cs['student_id'],
                    'enrollment_key' => '',
                    'created_at' => ''
                ];
            }
        }

        // 4. User Details Map
        $userDetails = $this->getLmsUserDetailsMap();

        // 5. Compile Student Results
        $reportData = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            $correctCount = 0;
            $pendingCount = $medicineCount * $attemptPerMedicine;
            $wrongCount = 0;
            $gemCount = 0;
            $coinCount = 0;

            $uData = $savedCounts[$selectedUsername] ?? ($savedCounts[$cleanStudent] ?? ($savedCounts[$selectedStudent] ?? null));
            if ($uData) {
                $correctCount = (int)$uData['correct_count'];
                $pendingCount = max(0, ($medicineCount * $attemptPerMedicine) - $correctCount);
                $wrongCount = (int)$uData['incorrect_count'];
                $gemCount = (int)$uData['gem_count'];
                $coinCount = (int)$uData['coin_count'];

                if ($coinCount >= 50) {
                    $gemCount += intval($coinCount / 50);
                    $coinCount = $coinCount % 50;
                }
            }

            $reportData[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'correct_count' => $correctCount,
                'pending_count' => $pendingCount,
                'wrong_count' => $wrongCount,
                'gem_count' => $gemCount,
                'coin_count' => $coinCount
            ];
        }

        return [
            'batch_code' => $batchCode,
            'medicine_count' => $medicineCount,
            'attempt_per_medicine' => $attemptPerMedicine,
            'total_possible_attempts' => $totalPossibleAttempts,
            'students' => $reportData
        ];
    }

    public function getCourseAssignmentReportByBatch($batchCode)
    {
        $batchCode = trim($batchCode);

        // 1. Get assignments for this course batch (Legacy: course_assignments)
        $stmtAssignments = $this->pdo->prepare("
            SELECT id, type, assignment_name, due_date, created_at, created_by, active_status, file_path, course_code 
            FROM course_assignments 
            WHERE course_code LIKE ? AND (active_status = '1' OR active_status LIKE 'Active')
            ORDER BY id ASC
        ");
        $stmtAssignments->execute([$batchCode]);
        $assignments = $stmtAssignments->fetchAll(PDO::FETCH_ASSOC);

        // 2. Get submissions for this course batch (Legacy: course_assignments_submissions)
        $stmtSubs = $this->pdo->prepare("
            SELECT id, assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status 
            FROM course_assignments_submissions 
            WHERE course_code LIKE ?
        ");
        $stmtSubs->execute([$batchCode]);
        $submissions = $stmtSubs->fetchAll(PDO::FETCH_ASSOC);

        $submissionsByCourse = [];
        foreach ($submissions as $sub) {
            $key = $sub['created_by'] . '_' . $sub['assignment_id'];
            $submissionsByCourse[$key] = $sub;
        }

        // 3. Get enrolled students
        $stmtEnroll = $this->pdo->prepare("
            SELECT id, course_code, student_id, enrollment_key, created_at 
            FROM student_course 
            WHERE course_code LIKE ? 
            ORDER BY id DESC
        ");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        if (empty($userList)) {
            $stmtCs = $this->pdo->prepare("
                SELECT cs.id, cs.course_id, cs.student_id, c.course_code 
                FROM course_students cs
                JOIN course c ON c.id = cs.course_id
                WHERE c.course_code LIKE ?
            ");
            $stmtCs->execute([$batchCode]);
            $csRows = $stmtCs->fetchAll(PDO::FETCH_ASSOC);
            foreach ($csRows as $cs) {
                $userList[] = [
                    'id' => $cs['id'],
                    'course_code' => $cs['course_code'],
                    'student_id' => $cs['student_id'],
                    'enrollment_key' => '',
                    'created_at' => ''
                ];
            }
        }

        // 4. User details map
        $userDetails = $this->getLmsUserDetailsMap();

        // 5. Build report data
        $students = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            $assignmentGrades = [];
            $submittedCount = 0;
            $gradedCount = 0;

            foreach ($assignments as $a) {
                $aid = (string)$a['id'];
                $sub = $submissionsByCourse[$selectedUsername . '_' . $aid] 
                    ?? ($submissionsByCourse[$cleanStudent . '_' . $aid] 
                    ?? ($submissionsByCourse[$selectedStudent . '_' . $aid] ?? null));

                if ($sub) {
                    $submittedCount++;
                    $rawGrade = $sub['grade'];
                    if ($rawGrade === '0' || $rawGrade === 0 || $rawGrade === '' || $rawGrade === null) {
                        $gradeDisplay = 'Not graded';
                    } else {
                        $gradedCount++;
                        $gradeDisplay = (string)$rawGrade;
                    }
                    $status = !empty($sub['grade_status']) ? $sub['grade_status'] : ($gradeDisplay === 'Not graded' ? 'Submitted' : 'Graded');
                } else {
                    $gradeDisplay = 'Not Submitted';
                    $status = 'Pending';
                }

                $assignmentGrades[$aid] = [
                    'grade' => $gradeDisplay,
                    'status' => $status
                ];
            }

            $students[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'assignment_grades' => $assignmentGrades,
                'submitted_count' => $submittedCount,
                'graded_count' => $gradedCount
            ];
        }

        return [
            'batch_code' => $batchCode,
            'assignments' => $assignments,
            'students' => $students
        ];
    }

    public function getCeylonPharmacyReportByBatch($batchCode)
    {
        $batchCode = trim($batchCode);

        // 1. Get total patients from care_patient
        $stmtPatients = $this->pdo->query("SELECT COUNT(*) FROM care_patient");
        $totalPatients = $stmtPatients ? (int)$stmtPatients->fetchColumn() : 0;

        // 2. Get enrolled students for this course batch
        $stmtEnroll = $this->pdo->prepare("
            SELECT id, course_code, student_id 
            FROM student_course 
            WHERE course_code LIKE ? 
            ORDER BY id DESC
        ");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        if (empty($userList)) {
            $stmtCs = $this->pdo->prepare("
                SELECT cs.id, cs.course_id, cs.student_id, c.course_code 
                FROM course_students cs
                JOIN course c ON c.id = cs.course_id
                WHERE c.course_code LIKE ?
            ");
            $stmtCs->execute([$batchCode]);
            $csRows = $stmtCs->fetchAll(PDO::FETCH_ASSOC);
            foreach ($csRows as $cs) {
                $userList[] = [
                    'id' => $cs['id'],
                    'course_code' => $cs['course_code'],
                    'student_id' => $cs['student_id'],
                ];
            }
        }

        // 3. User details map
        $userDetails = $this->getLmsUserDetailsMap();

        // Collect all student identifier variants
        $studentUsernames = [];
        foreach ($userList as $enr) {
            $sid = $enr['student_id'] ?? '';
            $clean = str_replace('/', '', $sid);
            $info = $userDetails[$sid] ?? ($userDetails[$clean] ?? null);
            $uname = !empty($info['username']) ? $info['username'] : $clean;
            if ($uname) $studentUsernames[$uname] = true;
            if ($sid) $studentUsernames[$sid] = true;
            if ($clean) $studentUsernames[$clean] = true;
        }

        // 4. Query care_start answers
        $careData = [];
        if (!empty($studentUsernames)) {
            $keys = array_keys($studentUsernames);
            $chunks = array_chunk($keys, 500);
            foreach ($chunks as $chunk) {
                $placeholders = implode(',', array_fill(0, count($chunk), '?'));
                $stmtCare = $this->pdo->prepare("
                    SELECT 
                        student_id,
                        SUM(CASE WHEN patient_status LIKE 'Recovered' THEN 1 ELSE 0 END) AS recovered_count,
                        SUM(CASE WHEN patient_status LIKE 'Pending' AND time < DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 ELSE 0 END) AS died_count,
                        SUM(CASE WHEN patient_status LIKE 'Pending' AND time >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 ELSE 0 END) AS pending_live_count
                    FROM 
                        care_start
                    WHERE 
                        student_id IN ($placeholders)
                    GROUP BY 
                        student_id
                ");
                $stmtCare->execute($chunk);
                $rows = $stmtCare->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as $r) {
                    $careData[$r['student_id']] = $r;
                }
            }
        }

        // 5. Build student records
        $students = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            $rec = $careData[$selectedUsername] 
                ?? ($careData[$cleanStudent] 
                ?? ($careData[$selectedStudent] ?? null));

            $recovered = $rec ? (int)$rec['recovered_count'] : 0;
            $died = $rec ? (int)$rec['died_count'] : 0;
            $pending = max(0, $totalPatients - ($recovered + $died));

            $students[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'recovered_count' => $recovered,
                'died_count' => $died,
                'pending_count' => $pending
            ];
        }

        return [
            'batch_code' => $batchCode,
            'total_patients' => $totalPatients,
            'students' => $students
        ];
    }

    public function getPharmaReaderReportByBatch($batchCode)
    {
        $batchCode = trim($batchCode);

        // 1. Get total active reader prescriptions
        $stmtPres = $this->pdo->query("SELECT COUNT(*) FROM reader_medicine WHERE active_status LIKE 'Active'");
        $totalPrescriptions = $stmtPres ? (int)$stmtPres->fetchColumn() : 0;

        // 2. Get enrolled students
        $stmtEnroll = $this->pdo->prepare("
            SELECT id, course_code, student_id 
            FROM student_course 
            WHERE course_code LIKE ? 
            ORDER BY id DESC
        ");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        if (empty($userList)) {
            $stmtCs = $this->pdo->prepare("
                SELECT cs.id, cs.course_id, cs.student_id, c.course_code 
                FROM course_students cs
                JOIN course c ON c.id = cs.course_id
                WHERE c.course_code LIKE ?
            ");
            $stmtCs->execute([$batchCode]);
            $csRows = $stmtCs->fetchAll(PDO::FETCH_ASSOC);
            foreach ($csRows as $cs) {
                $userList[] = [
                    'id' => $cs['id'],
                    'course_code' => $cs['course_code'],
                    'student_id' => $cs['student_id'],
                ];
            }
        }

        // 3. User details map
        $userDetails = $this->getLmsUserDetailsMap();

        $studentUsernames = [];
        foreach ($userList as $enr) {
            $sid = $enr['student_id'] ?? '';
            $clean = str_replace('/', '', $sid);
            $info = $userDetails[$sid] ?? ($userDetails[$clean] ?? null);
            $uname = !empty($info['username']) ? $info['username'] : $clean;
            if ($uname) $studentUsernames[$uname] = true;
            if ($sid) $studentUsernames[$sid] = true;
            if ($clean) $studentUsernames[$clean] = true;
        }

        // 4. Query reader_attempts
        $readerData = [];
        if (!empty($studentUsernames)) {
            $keys = array_keys($studentUsernames);
            $chunks = array_chunk($keys, 500);
            foreach ($chunks as $chunk) {
                $placeholders = implode(',', array_fill(0, count($chunk), '?'));
                $stmtReader = $this->pdo->prepare("
                    SELECT 
                        user_id,
                        COUNT(*) as read_count,
                        SUM(CASE WHEN answer_status LIKE 'Correct' THEN 1 ELSE 0 END) AS correct_count,
                        SUM(CASE WHEN answer_status LIKE 'In-Correct' THEN 1 ELSE 0 END) AS incorrect_count
                    FROM 
                        reader_attempts
                    WHERE 
                        user_id IN ($placeholders)
                    GROUP BY 
                        user_id
                ");
                $stmtReader->execute($chunk);
                $rows = $stmtReader->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as $r) {
                    $readerData[$r['user_id']] = $r;
                }
            }
        }

        // 5. Build student records
        $students = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            $rec = $readerData[$selectedUsername] 
                ?? ($readerData[$cleanStudent] 
                ?? ($readerData[$selectedStudent] ?? null));

            $readCount = $rec ? (int)$rec['read_count'] : 0;
            $correctCount = $rec ? (int)$rec['correct_count'] : 0;
            $incorrectCount = $rec ? (int)$rec['incorrect_count'] : 0;

            $students[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'read_count' => $readCount,
                'correct_count' => $correctCount,
                'incorrect_count' => $incorrectCount
            ];
        }

        return [
            'batch_code' => $batchCode,
            'total_prescriptions' => $totalPrescriptions,
            'students' => $students
        ];
    }

    public function getAssignmentReportByBatch($batchCode)
    {
        $batchCode = trim($batchCode);

        // 1. Get assignments for this course batch (Legacy: assignment table)
        $stmtAssignments = $this->pdo->prepare("
            SELECT id, course_code, title_id, assignment_id, assignment_name, file_path, due_date, added_date, description 
            FROM assignment 
            WHERE course_code LIKE ?
            ORDER BY id ASC
        ");
        $stmtAssignments->execute([$batchCode]);
        $assignments = $stmtAssignments->fetchAll(PDO::FETCH_ASSOC);

        // 2. Get all submissions (Legacy: assignment_submittion)
        $stmtSubs = $this->pdo->query("
            SELECT id, assignment_id, file_path, created_by, created_at, status, grade 
            FROM assignment_submittion
        ");
        $allSubs = $stmtSubs ? $stmtSubs->fetchAll(PDO::FETCH_ASSOC) : [];
        $submissionsMap = [];
        foreach ($allSubs as $s) {
            $key = $s['assignment_id'] . '-' . $s['created_by'];
            $submissionsMap[$key] = $s;
        }

        // 3. Get enrolled students
        $stmtEnroll = $this->pdo->prepare("
            SELECT id, course_code, student_id 
            FROM student_course 
            WHERE course_code LIKE ? 
            ORDER BY id DESC
        ");
        $stmtEnroll->execute([$batchCode]);
        $userList = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

        if (empty($userList)) {
            $stmtCs = $this->pdo->prepare("
                SELECT cs.id, cs.course_id, cs.student_id, c.course_code 
                FROM course_students cs
                JOIN course c ON c.id = cs.course_id
                WHERE c.course_code LIKE ?
            ");
            $stmtCs->execute([$batchCode]);
            $csRows = $stmtCs->fetchAll(PDO::FETCH_ASSOC);
            foreach ($csRows as $cs) {
                $userList[] = [
                    'id' => $cs['id'],
                    'course_code' => $cs['course_code'],
                    'student_id' => $cs['student_id'],
                ];
            }
        }

        // 4. User details map
        $userDetails = $this->getLmsUserDetailsMap();

        // 5. Build student rows
        $students = [];
        foreach ($userList as $enr) {
            $selectedStudent = $enr['student_id'] ?? '';
            $cleanStudent = str_replace('/', '', $selectedStudent);

            $studentInfo = $userDetails[$selectedStudent] ?? ($userDetails[$cleanStudent] ?? null);
            $selectedUsername = !empty($studentInfo['username']) ? $studentInfo['username'] : $cleanStudent;
            $nameOnCertificate = !empty($studentInfo['name_on_certificate']) 
                ? $studentInfo['name_on_certificate'] 
                : (!empty($studentInfo['full_name']) 
                    ? $studentInfo['full_name'] 
                    : (!empty($studentInfo['first_name']) ? trim($studentInfo['first_name'] . ' ' . ($studentInfo['last_name'] ?? '')) : ''));

            $grades = [];
            $submittedCount = 0;
            $gradedCount = 0;

            foreach ($assignments as $a) {
                $aid = $a['assignment_id'];
                $sub = $submissionsMap[$aid . '-' . $selectedUsername] 
                    ?? ($submissionsMap[$aid . '-' . $cleanStudent] 
                    ?? ($submissionsMap[$aid . '-' . $selectedStudent] ?? null));

                if ($sub) {
                    $submittedCount++;
                    $rawGrade = $sub['grade'];
                    if ($rawGrade !== null && $rawGrade !== '') {
                        $gradedCount++;
                        $gradeDisplay = is_numeric($rawGrade) ? number_format((float)$rawGrade, 2) : (string)$rawGrade;
                    } else {
                        $gradeDisplay = 'Not Set';
                    }
                    $status = !empty($sub['status']) ? $sub['status'] : 'Submitted';
                } else {
                    $gradeDisplay = 'Not Set';
                    $status = 'Pending';
                }

                $grades[$aid] = [
                    'grade' => $gradeDisplay,
                    'status' => $status
                ];
            }

            $students[] = [
                'index_number' => $selectedUsername,
                'student_name' => $nameOnCertificate,
                'assignment_grades' => $grades,
                'submitted_count' => $submittedCount,
                'graded_count' => $gradedCount
            ];
        }

        return [
            'batch_code' => $batchCode,
            'assignments' => $assignments,
            'students' => $students
        ];
    }

    public function saveAssignmentGrade($assignmentId, $studentNumber, $gradeValue)
    {
        $assignmentId = trim($assignmentId);
        $studentNumber = trim($studentNumber);
        $gradeValue = trim($gradeValue);

        if (empty($assignmentId) || empty($studentNumber)) {
            return ['status' => 'error', 'message' => 'Assignment ID and Student Number are required'];
        }

        $stmt = $this->pdo->prepare("SELECT id FROM assignment_submittion WHERE assignment_id = ? AND created_by = ? LIMIT 1");
        $stmt->execute([$assignmentId, $studentNumber]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
            $up = $this->pdo->prepare("UPDATE assignment_submittion SET grade = ?, status = 'Graded', created_at = NOW() WHERE id = ?");
            $up->execute([$gradeValue, $existingId]);
        } else {
            $in = $this->pdo->prepare("INSERT INTO assignment_submittion (assignment_id, created_by, created_at, status, grade) VALUES (?, ?, NOW(), 'Graded', ?)");
            $in->execute([$assignmentId, $studentNumber, $gradeValue]);
        }

        return ['status' => 'success', 'message' => "Grade for student {$studentNumber} updated to {$gradeValue}"];
    }
}
