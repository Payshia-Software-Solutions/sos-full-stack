# PrescriptionAnswer API Documentation

## Overview

The `PrescriptionAnswer` API provides CRUD operations for managing prescription answers in the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/prescription_answer

## Endpoints

### 1. Get All Prescription Answers

- **Endpoint:** `GET /prescription_answer/`
- **Description:** Retrieves a list of all prescription answers.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "answer_id": 101,
        "pres_id": 202,
        "cover_id": 303,
        "date": "2024-11-10",
        "name": "Prescription 1",
        "drug_name": "Drug 1",
        "drug_type": "Tablet",
        "drug_qty": 30,
        "morning_qty": 1,
        "afternoon_qty": 1,
        "evening_qty": 1,
        "night_qty": 1,
        "meal_type": "Before",
        "using_type": "Oral",
        "at_a_time": 1,
        "hour_qty": 2,
        "additional_description": "Take with water",
        "created_at": "2024-11-10 12:00:00",
        "created_by": "admin"
      },
      {
        "id": 2,
        "answer_id": 102,
        "pres_id": 204,
        "cover_id": 304,
        "date": "2024-11-10",
        "name": "Prescription 2",
        "drug_name": "Drug 2",
        "drug_type": "Syrup",
        "drug_qty": 50,
        "morning_qty": 2,
        "afternoon_qty": 2,
        "evening_qty": 2,
        "night_qty": 2,
        "meal_type": "After",
        "using_type": "Oral",
        "at_a_time": 2,
        "hour_qty": 3,
        "additional_description": "Shake before use",
        "created_at": "2024-11-10 13:00:00",
        "created_by": "user1"
      }
    ]
    ```

### 2. Get Prescription Answer by ID

- **Endpoint:** `GET /prescription_answer/{id}/`
- **Description:** Retrieves a specific prescription answer by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription answer to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "answer_id": 101,
      "pres_id": 202,
      "cover_id": 303,
      "date": "2024-11-10",
      "name": "Prescription 1",
      "drug_name": "Drug 1",
      "drug_type": "Tablet",
      "drug_qty": 30,
      "morning_qty": 1,
      "afternoon_qty": 1,
      "evening_qty": 1,
      "night_qty": 1,
      "meal_type": "Before",
      "using_type": "Oral",
      "at_a_time": 1,
      "hour_qty": 2,
      "additional_description": "Take with water",
      "created_at": "2024-11-10 12:00:00",
      "created_by": "admin"
    }
    ```
  - **Status Code:** `404 Not Found` (If the prescription answer does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Prescription Answer

- **Endpoint:** `POST /prescription_answer/`
- **Description:** Creates a new prescription answer.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "answer_id": 105,
      "pres_id": 210,
      "cover_id": 315,
      "date": "2024-11-10",
      "name": "Prescription 3",
      "drug_name": "Drug 3",
      "drug_type": "Capsule",
      "drug_qty": 20,
      "morning_qty": 2,
      "afternoon_qty": 2,
      "evening_qty": 2,
      "night_qty": 2,
      "meal_type": "Before",
      "using_type": "Oral",
      "at_a_time": 1,
      "hour_qty": 3,
      "additional_description": "Store in a cool place",
      "created_at": "2024-11-10 14:00:00",
      "created_by": "admin"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "Prescription Answer created successfully"
    }
    ```

### 4. Update a Prescription Answer

- **Endpoint:** `PUT /prescription_answer/{id}/`
- **Description:** Updates an existing prescription answer.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription answer to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "answer_id": 106,
      "pres_id": 220,
      "cover_id": 330,
      "date": "2024-11-10",
      "name": "Prescription 4",
      "drug_name": "Drug 4",
      "drug_type": "Injection",
      "drug_qty": 10,
      "morning_qty": 1,
      "afternoon_qty": 1,
      "evening_qty": 1,
      "night_qty": 1,
      "meal_type": "After",
      "using_type": "Injection",
      "at_a_time": 1,
      "hour_qty": 1,
      "additional_description": "Consult a doctor before use",
      "created_at": "2024-11-10 15:00:00",
      "created_by": "user2"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Prescription Answer updated successfully"
    }
    ```

### 5. Delete a Prescription Answer

- **Endpoint:** `DELETE /prescription_answer/{id}/`
- **Description:** Deletes a specific prescription answer by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription answer to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Prescription Answer deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a Prescription Answer

```bash
curl -X POST https://api.pharmacollege.lk/prescription_answer \
-H "Content-Type: application/json" \
-d '{
  "answer_id": 105,
  "pres_id": 210,
  "cover_id": 315,
  "date": "2024-11-10",
  "name": "Prescription 3",
  "drug_name": "Drug 3",
  "drug_type": "Capsule",
  "drug_qty": 20,
  "morning_qty": 2,
  "afternoon_qty": 2,
  "evening_qty": 2,
  "night_qty": 2,

```
