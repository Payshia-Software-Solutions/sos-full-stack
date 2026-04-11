<?php
// models/CertificationCenter/CcCertificateList.php

class CcCertificateList
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCertificates()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_certificate_list`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCertificateById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_certificate_list` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getCertificateByListName($list_name)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cc_certificate_list WHERE list_name = :list_name");
        $stmt->execute(['list_name' => $list_name]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function createCertificate($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `cc_certificate_list` (`list_name`, `criteria_group_id`, `price`, `created_at`, `created_by`, `is_active`) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['list_name'],
            $data['criteria_group_id'],
            $data['price'],
            $data['created_at'],
            $data['created_by'],
            $data['is_active']
        ]);
    }

    public function updateCertificate($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `cc_certificate_list` SET `list_name` = ?, `criteria_group_id` = ?, `price` = ?, `created_at` = ?, `created_by` = ?, `is_active` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['list_name'],
            $data['criteria_group_id'],
            $data['price'],
            $data['created_at'],
            $data['created_by'],
            $data['is_active'],
            $id
        ]);
    }

    public function deleteCertificate($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `cc_certificate_list` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
