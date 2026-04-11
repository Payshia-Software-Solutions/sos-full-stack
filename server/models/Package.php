<?php
// models/Package.php

class Package
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function createPackage(
        $package_name,
        $price,
        $parent_seat_count,
        $garland,
        $graduation_cloth,
        $photo_package,
        $courses,
        $course_list,
        $scroll,
        $student_seat,
        $certificate_file,
        $video_360,
        $refreshments,
        $vip_seat,
        $description,
        $is_active = true,
        $cover_image = null,
        $convocation_id = null
    ) {
        // Prepare the SQL statement to insert the package data
        $stmt = $this->pdo->prepare("
        INSERT INTO packages (
            package_name, price, parent_seat_count, garland, graduation_cloth, photo_package, is_active, courses, course_list, 
            scroll, student_seat, certificate_file, video_360, refreshments, vip_seat, description,
            cover_image, convocation_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

        // Execute the query with the provided values
        $stmt->execute([
            $package_name,
            $price,
            $parent_seat_count,
            $garland,
            $graduation_cloth,
            $photo_package,
            $is_active,
            $courses,
            $course_list,
            $scroll,
            $student_seat,
            $certificate_file,
            $video_360,
            $refreshments,
            $vip_seat,
            $description,
            $cover_image,
            $convocation_id
        ]);

        // Return the ID of the last inserted row
        return $this->pdo->lastInsertId();
    }

    // Read all packages
    public function getAllPackages()
    {
        $stmt = $this->pdo->query("SELECT * FROM packages");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Read a single package by ID
    public function getPackageById($package_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM packages WHERE package_id = ?");
        $stmt->execute([$package_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getPackagesByCourseIds(array $courseIds)
    {
        if (empty($courseIds)) {
            return []; // Return empty if no course IDs
        }

        // Generate FIND_IN_SET placeholders
        $conditions = array_fill(0, count($courseIds), 'FIND_IN_SET(?, p.courses)');
        $whereClause = implode(' OR ', $conditions);

        $sql = "
            SELECT DISTINCT p.* 
            FROM packages p
            WHERE $whereClause
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($courseIds); // Use courseIds once, not twice!

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // Update a package
    public function updatePackage(
        $package_id,
        $package_name,
        $price,
        $parent_seat_count,
        $garland,
        $graduation_cloth,
        $photo_package,
        $courses,
        $course_list,
        $scroll,
        $student_seat,
        $certificate_file,
        $video_360,
        $refreshments,
        $vip_seat,
        $description,
        $is_active,
        $cover_image = null,
        $convocation_id = null
    ) {
        if ($cover_image) {
            $stmt = $this->pdo->prepare("
            UPDATE packages 
            SET package_name = ?, price = ?, parent_seat_count = ?, garland = ?, graduation_cloth = ?, photo_package = ?, 
                is_active = ?, courses = ?, course_list = ?, scroll = ?, student_seat = ?, certificate_file = ?, 
                video_360 = ?, refreshments = ?, vip_seat = ?, description = ?, cover_image = ?, convocation_id = ?
            WHERE package_id = ?
        ");
            return $stmt->execute([
                $package_name,
                $price,
                $parent_seat_count,
                $garland,
                $graduation_cloth,
                $photo_package,
                $is_active,
                $courses,
                $course_list,
                $scroll,
                $student_seat,
                $certificate_file,
                $video_360,
                $refreshments,
                $vip_seat,
                $description,
                $cover_image,
                $convocation_id,
                $package_id
            ]);
        } else {
            $stmt = $this->pdo->prepare("
            UPDATE packages 
            SET package_name = ?, price = ?, parent_seat_count = ?, garland = ?, graduation_cloth = ?, photo_package = ?, 
                is_active = ?, courses = ?, course_list = ?, scroll = ?, student_seat = ?, certificate_file = ?, 
                video_360 = ?, refreshments = ?, vip_seat = ?, description = ?, convocation_id = ?
            WHERE package_id = ?
        ");
            return $stmt->execute([
                $package_name,
                $price,
                $parent_seat_count,
                $garland,
                $graduation_cloth,
                $photo_package,
                $is_active,
                $courses,
                $course_list,
                $scroll,
                $student_seat,
                $certificate_file,
                $video_360,
                $refreshments,
                $vip_seat,
                $description,
                $convocation_id,
                $package_id
            ]);
        }
    }


    // Delete a package
    public function deletePackage($package_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM packages WHERE package_id = ?");
        return $stmt->execute([$package_id]);
    }

    public function updatePackageStatus($package_id, $is_active)
    {
        $sql = "UPDATE packages SET is_active = :is_active WHERE package_id = :package_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);
        $stmt->bindParam(':package_id', $package_id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}
