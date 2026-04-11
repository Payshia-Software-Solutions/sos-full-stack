# WinpharmaCommonReason API Documentation

## Overview

The `WinpharmaCommonReason` API provides CRUD operations for managing common reasons within the Winpharma system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/winpharma-common-reasons

## Endpoints

### 1. Get All Common Reasons

- **Endpoint:** `GET /winpharma_common_resons/`
- **Description:** Retrieves a list of all common reasons.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "reason": "Reason 1",
        "is_active": 1,
        "created_by": "admin",
        "created_at": "2024-09-02 12:34:56"
      },
      {
        "id": 2,
        "reason": "Reason 2",
        "is_active": 1,
        "created_by": "user1",
        "created_at": "2024-09-02 13:00:00"
      }
    ]
    ```

### 2. Get Common Reason by ID

- **Endpoint:** `GET /winpharma_common_resons/{id}/`
- **Description:** Retrieves a specific common reason by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the common reason to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "reason": "Reason 1",
      "is_active": 1,
      "created_by": "admin",
      "created_at": "2024-09-02 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the common reason does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Common Reason

- **Endpoint:** `POST /winpharma_common_resons/`
- **Description:** Creates a new common reason.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "reason": "New Reason",
      "is_active": 1,
      "created_by": "admin",
      "created_at": "2024-09-02 14:00:00"
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

### 4. Update a Common Reason

- **Endpoint:** `PUT /winpharma_common_resons/{id}/`
- **Description:** Updates an existing common reason.
- **Path Parameters:**
  - `id` (integer): The ID of the common reason to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "reason": "Updated Reason",
      "is_active": 0,
      "created_by": "admin",
      "created_at": "2024-09-02 15:00:00"
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

### 5. Delete a Common Reason

- **Endpoint:** `DELETE /winpharma_common_resons/{id}/`
- **Description:** Deletes a specific common reason by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the common reason to delete.
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

### cURL Example for Creating a Common Reason

```bash
curl -X POST https://api.pharmacollege.lk/winpharma-common-reasons \
-H "Content-Type: application/json" \
-d '{
  "reason": "New Reason",
  "is_active": 1,
  "created_by": "admin",
  "created_at": "2024-09-02 14:00:00"
}'
```
