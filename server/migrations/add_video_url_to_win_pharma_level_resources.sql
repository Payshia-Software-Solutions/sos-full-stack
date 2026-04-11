-- Adds optional video URL support for WinPharma resources.
-- Expected table: win_pharma_level_resources

ALTER TABLE `win_pharma_level_resources`
  ADD COLUMN `video_url` VARCHAR(500) NULL AFTER `task_cover`;

