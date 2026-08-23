<?php

class StudentDocumentVerification
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getByStudentId($studentId)
    {
        $stmt = $this->pdo->prepare("SELECT v.*, u.verification_status as user_verification_status 
            FROM student_document_verifications v 
            LEFT JOIN users u ON v.student_id = u.username 
            WHERE v.student_id = :student_id 
            ORDER BY v.id DESC LIMIT 1");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT v.*, u.fname, u.lname, u.email, u.phone, u.verification_status as user_verification_status 
            FROM student_document_verifications v 
            LEFT JOIN users u ON v.student_id = u.username 
            WHERE v.id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll($status = null, $search = null, $limit = 50, $offset = 0)
    {
        $query = "SELECT v.*, u.fname, u.lname, u.email, u.phone, u.verification_status as user_verification_status 
                  FROM student_document_verifications v 
                  LEFT JOIN users u ON v.student_id = u.username 
                  WHERE 1=1";
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $query .= " AND v.status = :status";
            $params['status'] = $status;
        }

        if (!empty($search)) {
            $query .= " AND (v.student_id LIKE :search OR u.fname LIKE :search OR u.lname LIKE :search OR v.id_number LIKE :search)";
            $params['search'] = "%$search%";
        }

        $query .= " ORDER BY v.updated_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->pdo->prepare($query);
        foreach ($params as $key => $val) {
            $stmt->bindValue(":$key", $val);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll($status = null, $search = null)
    {
        $query = "SELECT COUNT(*) as total 
                  FROM student_document_verifications v 
                  LEFT JOIN users u ON v.student_id = u.username 
                  WHERE 1=1";
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $query .= " AND v.status = :status";
            $params['status'] = $status;
        }

        if (!empty($search)) {
            $query .= " AND (v.student_id LIKE :search OR u.fname LIKE :search OR u.lname LIKE :search OR v.id_number LIKE :search)";
            $params['search'] = "%$search%";
        }

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return $res ? (int)$res['total'] : 0;
    }

    public function createOrUpdateRecord($data)
    {
        $existing = $this->getByStudentId($data['student_id']);
        $recordId = null;

        if ($existing) {
            $fields = [
                'id_type = :id_type',
                'id_number = :id_number',
                'status = :status',
                'rejection_reason = NULL',
                'verified_by = NULL',
                'verified_at = NULL'
            ];

            $params = [
                'id' => $existing['id'],
                'id_type' => $data['id_type'] ?? $existing['id_type'],
                'id_number' => $data['id_number'] ?? $existing['id_number'],
                'status' => 'pending'
            ];

            if (isset($data['id_front_image'])) {
                $fields[] = 'id_front_image = :id_front_image';
                $params['id_front_image'] = $data['id_front_image'];
            }
            if (isset($data['id_back_image'])) {
                $fields[] = 'id_back_image = :id_back_image';
                $params['id_back_image'] = $data['id_back_image'];
            }
            if (isset($data['birth_certificate_front'])) {
                $fields[] = 'birth_certificate_front = :birth_certificate_front';
                $params['birth_certificate_front'] = $data['birth_certificate_front'];
            }
            if (isset($data['birth_certificate_back'])) {
                $fields[] = 'birth_certificate_back = :birth_certificate_back';
                $params['birth_certificate_back'] = $data['birth_certificate_back'];
            }
            if (isset($data['ol_certificate'])) {
                $fields[] = 'ol_certificate = :ol_certificate';
                $params['ol_certificate'] = $data['ol_certificate'];
            }
            if (isset($data['al_certificate'])) {
                $fields[] = 'al_certificate = :al_certificate';
                $params['al_certificate'] = $data['al_certificate'];
            }
            if (isset($data['other_documents'])) {
                $fields[] = 'other_documents = :other_documents';
                $params['other_documents'] = $data['other_documents'];
            }

            $sql = "UPDATE student_document_verifications SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $recordId = $existing['id'];
        } else {
            $sql = "INSERT INTO student_document_verifications 
                    (student_id, id_type, id_number, id_front_image, id_back_image, birth_certificate_front, birth_certificate_back, ol_certificate, al_certificate, other_documents, status) 
                    VALUES 
                    (:student_id, :id_type, :id_number, :id_front_image, :id_back_image, :birth_certificate_front, :birth_certificate_back, :ol_certificate, :al_certificate, :other_documents, :status)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'student_id' => $data['student_id'],
                'id_type' => $data['id_type'] ?? 'nic',
                'id_number' => $data['id_number'] ?? null,
                'id_front_image' => $data['id_front_image'] ?? null,
                'id_back_image' => $data['id_back_image'] ?? null,
                'birth_certificate_front' => $data['birth_certificate_front'] ?? null,
                'birth_certificate_back' => $data['birth_certificate_back'] ?? null,
                'ol_certificate' => $data['ol_certificate'] ?? null,
                'al_certificate' => $data['al_certificate'] ?? null,
                'other_documents' => $data['other_documents'] ?? null,
                'status' => 'pending'
            ]);
            $recordId = $this->pdo->lastInsertId();
        }

        // Also update users.verification_status to 'Pending'
        $stmtUser = $this->pdo->prepare("UPDATE users SET verification_status = 'Pending' WHERE username = :username");
        $stmtUser->execute(['username' => $data['student_id']]);

        return $recordId;
    }

    public function updateStatus($id, $status, $rejectionReason = null, $verifiedBy = null)
    {
        $stmt = $this->pdo->prepare("UPDATE student_document_verifications 
            SET status = :status, 
                rejection_reason = :rejection_reason, 
                verified_by = :verified_by, 
                verified_at = NOW() 
            WHERE id = :id");
            
        $result = $stmt->execute([
            'id' => $id,
            'status' => $status,
            'rejection_reason' => $status === 'rejected' ? $rejectionReason : null,
            'verified_by' => $verifiedBy
        ]);

        if ($result) {
            $rec = $this->getById($id);
            if ($rec && !empty($rec['student_id'])) {
                $userStatus = $status === 'approved' ? 'Verified' : ($status === 'rejected' ? 'Rejected' : 'Pending');
                $stmtUser = $this->pdo->prepare("UPDATE users SET verification_status = :vstatus WHERE username = :username");
                $stmtUser->execute([
                    'vstatus' => $userStatus,
                    'username' => $rec['student_id']
                ]);
            }
        }

        return $result;
    }

    public function setUserVerificationStatus($username, $verificationStatus)
    {
        $stmt = $this->pdo->prepare("UPDATE users SET verification_status = :vstatus WHERE username = :username");
        return $stmt->execute([
            'vstatus' => $verificationStatus,
            'username' => $username
        ]);
    }
}
