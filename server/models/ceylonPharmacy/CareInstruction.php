<?php
// models/ceylonPharmacy/CareInstruction.php

class CareInstruction
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareInstructions()
    {
        $stmt = $this->pdo->query('SELECT ci.*, cip.instruction FROM care_instruction ci JOIN care_instruction_pre cip ON ci.content = cip.id');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCareInstructionById($id)
    {
        $stmt = $this->pdo->prepare('SELECT ci.*, cip.instruction FROM care_instruction ci JOIN care_instruction_pre cip ON ci.content = cip.id WHERE ci.id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getInstructionsByPrescriptionAndCover($presCode, $coverId)
    {
        $stmt = $this->pdo->prepare('SELECT ci.*, cip.instruction FROM care_instruction ci JOIN care_instruction_pre cip ON ci.content = cip.id WHERE ci.pres_code LIKE ? AND ci.cover_id = ?');
        $stmt->execute([$presCode, $coverId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getWrongInstructions($coverId, $limit = 5)
    {
        $query = 'SELECT ci.*, cip.instruction FROM care_instruction ci JOIN care_instruction_pre cip ON ci.content = cip.id WHERE ci.cover_id != ? ORDER BY RAND() LIMIT ' . (int)$limit;
        $stmt = $this->pdo->prepare($query);
        $stmt->execute([$coverId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function createCareInstruction($data)
    {
        $presCode = $data['pres_code'];
        $coverId = $data['cover_id'];
        $instructions = $data['instructions']; // Expects an array of instruction content IDs

        $this->pdo->beginTransaction();

        try {
            // Step 1: Delete existing instructions for the pres_code and cover_id
            $deleteStmt = $this->pdo->prepare(
                'DELETE FROM care_instruction WHERE pres_code = ? AND cover_id = ?'
            );
            $deleteStmt->execute([$presCode, $coverId]);

            // Step 2: Insert the new instructions
            $insertStmt = $this->pdo->prepare(
                'INSERT INTO care_instruction (pres_code, cover_id, content) VALUES (?, ?, ?)'
            );

            $insertedIds = [];
            if (is_array($instructions) && !empty($instructions)) {
                foreach ($instructions as $contentId) {
                    // Ensure contentId is not null or empty
                    if (!empty($contentId)) {
                        $insertStmt->execute([$presCode, $coverId, $contentId]);
                        $insertedIds[] = $this->pdo->lastInsertId();
                    }
                }
            }

            $this->pdo->commit();

            return $insertedIds;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            // In a real app, you would log the error
            error_log($e->getMessage());
            return false;
        }
    }

    public function getShuffledInstructions($presCode, $coverId)
    {
        $correctInstructions = $this->getInstructionsByPrescriptionAndCover($presCode, $coverId);
        $wrongInstructions = $this->getWrongInstructions($coverId);

        $allInstructions = array_merge($correctInstructions, $wrongInstructions);
        shuffle($allInstructions);

        return $allInstructions;
    }

}
