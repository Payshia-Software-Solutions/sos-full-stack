<?php
// models/Course/CourseCover.php
// Validation and naming rules for course cover images uploaded to the content server.

class CourseCover
{
    const MAX_BYTES = 5 * 1024 * 1024;
    const PUBLIC_BASE = 'https://content-provider.pharmacollege.lk';
    const TYPES = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];

    /** Returns an error message, or null when the uploaded file is acceptable. */
    public static function validate($file): ?string
    {
        if (!is_array($file)) {
            return 'No image provided';
        }
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            return 'File upload error';
        }
        if (($file['size'] ?? 0) > self::MAX_BYTES) {
            return 'The image must be 5 MB or smaller';
        }
        if (self::extensionFor($file['tmp_name'] ?? '') === null) {
            return 'The file must be a JPG, PNG or WebP image';
        }
        return null;
    }

    /** Extension chosen from the file's real content (not its name), or null when it is not an accepted image. */
    public static function extensionFor(string $path): ?string
    {
        if ($path === '' || !is_file($path)) {
            return null;
        }
        $info = @getimagesize($path);
        return $info ? (self::TYPES[$info[2]] ?? null) : null;
    }

    /** Folder on the content server for a course's images, or null for an unsafe course code. */
    public static function remoteDir(string $courseCode): ?string
    {
        return preg_match('/^[A-Za-z0-9_-]+$/', $courseCode) ? '/courses/' . $courseCode . '/' : null;
    }

    public static function fileName(string $extension): string
    {
        return uniqid('cover_') . '.' . $extension;
    }

    public static function publicUrl(string $courseCode, string $fileName): string
    {
        return self::PUBLIC_BASE . '/courses/' . $courseCode . '/' . $fileName;
    }
}
