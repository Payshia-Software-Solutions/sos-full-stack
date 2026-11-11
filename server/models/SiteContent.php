<?php
// models/SiteContent.php
// Small key/value store for site-wide content documents (e.g. the shared refund policy).

class SiteContent
{
    const ALLOWED_KEYS = ['refund_policy'];

    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function createTable(): void
    {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS `site_content` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `content_key` VARCHAR(100) NOT NULL,
            `content_value` LONGTEXT NOT NULL,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `uniq_site_content_key` (`content_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public function get(string $key): ?array
    {
        $stmt = $this->pdo->prepare("SELECT content_value FROM site_content WHERE content_key = :k LIMIT 1");
        $stmt->execute(['k' => $key]);
        $json = $stmt->fetchColumn();
        if ($json === false) {
            return null;
        }
        $decoded = json_decode($json, true);
        return is_array($decoded) ? $decoded : null;
    }

    public function set(string $key, array $value): void
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO site_content (content_key, content_value) VALUES (:k, :v)
             ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)"
        );
        $stmt->execute(['k' => $key, 'v' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
    }

    public function setIfAbsent(string $key, array $value): bool
    {
        if ($this->get($key) !== null) {
            return false;
        }
        $this->set($key, $value);
        return true;
    }
}
