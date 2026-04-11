# HpRacks API Documentation

## Overview
The `HpRacks` API provides CRUD operations for managing racks within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL
https://api.pharmacollege.lk/hp-racks


## Endpoints

### 1. Get All Racks
- **Endpoint:** `GET /hp-racks/`
- **Description:** Retrieves a list of all racks.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "id": 1,
            "name": "Rack 1",
            "is_active": 1,
            "created_by": "admin",
            "created_at": "2024-09-01 12:34:56"
        },
        {
            "id": 2,
            "name": "Rack 2",
            "is_active": 0,
            "created_by": "user1",
            "created_at": "2024-09-02 13:00:00"
        }
    ]
    ```

### 2. Get Rack by ID
- **Endpoint:** `GET /hp-racks/{id}/`
- **Description:** Retrieves a specific rack by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the rack to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "id": 1,
        "name": "Rack 1",
        "is_active": 1,
        "created_by": "admin",
        "created_at": "2024-09-01 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the rack does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Rack
- **Endpoint:** `POST /hp-racks/`
- **Description:** Creates a new rack.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "New Rack",
        "is_active": 1,
        "created_by": "admin"
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

### 4. Update a Rack
- **Endpoint:** `PUT /hp-racks/{id}/`
- **Description:** Updates an existing rack.
- **Path Parameters:**
  - `id` (integer): The ID of the rack to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "Updated Rack",
        "is_active": 0,
        "created_by": "admin"
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

### 5. Delete a Rack
- **Endpoint:** `DELETE /hp-racks/{id}/`
- **Description:** Deletes a specific rack by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the rack to delete.
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

### cURL Example for Creating a Rack
```bash
curl -X POST https://api.pharmacollege.lk/hp-racks \
-H "Content-Type: application/json" \
-d '{
  "name": "New Rack",
  "is_active": 1,
  "created_by": "admin"
}'

