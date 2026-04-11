<?php
// models/ceylonPharmacy/MasterProduct.php

class MasterProduct
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllMasterProducts()
    {
        $stmt = $this->pdo->query('SELECT * FROM master_product');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMasterProductById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM master_product WHERE product_id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createMasterProduct($data)
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        $sql = "INSERT INTO master_product ($columns) VALUES ($placeholders)";
        $stmt = $this->pdo->prepare($sql);
        if ($stmt->execute($data)) {
            return $this->pdo->lastInsertId();
        }
        return false;
    }

    public function updateMasterProduct($id, $data)
    {
        $setPart = [];
        foreach ($data as $key => $value) {
            $setPart[] = "`$key` = :$key";
        }
        $setString = implode(', ', $setPart);
        $sql = "UPDATE master_product SET $setString WHERE product_id = :product_id";
        $stmt = $this->pdo->prepare($sql);
        $data['product_id'] = $id;
        $stmt->execute($data);
        return $stmt->rowCount();
    }

    public function updateMasterProductNameAndPrice($id, $name, $price)
    {
        $stmt = $this->pdo->prepare('UPDATE master_product SET ProductName = ?, DisplayName = ?, PrintName = ?, SellingPrice = ? WHERE product_id = ?');
        $stmt->execute([$name, $name, $name, $price, $id]);
        return $stmt->rowCount();
    }

    public function deleteMasterProduct($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM master_product WHERE product_id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
