<?php

class PaymentPortalRequest
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Fetch all payment requests
    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM payment_requests");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a payment request by ID
    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM payment_requests WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // Fetch a payment request by Ref
    public function getRecordByUnique($unique_number)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM payment_requests WHERE unique_number = :unique_number");
        $stmt->execute(['unique_number' => $unique_number]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPaymentRequestRecordsByReason($unique_number, $reason)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM payment_requests WHERE unique_number = :unique_number AND payment_reson = :reason");
        $stmt->execute(['unique_number' => $unique_number, 'reason' => $reason]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        // Check if 'payment_status' is set in the data array, if not set it to 'Pending'
        if (!isset($data['payment_status'])) {
            $data['payment_status'] = 'Pending';
        }

        // Prepare the INSERT SQL statement
        $sql = "INSERT INTO payment_requests 
                (unique_number, number_type, payment_reson, paid_amount, payment_reference, bank, branch, slip_path, paid_date, created_at, is_active, hash_value, payment_status) 
            VALUES 
                (:unique_number, :number_type, :payment_reson, :paid_amount, :payment_reference, :bank, :branch, :slip_path, :paid_date, :created_at, :is_active, :hash_value, :payment_status)";

        // Prepare and execute the query
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);

        // Get the last inserted ID
        $lastInsertId = $this->pdo->lastInsertId();

        // Fetch the inserted record
        $selectSql = "SELECT id, unique_number, number_type, payment_reson, paid_amount, payment_reference, bank, branch, slip_path, paid_date, created_at, is_active, hash_value, payment_status 
                  FROM payment_requests 
                  WHERE id = :id";
        $stmtSelect = $this->pdo->prepare($selectSql);
        $stmtSelect->execute(['id' => $lastInsertId]);

        // Return the inserted record
        return $stmtSelect->fetch(PDO::FETCH_ASSOC);
    }


    public function updateRecord($id, $data)
    {
        // Check if 'payment_status' is set in the data array, if not set it to 'Pending'
        if (!isset($data['payment_status'])) {
            $data['payment_status'] = 'Pending';
        }

        $data['id'] = $id;

        // Prepare the UPDATE SQL statement
        $sql = "UPDATE payment_requests SET 
                unique_number = :unique_number, 
                number_type = :number_type, 
                payment_reson = :payment_reson, 
                paid_amount = :paid_amount, 
                payment_reference = :payment_reference, 
                bank = :bank, 
                branch = :branch, 
                slip_path = :slip_path, 
                paid_date = :paid_date, 
                created_at = :created_at, 
                is_active = :is_active, 
                hash_value = :hash_value, 
                payment_status = :payment_status
            WHERE id = :id";

        // Prepare and execute the query
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);

        // Fetch the updated record
        $selectSql = "SELECT id, unique_number, number_type, payment_reson, paid_amount, payment_reference, bank, branch, slip_path, paid_date, created_at, is_active, hash_value, payment_status 
                  FROM payment_requests 
                  WHERE id = :id";
        $stmtSelect = $this->pdo->prepare($selectSql);
        $stmtSelect->execute(['id' => $id]);

        // Return the updated record
        return $stmtSelect->fetch(PDO::FETCH_ASSOC);
    }

    // Update payment status by ID
    public function updatePaymentStatus($id, $status)
    {
        $stmt = $this->pdo->prepare("UPDATE payment_requests SET payment_status = :status WHERE id = :id");
        $stmt->execute(['status' => $status, 'id' => $id]);

        // Fetch the updated record
        $selectSql = "SELECT id, unique_number, number_type, payment_reson, paid_amount, payment_reference, bank, branch, slip_path, paid_date, created_at, is_active, hash_value, payment_status 
                  FROM payment_requests 
                  WHERE id = :id";
        $stmtSelect = $this->pdo->prepare($selectSql);
        $stmtSelect->execute(['id' => $id]);

        // Return the updated record
        return $stmtSelect->fetch(PDO::FETCH_ASSOC);
    }


    // Delete a payment request
    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM payment_requests WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function checkHashDupplicate($generated_hash)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM payment_requests WHERE hash_value = ?");
        $stmt->execute([$generated_hash]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordByNumberType($numberType)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM payment_requests WHERE number_type = :number_type");
        $stmt->execute(['number_type' => $numberType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
