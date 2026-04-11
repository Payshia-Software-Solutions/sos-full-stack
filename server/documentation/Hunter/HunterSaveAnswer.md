# Hunter Save Answer API Documentation

## Overview

The Hunter Save Answer API provides CRUD operations for managing saved answers within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/hunter-saveanswer`

## Endpoints

### 1. Get All Saved Answers

- **Endpoint:** `GET /hunter-saveanswer/`
- **Description:** Retrieves a list of all saved answers.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "index_number": "ABC123",
        "category_id": 1,
        "medicine_id": 2,
        "rack_id": 3,
        "dosage_id": 4,
        "answer_status": "Correct",
        "created_at": "2024-09-01T12:34:56Z",
        "score": 5,
        "score_type": "Points",
        "attempts": 1
      }
    ]
    ```

### 2. Get Saved Answer by ID

- **Endpoint:** `GET /hunter-saveanswer/{id}/`
- **Description:** Retrieves a specific saved answer by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the saved answer to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "index_number": "ABC123",
      "category_id": 1,
      "medicine_id": 2,
      "rack_id": 3,
      "dosage_id": 4,
      "answer_status": "Correct",
      "created_at": "2024-09-01T12:34:56Z",
      "score": 5,
      "score_type": "Points",
      "attempts": 1
    }
    ```
  - **Status Code:** `404 Not Found` (if the saved answer does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Saved Answer

- **Endpoint:** `POST /hunter-saveanswer/`
- **Description:** Creates a new saved answer.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "index_number": "ABC123",
      "category_id": 1,
      "medicine_id": 2,
      "rack_id": 3,
      "dosage_id": 4,
      "answer_status": "Correct",
      "score": 5,
      "score_type": "Points",
      "attempts": 1
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

### 4. Update a Saved Answer

- **Endpoint:** `PUT /hunter-saveanswer/{id}/`
- **Description:** Updates an existing saved answer.
- **Path Parameters:**
  - `id` (integer): The ID of the saved answer to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "index_number": "ABC123",
      "category_id": 1,
      "medicine_id": 2,
      "rack_id": 3,
      "dosage_id": 4,
      "answer_status": "Incorrect",
      "score": 3,
      "score_type": "Percentage",
      "attempts": 2
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

### 5. Delete a Saved Answer

- **Endpoint:** `DELETE /hunter-saveanswer/{id}/`
- **Description:** Deletes a specific saved answer by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the saved answer to delete.
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

### cURL Example for Creating a Saved Answer

```bash
curl -X POST https://api.pharmacollege.lk/hunter-saveanswer \
-H "Content-Type: application/json" \
-d '{
  "index_number": "ABC123",
  "category_id": 1,
  "medicine_id": 2,
  "rack_id": 3,
  "dosage_id": 4,
  "
