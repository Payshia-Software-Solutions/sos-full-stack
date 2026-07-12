<?php

class TempLmsUser
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Count all users
    public function countUsers()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) AS user_count FROM temp_lms_user");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['user_count'];
    }

    // Get all users
    public function getAllUsers()
    {
        $stmt = $this->pdo->query("SELECT * FROM temp_lms_user");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a user by ID
    public function getUserById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM temp_lms_user WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    

    // Create a new user
    public function createUser($data)
    {
        $sql = "INSERT INTO temp_lms_user (
                    email_address, civil_status, first_name, last_name, password, nic_number, phone_number, 
                    whatsapp_number, address_l1, address_l2, city, district, postal_code, paid_amount, 
                    aprroved_status, created_at, full_name, name_with_initials, gender, index_number, 
                    name_on_certificate, selected_course
                ) VALUES (
                    :email_address, :civil_status, :first_name, :last_name, :password, :nic_number, :phone_number, 
                    :whatsapp_number, :address_l1, :address_l2, :city, :district, :postal_code, :paid_amount, 
                    :aprroved_status, :created_at, :full_name, :name_with_initials, :gender, :index_number, 
                    :name_on_certificate, :selected_course
                )";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);

        // Return the auto-generated ID
        return $this->pdo->lastInsertId();
    }




    // Update a user by ID
    public function updateUser($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE temp_lms_user SET 
                    email_address = :email_address,
                    civil_status = :civil_status,
                    first_name = :first_name,
                    last_name = :last_name,
                    password = :password,
                    nic_number = :nic_number,
                    phone_number = :phone_number,
                    whatsapp_number = :whatsapp_number,
                    address_l1 = :address_l1,
                    address_l2 = :address_l2,
                    city = :city,
                    district = :district,
                    postal_code = :postal_code,
                    paid_amount = :paid_amount,
                    aprroved_status = :aprroved_status,
                    created_at = :created_at,
                    full_name = :full_name,
                    name_with_initials = :name_with_initials,
                    gender = :gender,
                    index_number = :index_number,
                    name_on_certificate = :name_on_certificate,
                    selected_course = :selected_course
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a user by ID
    public function deleteUser($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM temp_lms_user WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Get users by approval status with pagination, search, and sorting
    public function getUsersByApprovalStatus($status, $limit = 10, $offset = 0, $search = '', $startDate = null, $endDate = null)
    {
        $searchParam = "%$search%";
        $whereClauses = ["t.aprroved_status = :status"];
        
        if ($search !== '') {
            $whereClauses[] = "(t.full_name LIKE :search OR t.email_address LIKE :search OR t.phone_number LIKE :search OR t.id LIKE :search)";
        }
        
        if ($startDate) {
            $whereClauses[] = "DATE(t.created_at) >= :start_date";
        }
        
        if ($endDate) {
            $whereClauses[] = "DATE(t.created_at) <= :end_date";
        }
        
        $whereString = implode(' AND ', $whereClauses);

        // Get total count for pagination
        $countSql = "
            SELECT COUNT(DISTINCT t.id)
            FROM temp_lms_user t
            WHERE $whereString
        ";
        $countStmt = $this->pdo->prepare($countSql);
        $countStmt->bindValue(':status', $status, PDO::PARAM_STR);
        if ($search !== '') {
            $countStmt->bindValue(':search', $searchParam, PDO::PARAM_STR);
        }
        if ($startDate) {
            $countStmt->bindValue(':start_date', $startDate, PDO::PARAM_STR);
        }
        if ($endDate) {
            $countStmt->bindValue(':end_date', $endDate, PDO::PARAM_STR);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();

        // Optimized sorting without schema changes:
        $slipStmt = $this->pdo->prepare("SELECT DISTINCT unique_number FROM payment_requests WHERE number_type = 'ref_number'");
        $slipStmt->execute();
        $slipUsers = $slipStmt->fetchAll(PDO::FETCH_COLUMN);
        
        $slipIds = [];
        foreach ($slipUsers as $uid) {
            if (is_numeric($uid)) {
                $slipIds[] = (int)$uid;
            }
        }
        
        $orderClause = "t.id DESC";
        if (count($slipIds) > 0) {
            $inList = implode(',', $slipIds);
            $orderClause = "t.id IN ($inList) DESC, t.id DESC";
        }

        $sql = "
            SELECT t.*, 
                (SELECT GROUP_CONCAT(p.slip_path SEPARATOR ',') 
                 FROM payment_requests p 
                 WHERE p.unique_number = CAST(t.id AS CHAR) AND p.number_type = 'ref_number'
                ) AS slip_paths
            FROM temp_lms_user t
            WHERE $whereString
            ORDER BY $orderClause
            LIMIT :limit OFFSET :offset
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);
        if ($search !== '') {
            $stmt->bindValue(':search', $searchParam, PDO::PARAM_STR);
        }
        if ($startDate) {
            $stmt->bindValue(':start_date', $startDate, PDO::PARAM_STR);
        }
        if ($endDate) {
            $stmt->bindValue(':end_date', $endDate, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'data' => $data,
            'total' => $total
        ];
    }

    // Get users by selected course
    public function getUsersByCourse($course)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM temp_lms_user WHERE selected_course = :course");
        $stmt->execute(['course' => $course]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    // Update user details
    public function updateUserDetails($id, $data)
    {
        $sql = "UPDATE temp_lms_user SET 
                    email_address = :email_address,
                    first_name = :first_name,
                    last_name = :last_name,
                    nic_number = :nic_number,
                    phone_number = :phone_number,
                    whatsapp_number = :whatsapp_number,
                    address_l1 = :address_l1,
                    address_l2 = :address_l2,
                    city = :city,
                    district = :district,
                    full_name = :full_name,
                    name_with_initials = :name_with_initials,
                    name_on_certificate = :name_on_certificate
                WHERE id = :id";
                
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'email_address' => $data['email_address'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'nic_number' => $data['nic_number'],
            'phone_number' => $data['phone_number'],
            'whatsapp_number' => $data['whatsapp_number'],
            'address_l1' => $data['address_l1'],
            'address_l2' => $data['address_l2'] ?? null,
            'city' => $data['city'] ?? null,
            'district' => $data['district'] ?? null,
            'full_name' => $data['full_name'] ?? null,
            'name_with_initials' => $data['name_with_initials'] ?? null,
            'name_on_certificate' => $data['name_on_certificate'] ?? null,
            'id' => $id
        ]);
        
        return $stmt->rowCount();
    }

    // Reject user
    public function rejectUser($id)
    {
        $sql = "UPDATE temp_lms_user SET aprroved_status = 'Rejected' WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
    }
}
?>
