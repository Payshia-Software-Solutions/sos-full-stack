<?php


class ActivityLogs
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function GetAllActivityLogs()
    {
        $stmt = $this->pdo->query("SELECT * FROM activitylogs");
        return $stmt->fetchAll();
    }

    public function getActivityLogById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `activitylogs` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createActivityLog($data)
    {
    $stmt = $this->pdo->prepare("INSERT INTO `activitylogs` (`ip`, `activity`, `remark`, `createdby`, `createdat`) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['ip'],
        $data['activity'],
        $data['remark'],
        $data['createdby'],
        $data['createdat'],
    ]);
    }


    public function updateActivityLog($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `activitylogs` SET `ip` = ?, `activity` = ?, `remark` = ?, `createdby` = ?, `createdat` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['ip'],
            $data['activity'],
            $data['remark'],
            $data['createdby'],
            $data['createdat'],
            $id
        ]);
    }

    public function deleteActivityLog($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `activitylogs` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}

?>