# WinPharmaLevel API Documentation

## Overview

The `WinPharmaLevel` API provides CRUD operations for managing the levels within the WinPharma system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/win_pharma_level

## Endpoints

### 1. Get All WinPharma Levels

- **Endpoint:** `GET /win_pharma_level/`
- **Description:** Retrieves a list of all WinPharma levels.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "level_id": 1,
        "course_code": "C001",
        "level_name": "Level 1",
        "is_active": 1,
        "created_at": "2024-09-02 12:34:56",
        "created_by": "admin"
      },
      {
        "level_id": 2,
        "course_code": "C002",
        "level_name": "Level 2",
        "is_active": 1,
        "created_at": "2024-09-02 13:00:00",
        "created_by": "user1"
      }
    ]
    ```

### 2. Get WinPharma Level by ID

- **Endpoint:** `GET /win_pharma_level/{id}/`
- **Description:** Retrieves a specific WinPharma level by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the WinPharma level to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "level_id": 1,
      "course_code": "C001",
      "level_name": "Level 1",
      "is_active": 1,
      "created_at": "2024-09-02 12:34:56",
      "created_by": "admin"
    }
    ```
  - **Status Code:** `404 Not Found` (If the WinPharma level does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New WinPharma Level

- **Endpoint:** `POST /win_pharma_level/`
- **Description:** Creates a new WinPharma level.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "course_code": "C003",
      "level_name": "Level 3",
      "is_active": 1,
      "created_at": "2024-09-02 14:00:00",
      "created_by": "admin"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "WinPharmaLevel created successfully"
    }
    ```

### 4. Update a WinPharma Level

- **Endpoint:** `PUT /win_pharma_level/{id}/`
- **Description:** Updates an existing WinPharma level.
- **Path Parameters:**
  - `id` (integer): The ID of the WinPharma level to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "course_code": "C004",
      "level_name": "Level 4",
      "is_active": 1,
      "created_at": "2024-09-02 15:00:00",
      "created_by": "admin"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "WinPharmaLevel updated successfully"
    }
    ```

### 5. Delete a WinPharma Level

- **Endpoint:** `DELETE /win_pharma_level/{id}/`
- **Description:** Deletes a specific WinPharma level by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the WinPharma level to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "WinPharmaLevel deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a WinPharma Level

```bash
curl -X POST https://api.pharmacollege.lk/win_pharma_level \
-H "Content-Type: application/json" \
-d '{
  "course_code": "C003",
  "level_name": "Level 3",
  "is_active": 1,
  "created_at": "2024-09-02 14:00:00",
  "created_by": "admin"
}'
```
