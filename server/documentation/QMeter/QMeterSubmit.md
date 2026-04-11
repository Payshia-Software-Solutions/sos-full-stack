# QMeterSubmit API Documentation

## Overview

The `QMeterSubmit` API provides CRUD operations for managing submissions in the QMeter system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/q-meter-submits

## Endpoints

### 1. Get All QMeter Submits

- **Endpoint:** `GET /q-meter-submits/`
- **Description:** Retrieves a list of all QMeter submissions.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "date": "2024-10-01",
        "user_id": 123,
        "q_id": 1,
        "main_id": 10,
        "answer_selected": "A",
        "mark": 5,
        "attempts": 2,
        "attempt_stat": "completed",
        "created_at": "2024-10-01 12:34:56"
      },
      {
        "id": 2,
        "date": "2024-10-02",
        "user_id": 124,
        "q_id": 2,
        "main_id": 11,
        "answer_selected": "B",
        "mark": 4,
        "attempts": 1,
        "attempt_stat": "incomplete",
        "created_at": "2024-10-02 14:00:00"
      }
    ]
    ```

### 2. Get QMeter Submit by ID

- **Endpoint:** `GET /q-meter-submits/{id}/`
- **Description:** Retrieves a specific QMeter submission by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the QMeter submission to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "date": "2024-10-01",
      "user_id": 123,
      "q_id": 1,
      "main_id": 10,
      "answer_selected": "A",
      "mark": 5,
      "attempts": 2,
      "attempt_stat": "completed",
      "created_at": "2024-10-01 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the QMeter submission does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New QMeter Submit

- **Endpoint:** `POST /q-meter-submits/`
- **Description:** Creates a new QMeter submission.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "date": "2024-10-03",
      "user_id": 125,
      "q_id": 3,
      "main_id": 12,
      "answer_selected": "C",
      "mark": 3,
      "attempts": 1,
      "attempt_stat": "completed",
      "created_at": "2024-10-03 16:45:00"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "QMeterSubmit created"
    }
    ```

### 4. Update a QMeter Submit

- **Endpoint:** `PUT /q-meter-submits/{id}/`
- **Description:** Updates an existing QMeter submission.
- **Path Parameters:**
  - `id` (integer): The ID of the QMeter submission to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "date": "2024-10-04",
      "user_id": 126,
      "q_id": 4,
      "main_id": 13,
      "answer_selected": "D",
      "mark": 6,
      "attempts": 3,
      "attempt_stat": "completed",
      "created_at": "2024-10-04 09:30:00"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "QMeterSubmit updated"
    }
    ```

### 5. Delete a QMeter Submit

- **Endpoint:** `DELETE /q-meter-submits/{id}/`
- **Description:** Deletes a specific QMeter submission by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the QMeter submission to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "QMeterSubmit deleted"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a QMeter Submit

```bash
curl -X POST https://api.pharmacollege.lk/q-meter-submits/ \
-H "Content-Type: application/json" \
-d '{
  "date": "2024-10-03",
  "user_id": 125,
  "q_id": 3,
  "main_id": 12,
  "answer_selected": "C",
  "mark": 3,
  "attempts": 1,
  "attempt_stat": "completed",
  "created_at": "2024-10-03 16:45:00"
}'
```
