<?php

require_once './models/ActivityLogs.php';

class ActivityLogController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new ActivityLogs($pdo);
    }

    public function getAllRecords()
    {
        $records = $this->model->GetAllActivityLogs();
        echo json_encode($records);
    }

    public function getActivityLogById($id)
    {
        $record = $this->model->getActivityLogById($id);
        echo json_encode($record);
    }

    public function createActivityLog()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createActivityLog($data);
        echo json_encode(['status' => 'ActivityLog created']);
    }

    public function updateActivityLog($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateActivityLog($id, $data);
        echo json_encode(['status' => 'ActivityLog updated']);
    }


    public function deleteActivityLog($id)
    {
        $this->model->deleteActivityLog($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }
}

?>
