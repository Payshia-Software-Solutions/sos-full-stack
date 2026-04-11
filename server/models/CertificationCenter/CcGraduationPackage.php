<?php
// ./models/CertificationCenter/CcGraduationPackage.php

class CcGraduationPackage
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllGraduationPackages()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_graduation_package`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getGraduationPackageById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_graduation_package` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createGraduationPackage($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `cc_graduation_package` (`package_name`, `price`, `items`, `created_at`, `created_by`, `is_active`) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['package_name'],
            $data['price'],
            $data['items'],
            $data['created_at'],
            $data['created_by'],
            $data['is_active']
        ]);
    }

    public function updateGraduationPackage($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `cc_graduation_package` SET `package_name` = ?, `price` = ?, `items` = ?, `created_at` = ?, `created_by` = ?, `is_active` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['package_name'],
            $data['price'],
            $data['items'],
            $data['created_at'],
            $data['created_by'],
            $data['is_active'],
            $id
        ]);
    }

    public function deleteGraduationPackage($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `cc_graduation_package` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
