<?php

class StudentDocumentVerification
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    private function getNormalizedIdentifiers($id)
    {
        if (empty($id)) return [];
        $id = trim($id);
        $identifiers = [$id];
        $noSlash = str_replace('/', '', $id);
        if (!empty($noSlash)) $identifiers[] = $noSlash;
        if (preg_match('/^([A-Za-z]+)(\d{2})(\d{3,})$/', $id, $m)) {
            $identifiers[] = $m[1] . '/' . $m[2] . '/' . $m[3];
        }
        return array_values(array_unique(array_filter($identifiers)));
    }

    public function getByStudentId($studentId)
    {
        $identifiers = $this->getNormalizedIdentifiers($studentId);
        if (empty($identifiers)) {
            return null;
        }
        $placeholders = implode(',', array_fill(0, count($identifiers), '?'));

        // 1. Try to find from student_document_verifications table
        $stmt = $this->pdo->prepare("SELECT v.*, u.verification_status as user_verification_status 
            FROM student_document_verifications v 
            LEFT JOIN users u ON (v.student_id = u.username OR v.student_id = u.userid) 
            WHERE v.student_id IN ($placeholders) 
            ORDER BY v.id DESC LIMIT 1");
        $stmt->execute($identifiers);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($record) {
            return $record;
        }

        // 2. Fallback: Check users and user_full_details tables directly
        try {
            $userStmt = $this->pdo->prepare("SELECT id, username, userid, fname, lname, email, verification_status 
                FROM users 
                WHERE username IN ($placeholders) OR userid IN ($placeholders) 
                LIMIT 1");
            $userStmt->execute(array_merge($identifiers, $identifiers));
            $userRow = $userStmt->fetch(PDO::FETCH_ASSOC);

            $ufdStmt = $this->pdo->prepare("SELECT id, username, student_id, first_name, last_name, verification_status 
                FROM user_full_details 
                WHERE username IN ($placeholders) OR student_id IN ($placeholders) 
                LIMIT 1");
            $ufdStmt->execute(array_merge($identifiers, $identifiers));
            $ufdRow = $ufdStmt->fetch(PDO::FETCH_ASSOC);

            $userVerStatus = $userRow['verification_status'] ?? $ufdRow['verification_status'] ?? null;
            if (!empty($userVerStatus)) {
                $norm = strtolower(trim($userVerStatus));
                $isVer = ($norm === 'verified' || $norm === 'approved');
                $isPend = ($norm === 'pending');
                $isRej = ($norm === 'rejected');

                return [
                    'id' => null,
                    'student_id' => $studentId,
                    'id_type' => 'nic',
                    'id_number' => null,
                    'status' => $isVer ? 'approved' : ($isPend ? 'pending' : ($isRej ? 'rejected' : 'not_submitted')),
                    'user_verification_status' => $userVerStatus,
                    'rejection_reason' => null,
                    'verified_by' => $isVer ? 'Administration' : null,
                    'verified_at' => null
                ];
            }
        } catch (\Exception $e) {
            error_log("Error resolving fallback KYC status: " . $e->getMessage());
        }

        return null;
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT v.*, u.fname, u.lname, u.email, u.phone, u.verification_status as user_verification_status 
            FROM student_document_verifications v 
            LEFT JOIN users u ON (v.student_id = u.username OR v.student_id = u.userid) 
            WHERE v.id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll($status = null, $search = null, $limit = 50, $offset = 0)
    {
        $query = "SELECT v.*, u.fname, u.lname, u.email, u.phone, u.verification_status as user_verification_status 
                  FROM student_document_verifications v 
                  LEFT JOIN users u ON (v.student_id = u.username OR v.student_id = u.userid) 
                  WHERE 1=1";
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $query .= " AND v.status = :status";
            $params['status'] = $status;
        }

        if (!empty($search) && trim($search) !== '') {
            $query .= " AND (v.student_id LIKE :s_student_id OR u.fname LIKE :s_fname OR u.lname LIKE :s_lname OR v.id_number LIKE :s_id_number)";
            $searchTerm = '%' . trim($search) . '%';
            $params['s_student_id'] = $searchTerm;
            $params['s_fname'] = $searchTerm;
            $params['s_lname'] = $searchTerm;
            $params['s_id_number'] = $searchTerm;
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
                  LEFT JOIN users u ON (v.student_id = u.username OR v.student_id = u.userid) 
                  WHERE 1=1";
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $query .= " AND v.status = :status";
            $params['status'] = $status;
        }

        if (!empty($search) && trim($search) !== '') {
            $query .= " AND (v.student_id LIKE :s_student_id OR u.fname LIKE :s_fname OR u.lname LIKE :s_lname OR v.id_number LIKE :s_id_number)";
            $searchTerm = '%' . trim($search) . '%';
            $params['s_student_id'] = $searchTerm;
            $params['s_fname'] = $searchTerm;
            $params['s_lname'] = $searchTerm;
            $params['s_id_number'] = $searchTerm;
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

        if ($existing && !empty($existing['id'])) {
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

        // Also update users.verification_status & user_full_details.verification_status to 'Pending'
        $identifiers = $this->getNormalizedIdentifiers($data['student_id']);
        if (!empty($identifiers)) {
            $placeholders = implode(',', array_fill(0, count($identifiers), '?'));
            try {
                $stmtUser = $this->pdo->prepare("UPDATE users SET verification_status = 'Pending' WHERE username IN ($placeholders) OR userid IN ($placeholders)");
                $stmtUser->execute(array_merge($identifiers, $identifiers));

                $stmtUfd = $this->pdo->prepare("UPDATE user_full_details SET verification_status = 'Pending' WHERE username IN ($placeholders) OR student_id IN ($placeholders)");
                $stmtUfd->execute(array_merge($identifiers, $identifiers));
            } catch (\Exception $e) {
                error_log("Failed to update pending status: " . $e->getMessage());
            }
        }

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
                $identifiers = $this->getNormalizedIdentifiers($rec['student_id']);
                if (!empty($identifiers)) {
                    $placeholders = implode(',', array_fill(0, count($identifiers), '?'));
                    try {
                        $stmtUser = $this->pdo->prepare("UPDATE users SET verification_status = ? WHERE username IN ($placeholders) OR userid IN ($placeholders)");
                        $stmtUser->execute(array_merge([$userStatus], $identifiers, $identifiers));

                        $stmtUfd = $this->pdo->prepare("UPDATE user_full_details SET verification_status = ? WHERE username IN ($placeholders) OR student_id IN ($placeholders)");
                        $stmtUfd->execute(array_merge([$userStatus], $identifiers, $identifiers));
                    } catch (\Exception $e) {
                        error_log("Failed to update user tables on verify: " . $e->getMessage());
                    }
                }
            }
        }

        return $result;
    }

    public function setUserVerificationStatus($username, $verificationStatus)
    {
        $identifiers = $this->getNormalizedIdentifiers($username);
        if (empty($identifiers)) {
            return false;
        }
        $placeholders = implode(',', array_fill(0, count($identifiers), '?'));

        try {
            $stmtUser = $this->pdo->prepare("UPDATE users SET verification_status = ? WHERE username IN ($placeholders) OR userid IN ($placeholders)");
            $stmtUser->execute(array_merge([$verificationStatus], $identifiers, $identifiers));

            $stmtUfd = $this->pdo->prepare("UPDATE user_full_details SET verification_status = ? WHERE username IN ($placeholders) OR student_id IN ($placeholders)");
            $stmtUfd->execute(array_merge([$verificationStatus], $identifiers, $identifiers));
            return true;
        } catch (\Exception $e) {
            error_log("Failed to set user verification status: " . $e->getMessage());
            return false;
        }
    }
}
