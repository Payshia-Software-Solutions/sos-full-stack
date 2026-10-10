<?php

class ReaderMedicine
{
    private $pdo;
    private $table = 'reader_medicine';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActive()
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table} WHERE active_status = 'Active'");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUnanswered($userId, $difficulty = null, $courseCode = null, $limit = 5)
    {
        if ($courseCode) {
            $sql = "SELECT m.* FROM {$this->table} m 
                    JOIN pharma_reader_course_assignments ca ON m.id = ca.prescription_id
                    WHERE m.active_status = 'Active' 
                    AND ca.course_code = :course_code
                    AND m.id NOT IN (
                        SELECT a.pres_id 
                        FROM reader_attempts a 
                        WHERE a.user_id = :user_id AND a.answer_status = 'Correct'
                        GROUP BY a.pres_id
                        HAVING COUNT(a.id) >= :target_limit
                    )";
        } else {
            $sql = "SELECT m.* FROM {$this->table} m 
                    WHERE m.active_status = 'Active' 
                    AND m.id NOT IN (
                        SELECT a.pres_id 
                        FROM reader_attempts a 
                        WHERE a.user_id = :user_id AND a.answer_status = 'Correct'
                        GROUP BY a.pres_id
                        HAVING COUNT(a.id) >= :target_limit
                    )";
        }
                
        if ($difficulty) {
            $sql .= " AND m.difficulty = :difficulty";
        }
        
        $stmt = $this->pdo->prepare($sql);
        
        $params = ['user_id' => $userId, 'target_limit' => $limit];
        if ($difficulty) {
            $params['difficulty'] = $difficulty;
        }
        if ($courseCode) {
            $params['course_code'] = $courseCode;
        }
        
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO {$this->table} (
                pres_name, course_code, difficulty, image_path, active_status, PresHelp, 
                prescription_question, answer_1, answer_2, answer_3, answer_4, 
                correct_answer, created_by
            ) VALUES (
                :pres_name, :course_code, :difficulty, :image_path, :active_status, :PresHelp, 
                :prescription_question, :answer_1, :answer_2, :answer_3, :answer_4, 
                :correct_answer, :created_by
            )
        ");
        
        $stmt->execute([
            'pres_name' => $data['pres_name'],
            'course_code' => $data['course_code'] ?? null,
            'difficulty' => $data['difficulty'],
            'image_path' => $data['image_path'],
            'active_status' => $data['active_status'] ?? 'Active',
            'PresHelp' => $data['PresHelp'],
            'prescription_question' => $data['prescription_question'],
            'answer_1' => $data['answer_1'],
            'answer_2' => $data['answer_2'],
            'answer_3' => $data['answer_3'],
            'answer_4' => $data['answer_4'],
            'correct_answer' => $data['correct_answer'],
            'created_by' => $data['created_by'] ?? 'Admin'
        ]);
        
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE {$this->table} SET 
                pres_name = :pres_name, 
                course_code = :course_code,
                difficulty = :difficulty, 
                image_path = :image_path, 
                active_status = :active_status, 
                PresHelp = :PresHelp, 
                prescription_question = :prescription_question, 
                answer_1 = :answer_1, 
                answer_2 = :answer_2, 
                answer_3 = :answer_3, 
                answer_4 = :answer_4, 
                correct_answer = :correct_answer
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'pres_name' => $data['pres_name'],
            'course_code' => $data['course_code'] ?? null,
            'difficulty' => $data['difficulty'],
            'image_path' => $data['image_path'],
            'active_status' => $data['active_status'],
            'PresHelp' => $data['PresHelp'],
            'prescription_question' => $data['prescription_question'],
            'answer_1' => $data['answer_1'],
            'answer_2' => $data['answer_2'],
            'answer_3' => $data['answer_3'],
            'answer_4' => $data['answer_4'],
            'correct_answer' => $data['correct_answer']
        ]);
        
        return $stmt->rowCount();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
    }

    // ─── Course Assignment Methods ─────────────────────────────────────────────

    public function assignToCourse($prescriptionId, $courseCode, $assignedBy = null)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO pharma_reader_course_assignments 
                (prescription_id, course_code, assigned_by) 
            VALUES 
                (:prescription_id, :course_code, :assigned_by)
            ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by)
        ");
        
        $result = $stmt->execute([
            'prescription_id' => $prescriptionId,
            'course_code'     => $courseCode,
            'assigned_by'     => $assignedBy
        ]);
        
        return $result 
            ? ['status' => 'success', 'message' => 'Prescription assigned to course']
            : ['status' => 'error',   'message' => 'Failed to assign prescription'];
    }

    public function unassignFromCourse($prescriptionId, $courseCode)
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM pharma_reader_course_assignments 
            WHERE prescription_id = :prescription_id 
              AND course_code = :course_code
        ");
        
        $result = $stmt->execute([
            'prescription_id' => $prescriptionId,
            'course_code'     => $courseCode
        ]);
        
        return $result 
            ? ['status' => 'success', 'message' => 'Prescription unassigned from course']
            : ['status' => 'error',   'message' => 'Failed to unassign prescription'];
    }

    public function getAllCourseAssignments()
    {
        $stmt = $this->pdo->query("SELECT * FROM pharma_reader_course_assignments");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
