<?php
// models/PasswordResetModel.php

class PasswordResetModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTableExists();
    }

    /**
     * Ensure the reset_token table exists
     */
    private function ensureTableExists()
    {
        try {
            $sql = "CREATE TABLE IF NOT EXISTS `reset_token` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `email` varchar(255) DEFAULT '',
              `token` varchar(64) NOT NULL,
              `is_active` int(1) DEFAULT 1,
              `date_time` datetime NOT NULL,
              `student_number` varchar(50) NOT NULL,
              `otp` varchar(10) NOT NULL,
              PRIMARY KEY (`id`),
              KEY `idx_student_number` (`student_number`),
              KEY `idx_token` (`token`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->pdo->exec($sql);
        } catch (Exception $e) {
            error_log("Failed to ensure reset_token table exists: " . $e->getMessage());
        }
    }

    /**
     * Normalize a phone number to standard Sri Lankan 10-digit format (07XXXXXXXX)
     */
    public static function normalizePhone($phone)
    {
        if (empty($phone)) return '';
        $phone = preg_replace('/[^0-9]/', '', (string)$phone);
        if (strpos($phone, '94') === 0 && strlen($phone) === 11) {
            $phone = '0' . substr($phone, 2);
        } elseif (strlen($phone) === 9 && strpos($phone, '0') !== 0) {
            $phone = '0' . $phone;
        }
        return $phone;
    }

    /**
     * Mask phone number for security in responses (e.g. 071****789)
     */
    public static function maskPhone($phone)
    {
        $normalized = self::normalizePhone($phone);
        if (strlen($normalized) === 10) {
            return substr($normalized, 0, 3) . '****' . substr($normalized, -3);
        }
        return '*******';
    }

    /**
     * Find user by username, email, or phone
     */
    public function findUserByIdentifier($identifier)
    {
        $trimmed = trim($identifier);
        if (empty($trimmed)) {
            return null;
        }

        $phoneNormalized = self::normalizePhone($trimmed);

        // 1. Check in users table
        $stmt = $this->pdo->prepare("
            SELECT id, username, email, phone, status, fname, lname
            FROM users
            WHERE username = ? 
               OR email = ? 
               OR (phone IS NOT NULL AND phone != '' AND (phone = ? OR phone = ?))
            LIMIT 1
        ");
        $stmt->execute([
            $trimmed,
            $trimmed,
            $trimmed,
            $phoneNormalized
        ]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        // 2. If not found or missing phone, check in user_full_details table
        if (!$user) {
            $stmtDetails = $this->pdo->prepare("
                SELECT student_id, username, e_mail, telephone_1, telephone_2, first_name, last_name
                FROM user_full_details
                WHERE username = ? 
                   OR student_id = ? 
                   OR e_mail = ?
                   OR telephone_1 = ? OR telephone_1 = ?
                   OR telephone_2 = ? OR telephone_2 = ?
                LIMIT 1
            ");
            $stmtDetails->execute([
                $trimmed,
                $trimmed,
                $trimmed,
                $trimmed,
                $phoneNormalized,
                $trimmed,
                $phoneNormalized
            ]);
            $details = $stmtDetails->fetch(PDO::FETCH_ASSOC);
            $stmtDetails->closeCursor();

            if ($details) {
                $targetUsername = !empty($details['username']) ? $details['username'] : $details['student_id'];
                $stmt = $this->pdo->prepare("
                    SELECT id, username, email, phone, status, fname, lname
                    FROM users
                    WHERE username = ?
                    LIMIT 1
                ");
                $stmt->execute([$targetUsername]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                $stmt->closeCursor();

                if (!$user) {
                    // Create minimal user array from full details
                    $user = [
                        'id' => null,
                        'username' => $targetUsername,
                        'email' => $details['e_mail'],
                        'phone' => !empty($details['telephone_1']) ? $details['telephone_1'] : $details['telephone_2'],
                        'status' => 'Active',
                        'fname' => $details['first_name'],
                        'lname' => $details['last_name']
                    ];
                }
            }
        }

        if ($user) {
            // Check if user has phone, otherwise enrich from user_full_details
            if (empty($user['phone'])) {
                $stmtPhone = $this->pdo->prepare("
                    SELECT telephone_1, telephone_2, e_mail 
                    FROM user_full_details 
                    WHERE username = ? OR student_id = ? 
                    LIMIT 1
                ");
                $stmtPhone->execute([$user['username'], $user['username']]);
                $fd = $stmtPhone->fetch(PDO::FETCH_ASSOC);
                $stmtPhone->closeCursor();
                if ($fd) {
                    $user['phone'] = !empty($fd['telephone_1']) ? $fd['telephone_1'] : $fd['telephone_2'];
                    if (empty($user['email'])) {
                        $user['email'] = $fd['e_mail'];
                    }
                }
            }
        }

        return $user;
    }

    /**
     * Create an OTP and token record for a student
     */
    public function createResetToken($studentNumber, $email, $otp, $token)
    {
        // Deactivate previous active tokens for this student
        $deactivateStmt = $this->pdo->prepare("
            UPDATE reset_token 
            SET is_active = 0 
            WHERE student_number = ?
        ");
        $deactivateStmt->execute([$studentNumber]);

        // Insert new reset token record
        $stmt = $this->pdo->prepare("
            INSERT INTO reset_token (email, token, is_active, date_time, student_number, otp) 
            VALUES (?, ?, 1, NOW(), ?, ?)
        ");
        return $stmt->execute([$email, $token, $studentNumber, $otp]);
    }

    /**
     * Get active token record by student number within 10 minutes
     */
    public function getActiveOtp($studentNumber)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM reset_token 
            WHERE student_number = ? 
              AND is_active = 1 
              AND date_time >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
            ORDER BY id DESC 
            LIMIT 1
        ");
        $stmt->execute([$studentNumber]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $row;
    }

    /**
     * Get active token record by token string within 15 minutes
     */
    public function getActiveToken($token)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM reset_token 
            WHERE token = ? 
              AND is_active = 1 
              AND date_time >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
            ORDER BY id DESC 
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $row;
    }

    /**
     * Mark a reset token as used (inactive)
     */
    public function invalidateToken($tokenId)
    {
        $stmt = $this->pdo->prepare("UPDATE reset_token SET is_active = 0 WHERE id = ?");
        $res = $stmt->execute([$tokenId]);
        $stmt->closeCursor();
        return $res;
    }

    /**
     * Update user password by username
     */
    public function updateUserPassword($username, $newHashedPassword)
    {
        try {
            $stmt = $this->pdo->prepare("
                UPDATE users 
                SET password = ?, temp_password = NULL 
                WHERE username = ?
            ");
            $res = $stmt->execute([$newHashedPassword, $username]);
            $stmt->closeCursor();
            return $res;
        } catch (\PDOException $e) {
            // If MyISAM index corrupted (Error 126), auto-repair and retry
            if (strpos($e->getMessage(), '126') !== false || stripos($e->getMessage(), 'corrupt') !== false) {
                try {
                    $repair = $this->pdo->query("REPAIR TABLE users");
                    if ($repair) {
                        $repair->fetchAll();
                        $repair->closeCursor();
                    }
                    $stmt = $this->pdo->prepare("
                        UPDATE users 
                        SET password = ?, temp_password = NULL 
                        WHERE username = ?
                    ");
                    $res = $stmt->execute([$newHashedPassword, $username]);
                    $stmt->closeCursor();
                    return $res;
                } catch (\Exception $repairError) {
                    error_log("Failed to auto-repair users table: " . $repairError->getMessage());
                    throw $repairError;
                }
            }
            throw $e;
        }
    }
}
