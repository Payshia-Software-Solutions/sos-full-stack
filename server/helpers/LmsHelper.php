<?php
// helpers/LmsHelper.php

class LmsHelper
{
    public static function GenerateLmsIndexNumber($pdo, $batchCode)
    {
        // For new system, we expect course batches like PA24, etc. 
        // If batch code is an ID, we pad it. But if it's alphanumeric, we can use it directly.
        // In the old system: $batchCode = str_pad($batchCode, 2, '0', STR_PAD_LEFT);
        // Let's assume $batchCode is something like "24" or "PA24".
        // To keep it safe, if $batchCode is numeric, we pad it and prefix with PA.
        // Actually, let's just use the batchCode provided, but ensure it matches the pattern PA{batchCode}.
        
        // Extract numbers from the batch code if it contains text (e.g., CPCC34 -> 34)
        if (preg_match('/\d+/', $batchCode, $matches)) {
            $batchCode = $matches[0];
        }

        // Ensure numeric batch codes are padded to 2 digits
        if (is_numeric($batchCode)) {
            $batchCode = (int)$batchCode + 1; // Increment the batch number by 1 (e.g., 34 becomes 35)
            $batchCode = str_pad($batchCode, 2, '0', STR_PAD_LEFT);
        }

        $prefix = "PA" . $batchCode;
        // Calculate length of prefix to substring correctly
        $prefixLength = strlen($prefix) + 1;
        
        $sql = "SELECT MAX(CAST(SUBSTRING(username, $prefixLength) AS UNSIGNED)) AS maxId FROM users WHERE username LIKE :prefix";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'prefix' => $prefix . '%'
        ]);
        $row = $stmt->fetch();
        $maxId = $row && $row['maxId'] !== null ? (int)$row['maxId'] : 0;

        $newUserId = str_pad($maxId + 1, 3, '0', STR_PAD_LEFT);

        // Create User ID & User Name
        $userName = $prefix . $newUserId;
        $userId = "PA/" . $batchCode . "/" . $newUserId;

        // Check Availability
        $checkSql = "SELECT COUNT(*) AS count FROM users WHERE username = :username";
        $checkStmt = $pdo->prepare($checkSql);
        $checkStmt->execute(['username' => $userName]);
        $exists = $checkStmt->fetch()['count'] > 0;

        if ($exists) {
            // Fallback: just count all users and append that count
            $allSql = "SELECT COUNT(*) AS totalCount FROM users";
            $allStmt = $pdo->query($allSql);
            $totalCount = $allStmt->fetch()['totalCount'];

            $newUserId = str_pad($totalCount + 1, 3, '0', STR_PAD_LEFT);

            // Create User ID & User Name again
            $userName = $prefix . $newUserId;
            $userId = "PA/" . $batchCode . "/" . $newUserId;
        }

        return ['userName' => $userName, 'userId' => $userId];
    }
}
