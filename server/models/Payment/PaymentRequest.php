<?php

class PaymentRequest
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM payment_request");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
{
    // Use a JOIN to get the reason from payment_reason table based on the reason id
    $sql = "
        SELECT pr.id, pr.created_by, pr.created_at, pr.course_id, pr.image, 
               pr.extra_note, pr.status, pr.reference_number, pr.amount, prr.reason AS reason
        FROM payment_request pr
        JOIN payment_reasons prr ON pr.reason = prr.id
        WHERE pr.id = :id
    ";
    
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute(['id' => $id]);

    // Fetch the record, reason included from the payment_reason table
    return $stmt->fetch(PDO::FETCH_ASSOC);
}


    public function createRecord($data, $imagePath)
    {
        // Check for required fields
        $requiredFields = ['created_by', 'created_at', 'course_id', 'reason', 'extra_note', 'reference_number', 'amount'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                throw new Exception("The '{$field}' field is required.");
            }
        }
    
        // If status is not provided, set it to 0
        if (!isset($data['status'])) {
            $data['status'] = 0;
        }
    
        // Set the image path
        $data['image'] = $imagePath;
    
        // Prepare the SQL statement with placeholders
        $sql = "INSERT INTO payment_request (created_by, created_at, course_id, image, reason, extra_note, status, reference_number, amount) 
                VALUES (:created_by, :created_at, :course_id, :image, :reason, :extra_note, :status, :reference_number, :amount)";
    
        // Prepare the statement
        $stmt = $this->pdo->prepare($sql);
    
        // Execute the query with the data array
        $stmt->execute([
            'created_by' => $data['created_by'],
            'created_at' => $data['created_at'],
            'course_id' => $data['course_id'],
            'image' => $data['image'],
            'reason' => $data['reason'],
            'extra_note' => $data['extra_note'],
            'status' => $data['status'],
            'reference_number' => $data['reference_number'],
            'amount' => $data['amount'],
        ]);
    }
    
    

    public function updateRecord($id, $data, $imagePath = null)
    {
        // Check if 'created_by' is set and not null
        if (empty($data['created_by'])) {
            throw new Exception("The 'created_by' field is required.");
        }
    
        // Check if 'created_at' is set and not null
        if (empty($data['created_at'])) {
            throw new Exception("The 'created_at' field is required.");
        }
    
        // Prepare the SQL query for updating the record
        $sql = "UPDATE payment_request SET 
                    created_by = :created_by, 
                    created_at = :created_at, 
                    course_id = :course_id, 
                    image = :image, 
                    reason = :reason,
                    extra_note = :extra_note,
                    status = :status,
                    reference_number = :reference_number,
                    amount = :amount
                WHERE id = :id";
    
        // Prepare the statement
        $stmt = $this->pdo->prepare($sql);
    
        // Execute the query with the provided data
        $stmt->execute([
            'created_by' => $data['created_by'],
            'created_at' => $data['created_at'],
            'course_id' => $data['course_id'],
            'image' => $imagePath ?? $data['image'],
            'reason' => $data['reason'],
            'extra_note' => $data['extra_note'],
            'status' => $data['status'],
            'reference_number' => $data['reference_number'],
            'id' => $id,
            'amount' => $data['amount'],
        ]);
    }
    

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM payment_request WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
    function getRecordByUserName($created_by)
    {
        $stmt = $this->pdo->prepare("
        SELECT pr.*, prn.reason, DATE(pr.created_at) AS created_at
        FROM payment_request pr
        JOIN payment_reasons prn ON pr.reason = prn.id
        WHERE pr.created_by = :created_by
    ");
        
        $stmt->execute(['created_by' => $created_by]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStatistics()
{
    // Fetch the payment statuses from the payment_request table
    $sql = "SELECT status FROM payment_request";
    $stmt = $this->pdo->query($sql);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Initialize counters
    $totalCount = count($payments);  // Total records count
    $pendingCount = 0;
    $approvedCount = 0;

    // Loop through each payment and count based on status
    foreach ($payments as $payment) {
        if ($payment['status'] == 0) {
            $pendingCount++;
        } elseif ($payment['status'] == 1) {
            $approvedCount++;
        }
    }

    // Return the counts as an array (you can send it as JSON later)
    return [
        'totalCount' => $totalCount,
        'pendingCount' => $pendingCount,
        'approvedCount' => $approvedCount
    ];
}

public function getByCourseCode($courseCode)
{
    $stmt = $this->pdo->prepare("
        SELECT pr.*, prn.reason, DATE(pr.created_at) AS created_at
        FROM payment_request pr
        JOIN payment_reasons prn ON pr.reason = prn.id
        WHERE pr.course_id = :courseCode
    ");
    
    $stmt->execute(['courseCode' => $courseCode]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

public function getStatisticsByCourseCode($courseCode)
{
    // Fetch the payment statuses from the payment_request table
    $sql = "SELECT status FROM payment_request WHERE course_id = :courseCode";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute(['courseCode' => $courseCode]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Initialize counters
    $totalCount = count($payments);  // Total records count
    $pendingCount = 0;
    $approvedCount = 0;

    // Loop through each payment and count based on status
    foreach ($payments as $payment) {
        if ($payment['status'] == 0) {
            $pendingCount++;
        } elseif ($payment['status'] == 1) {
            $approvedCount++;
        }
    }    

    // Return the counts as an array (you can send it as JSON later)
    return [
        'totalCount' => $totalCount,
        'pendingCount' => $pendingCount,
        'approvedCount' => $approvedCount
    ];
}
    

}