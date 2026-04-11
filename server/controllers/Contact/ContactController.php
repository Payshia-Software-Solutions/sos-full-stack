<?php
require_once './models/Contact/Contact.php';

class ContactController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Contact($pdo);
    }

    // Get all contacts
    public function getAllContacts()
    {
        $contacts = $this->model->getAllContacts();
        echo json_encode($contacts);
    }

    // Get a single contact by ID
    public function getContactById($id)
    {
        $contact = $this->model->getContactById($id);
        if ($contact) {
            echo json_encode($contact);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contact not found']);
        }
    }

    // Create a new contact
    public function createContact()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateContactData($data)) {
            $this->model->createContact($data);
            http_response_code(201);
            echo json_encode(['message' => 'Contact created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid contact data']);
        }
    }

    // Update an existing contact
    public function updateContact($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateContactData($data)) {
            $this->model->updateContact($id, $data);
            echo json_encode(['message' => 'Contact updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid contact data']);
        }
    }

    // Delete a contact by ID
    public function deleteContact($id)
    {
        $this->model->deleteContact($id);
        echo json_encode(['message' => 'Contact deleted successfully']);
    }

    // Validate contact data
    private function validateContactData($data)
    {
        return isset($data['full_name'], $data['email'], $data['message']);
    }
}
