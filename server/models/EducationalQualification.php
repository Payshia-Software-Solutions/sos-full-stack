<?php

class EducationalQualification
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTable();
    }

    private function ensureTable()
    {
        try {
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS `educational_qualifications` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `title_en` VARCHAR(255) NOT NULL,
                    `title_si` VARCHAR(255) NULL,
                    `title_ta` VARCHAR(255) NULL,
                    `display_order` INT DEFAULT 0,
                    `is_active` TINYINT(1) DEFAULT 1,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            // Seed default qualifications if empty
            $count = (int)$this->pdo->query("SELECT COUNT(*) FROM `educational_qualifications`")->fetchColumn();
            if ($count === 0) {
                $this->pdo->exec("
                    INSERT INTO `educational_qualifications` (`title_en`, `title_si`, `title_ta`, `display_order`, `is_active`) VALUES
                    ('G.C.E. O/L Qualified', 'සාමාන්‍ය පෙළ සමත් (G.C.E. O/L)', 'க.பொ.த சாதாரண தரம் தேர்ச்சி', 1, 1),
                    ('G.C.E. A/L (Bio / Maths)', 'උසස් පෙළ විද්‍යා අංශය (G.C.E. A/L Bio/Maths)', 'க.பொ.த உயர்தரம் (உயிரியல் / கணிதம்)', 2, 1),
                    ('G.C.E. A/L (Other Streams)', 'උසස් පෙළ වාණිජ / කලා / තාක්ෂණවේදය', 'க.பொ.த உயர்தரம் (ஏனைய துறைகள்)', 3, 1),
                    ('Currently working in a Pharmacy', 'දැනටමත් ඖෂධසලක සේවය කරන අයෙක් (Pharmacy Experience)', 'தற்போது மருந்தகத்தில் பணிபுரிபவர்', 4, 1),
                    ('Degree / Higher Diploma Holder', 'වෙනත් ඩිප්ලෝමා හෝ උපාධිධාරී (Degree / Diploma)', 'பட்டம் அல்லது உயர் டிப்ளோமா பெற்றவர்', 5, 1)
                ");
            }
        } catch (\Exception $e) {
            // Silently continue
        }
    }

    public function getAllRecords()
    {
        try {
            $stmt = $this->pdo->query("SELECT * FROM `educational_qualifications` WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) return $rows;
        } catch (\Exception $e) {}

        return [
            ['id' => '1', 'title_en' => 'G.C.E. O/L Qualified', 'title_si' => 'සාමාන්‍ය පෙළ සමත් (G.C.E. O/L)', 'title_ta' => 'க.பொ.த சாதாரண தரம் தேர்ச்சி', 'display_order' => 1, 'is_active' => 1],
            ['id' => '2', 'title_en' => 'G.C.E. A/L (Bio / Maths)', 'title_si' => 'උසස් පෙළ විද්‍යා අංශය (G.C.E. A/L Bio/Maths)', 'title_ta' => 'க.பொ.த உயர்தரம் (உயிரியல் / கணிதம்)', 'display_order' => 2, 'is_active' => 1],
            ['id' => '3', 'title_en' => 'G.C.E. A/L (Other Streams)', 'title_si' => 'උසස් පෙළ වාණිජ / කලා / තාක්ෂණවේදය', 'title_ta' => 'க.பொ.த உயர்தரம் (ஏனைய துறைகள்)', 'display_order' => 3, 'is_active' => 1],
            ['id' => '4', 'title_en' => 'Currently working in a Pharmacy', 'title_si' => 'දැනටමත් ඖෂධසලක සේවය කරන අයෙක් (Pharmacy Experience)', 'title_ta' => 'தற்போது மருந்தகத்தில் பணிபுரிபவர்', 'display_order' => 4, 'is_active' => 1],
            ['id' => '5', 'title_en' => 'Degree / Higher Diploma Holder', 'title_si' => 'වෙනත් ඩිප්ලෝමා හෝ උපාධිධාරී (Degree / Diploma)', 'title_ta' => 'பட்டம் அல்லது உயர் டிப்ளோமா பெற்றவர்', 'display_order' => 5, 'is_active' => 1],
        ];
    }

    public function getAllAdmin()
    {
        try {
            $stmt = $this->pdo->query("SELECT * FROM `educational_qualifications` ORDER BY display_order ASC, id ASC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return $this->getAllRecords();
        }
    }

    public function createRecord($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `educational_qualifications` (`title_en`, `title_si`, `title_ta`, `display_order`, `is_active`)
            VALUES (:title_en, :title_si, :title_ta, :display_order, :is_active)
        ");
        $stmt->execute([
            'title_en' => $data['title_en'],
            'title_si' => $data['title_si'] ?? '',
            'title_ta' => $data['title_ta'] ?? '',
            'display_order' => (int)($data['display_order'] ?? 0),
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateRecord($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE `educational_qualifications` SET 
                `title_en` = :title_en,
                `title_si` = :title_si,
                `title_ta` = :title_ta,
                `display_order` = :display_order,
                `is_active` = :is_active
            WHERE id = :id
        ");
        return $stmt->execute([
            'title_en' => $data['title_en'],
            'title_si' => $data['title_si'] ?? '',
            'title_ta' => $data['title_ta'] ?? '',
            'display_order' => (int)($data['display_order'] ?? 0),
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            'id' => $id,
        ]);
    }
}
