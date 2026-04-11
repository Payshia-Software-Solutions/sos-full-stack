<?php
// models/CertificationCenter/CcGraduationPackageItem.php

class CcGraduationPackageItem
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCcGraduationPackageItems()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_graduation_package_items`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCcGraduationPackageItemById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_graduation_package_items` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCcGraduationPackageItem($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `cc_graduation_package_items` (`item_name`, `created_at`, `created_by`, `is_active`) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['item_name'],
            $data['created_at'],
            $data['created_by'],
            $data['is_active']
        ]);
    }

    public function updateCcGraduationPackageItem($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `cc_graduation_package_items` SET `item_name` = ?, `created_at` = ?, `created_by` = ?, `is_active` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['item_name'],
            $data['created_at'],
            $data['created_by'],
            $data['is_active'],
            $id
        ]);
    }

    public function deleteCcGraduationPackageItem($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `cc_graduation_package_items` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
