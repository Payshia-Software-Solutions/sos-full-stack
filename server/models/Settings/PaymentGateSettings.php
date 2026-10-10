<?php
// models/Settings/PaymentGateSettings.php

class PaymentGateSettings
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTable();
    }

    private function ensureTable()
    {
        try {
            $sql = "CREATE TABLE IF NOT EXISTS `grade_payment_gate_settings` (
                `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `is_active` tinyint(1) NOT NULL DEFAULT 1,
                `restriction_mode` varchar(50) NOT NULL DEFAULT 'minimum_due',
                `minimum_due_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
                `custom_message` text NULL,
                `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->pdo->exec($sql);

            $stmt = $this->pdo->query("SELECT COUNT(*) FROM `grade_payment_gate_settings`");
            if ($stmt->fetchColumn() == 0) {
                $insert = $this->pdo->prepare("INSERT INTO `grade_payment_gate_settings` (`id`, `is_active`, `restriction_mode`, `minimum_due_amount`, `custom_message`) VALUES (1, 1, 'minimum_due', 0.00, 'Please complete your pending payments to view your assignment and exam grades.')");
                $insert->execute();
            }
        } catch (\PDOException $e) {
            // Silently log or ignore if table already exists
            error_log("PaymentGateSettings ensureTable error: " . $e->getMessage());
        }
    }

    public function getSettings()
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM `grade_payment_gate_settings` WHERE id = 1");
            $stmt->execute();
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($row) {
                return [
                    'id' => (int)$row['id'],
                    'is_active' => (bool)$row['is_active'],
                    'restriction_mode' => $row['restriction_mode'],
                    'minimum_due_amount' => (float)$row['minimum_due_amount'],
                    'custom_message' => $row['custom_message'] ?? 'Please complete your pending payments to view your assignment and exam grades.',
                    'updated_at' => $row['updated_at'] ?? null,
                ];
            }
        } catch (\PDOException $e) {
            error_log("PaymentGateSettings getSettings error: " . $e->getMessage());
        }

        return [
            'id' => 1,
            'is_active' => true,
            'restriction_mode' => 'minimum_due',
            'minimum_due_amount' => 0.00,
            'custom_message' => 'Please complete your pending payments to view your assignment and exam grades.',
            'updated_at' => null,
        ];
    }

    public function updateSettings($data)
    {
        try {
            $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;
            $restrictionMode = !empty($data['restriction_mode']) && in_array($data['restriction_mode'], ['fully_paid', 'minimum_due']) 
                ? $data['restriction_mode'] 
                : 'minimum_due';
            $minimumDueAmount = isset($data['minimum_due_amount']) ? (float)$data['minimum_due_amount'] : 0.00;
            $customMessage = isset($data['custom_message']) ? trim($data['custom_message']) : 'Please complete your pending payments to view your assignment and exam grades.';

            $sql = "UPDATE `grade_payment_gate_settings` 
                    SET `is_active` = ?, 
                        `restriction_mode` = ?, 
                        `minimum_due_amount` = ?, 
                        `custom_message` = ?, 
                        `updated_at` = NOW() 
                    WHERE id = 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$isActive, $restrictionMode, $minimumDueAmount, $customMessage]);

            return [
                'success' => true,
                'message' => 'Payment gate settings updated successfully',
                'settings' => $this->getSettings()
            ];
        } catch (\PDOException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Checks if a given balance is locked according to current settings.
     * @param float $balance
     * @return array [is_locked => bool, settings => array]
     */
    public function evaluateLock($balance)
    {
        $settings = $this->getSettings();
        if (!$settings['is_active']) {
            return [
                'is_locked' => false,
                'reason' => 'gate_disabled',
                'settings' => $settings
            ];
        }

        $balanceFloat = (float)$balance;
        $minDue = (float)$settings['minimum_due_amount'];

        if ($settings['restriction_mode'] === 'fully_paid') {
            // Strictly 0 due
            $isLocked = $balanceFloat > 0.00;
        } else {
            // Minimum due allowed threshold
            $isLocked = $balanceFloat > $minDue;
        }

        return [
            'is_locked' => $isLocked,
            'balance' => $balanceFloat,
            'threshold' => $minDue,
            'settings' => $settings
        ];
    }
}
