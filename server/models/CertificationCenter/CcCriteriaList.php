<?php
// models/CertificationCenter/CcCriteriaList.php

class CcCriteriaList
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCriteriaLists()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_criteria_list`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCriteriaListById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_criteria_list` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCriteriaList($data)
    {
        try {
            $created_at = isset($data['created_at']) ? $data['created_at'] : date('Y-m-d H:i:s');
            $created_by = isset($data['created_by']) ? $data['created_by'] : 'Admin';

            $stmt = $this->pdo->prepare("INSERT INTO `cc_criteria_list` (`list_name`, `moq`, `created_at`, `created_by`, `is_active`) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['list_name'],
                $data['moq'],
                $created_at,
                $created_by,
                $data['is_active']
            ]);
        } catch (Exception $e) {
            throw new Exception('Failed to create criteria list: ' . $e->getMessage());
        }
    }

    public function updateCriteriaList($id, $data)
    {
        // For updates, we don't necessarily want to overwrite created_at or created_by unless provided
        if (isset($data['created_at']) && isset($data['created_by'])) {
            $stmt = $this->pdo->prepare("UPDATE `cc_criteria_list` SET `list_name` = ?, `moq` = ?, `created_at` = ?, `created_by` = ?, `is_active` = ? WHERE `id` = ?");
            $stmt->execute([
                $data['list_name'],
                $data['moq'],
                $data['created_at'],
                $data['created_by'],
                $data['is_active'],
                $id
            ]);
        } else {
            $stmt = $this->pdo->prepare("UPDATE `cc_criteria_list` SET `list_name` = ?, `moq` = ?, `is_active` = ? WHERE `id` = ?");
            $stmt->execute([
                $data['list_name'],
                $data['moq'],
                $data['is_active'],
                $id
            ]);
        }
        return ['message' => 'Criteria List updated successfully'];
    }

    public function deleteCriteriaList($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `cc_criteria_list` WHERE `id` = ?");
        $stmt->execute([$id]);
    }

    function getCriteriaGroupDetails($groupId, $pdo)
    {
        // SQL Query
        $sql = "
            SELECT 
                JSON_EXTRACT(cg.criteria_group, CONCAT('$[', n.row_index, '].title')) AS title,
                JSON_EXTRACT(cg.criteria_group, CONCAT('$[', n.row_index, '].moq')) AS moq,
                cl.list_name
            FROM 
                cc_criteria_group cg
            CROSS JOIN 
                (SELECT 0 AS row_index UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) n -- Adjust range for expected JSON array size
            LEFT JOIN 
                cc_criteria_list cl
            ON 
                JSON_UNQUOTE(JSON_EXTRACT(cg.criteria_group, CONCAT('$[', n.row_index, '].title'))) = cl.id
            WHERE 
                cg.id = :groupId;
        ";

        try {
            // Prepare the statement
            $stmt = $pdo->prepare($sql);

            // Bind the parameter
            $stmt->bindParam(':groupId', $groupId, PDO::PARAM_INT);

            // Execute the query
            $stmt->execute();

            // Fetch results
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format the results (optional)
            $formattedResults = [];
            foreach ($results as $row) {
                $formattedResults[] = [
                    'title' => isset($row['title']) ? json_decode($row['title'], true) : null, // Decode JSON value
                    'moq' => $row['moq'] ?? null,
                    'list_name' => $row['list_name'] ?? null,
                ];
            }

            return $formattedResults;
        } catch (PDOException $e) {
            // Handle exceptions
            return ['error' => $e->getMessage()];
        }
    }
}
