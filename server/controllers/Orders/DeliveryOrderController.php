<?php
require_once './models/Orders/DeliveryOrder.php';

class DeliveryOrderController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new DeliveryOrder($pdo);
    }

    // Get all delivery orders
    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
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
            $success = $this->model->updateRecord($id, $data);
            if ($success) {
                echo json_encode(['status'=> 'success', 'message' => 'Delivery order updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status'=> 'success', 'message' => 'Failed to update delivery order']);
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