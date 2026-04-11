<?php
class CourseContentTitle
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM course_content_title");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_content_title WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $sql = "INSERT INTO course_content_title 
            (course_code, title_id, resource_type, description, file_path, web_link, created_by, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['course_code'],
            $data['title_id'],
            $data['resource_type'],
            $data['description'],
            $data['file_path'],
            $data['web_link'],
            $data['created_by']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, array $data)
    {
        $sql = "UPDATE course_content_title 
                SET course_code = ?, title_id = ?, resource_type = ?, description = ?, file_path = ?, web_link = ?, created_by = ?
                WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            $data['course_code'],
            $data['title_id'],
            $data['resource_type'],
            $data['description'],
            $data['file_path'],
            $data['web_link'],
            $data['created_by'],
            $id
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM course_content_title WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
