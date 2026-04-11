# QMeterOpen API Documentation

## Overview

The `QMeterOpen` API provides CRUD operations for managing entries in the `q-meter-open` table within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/q-meter-open

## Endpoints

### 1. Get All QMeterOpen Entries

- **Endpoint:** `GET /q-meter-open/`
- **Description:** Retrieves a list of all QMeterOpen entries.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "quest_id": 101,
        "d_id": 5,
        "user_id": 3,
        "created_at": "2024-09-02 12:34:56"
      },
      {
        "id": 2,
        "quest_id": 102,
        "d_id": 6,
        "user_id": 4,
        "created_at": "2024-09-02 13:00:00"
      }
    ]
    ```

### 2. Get QMeterOpen Entry by ID

- **Endpoint:** `GET /q-meter-open/{id}/`
- **Description:** Retrieves a specific QMeterOpen entry by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the QMeterOpen entry to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "quest_id": 101,
      "d_id": 5,
      "user_id": 3,
      "created_at": "2024-09-02 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the entry does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New QMeterOpen Entry

- **Endpoint:** `POST /q-meter-open/`
- **Description:** Creates a new QMeterOpen entry.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "quest_id": 103,
      "d_id": 7,
      "user_id": 5,
      "created_at": "2024-09-02 14:00:00"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "QMeterOpen entry created"
    }
    ```

### 4. Update a QMeterOpen Entry

- **Endpoint:** `PUT /q-meter-open/{id}/`
- **Description:** Updates an existing QMeterOpen entry.
- **Path Parameters:**
  - `id` (integer): The ID of the QMeterOpen entry to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "quest_id": 104,
      "d_id": 8,
      "user_id": 6,
      "created_at": "2024-09-02 15:00:00"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "QMeterOpen entry updated"
    }
    ```

### 5. Delete a QMeterOpen Entry

- **Endpoint:** `DELETE /q-meter-open/{id}/`
- **Description:** Deletes a specific QMeterOpen entry by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the QMeterOpen entry to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "QMeterOpen entry deleted"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a QMeterOpen Entry

```bash
curl -X POST https://api.pharmacollege.lk/q-meter-open \
-H "Content-Type: application/json" \
-d '{
  "quest_id": 103,
  "d_id": 7,
  "user_id": 5,
  "created_at": "2024-09-02 14:00:00"
}'
```
