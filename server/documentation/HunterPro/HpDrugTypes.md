# HpDrugTypes API Documentation

## Overview
The `HpDrugTypes` API provides CRUD operations for managing drug types within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL
https://api.pharmacollege.lk/hp-drug-types


## Endpoints

### 1. Get All Drug Types
- **Endpoint:** `GET /hp-drug-types/`
- **Description:** Retrieves a list of all drug types.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "id": 1,
            "name": "Drug Type 1",
            "is_active": 1,
            "created_by": "admin",
            "created_at": "2024-09-01 12:34:56"
        },
        {
            "id": 2,
            "name": "Drug Type 2",
            "is_active": 0,
            "created_by": "user1",
            "created_at": "2024-09-02 13:00:00"
        }
    ]
    ```

### 2. Get Drug Type by ID
- **Endpoint:** `GET /hp-drug-types/{id}/`
- **Description:** Retrieves a specific drug type by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the drug type to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "id": 1,
        "name": "Drug Type 1",
        "is_active": 1,
        "created_by": "admin",
        "created_at": "2024-09-01 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the drug type does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Drug Type
- **Endpoint:** `POST /hp-drug-types/`
- **Description:** Creates a new drug type.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "New Drug Type",
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

### 4. Update a Drug Type
- **Endpoint:** `PUT /hp-drug-types/{id}/`
- **Description:** Updates an existing drug type.
- **Path Parameters:**
  - `id` (integer): The ID of the drug type to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "Updated Drug Type",
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

### 5. Delete a Drug Type
- **Endpoint:** `DELETE /hp-drug-types/{id}/`
- **Description:** Deletes a specific drug type by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the drug type to delete.
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

### cURL Example for Creating a Drug Type
```bash
curl -X POST https://api.pharmacollege.lk/hp-drug-types \
-H "Content-Type: application/json" \
-d '{
  "name": "New Drug Type",
  "is_active": 1,
  "created_by": "admin"
}'
