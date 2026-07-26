<?php

class EditProfileTemp
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getPendingRequests()
    {
        $stmt = $this->pdo->query("SELECT * FROM edit_profile_temp WHERE active_status = 'Pending' ORDER BY updated_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRequestById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM edit_profile_temp WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getRequestByUsername($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM edit_profile_temp WHERE username = :username ORDER BY updated_at DESC LIMIT 1");
        $stmt->execute(['username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createOrUpdateRequest($username, $data)
    {
        // Check if there is already a Pending request
        $stmt = $this->pdo->prepare("SELECT id FROM edit_profile_temp WHERE username = :username AND active_status = 'Pending'");
        $stmt->execute(['username' => $username]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        $params = [
            'username' => $username,
            'civil_status' => $data['civil_status'] ?? null,
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'gender' => $data['gender'] ?? null,
            'address_line_1' => $data['address_line_1'] ?? null,
            'address_line_2' => $data['address_line_2'] ?? null,
            'city' => $data['city'] ?? null,
            'district' => isset($data['district']) ? (int)$data['district'] : 0,
            'postal_code' => $data['postal_code'] ?? null,
            'telephone_1' => $data['telephone_1'] ?? null,
            'telephone_2' => $data['telephone_2'] ?? null,
            'nic' => $data['nic'] ?? null,
            'e_mail' => $data['e_mail'] ?? null,
            'birth_day' => $data['birth_day'] ?? null,
            'full_name' => $data['full_name'] ?? '',
            'name_with_initials' => $data['name_with_initials'] ?? '',
            'name_on_certificate' => $data['name_on_certificate'] ?? ''
        ];

        if ($existing) {
            $params['id'] = $existing['id'];
            $sql = "UPDATE edit_profile_temp SET 
                        civil_status = :civil_status,
                        first_name = :first_name,
                        last_name = :last_name,
                        gender = :gender,
                        address_line_1 = :address_line_1,
                        address_line_2 = :address_line_2,
                        city = :city,
                        district = :district,
                        postal_code = :postal_code,
                        telephone_1 = :telephone_1,
                        telephone_2 = :telephone_2,
                        nic = :nic,
                        e_mail = :e_mail,
                        birth_day = :birth_day,
                        full_name = :full_name,
                        name_with_initials = :name_with_initials,
                        name_on_certificate = :name_on_certificate,
                        active_status = 'Pending',
                        updated_at = CURRENT_TIMESTAMP(6)
                    WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $existing['id'];
        } else {
            $sql = "INSERT INTO edit_profile_temp 
                    (username, civil_status, first_name, last_name, gender, address_line_1, address_line_2, city, district, postal_code, telephone_1, telephone_2, nic, e_mail, birth_day, full_name, name_with_initials, name_on_certificate, active_status)
                    VALUES 
                    (:username, :civil_status, :first_name, :last_name, :gender, :address_line_1, :address_line_2, :city, :district, :postal_code, :telephone_1, :telephone_2, :nic, :e_mail, :birth_day, :full_name, :name_with_initials, :name_on_certificate, 'Pending')";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $this->pdo->lastInsertId();
        }
    }

    public function rejectRequest($id)
    {
        $stmt = $this->pdo->prepare("UPDATE edit_profile_temp SET active_status = 'Rejected', updated_at = CURRENT_TIMESTAMP(6) WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function approveRequest($id, $adminUsername)
    {
        // 1. Get the temp request details
        $request = $this->getRequestById($id);
        if (!$request) {
            return false;
        }

        // 2. Begin Transaction
        $this->pdo->beginTransaction();
        try {
            // Check if user exists in user_full_details
            $checkStmt = $this->pdo->prepare("SELECT id FROM user_full_details WHERE username = :username");
            $checkStmt->execute(['username' => $request['username']]);
            $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingUser) {
                // Update user_full_details
                $sql = "UPDATE user_full_details SET 
                            civil_status = :civil_status,
                            first_name = :first_name,
                            last_name = :last_name,
                            gender = :gender,
                            address_line_1 = :address_line_1,
                            address_line_2 = :address_line_2,
                            city = :city,
                            district = :district,
                            postal_code = :postal_code,
                            telephone_1 = :telephone_1,
                            telephone_2 = :telephone_2,
                            nic = :nic,
                            e_mail = :e_mail,
                            birth_day = :birth_day,
                            full_name = :full_name,
                            name_with_initials = :name_with_initials,
                            name_on_certificate = :name_on_certificate,
                            updated_by = :updated_by,
                            updated_at = CURRENT_TIMESTAMP(6)
                        WHERE username = :username";
                $updateStmt = $this->pdo->prepare($sql);
                $updateStmt->execute([
                    'civil_status' => $request['civil_status'],
                    'first_name' => $request['first_name'],
                    'last_name' => $request['last_name'],
                    'gender' => $request['gender'],
                    'address_line_1' => $request['address_line_1'],
                    'address_line_2' => $request['address_line_2'],
                    'city' => $request['city'],
                    'district' => $request['district'],
                    'postal_code' => $request['postal_code'],
                    'telephone_1' => $request['telephone_1'],
                    'telephone_2' => $request['telephone_2'],
                    'nic' => $request['nic'],
                    'e_mail' => $request['e_mail'],
                    'birth_day' => $request['birth_day'],
                    'full_name' => $request['full_name'],
                    'name_with_initials' => $request['name_with_initials'],
                    'name_on_certificate' => $request['name_on_certificate'],
                    'updated_by' => $adminUsername,
                    'username' => $request['username']
                ]);
            }

            // Also update phone/email in `users` table if they exist
            $userUpdateStmt = $this->pdo->prepare("UPDATE users SET email = :email, phone = :phone, fname = :first_name, lname = :last_name WHERE username = :username");
            $userUpdateStmt->execute([
                'email' => $request['e_mail'],
                'phone' => $request['telephone_1'],
                'first_name' => $request['first_name'],
                'last_name' => $request['last_name'],
                'username' => $request['username']
            ]);

            // 3. Mark request as Approved
            $statusStmt = $this->pdo->prepare("UPDATE edit_profile_temp SET active_status = 'Approved', updated_at = CURRENT_TIMESTAMP(6) WHERE id = :id");
            $statusStmt->execute(['id' => $id]);

            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
