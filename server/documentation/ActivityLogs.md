
# ActivityLogs API Documentation

## Overview
The `ActivityLogs` API provides CRUD operations for managing activity logs within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL
```
https://api.pharmacollege.lk/activitylogs
```

## Endpoints

### 1. Get All Activity Logs
- **Endpoint:** `GET /activitylogs/`
- **Description:** Retrieves a list of all activity logs.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "id": 1,
            "ip": "192.168.1.1",
            "activity": "User login",
            "remark": "Successful login",
            "createdby": "admin",
            "createdat": "2024-11-10 10:00:00"
        },
        {
            "id": 2,
            "ip": "192.168.1.2",
            "activity": "Password change",
            "remark": "Password successfully changed",
            "createdby": "user1",
            "createdat": "2024-11-10 11:15:00"
        }
    ]
    ```

### 2. Get Activity Log by ID
- **Endpoint:** `GET /activitylogs/{id}/`
- **Description:** Retrieves a specific activity log by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the activity log to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "id": 1,
        "ip": "192.168.1.1",
        "activity": "User login",
        "remark": "Successful login",
        "createdby": "admin",
        "createdat": "2024-11-10 10:00:00"
    }
    ```
  - **Status Code:** `404 Not Found` (If the activity log does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Activity Log
- **Endpoint:** `POST /activitylogs/`
- **Description:** Creates a new activity log.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "ip": "192.168.1.3",
        "activity": "Profile update",
        "remark": "Updated user profile information",
        "createdby": "user2"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:** 
    ```json
    {
        "message": "Record created successfully"
    }
    ```

### 4. Update an Activity Log
- **Endpoint:** `PUT /activitylogs/{id}/`
- **Description:** Updates an existing activity log.
- **Path Parameters:**
  - `id` (integer): The ID of the activity log to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "ip": "192.168.1.4",
        "activity": "User logout",
        "remark": "Successful logout",
        "createdby": "admin"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "message": "Record updated successfully"
    }
    ```

### 5. Delete an Activity Log
- **Endpoint:** `DELETE /activitylogs/{id}/`
- **Description:** Deletes a specific activity log by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the activity log to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "message": "Record deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating an Activity Log
```bash
curl -X POST https://api.pharmacollege.lk/activitylogs -H "Content-Type: application/json" -d '{
  "ip": "192.168.1.3",
  "activity": "Profile update",
  "remark": "Updated user profile information",
  "createdby": "user2"
}'
```

### cURL Example for Updating an Activity Log
```bash
curl -X PUT https://api.pharmacollege.lk/activitylogs/1/ -H "Content-Type: application/json" -d '{
  "ip": "192.168.1.4",
  "activity": "User logout",
  "remark": "Successful logout",
  "createdby": "admin"
}'
```

### cURL Example for Deleting an Activity Log
```bash
curl -X DELETE https://api.pharmacollege.lk/activitylogs/1/ 
```
