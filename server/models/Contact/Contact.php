<?php

class Contact
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all contacts
    public function getAllContacts()
    {
        $stmt = $this->pdo->query("SELECT * FROM contacts");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a contact by ID
    public function getContactById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM contacts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new contact
    public function createContact($data)
    {
        $sql = "INSERT INTO contacts (full_name, email, phone_number, subject_topic, message) 
                VALUES (:full_name, :email, :phone_number, :subject_topic, :message)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Update a contact by ID
    public function updateContact($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE contacts SET 
                    full_name = :full_name,
                    email = :email,
                    phone_number = :phone_number,
                    subject_topic = :subject_topic,
                    message = :message
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a contact by ID
    public function deleteContact($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM contacts WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
