<?php

class StudentCourseModelNew
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Create new student course enrollment
    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO student_course (course_code, student_id, enrollment_key, created_at)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['course_code'],
            $data['student_id'],
            $data['enrollment_key'],
            $data['created_at']
        ]);

        return $this->pdo->lastInsertId();
    }

    // Read all enrollments with user details
    public function getAll()
    {
        $stmt = $this->pdo->query("
            SELECT 
                sc.id AS student_course_id,
                sc.course_code,
                sc.student_id,
                sc.enrollment_key,
                sc.created_at,

                ufd.id AS user_id,
                ufd.username,
                ufd.civil_status,
                ufd.first_name,
                ufd.last_name,
                ufd.gender,
                ufd.address_line_1,
                ufd.address_line_2,
                ufd.city,
                ufd.district,
                ufd.postal_code,
                ufd.telephone_1,
                ufd.telephone_2,
                ufd.nic,
                ufd.e_mail,
                ufd.birth_day,
                ufd.updated_by,
                ufd.updated_at,
                ufd.full_name,
                ufd.name_with_initials,
                ufd.name_on_certificate

            FROM student_course sc
            INNER JOIN user_full_details ufd ON sc.student_id = ufd.student_id
            ORDER BY sc.id DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Helper to resolve all possible identifier variants (with/without slash, from user_full_details, and from users table)
    private function resolveStudentIdentifiers($userName)
    {
        $identifiers = [$userName];

        $noSlash = str_replace('/', '', $userName);
        if (!empty($noSlash)) $identifiers[] = $noSlash;

        if (preg_match('/^([A-Za-z]+)(\d{2})(\d{3,})$/', $userName, $matches)) {
            $identifiers[] = $matches[1] . '/' . $matches[2] . '/' . $matches[3];
        }

        $stmtUser = $this->pdo->prepare("SELECT student_id, username FROM user_full_details WHERE student_id = ? OR username = ? OR student_id = ? OR username = ? LIMIT 1");
        $stmtUser->execute([$userName, $userName, $noSlash, $noSlash]);
        $userInfo = $stmtUser->fetch(PDO::FETCH_ASSOC);
        if ($userInfo) {
            if (!empty($userInfo['student_id'])) $identifiers[] = $userInfo['student_id'];
            if (!empty($userInfo['username'])) $identifiers[] = $userInfo['username'];
        }

        $stmtUsersTable = $this->pdo->prepare("SELECT userid, username FROM users WHERE username = ? OR userid = ? OR username = ? OR userid = ? LIMIT 1");
        $stmtUsersTable->execute([$userName, $userName, $noSlash, $noSlash]);
        $userFallback = $stmtUsersTable->fetch(PDO::FETCH_ASSOC);
        if ($userFallback) {
            if (!empty($userFallback['userid'])) $identifiers[] = $userFallback['userid'];
            if (!empty($userFallback['username'])) $identifiers[] = $userFallback['username'];
        }

        return array_values(array_unique(array_filter($identifiers)));
    }

    // Read single enrollment with user details by student course ID
    public function getByStudentNumber($userName)
    {
        $identifiers = $this->resolveStudentIdentifiers($userName);
        $inQuery = implode(',', array_fill(0, count($identifiers), '?'));

        $stmt = $this->pdo->prepare("
            SELECT 
                sc.id AS student_course_id,
                sc.course_code,
                sc.student_id,
                sc.enrollment_key,
                sc.created_at,
                c.parent_course_id,
                c.course_name,
                c.course_img,
                c.whatsapp_link,

                ufd.id AS user_id,
                ufd.username,
                ufd.civil_status,
                ufd.first_name,
                ufd.last_name,
                ufd.gender,
                ufd.address_line_1,
                ufd.address_line_2,
                ufd.city,
                ufd.district,
                ufd.postal_code,
                ufd.telephone_1,
                ufd.telephone_2,
                ufd.nic,
                ufd.e_mail,
                ufd.birth_day,
                ufd.updated_by,
                ufd.updated_at,
                ufd.full_name,
                ufd.name_with_initials,
                ufd.name_on_certificate

            FROM student_course sc
            LEFT JOIN user_full_details ufd ON sc.student_id = ufd.student_id OR sc.student_id = ufd.username
            LEFT JOIN course c ON sc.course_code = c.course_code
            WHERE sc.student_id IN ($inQuery)
        ");
        $stmt->execute(array_values($identifiers));
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fill in missing details for admin or users not in user_full_details
        foreach ($results as &$row) {
            if (empty($row['username'])) {
                $stmtFallback = $this->pdo->prepare("SELECT `id`, `userid` as student_id, `username`, `fname` as first_name, `lname` as last_name, `phone` as telephone_1, `email` as e_mail, CONCAT(`fname`, ' ', `lname`) as full_name FROM `users` WHERE `username` = ? OR `userid` = ? LIMIT 1");
                $stmtFallback->execute([$userName, $userName]);
                $fallback = $stmtFallback->fetch(PDO::FETCH_ASSOC);
                if ($fallback) {
                    $row['user_id'] = $fallback['id'];
                    $row['username'] = $fallback['username'];
                    $row['first_name'] = $fallback['first_name'];
                    $row['last_name'] = $fallback['last_name'];
                    $row['telephone_1'] = $fallback['telephone_1'];
                    $row['e_mail'] = $fallback['e_mail'];
                    $row['full_name'] = $fallback['full_name'];
                    $row['name_on_certificate'] = $fallback['full_name'];
                }
            }
        }
        return $results;
    }

    // Read single enrollment with user details by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                sc.id AS student_course_id,
                sc.course_code,
                sc.student_id,
                sc.enrollment_key,
                sc.created_at,

                ufd.id AS user_id,
                ufd.username,
                ufd.civil_status,
                ufd.first_name,
                ufd.last_name,
                ufd.gender,
                ufd.address_line_1,
                ufd.address_line_2,
                ufd.city,
                ufd.district,
                ufd.postal_code,
                ufd.telephone_1,
                ufd.telephone_2,
                ufd.nic,
                ufd.e_mail,
                ufd.birth_day,
                ufd.updated_by,
                ufd.updated_at,
                ufd.full_name,
                ufd.name_with_initials,
                ufd.name_on_certificate

            FROM student_course sc
            INNER JOIN user_full_details ufd ON sc.student_id = ufd.student_id
            WHERE sc.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Read single enrollment by course code
    public function getByCourseCodeId($courseCode)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                sc.id AS student_course_id,
                sc.course_code,
                sc.student_id,
                sc.enrollment_key,
                sc.created_at,

                ufd.id AS user_id,
                ufd.username,
                ufd.civil_status,
                ufd.first_name,
                ufd.last_name,
                ufd.gender,
                ufd.address_line_1,
                ufd.address_line_2,
                ufd.city,
                ufd.district,
                ufd.postal_code,
                ufd.telephone_1,
                ufd.telephone_2,
                ufd.nic,
                ufd.e_mail,
                ufd.birth_day,
                ufd.updated_by,
                ufd.updated_at,
                ufd.full_name,
                ufd.name_with_initials,
                ufd.name_on_certificate

            FROM student_course sc
            INNER JOIN user_full_details ufd ON sc.student_id = ufd.student_id
            WHERE sc.course_code = ?
        ");
        $stmt->execute([$courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update enrollment by ID
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE student_course 
            SET course_code = ?, student_id = ?, enrollment_key = ?, created_at = ?
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['course_code'],
            $data['student_id'],
            $data['enrollment_key'],
            $data['created_at'],
            $id
        ]);
    }

    // Delete enrollment by ID
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM student_course WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getByStudentNumberAndParentCourseId($userName, $parentCourseId)
    {
        $identifiers = $this->resolveStudentIdentifiers($userName);
        $inQuery = implode(',', array_fill(0, count($identifiers), '?'));

        $stmt = $this->pdo->prepare("
            SELECT 
                sc.id AS student_course_id,
                sc.course_code,
                sc.student_id,
                sc.enrollment_key,
                sc.created_at,
                c.parent_course_id,
                c.course_name,
                c.course_img,
                c.whatsapp_link,

                ufd.id AS user_id,
                ufd.username,
                ufd.civil_status,
                ufd.first_name,
                ufd.last_name,
                ufd.gender,
                ufd.address_line_1,
                ufd.address_line_2,
                ufd.city,
                ufd.district,
                ufd.postal_code,
                ufd.telephone_1,
                ufd.telephone_2,
                ufd.nic,
                ufd.e_mail,
                ufd.birth_day,
                ufd.updated_by,
                ufd.updated_at,
                ufd.full_name,
                ufd.name_with_initials,
                ufd.name_on_certificate

            FROM student_course sc
            LEFT JOIN user_full_details ufd ON sc.student_id = ufd.student_id OR sc.student_id = ufd.username
            LEFT JOIN course c ON sc.course_code = c.course_code
            WHERE sc.student_id IN ($inQuery) AND c.parent_course_id = ?
            ORDER BY sc.id DESC
            LIMIT 1
        ");
        
        $params = array_values($identifiers);
        $params[] = $parentCourseId;
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && empty($row['username'])) {
            $stmtFallback = $this->pdo->prepare("SELECT `id`, `userid` as student_id, `username`, `fname` as first_name, `lname` as last_name, `phone` as telephone_1, `email` as e_mail, CONCAT(`fname`, ' ', `lname`) as full_name FROM `users` WHERE `username` = ? OR `userid` = ? LIMIT 1");
            $stmtFallback->execute([$userName, $userName]);
            $fallback = $stmtFallback->fetch(PDO::FETCH_ASSOC);
            if ($fallback) {
                $row['user_id'] = $fallback['id'];
                $row['username'] = $fallback['username'];
                $row['first_name'] = $fallback['first_name'];
                $row['last_name'] = $fallback['last_name'];
                $row['telephone_1'] = $fallback['telephone_1'];
                $row['e_mail'] = $fallback['e_mail'];
                $row['full_name'] = $fallback['full_name'];
                $row['name_on_certificate'] = $fallback['full_name'];
            }
        }
        return $row;
    }

}
