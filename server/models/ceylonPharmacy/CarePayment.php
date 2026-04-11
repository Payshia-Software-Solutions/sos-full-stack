<?php
// models/ceylonPharmacy/CarePayment.php

class CarePayment
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCarePayments()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_payment');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCarePaymentById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_payment WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createOrUpdatePayment($data)
    {
        // Check if a record with the same PresCode already exists
        $stmt = $this->pdo->prepare('SELECT id FROM care_payment WHERE PresCode = :PresCode LIMIT 1');
        $stmt->execute(['PresCode' => $data['PresCode']]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // Record exists, update all records with the matching PresCode
            $stmt = $this->pdo->prepare(
                'UPDATE care_payment SET value = :value WHERE PresCode = :PresCode'
            );
            $stmt->execute([
                ':value' => $data['value'],
                ':PresCode' => $data['PresCode']
            ]);

            if ($stmt->rowCount() > 0) {
                return ['status' => 'updated', 'PresCode' => $data['PresCode']];
            } else {
                return ['status' => 'unchanged', 'PresCode' => $data['PresCode']];
            }
        } else {
            // Record does not exist, create a new one
            $stmt = $this->pdo->prepare(
                'INSERT INTO care_payment (PresCode, value, created_at) VALUES (:PresCode, :value, NOW())'
            );
            $stmt->execute([
                ':PresCode' => $data['PresCode'],
                ':value' => $data['value']
            ]);
            $newId = $this->pdo->lastInsertId();
            return ['status' => 'created', 'id' => $newId];
        }
    }

    public function updateCarePayment($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_payment SET PresCode = ?, value = ?, created_at = ? WHERE id = ?');
        $stmt->execute([
            $data['PresCode'],
            $data['value'],
            $data['created_at'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function deleteCarePayment($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_payment WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    public function getLastRecordByPresCode($presCode)
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `PresCode`, `value`, `created_at` FROM `care_payment` WHERE `PresCode` = ? ORDER BY `id` DESC LIMIT 1");
        $stmt->execute([$presCode]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
