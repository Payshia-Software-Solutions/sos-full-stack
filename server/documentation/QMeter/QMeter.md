# QMeter API Documentation

## Overview

The `QMeter` API provides CRUD operations for managing question meter data within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/q-meter

## Endpoints

### 1. Get All QMeter Entries

- **Endpoint:** `GET /q-meter/`
- **Description:** Retrieves a list of all question meter entries.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "quest_id": 1,
        "main_id": 101,
        "quest_no": 1,
        "question": "What is 2 + 2?",
        "answer_1": "3",
        "answer_2": "4",
        "answer_3": "5",
        "answer_4": "6",
        "correct_answer": "4",
        "quest_stat": 1,
        "created_at": "2024-09-02 12:34:56"
      },
      {
        "id": 2,
        "quest_id": 2,
        "main_id": 102,
        "quest_no": 2,
        "question": "What is the capital of France?",
        "answer_1": "Berlin",
        "answer_2": "Madrid",
        "answer_3": "Paris",
        "answer_4": "Rome",
        "correct_answer": "Paris",
        "quest_stat": 1,
        "created_at": "2024-09-02 13:00:00"
      }
    ]
    ```

### 2. Get QMeter by ID

- **Endpoint:** `GET /q-meter/{id}/`
- **Description:** Retrieves a specific question meter entry by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the question meter entry to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "quest_id": 1,
      "main_id": 101,
      "quest_no": 1,
      "question": "What is 2 + 2?",
      "answer_1": "3",
      "answer_2": "4",
      "answer_3": "5",
      "answer_4": "6",
      "correct_answer": "4",
      "quest_stat": 1,
      "created_at": "2024-09-02 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the question meter entry does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New QMeter Entry

- **Endpoint:** `POST /q-meter/`
- **Description:** Creates a new question meter entry.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "quest_id": 3,
      "main_id": 103,
      "quest_no": 3,
      "question": "What is the largest planet in our solar system?",
      "answer_1": "Earth",
      "answer_2": "Mars",
      "answer_3": "Jupiter",
      "answer_4": "Saturn",
      "correct_answer": "Jupiter",
      "quest_stat": 1,
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

### 4. Update a QMeter Entry

- **Endpoint:** `PUT /q-meter/{id}/`
- **Description:** Updates an existing question meter entry.
- **Path Parameters:**
  - `id` (integer): The ID of the question meter entry to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "quest_id": 4,
      "main_id": 104,
      "quest_no": 4,
      "question": "Who developed the theory of relativity?",
      "answer_1": "Isaac Newton",
      "answer_2": "Albert Einstein",
      "answer_3": "Galileo Galilei",
      "answer_4": "Nikola Tesla",
      "correct_answer": "Albert Einstein",
      "quest_stat": 1,
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

### 5. Delete a QMeter Entry

- **Endpoint:** `DELETE /q-meter/{id}/`
- **Description:** Deletes a specific question meter entry by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the question meter entry to delete.
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

### cURL Example for Creating a QMeter Entry

```bash
curl -X POST https://api.pharmacollege.lk/q-meter \
-H "Content-Type: application/json" \
-d '{
  "quest_id": 3,
  "main_id": 103,
  "quest_no": 3,
  "question": "What is the largest planet in our solar system?",
  "answer_1": "Earth",
  "answer_2": "Mars",
  "answer_3": "Jupiter",
  "answer_4": "Saturn",
  "correct_answer": "Jupiter",
  "quest_stat": 1,
  "created_at": "2024-09-02 14:00:00"
}'
```
