<?php

class Lead
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all leads with filtering, sorting, and search
    public function getAllLeads($filters = [])
    {
        $sql = "SELECT l.*, 
                (SELECT COUNT(*) FROM lead_logs WHERE lead_id = l.id) as log_count 
                FROM leads l WHERE 1=1";
        $params = [];

        if (!empty($filters['source'])) {
            $sql .= " AND l.source = :source";
            $params['source'] = $filters['source'];
        }

        if (!empty($filters['student_type'])) {
            $sql .= " AND l.student_type = :student_type";
            $params['student_type'] = $filters['student_type'];
        }

        if (!empty($filters['status'])) {
            $sql .= " AND l.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['assigned_to'])) {
            $sql .= " AND l.assigned_to = :assigned_to";
            $params['assigned_to'] = $filters['assigned_to'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (l.full_name LIKE :search OR l.email LIKE :search OR l.phone_number LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }

        // Default sort by created_at desc
        $sql .= " ORDER BY l.created_at DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a lead by ID
    public function getLeadById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM leads WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $lead = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($lead) {
            $lead['logs'] = $this->getLogs($id);
        }

        return $lead;
    }

    // Create a new lead
    public function createLead($data)
    {
        $sql = "INSERT INTO leads (full_name, student_number, email, phone_number, source, student_type, course_id, requirement_type, course_completed, issue_type, assigned_department, status, assigned_to, notes) 
                VALUES (:full_name, :student_number, :email, :phone_number, :source, :student_type, :course_id, :requirement_type, :course_completed, :issue_type, :assigned_department, :status, :assigned_to, :notes)";
        
        $params = [
            'full_name' => $data['full_name'],
            'student_number' => isset($data['student_number']) ? $data['student_number'] : null,
            'email' => isset($data['email']) ? $data['email'] : null,
            'phone_number' => isset($data['phone_number']) ? $data['phone_number'] : null,
            'source' => isset($data['source']) ? $data['source'] : 'Other',
            'student_type' => isset($data['student_type']) ? $data['student_type'] : 'New',
            'course_id' => isset($data['course_id']) ? $data['course_id'] : null,
            'requirement_type' => isset($data['requirement_type']) ? $data['requirement_type'] : null,
            'course_completed' => isset($data['course_completed']) ? $data['course_completed'] : null,
            'issue_type' => isset($data['issue_type']) ? $data['issue_type'] : null,
            'assigned_department' => isset($data['assigned_department']) ? $data['assigned_department'] : null,
            'status' => isset($data['status']) ? $data['status'] : 'Received',
            'assigned_to' => isset($data['assigned_to']) ? $data['assigned_to'] : null,
            'notes' => isset($data['notes']) ? $data['notes'] : null,
        ];

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        $leadId = $this->pdo->lastInsertId();
        
        // Add an initial log
        $this->addLog($leadId, isset($data['creator_name']) ? $data['creator_name'] : 'System', 'Lead Created', 'Lead was logged into the system.');
        
        return $leadId;
    }

    // Update an existing lead
    public function updateLead($id, $data)
    {
        $sql = "UPDATE leads SET 
                    full_name = :full_name,
                    student_number = :student_number,
                    email = :email,
                    phone_number = :phone_number,
                    source = :source,
                    student_type = :student_type,
                    course_id = :course_id,
                    requirement_type = :requirement_type,
                    course_completed = :course_completed,
                    issue_type = :issue_type,
                    assigned_department = :assigned_department,
                    status = :status,
                    assigned_to = :assigned_to,
                    notes = :notes
                WHERE id = :id";
        
        $params = [
            'id' => $id,
            'full_name' => $data['full_name'],
            'student_number' => isset($data['student_number']) ? $data['student_number'] : null,
            'email' => isset($data['email']) ? $data['email'] : null,
            'phone_number' => isset($data['phone_number']) ? $data['phone_number'] : null,
            'source' => isset($data['source']) ? $data['source'] : 'Other',
            'student_type' => isset($data['student_type']) ? $data['student_type'] : 'New',
            'course_id' => isset($data['course_id']) ? $data['course_id'] : null,
            'requirement_type' => isset($data['requirement_type']) ? $data['requirement_type'] : null,
            'course_completed' => isset($data['course_completed']) ? $data['course_completed'] : null,
            'issue_type' => isset($data['issue_type']) ? $data['issue_type'] : null,
            'assigned_department' => isset($data['assigned_department']) ? $data['assigned_department'] : null,
            'status' => isset($data['status']) ? $data['status'] : 'Received',
            'assigned_to' => isset($data['assigned_to']) ? $data['assigned_to'] : null,
            'notes' => isset($data['notes']) ? $data['notes'] : null,
        ];

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
    }

    // Delete a lead by ID
    public function deleteLead($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM leads WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Add a log entry for follow-ups/actions
    public function addLog($leadId, $staffName, $action, $notes = null)
    {
        $sql = "INSERT INTO lead_logs (lead_id, staff_name, action, notes) 
                VALUES (:lead_id, :staff_name, :action, :notes)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'lead_id' => $leadId,
            'staff_name' => $staffName,
            'action' => $action,
            'notes' => $notes
        ]);
    }

    // Get all logs for a lead
    public function getLogs($leadId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM lead_logs WHERE lead_id = :lead_id ORDER BY created_at DESC");
        $stmt->execute(['lead_id' => $leadId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get Lead statistics for KPI Dashboard
    public function getStats()
    {
        // Total Leads
        $totalStmt = $this->pdo->query("SELECT COUNT(*) FROM leads");
        $totalLeads = (int)$totalStmt->fetchColumn();

        // Status Counts
        $statusStmt = $this->pdo->query("SELECT status, COUNT(*) as count FROM leads GROUP BY status");
        $statuses = $statusStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Source Counts
        $sourceStmt = $this->pdo->query("SELECT source, COUNT(*) as count FROM leads GROUP BY source");
        $sources = $sourceStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Type Counts
        $typeStmt = $this->pdo->query("SELECT student_type, COUNT(*) as count FROM leads GROUP BY student_type");
        $types = $typeStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Conversion Rate: (Registration Completed + Payment Verified + Enrolled) / Total Leads
        $convertedStmt = $this->pdo->query("
            SELECT COUNT(*) FROM leads 
            WHERE status IN ('Registration Completed', 'Payment Verified', 'Enrolled', 'Course Started')
        ");
        $convertedCount = (int)$convertedStmt->fetchColumn();
        $conversionRate = $totalLeads > 0 ? round(($convertedCount / $totalLeads) * 100, 2) : 0;

        // Active Students count (leads with Ongoing status, or Active status)
        $activeStmt = $this->pdo->query("SELECT COUNT(*) FROM leads WHERE student_type = 'Ongoing'");
        $ongoingCount = (int)$activeStmt->fetchColumn();

        // Follow-ups pending (leads in 'Follow-up' status)
        $followUpStmt = $this->pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'Follow-up'");
        $followUpCount = (int)$followUpStmt->fetchColumn();

        return [
            'total_leads' => $totalLeads,
            'statuses' => $statuses,
            'sources' => $sources,
            'types' => $types,
            'conversion_rate' => $conversionRate,
            'ongoing_count' => $ongoingCount,
            'follow_up_count' => $followUpCount,
            'converted_count' => $convertedCount
        ];
    }
}
