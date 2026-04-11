<?php
// models/WordList.php
require_once './models/EnWordSubmission.php';

class WordList
{
    private $pdo;
    private $submissionModel;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->submissionModel = new EnWordSubmission($pdo); // instantiate the other model
    }

    // Create a new word
    public function createWord($word_name, $word_tip, $word_img, $word_type, $word_status, $created_by, $created_at)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO en_word_list (word_name, word_tip, word_img, word_type, word_status, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$word_name, $word_tip, $word_img, $word_type, $word_status, $created_by, $created_at]);

        return $this->pdo->lastInsertId();
    }

    // Get all words
    public function getAllWords()
    {
        $stmt = $this->pdo->query("SELECT * FROM en_word_list");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActiveAllWords()
    {
        $stmt = $this->pdo->query("SELECT * FROM en_word_list WHERE word_status = 'Active'");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get word by ID
    public function getWordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM en_word_list WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function getWordForGame($studentNumber)
    {
        // Get all correct submissions by the student
        $submissions = $this->submissionModel->getCorrectSubmissionsByStudent($studentNumber);

        // Count correct submissions per word_id
        $correctCounts = [];
        foreach ($submissions as $submission) {
            $wordId = $submission['word_id'];
            if (!isset($correctCounts[$wordId])) {
                $correctCounts[$wordId] = 0;
            }
            $correctCounts[$wordId]++;
        }

        // Fetch all active words
        $stmt = $this->pdo->prepare("SELECT * FROM en_word_list WHERE word_status = 'Active'");
        $stmt->execute();
        $allWords = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Filter eligible words based on correct submission counts
        $eligibleWords = array_filter($allWords, function ($word) use ($correctCounts) {
            $wordId = $word['id'];
            $type = $word['word_type'];
            $count = isset($correctCounts[$wordId]) ? $correctCounts[$wordId] : 0;

            if ($type === 'Basic' && $count >= 10) return false;
            if ($type === 'Intermediate' && $count >= 15) return false;
            if ($type === 'Advanced' && $count >= 20) return false;

            return true;
        });

        // Return a random eligible word with 4 options
        if (!empty($eligibleWords)) {
            $correctWord = $eligibleWords[array_rand($eligibleWords)];

            // Exclude correct word from options list
            $incorrectOptions = array_filter($allWords, function ($word) use ($correctWord) {
                return $word['id'] !== $correctWord['id'];
            });

            // Shuffle and pick 3 incorrect answers
            shuffle($incorrectOptions);
            $threeIncorrect = array_slice($incorrectOptions, 0, 3);

            // Prepare all options
            $answers = array_merge([$correctWord], $threeIncorrect);
            shuffle($answers); // Randomize option order

            return [
                'question' => $correctWord['word_name'],
                'word_tip' => $correctWord['word_tip'],
                'word_img' => $correctWord['word_img'],
                'word_type' => $correctWord['word_type'],
                'word_id' => $correctWord['id'],
                'options' => array_map(function ($word) {
                    return [
                        'id' => $word['id'],
                        'text' => $word['word_name']
                    ];
                }, $answers)
            ];
        }

        // No eligible words found
        return null;
    }



    // Update a word
    public function updateWord($id, $word_name, $word_tip, $word_img, $word_type, $word_status)
    {
        $stmt = $this->pdo->prepare("
            UPDATE en_word_list 
            SET word_name = ?, word_tip = ?, word_img = ?, word_type = ?, word_status = ?
            WHERE id = ?
        ");
        return $stmt->execute([$word_name, $word_tip, $word_img, $word_type, $word_status, $id]);
    }

    // Delete a word
    public function deleteWord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM en_word_list WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
