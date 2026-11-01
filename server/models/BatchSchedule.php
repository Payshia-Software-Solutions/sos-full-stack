<?php

class BatchSchedule
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
                CREATE TABLE IF NOT EXISTS `batch_schedules` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `name_en` VARCHAR(255) NOT NULL,
                    `name_si` VARCHAR(255) NULL,
                    `name_ta` VARCHAR(255) NULL,
                    `days` VARCHAR(255) NULL,
                    `time_slot` VARCHAR(255) NULL,
                    `badge` VARCHAR(255) NULL,
                    `is_active` TINYINT(1) DEFAULT 1,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            // Seed default schedules if table is empty
            $count = (int)$this->pdo->query("SELECT COUNT(*) FROM `batch_schedules`")->fetchColumn();
            if ($count === 0) {
                $this->pdo->exec("
                    INSERT INTO `batch_schedules` (`name_en`, `name_si`, `name_ta`, `days`, `time_slot`, `badge`, `is_active`) VALUES
                    ('Weekend Batch (Saturday & Sunday)', 'සති අන්ත කණ්ඩායම (සෙනසුරාදා / ඉරිදා)', 'வார இறுதி தொகுதி (சனி மற்றும் ஞாயிறு)', 'Saturday & Sunday', '8.30 AM - 1.30 PM', 'Most Popular for Working Students', 1),
                    ('Weekday Batch (Tuesday & Thursday)', 'සතියේ දින සන්ධ්‍යා කණ්ඩායම (අඟහරුවාදා / බ්‍රහස්පතින්දා)', 'வார நாள் மாலை தொகுதி (செவ்வாய் மற்றும் வியாழன்)', 'Tuesday & Thursday', 'Evening Sessions (7.30 PM - 9.30 PM)', 'Convenient Online Sessions', 1),
                    ('Sunday Only Batch', 'ඉරිදා පමණක් පැවැත්වෙන කණ්ඩායම', 'ஞாயிறு மட்டும் தொகுதி', 'Sunday', '8.30 AM - 4.30 PM', 'Special Intensive Class', 1),
                    ('Full-Time Weekday Batch (Monday - Friday)', 'සතියේ දින පූර්ණ කාලීන කණ්ඩායම (සඳුදා - සිකුරාදා)', 'முழு நேர வார நாள் தொகுதி', 'Monday to Friday', '9.00 AM - 2.00 PM', 'Fast-Track Program', 1)
                ");
            }
        } catch (\Exception $e) {
            // Silently continue
        }
    }

    public function getAllRecords()
    {
        try {
            $stmt = $this->pdo->query("SELECT * FROM `batch_schedules` WHERE is_active = 1 ORDER BY id ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) return $rows;
        } catch (\Exception $e) {}

        // Fallback default list
        return [
            ['id' => '1', 'name_en' => 'Weekend Batch (Saturday & Sunday)', 'name_si' => 'සති අන්ත කණ්ඩායම (සෙනසුරාදා / ඉරිදා)', 'name_ta' => 'வார இறுதி தொகுதி', 'days' => 'Saturday & Sunday', 'time_slot' => '8.30 AM - 1.30 PM', 'badge' => 'Most Popular for Working Students', 'is_active' => 1],
            ['id' => '2', 'name_en' => 'Weekday Batch (Tuesday & Thursday)', 'name_si' => 'සතියේ දින සන්ධ්‍යා කණ්ඩායම (අඟහරුවාදා / බ්‍රහස්පතින්දා)', 'name_ta' => 'வார நாள் மாலை தொகுதி', 'days' => 'Tuesday & Thursday', 'time_slot' => 'Evening Sessions (7.30 PM - 9.30 PM)', 'badge' => 'Convenient Online Sessions', 'is_active' => 1],
            ['id' => '3', 'name_en' => 'Sunday Only Batch', 'name_si' => 'ඉරිදා පමණක් පැවැත්වෙන කණ්ඩායම', 'name_ta' => 'ஞாயிறு மட்டும் தொகுதி', 'days' => 'Sunday', 'time_slot' => '8.30 AM - 4.30 PM', 'badge' => 'Special Intensive Class', 'is_active' => 1],
            ['id' => '4', 'name_en' => 'Full-Time Weekday Batch (Monday - Friday)', 'name_si' => 'සතියේ දින පූර්ණ කාලීන කණ්ඩායම (සඳුදා - සිකුරාදා)', 'name_ta' => 'முழு நேர வார நாள் தொகுதி', 'days' => 'Monday to Friday', 'time_slot' => '9.00 AM - 2.00 PM', 'badge' => 'Fast-Track Program', 'is_active' => 1],
        ];
    }

    public function getAllAdmin()
    {
        try {
            $stmt = $this->pdo->query("SELECT * FROM `batch_schedules` ORDER BY id ASC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return $this->getAllRecords();
        }
    }

    public function createRecord($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `batch_schedules` (`name_en`, `name_si`, `name_ta`, `days`, `time_slot`, `badge`, `is_active`)
            VALUES (:name_en, :name_si, :name_ta, :days, :time_slot, :badge, :is_active)
        ");
        $stmt->execute([
            'name_en' => $data['name_en'],
            'name_si' => $data['name_si'] ?? '',
            'name_ta' => $data['name_ta'] ?? '',
            'days' => $data['days'] ?? '',
            'time_slot' => $data['time_slot'] ?? '',
            'badge' => $data['badge'] ?? '',
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateRecord($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE `batch_schedules` SET 
                `name_en` = :name_en,
                `name_si` = :name_si,
                `name_ta` = :name_ta,
                `days` = :days,
                `time_slot` = :time_slot,
                `badge` = :badge,
                `is_active` = :is_active
            WHERE id = :id
        ");
        return $stmt->execute([
            'name_en' => $data['name_en'],
            'name_si' => $data['name_si'] ?? '',
            'name_ta' => $data['name_ta'] ?? '',
            'days' => $data['days'] ?? '',
            'time_slot' => $data['time_slot'] ?? '',
            'badge' => $data['badge'] ?? '',
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            'id' => $id,
        ]);
    }
}
