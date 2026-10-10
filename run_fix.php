<?php
$sql = <<<'SQL'
CREATE TABLE IF NOT EXISTS `dpad_course_prescriptions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `course_code` varchar(50) NOT NULL,
    `prescription_id` varchar(50) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pharma_reader_batch_settings` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `course_code` varchar(50) NOT NULL,
    `max_easy` int(11) DEFAULT 5,
    `max_intermediate` int(11) DEFAULT 7,
    `max_advanced` int(11) DEFAULT 10,
    PRIMARY KEY (`id`),
    UNIQUE KEY `course_code` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pharma_reader_course_assignments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `prescription_id` int(11) NOT NULL,
    `course_code` varchar(50) NOT NULL,
    `assigned_by` varchar(50) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_assignment` (`prescription_id`, `course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sms_templates` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `template_name` varchar(100) NOT NULL,
    `template_content` text NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `template_name` (`template_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
SQL;
require 'fix_tables.php';
