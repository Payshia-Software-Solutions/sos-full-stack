<?php
// controllers/BankController.php

require_once './models/Bank.php';

class BankController
{
    private $bank;

    public function __construct()
    {
        global $pdo;
        $this->bank = new Bank($pdo);
    }

    public function getAllRecords()
    {
        $banks = $this->bank->getAllBanks();
        echo json_encode($banks);
    }

    public function getRecordById($id)
    {
        $bank = $this->bank->getBankById($id);
        echo json_encode($bank);
    }

    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['bank_code']) || !isset($data['bank_name'])) {
            echo json_encode(['error' => 'Invalid data']);
            return;
        }

        $this->bank->createBank($data['bank_code'], $data['bank_name']);
        echo json_encode(['message' => 'Bank created successfully']);
    }

    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['bank_code']) || !isset($data['bank_name'])) {
            echo json_encode(['error' => 'Invalid data']);
            return;
        }

        $this->bank->updateBank($id, $data['bank_code'], $data['bank_name']);
        echo json_encode(['message' => 'Bank updated successfully']);
    }

    public function deleteRecord($id)
    {
        $this->bank->deleteBank($id);
        echo json_encode(['message' => 'Bank deleted successfully']);
    }
}
