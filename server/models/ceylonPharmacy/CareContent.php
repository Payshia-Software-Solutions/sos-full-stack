<?php
// models/ceylonPharmacy/CareContent.php

class CareContent
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareContents()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_content');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCareContentById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_content WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCareContent($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_content (pres_code, cover_id, content) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['pres_code'],
            $data['cover_id'],
            $data['content']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateCareContent($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_content SET pres_code = ?, cover_id = ?, content = ? WHERE id = ?');
        $stmt->execute([
            $data['pres_code'],
            $data['cover_id'],
            $data['content'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function updateCareContentByPresCodeAndCoverId($presCode, $coverId, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_content SET content = ? WHERE pres_code = ? AND cover_id = ?');
        $stmt->execute([
            $data['content'],
            $presCode,
            $coverId
        ]);
        return $stmt->rowCount();
    }

    public function deleteCareContent($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_content WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    public function deleteCareContentByPresCodeAndCoverId($presCode, $coverId)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_content WHERE pres_code = ? AND cover_id = ?');
        $stmt->execute([$presCode, $coverId]);
        return $stmt->rowCount();
    }

    public function getCareContentByPresCode($presCode)
    {
        $stmt = $this->pdo->prepare('SELECT cover_id, content FROM care_content WHERE pres_code = ?');
        $stmt->execute([$presCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
