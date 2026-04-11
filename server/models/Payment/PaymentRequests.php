<?php

class PaymentRequest
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

    // Insert a new payment request
    public function createRecord($data)
    {
        $sql = "INSERT INTO payment_requests 
                (unique_number, number_type, payment_reson, paid_amount, payment_reference, bank, branch, slip_path, paid_date, created_at, is_active, hash_value) 
                VALUES 
                (:unique_number, :number_type, :payment_reson, :paid_amount, :payment_reference, :bank, :branch, :slip_path, :paid_date, :created_at, :is_active, :hash_value)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Update an existing payment request
    public function updateRecord($id, $data)
    {
        $data['id'] = $id;

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
                    hash_value = :hash_value
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a payment request
    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM payment_requests WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
