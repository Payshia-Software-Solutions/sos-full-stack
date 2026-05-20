<?php

class Reports
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getUserInfo($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM user_full_details WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStudentContactsByBatch($batch_id)
    {
        $sql = "
            SELECT 
                u.id AS user_id, 
                u.username, 
                u.fname, 
                u.lname, 
                u.batch_id, 
                u.phone, 
                u.email,
                uf.address_line_1, 
                uf.address_line_2, 
                uf.city AS original_city, 
                uf.district AS original_district,
                uf.telephone_1, 
                uf.telephone_2,
                c.name_en AS city_name,
                d.name_en AS district_name
            FROM student_course sc
            INNER JOIN user_full_details uf ON sc.student_id = uf.student_id
            INNER JOIN users u ON u.username = uf.username
            LEFT JOIN cities c ON 
                (uf.city REGEXP '^[0-9]+$' AND c.id = CAST(uf.city AS UNSIGNED))
                OR 
                (uf.city NOT REGEXP '^[0-9]+$' AND LOWER(c.name_en) = LOWER(uf.city))
            LEFT JOIN districts d ON c.district_id = d.id
            WHERE sc.course_code = :batch_id AND u.status = 'Active'
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['batch_id' => $batch_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
