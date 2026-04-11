<?php


class Levels
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function GetAllLevels()
    {
        $stmt = $this->pdo->query("SELECT * FROM levels");
        return $stmt->fetchAll();
    }

    public function getLevelById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `levels` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createLevel($data)
    {
    $stmt = $this->pdo->prepare("INSERT INTO `levels` (`batch_id`, `level_code`, `level_name`, `level_description`, `created_by`, `status_active`) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['batch_id'],
        $data['level_code'],
        $data['level_name'],
        $data['level_description'],
        $data['created_by'],
        $data['status_active'],
    ]);
    }


    public function updateLevel($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `levels` SET `batch_id` = ?, `level_code` = ?, `level_name` = ?, `level_description` = ?, `created_by` = ?, `status_active` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['batch_id'],
            $data['level_code'],
            $data['level_name'],
            $data['level_description'],
            $data['created_by'],
            $data['status_active'],
            $id
        ]);
    }

    public function deleteLevel($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `levels` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}

?>