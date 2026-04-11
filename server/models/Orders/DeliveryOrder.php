<?php

class DeliveryOrder
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Fetch all delivery orders
    public function getAllRecords()
    {
        try {
            $stmt = $this->pdo->query("SELECT * FROM delivery_orders");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Fetch a delivery order by ID
    public function getRecordById($id)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM delivery_orders WHERE id = :id");
            $stmt->execute(['id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Insert a new delivery order
    public function createRecord($data)
    {
        try {
            $sql = "INSERT INTO delivery_orders 
                    (delivery_id, tracking_number, index_number, order_date, packed_date, send_date, removed_date, 
                    current_status, delivery_partner, value, payment_method, course_code, estimate_delivery, full_name, 
                    street_address, city, district, phone_1, phone_2, is_active, received_date, cod_amount, package_weight) 
                    VALUES 
                    (:delivery_id, :tracking_number, :index_number, :order_date, :packed_date, :send_date, :removed_date, 
                    :current_status, :delivery_partner, :value, :payment_method, :course_code, :estimate_delivery, :full_name, 
                    :street_address, :city, :district, :phone_1, :phone_2, :is_active, :received_date, :cod_amount, :package_weight)";

            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Update an existing delivery order
    public function updateRecord($id, $data)
    {
        try {
            $data['id'] = $id;

            $sql = "UPDATE delivery_orders SET 
                        delivery_id = :delivery_id, 
                        tracking_number = :tracking_number, 
                        index_number = :index_number, 
                        order_date = :order_date, 
                        packed_date = :packed_date, 
                        send_date = :send_date, 
                        removed_date = :removed_date, 
                        current_status = :current_status, 
                        delivery_partner = :delivery_partner, 
                        value = :value, 
                        payment_method = :payment_method, 
                        course_code = :course_code, 
                        estimate_delivery = :estimate_delivery, 
                        full_name = :full_name, 
                        street_address = :street_address, 
                        city = :city, 
                        district = :district, 
                        phone_1 = :phone_1, 
                        phone_2 = :phone_2, 
                        is_active = :is_active, 
                        received_date = :received_date, 
                        cod_amount = :cod_amount, 
                        package_weight = :package_weight 
                    WHERE id = :id";

            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Delete a delivery order
    public function deleteRecord($id)
    {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM delivery_orders WHERE id = :id");
            return $stmt->execute(['id' => $id]);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Get a delivery order by Index Number
    public function getRecordByIndexNumber($index_number)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM delivery_orders WHERE index_number = :index_number");
        $stmt->execute(['index_number' => $index_number]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Fetches all matching records
    }

     // Get a delivery order by Index Number, including the delivery title from the delivery_setting table
     public function getRecordByIndexNumberAndStatus($index_number, $receivedStatus)
     {
         // Prepare the query
         $stmt = $this->pdo->prepare("
             SELECT 
                 delivery_orders.*, 
                 delivery_setting.id AS setting_id, 
                 delivery_setting.course_id, 
                 delivery_setting.delivery_title, 
                 delivery_setting.is_active, 
                 delivery_setting.icon, 
                 delivery_setting.value
             FROM 
                 delivery_orders
             INNER JOIN 
                 delivery_setting ON delivery_orders.delivery_id = delivery_setting.id
             WHERE 
                 delivery_orders.index_number = :index_number 
                 AND delivery_orders.order_recived_status = :receivedStatus
         ");
         
         // Execute the query with the provided parameters
         $stmt->execute(['index_number' => $index_number, 'receivedStatus' => $receivedStatus]);
         
         // Return the results as an associative array
         return $stmt->fetchAll(PDO::FETCH_ASSOC);
     }
     


    public function getRecordByIndexNumberAndCourse($index_number, $courseCode)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
        do.`id`, 
        do.`delivery_id`, 
        do.`tracking_number`, 
        do.`index_number`, 
        do.`order_date`, 
        do.`packed_date`, 
        do.`send_date`, 
        do.`removed_date`, 
        do.`current_status`, 
        do.`delivery_partner`, 
        do.`value`, 
        do.`payment_method`, 
        do.`course_code`, 
        do.`estimate_delivery`, 
        do.`full_name`, 
        do.`street_address`, 
        do.`city`, 
        do.`district`, 
        do.`phone_1`, 
        do.`phone_2`, 
        do.`is_active`, 
        do.`received_date`, 
        do.`cod_amount`, 
        do.`package_weight`, 
        ds.`delivery_title`,
        CASE 
            WHEN do.`current_status` = 1 THEN 'Processing'
            WHEN do.`current_status` = 2 THEN 'Packed'
            WHEN do.`current_status` = 3 THEN 'Delivered'
            WHEN do.`current_status` = 4 THEN 'Removed'
            WHEN do.`current_status` = 5 THEN 'Returned'
            WHEN do.`current_status` = 6 THEN 'Cancelled'
            ELSE 'Unknown'
        END AS `active_status`,
        CASE 
            WHEN do.`current_status` = 1 THEN 'danger'
            WHEN do.`current_status` = 2 THEN 'success'
            WHEN do.`current_status` = 3 THEN 'dark'
            WHEN do.`current_status` = 4 THEN 'danger'
            WHEN do.`current_status` = 5 THEN 'warning'
            WHEN do.`current_status` = 6 THEN 'secondary'
            ELSE 'info'
        END AS `color`
    FROM 
        `delivery_orders` AS do
    LEFT JOIN 
        `delivery_setting` AS ds
    ON 
        do.`delivery_id` = ds.`id`
    WHERE 
        do.`index_number` = :index_number 
    AND 
        do.`course_code` = :course_code;
    ");
        $stmt->execute(['index_number' => $index_number, 'course_code' => $courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Fetches all matching records with delivery_title
        // Update this
    }




    // Get a delivery order by Tracking Number
    public function getRecordByTrackingNumber($tracking_number)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM delivery_orders WHERE tracking_number = :tracking_number");
            $stmt->execute(['tracking_number' => $tracking_number]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }




    // Get a delivery order by Current Status
    public function getRecordByCurrentStatus($current_status)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM delivery_orders WHERE current_status = :current_status");
            $stmt->execute(['current_status' => $current_status]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Update the order received status only
    public function updateOrderStatus($id, $order_recived_status)
    {
        try {
            // Prepare the SQL query to update only the order_recived_status
            $sql = "UPDATE delivery_orders SET order_recived_status = :order_recived_status WHERE id = :id";

            // Prepare the statement
            $stmt = $this->pdo->prepare($sql);

            // Bind the parameters
            $stmt->bindParam(':order_recived_status', $order_recived_status);
            $stmt->bindParam(':id', $id);

            // Execute the statement
            $stmt->execute();

            // Return the number of affected rows
            return $stmt->rowCount();
        } catch (PDOException $e) {
            // Return the error message if an exception occurs
            return ['error' => $e->getMessage()];
        }
    }

}