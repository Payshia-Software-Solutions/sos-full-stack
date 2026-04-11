<?php

class CertificateUserResult
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM certificate_user_result");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM certificate_user_result WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getRecordByKeys($index_number, $course_code, $title_id)
    {
        // SQL query to select the record based on the provided parameters
        $sql = "SELECT * FROM certificate_user_result 
                WHERE index_number = :index_number 
                AND course_code = :course_code 
                AND title_id = :title_id";

        // Prepare and execute the query with the provided parameters
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'index_number' => $index_number,
            'course_code' => $course_code,
            'title_id' => $title_id
        ]);

        // Fetch the result and return it as an associative array
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function createRecord($data)
    {
        $sql = "INSERT INTO certificate_user_result (index_number, course_code, title_id, result, created_at, created_by)
                VALUES (:index_number, :course_code, :title_id, :result, :created_at, :created_by)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE certificate_user_result 
                SET index_number = :index_number, 
                    course_code = :course_code, 
                    title_id = :title_id, 
                    result = :result, 
                    created_at = :created_at, 
                    created_by = :created_by 
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM certificate_user_result WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function updateCertificateResult($indexNo, $courseCode, $titleId, $result, $createdBy)
    {
        $sql = "UPDATE `certificate_user_result` SET `result` = :result, `created_by` = :created_by WHERE `index_number` = :index_number AND `course_code` = :course_code AND `title_id` = :title_id";

        // Prepare the SQL query
        if ($stmt = $this->pdo->prepare($sql)) {
            // Bind parameters using named placeholders
            $stmt->bindParam(':result', $result, PDO::PARAM_STR);
            $stmt->bindParam(':created_by', $createdBy, PDO::PARAM_STR);
            $stmt->bindParam(':index_number', $indexNo, PDO::PARAM_STR);
            $stmt->bindParam(':course_code', $courseCode, PDO::PARAM_STR);
            $stmt->bindParam(':title_id', $titleId, PDO::PARAM_STR);

            // Execute the statement (no parameters passed here)
            if ($stmt->execute()) {
                return true; // Successfully updated
            } else {
                return false; // Failed to update
            }
        }

        return false; // SQL statement preparation failed
    }
}
