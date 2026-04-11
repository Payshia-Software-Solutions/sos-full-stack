<?php
// models/TransactionPayment.php

class TransactionPayment
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllPayments()
    {
        $stmt = $this->pdo->query("SELECT * FROM transcation_payments WHERE record_status = 'Active' ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function getPaymentById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM transcation_payments WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getPaymentsByStudentNumber($studentNumber)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM transcation_payments WHERE student_number = ? ");
        $stmt->execute([$studentNumber]);
        return $stmt->fetchAll();
    }

    public function getPaymentsByStudentNumberAndReference($studentNumber, $referenceKey)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM transcation_payments WHERE student_number = ? AND reference_key = ? AND record_status = 'Active'");
        $stmt->execute([$studentNumber, $referenceKey]);
        return $stmt->fetchAll();
    }

    public function getPaidAmount($studentNumber, $referenceKey)
    {
        $stmt = $this->pdo->prepare("SELECT SUM(payment_amount) AS total_paid FROM transcation_payments WHERE student_number = ? AND reference_key = ? AND record_status = 'Active'");
        $stmt->execute([$studentNumber, $referenceKey]);
        $result = $stmt->fetch();
        return $result ? $result['total_paid'] : 0;
    }


    public function createPayment($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO transcation_payments (transaction_id, rec_time, reference, ref_id, created_by, created_at, student_number, transaction_type, reference_key, payment_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $data['transaction_id'],
            $data['rec_time'],
            $data['reference'],
            $data['ref_id'],
            $data['created_by'],
            $data['created_at'],
            $data['student_number'],
            $data['transaction_type'],
            $data['reference_key'],
            $data['payment_amount'],
        ]);
    }

    public function updatePayment($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE transcation_payments SET transaction_id = ?, rec_time = ?, reference = ?, ref_id = ?, created_by = ?, created_at = ?, student_number = ?, transaction_type = ?, reference_key = ?, payment_amount = ? WHERE id = ?");
        return $stmt->execute([
            $data['transaction_id'],
            $data['rec_time'],
            $data['reference'],
            $data['ref_id'],
            $data['created_by'],
            $data['created_at'],
            $data['student_number'],
            $data['transaction_type'],
            $data['reference_key'],
            $data['payment_amount'],
            $id
        ]);
    }

    public function deletePayment($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM transcation_payments WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function InactivePayment($id)
    {
        $stmt = $this->pdo->prepare("UPDATE transcation_payments SET record_status = 'Deleted' WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
