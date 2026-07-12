<?php
require_once './models/Orders/DeliveryOrder.php';
require_once './helpers/SmsHelper.php';

class DeliveryOrderController
{
    private $model;
    private $pdo;

    public function __construct($pdo)
    {
        $this->model = new DeliveryOrder($pdo);
        $this->pdo = $pdo;
    }

    // Get all delivery orders
    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    public function getRecordByCourseCode($courseCode)
    {
        $records = $this->model->getRecordByCourseCode($courseCode);
        if ($records !== false) {
            echo json_encode($records);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No delivery orders found for the given course code']);
        }
    }

    // Get a delivery order by ID
    public function getRecordById($id)
    {
        $record = $this->model->getRecordById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Delivery order not found']);
        }
    }

    // Get a delivery order by Index Number
    public function getRecordByIndexNumber($index_number)
    {
        // Remove the trailing slash if it exists
        $index_number = rtrim($index_number, '/');
    
        $record = $this->model->getRecordByIndexNumber($index_number);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No delivery orders found for the given index number']);
        }
    }

    public function getRecordByIndexNumberAndStatus($index_number, $receivedStatus){
         // Remove the trailing slash if it exists
         $index_number = rtrim($index_number, '/');
         $receivedStatus = rtrim($receivedStatus, '/');
    
         $record = $this->model->getRecordByIndexNumberAndStatus($index_number, $receivedStatus);
         if ($record) {
             echo json_encode($record);
         } else {
             http_response_code(404);
             echo json_encode(['error' => 'No delivery orders found for the given index number']);
         }
    }
    
    

    // Get a delivery order by Tracking Number
    public function getRecordByTrackingNumber($tracking_number)
    {
        // Remove the trailing slash if it exists
        $tracking_number = rtrim($tracking_number, '/');
    
        $record = $this->model->getRecordByTrackingNumber($tracking_number);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No delivery orders found for the given tracking number']);
        }
    }
    
    // Create a new delivery order
    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->validateData($data)) {
            $success = $this->model->createRecord($data);
            if ($success) {
                // Send SMS on order placement
                $phone_1 = $data['phone_1'] ?? null;
                $index_number = $data['index_number'] ?? 'Student';
                $deliveryItem = $data['delivery_title'] ?? 'Package';

                if ($phone_1) {
                    $stmt = $this->pdo->prepare("SELECT template_content FROM sms_templates WHERE template_name = 'delivery-order-placed'");
                    $stmt->execute();
                    $template = $stmt->fetchColumn();
                    
                    if ($template) {
                        $messageText = str_replace(
                            ['{index_number}', '{delivery_item}'],
                            [$index_number, $deliveryItem],
                            $template
                        );
                        SentSMS($phone_1, 'Pharma C.', $messageText);
                    }
                }

                http_response_code(201);
                echo json_encode(['message' => 'Delivery order created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create delivery order']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
        }
    }

    // Update a delivery order
    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->validateData($data)) {
            // Get current record to check for status changes
            $currentRecord = $this->model->getRecordById($id);
            $oldStatus = $currentRecord ? $currentRecord['current_status'] : null;

            // Automatically set dates if status changed
            if ($oldStatus !== null && $oldStatus != $data['current_status']) {
                $newStatus = $data['current_status'];
                if ($newStatus == 2 && empty($data['packed_date'])) {
                    $data['packed_date'] = date('Y-m-d H:i:s');
                } else if ($newStatus == 3 && empty($data['send_date'])) {
                    $data['send_date'] = date('Y-m-d H:i:s');
                } else if ($newStatus == 4 && empty($data['removed_date'])) {
                    $data['removed_date'] = date('Y-m-d H:i:s');
                }
            }

            $success = $this->model->updateRecord($id, $data);
            if ($success) {
                // Send SMS if status changed
                $newStatus = $data['current_status'];
                if ($oldStatus !== null && $oldStatus != $newStatus) {
                    $phone_1 = $data['phone_1'];
                    $index_number = $data['index_number'];
                    $trackingNumber = $data['tracking_number'] ?? 'Not Set';
                    $codAmount = $data['cod_amount'] ?? '0.00';
                    $deliveryItem = $data['delivery_title'] ?? 'Package';

                    $templateName = '';
                    if ($newStatus == 2) {
                        $templateName = 'delivery-order-packed';
                    } else if ($newStatus == 3) {
                        $templateName = 'delivery-order-dispatched';
                    } else if ($newStatus == 4) {
                        $templateName = 'delivery-order-received';
                    }

                    if ($templateName !== '') {
                        $stmt = $this->pdo->prepare("SELECT template_content FROM sms_templates WHERE template_name = ?");
                        $stmt->execute([$templateName]);
                        $template = $stmt->fetchColumn();

                        if ($template) {
                            $messageText = str_replace(
                                ['{index_number}', '{delivery_item}', '{tracking_number}', '{cod_amount}'],
                                [$index_number, $deliveryItem, $trackingNumber, $codAmount],
                                $template
                            );
                            SentSMS($phone_1, 'Pharma C.', $messageText);
                        }
                    }
                }

                echo json_encode(['status'=> 'success', 'message' => 'Delivery order updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status'=> 'error', 'message' => 'Failed to update delivery order']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
        }
    }

    




    // Delete a delivery order
    public function deleteRecord($id)
    {
        $success = $this->model->deleteRecord($id);
        if ($success) {
            echo json_encode(['message' => 'Delivery order deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete delivery order']);
        }
    }

    // Validate incoming data before inserting/updating
    private function validateData($data)
    {
        // Basic validation for required fields
        return isset(
            $data['delivery_id'], $data['index_number'], $data['order_date'],
            $data['current_status'], $data['delivery_partner'], $data['value'],
            $data['payment_method'], $data['course_code'], $data['full_name'],
            $data['street_address'], $data['city'], $data['district'],
            $data['phone_1'], $data['cod_amount']
        ) && $this->validateDataTypes($data);
    }

    // Additional validation for data types, dates, and formats
    private function validateDataTypes($data)
    {
        // Example: Check if 'order_date' is in valid date format
        if (!strtotime($data['order_date'])) {
            return false;
        }
        
        // Example: Check if 'cod_amount' and 'value' are numeric
        if (!is_numeric($data['cod_amount']) || !is_numeric($data['value'])) {
            return false;
        }

        // Add more validation checks for other fields as necessary

        return true;
    }

    // In the DeliveryOrderController class

// Get a delivery order by Current Status
public function getRecordByCurrentStatus($current_status)
{
    $record = $this->model->getRecordByCurrentStatus($current_status);
    if ($record) {
        echo json_encode($record);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No delivery orders found for the given current status']);
    }
}

// Update order status
// Update order status
public function updateOrderStatus($id)
{
    // Get the data from the request (assuming the status is passed in the body as JSON)
    $data = json_decode(file_get_contents("php://input"), true);

    // Check if the status is provided
    if (isset($data['OrderStatus'])) {
        $order_recived_status = $data['OrderStatus'];
    

        // Call the model function to update the order status
        $affectedRows = $this->model->updateOrderStatus($id, $order_recived_status);

        // Return response based on the number of affected rows
        if ($affectedRows > 0) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Order status updated successfully',
                'affectedRows' => $affectedRows
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update order status',
                'affectedRows' => $affectedRows
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'OrderStatus is required'
        ]);
    }
}



// Optional: Validate the status (you can customize based on your logic)
private function validateStatus($status) {
    $validStatuses = ['Received', 'Pending', 'Shipped', 'Cancelled'];
    return in_array($status, $validStatuses);
}

}