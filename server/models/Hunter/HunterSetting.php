<?php

class HunterSetting
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM huner_setting");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordByName($setting_name)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM huner_setting WHERE setting_name = :setting_name");
        $stmt->execute(['setting_name' => $setting_name]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        $sql = "INSERT INTO huner_setting (setting_name, value) 
                VALUES (:setting_name, :value)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($setting_name, $data)
    {
        $data['setting_name'] = $setting_name;
        $sql = "UPDATE huner_setting SET 
                    value = :value
                WHERE setting_name = :setting_name";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($setting_name)
    {
        $stmt = $this->pdo->prepare("DELETE FROM huner_setting WHERE setting_name = :setting_name");
        $stmt->execute(['setting_name' => $setting_name]);
    }
}
