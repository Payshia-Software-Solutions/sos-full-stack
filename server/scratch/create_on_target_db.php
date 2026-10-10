<?php
// Use the exact database config from config/database.php
require_once __DIR__ . '/../config/database.php';

$sql = "CREATE TABLE IF NOT EXISTS `ticket_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_key` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'HelpCircle',
  `color` VARCHAR(50) DEFAULT 'text-blue-400',
  `bg_color` VARCHAR(50) DEFAULT 'bg-blue-500/10',
  `border_color` VARCHAR(50) DEFAULT 'border-blue-500/30',
  `description` VARCHAR(255) NULL,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$pdo->exec($sql);
echo "Table ticket_categories created or verified on config/database.php target!\n";

$count = $pdo->query("SELECT COUNT(*) FROM ticket_categories")->fetchColumn();
echo "Current row count: $count\n";

if ($count == 0) {
    $seed = [
        ['Academic', 'Academic Support', 'BookOpen', 'text-blue-400', 'bg-blue-500/10', 'border-blue-500/30', 'Courses, lectures, and academic materials', 1],
        ['LMS Access', 'LMS & App Access', 'KeyRound', 'text-purple-400', 'bg-purple-500/10', 'border-purple-500/30', 'Login issues, password reset, mobile app', 2],
        ['Payment', 'Payment & Slips', 'CreditCard', 'text-emerald-400', 'bg-emerald-500/10', 'border-emerald-500/30', 'Bank slip approvals, installment queries', 3],
        ['Study Pack', 'Study Pack Courier', 'Package', 'text-amber-400', 'bg-amber-500/10', 'border-amber-500/30', 'Delivery tracking, book parcels, courier delays', 4],
        ['Examination', 'Exams & Quizzes', 'FileText', 'text-rose-400', 'bg-rose-500/10', 'border-rose-500/30', 'Online exam access, quiz retakes, grades', 5],
        ['Certificate', 'Certificate & Conv.', 'Award', 'text-teal-400', 'bg-teal-500/10', 'border-teal-500/30', 'Certificate requests, reprint, convocation booking', 6],
        ['Other', 'General Support', 'HelpCircle', 'text-slate-400', 'bg-slate-500/10', 'border-slate-500/30', 'General questions and administrative inquiries', 7]
    ];
    $stmt = $pdo->prepare("INSERT INTO ticket_categories (category_key, name, icon, color, bg_color, border_color, description, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($seed as $row) {
        $stmt->execute($row);
    }
    echo "Default ticket categories seeded.\n";
}
