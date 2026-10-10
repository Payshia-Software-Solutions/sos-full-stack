<?php
require_once './models/Lead/Lead.php';

class LeadController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Lead($pdo);
    }

    // Get all leads with optional query filters
    public function getAll()
    {
        $filters = [
            'source' => isset($_GET['source']) ? $_GET['source'] : null,
            'student_type' => isset($_GET['student_type']) ? $_GET['student_type'] : null,
            'status' => isset($_GET['status']) ? $_GET['status'] : null,
            'assigned_to' => isset($_GET['assigned_to']) ? $_GET['assigned_to'] : null,
            'search' => isset($_GET['search']) ? $_GET['search'] : null,
        ];

        $leads = $this->model->getAllLeads($filters);
        echo json_encode($leads);
    }

    // Get single lead details with logs
    public function get($id)
    {
        $lead = $this->model->getLeadById($id);
        if ($lead) {
            echo json_encode($lead);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Lead not found']);
        }
    }

    // Create a new lead
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['full_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name is required']);
            return;
        }

        try {
            $leadId = $this->model->createLead($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Lead created successfully',
                'id' => $leadId
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Update lead details
    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['full_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name is required']);
            return;
        }

        try {
            $oldLead = $this->model->getLeadById($id);
            if (!$oldLead) {
                http_response_code(404);
                echo json_encode(['error' => 'Lead not found']);
                return;
            }

            // Perform update
            $this->model->updateLead($id, $data);

            // Log status change if status has been updated
            if (isset($data['status']) && $data['status'] !== $oldLead['status']) {
                $staffName = isset($data['editor_name']) ? $data['editor_name'] : 'Staff';
                $this->model->addLog(
                    $id, 
                    $staffName, 
                    'Status Changed', 
                    "Status updated from '{$oldLead['status']}' to '{$data['status']}'"
                );
            }

            // Log assignment change if assigned_to has been updated
            if (isset($data['assigned_to']) && $data['assigned_to'] !== $oldLead['assigned_to']) {
                $staffName = isset($data['editor_name']) ? $data['editor_name'] : 'Staff';
                $newAssignee = $data['assigned_to'] ? $data['assigned_to'] : 'Unassigned';
                $this->model->addLog(
                    $id, 
                    $staffName, 
                    'Lead Assigned', 
                    "Lead assigned to '{$newAssignee}'"
                );
            }

            echo json_encode(['message' => 'Lead updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Delete lead
    public function delete($id)
    {
        try {
            $lead = $this->model->getLeadById($id);
            if (!$lead) {
                http_response_code(404);
                echo json_encode(['error' => 'Lead not found']);
                return;
            }

            $this->model->deleteLead($id);
            echo json_encode(['message' => 'Lead deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Add a log entry manually
    public function addLog($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['action']) || empty($data['staff_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Action and Staff name are required']);
            return;
        }

        try {
            $lead = $this->model->getLeadById($id);
            if (!$lead) {
                http_response_code(404);
                echo json_encode(['error' => 'Lead not found']);
                return;
            }

            $notes = isset($data['notes']) ? $data['notes'] : null;
            $this->model->addLog($id, $data['staff_name'], $data['action'], $notes);
            
            http_response_code(201);
            echo json_encode(['message' => 'Log added successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // Get statistics for KPI dashboard
    public function getStats()
    {
        try {
            $stats = $this->model->getStats();
            echo json_encode($stats);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
