<?php
// models/Course/CoursePageContent.php
// Storage for per-course public page content (draft + published JSON documents).

class CoursePageContent
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public static function encode(array $value): string
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private static function decode($json): ?array
    {
        if ($json === null || $json === '') {
            return null;
        }
        $decoded = json_decode($json, true);
        return is_array($decoded) ? $decoded : null;
    }

    public function createTable(): void
    {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS `course_page_content` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `course_code` VARCHAR(50) NOT NULL,
            `draft_content` LONGTEXT NULL,
            `published_content` LONGTEXT NULL,
            `status` ENUM('draft','published') NOT NULL DEFAULT 'draft',
            `published_at` DATETIME NULL,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `uniq_course_page_course_code` (`course_code`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public function courseExists(string $courseCode): bool
    {
        $stmt = $this->pdo->prepare("SELECT 1 FROM parent_main_course WHERE course_code = :code LIMIT 1");
        $stmt->execute(['code' => $courseCode]);
        return (bool)$stmt->fetchColumn();
    }

    /** Admin view: draft + published + status for a course code, or null when no row exists. */
    public function getByCourseCode(string $courseCode): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_page_content WHERE course_code = :code LIMIT 1");
        $stmt->execute(['code' => $courseCode]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }
        return [
            'course_code' => $row['course_code'],
            'status' => $row['status'],
            'draft' => self::decode($row['draft_content']),
            'published' => self::decode($row['published_content']),
            'published_at' => $row['published_at'],
            'updated_at' => $row['updated_at'],
        ];
    }

    /** Public view: only published content, found through the course slug. */
    public function getPublishedBySlug(string $slug): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT cpc.course_code, pmc.slug, cpc.published_content, cpc.published_at
             FROM course_page_content cpc
             INNER JOIN parent_main_course pmc ON pmc.course_code = cpc.course_code
             WHERE pmc.slug = :slug AND cpc.published_content IS NOT NULL
             LIMIT 1"
        );
        $stmt->execute(['slug' => $slug]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }
        $content = self::decode($row['published_content']);
        if ($content === null) {
            return null;
        }
        return [
            'course_code' => $row['course_code'],
            'slug' => $row['slug'],
            'published_at' => $row['published_at'],
            'content' => $content,
        ];
    }

    /** Saves the draft; a page that is already published stays published. */
    public function saveDraft(string $courseCode, array $content): void
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO course_page_content (course_code, draft_content, status)
             VALUES (:code, :draft, 'draft')
             ON DUPLICATE KEY UPDATE draft_content = VALUES(draft_content)"
        );
        $stmt->execute(['code' => $courseCode, 'draft' => self::encode($content)]);
    }

    /** Copies the draft to published. Returns published_at, or null when there is no draft. */
    public function publish(string $courseCode): ?string
    {
        // Check for a draft first: UPDATE's rowCount() counts changed rows, so publishing the same
        // draft twice within one second would look like "no draft" if we relied on it.
        $check = $this->pdo->prepare("SELECT 1 FROM course_page_content WHERE course_code = :code AND draft_content IS NOT NULL LIMIT 1");
        $check->execute(['code' => $courseCode]);
        if (!$check->fetchColumn()) {
            return null;
        }
        $publishedAt = date('Y-m-d H:i:s');
        $stmt = $this->pdo->prepare(
            "UPDATE course_page_content
             SET published_content = draft_content, status = 'published', published_at = :at
             WHERE course_code = :code"
        );
        $stmt->execute(['at' => $publishedAt, 'code' => $courseCode]);
        return $publishedAt;
    }

    /** Seeds a course page (draft + published) only when no row exists yet. Returns true when inserted. */
    public function seedIfAbsent(string $courseCode, array $content): bool
    {
        $stmt = $this->pdo->prepare("SELECT 1 FROM course_page_content WHERE course_code = :code LIMIT 1");
        $stmt->execute(['code' => $courseCode]);
        if ($stmt->fetchColumn()) {
            return false;
        }
        $json = self::encode($content);
        $insert = $this->pdo->prepare(
            "INSERT INTO course_page_content (course_code, draft_content, published_content, status, published_at)
             VALUES (:code, :draft, :published, 'published', :at)"
        );
        $insert->execute(['code' => $courseCode, 'draft' => $json, 'published' => $json, 'at' => date('Y-m-d H:i:s')]);
        return true;
    }
}
