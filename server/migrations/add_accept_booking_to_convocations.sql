ALTER TABLE `convocations` ADD `accept_booking` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = Not Accepted, 1 = Accepted';
ALTER TABLE `convocations` ADD `session_2` TEXT;