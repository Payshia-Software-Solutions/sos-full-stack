<?php
require_once './models/SupportTicket.php';

class SupportTicketController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new SupportTicket($pdo);
    }

    // Get all ticket records
    public function getAllRecords()
    {
        $records = $this->model->getAllTickets();
        echo json_encode($records);
    }

    // Get a single ticket record by ID
    public function getRecordById($ticket_id)
    {
        $record = $this->model->getTicketById($ticket_id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Ticket not found']);
        }
    }

    // Get a single ticket record by ID
    public function getRecordByUsername($user_name)
    {
        $record = $this->model->getTicketByUsername($user_name);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Ticket not found']);
        }
    }

    // Get a single ticket record by ID
    public function getMainTicketsByUsername($user_name)
    {
        $record = $this->model->getMainTicketsByUsername($user_name);
        echo json_encode($record);
    }

    // Get Ticket Replies
    public function getTicketReplies($ticket_id)
    {
        $record = $this->model->getTicketReplies($ticket_id);
        echo json_encode($record);
    }

    // Create a new ticket record
    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['index_number']) && isset($data['subject']) && isset($data['department']) && isset($data['related_service']) && isset($data['ticket']) && isset($data['is_active']) && isset($data['to_index_number'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->model->createTicket($data);
            http_response_code(201);
            echo json_encode(['message' => 'Ticket created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    // Update an existing ticket record
    public function updateRecord($ticket_id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['index_number']) && isset($data['subject']) && isset($data['department']) && isset($data['related_service']) && isset($data['ticket']) && isset($data['is_active']) && isset($data['to_index_number'])) {
            $this->model->updateTicket($ticket_id, $data);
            echo json_encode(['message' => 'Ticket updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    // Delete a ticket record by ID
    public function deleteRecord($ticket_id)
    {
        $this->model->deleteTicket($ticket_id);
        echo json_encode(['message' => 'Ticket deleted successfully']);
    }
}
