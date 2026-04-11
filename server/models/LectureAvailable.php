<?php

class LectureAvailable
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllLectures()
    {
        $stmt = $this->pdo->query("SELECT * FROM lecture_available");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAvailableLectures()
{
    $stmt = $this->pdo->query("SELECT * FROM lecture_available WHERE is_available = 1");
    return $stmt->fetchAll(PDO::FETCH_ASSOC); // Fetch all available lectures
}

public function getAvailableLecturesWithUserNames()
{
    $sql = "
    SELECT la.id, la.is_available, la.lecture_id, 
       CONCAT(ufd.first_name, ' ', ufd.last_name) AS full_name,
       CONCAT(
           COALESCE(ufd.address_line_1, ''), ', ',
           COALESCE(ufd.address_line_2, ''), ', ',
           COALESCE(ufd.city, '')
       ) AS full_address
FROM lecture_available la
JOIN user_full_details ufd ON la.lecture_id = ufd.id
WHERE la.is_available = 1;
";

    $stmt = $this->pdo->query($sql);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $results; // Fetch all available lectures with user names
}



    public function getLectureById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM lecture_available WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createLecture($data)
    {
        $sql = "INSERT INTO lecture_available (is_available, lecture_id) VALUES (:is_available, :lecture_id)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateLecture($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE lecture_available SET is_available = :is_available, lecture_id = :lecture_id WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteLecture($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM lecture_available WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}