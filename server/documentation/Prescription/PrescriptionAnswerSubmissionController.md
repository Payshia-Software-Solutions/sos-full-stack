# PrescriptionAnswerSubmission API Documentation

## Overview

The `PrescriptionAnswerSubmission` API provides CRUD operations for managing prescription answer submissions within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/prescription_answer_submission

## Endpoints

### 1. Get All Prescription Answer Submissions

- **Endpoint:** `GET /prescription_answer_submission/`
- **Description:** Retrieves a list of all prescription answer submissions.
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
        "date": "2024-09-02",
        "name": "John Doe",
        "drug_name": "Aspirin",
        "drug_type": "Tablet",
        "drug_qty": 10,
        "morning_qty": 2,
        "afternoon_qty": 2,
        "evening_qty": 2,
        "night_qty": 2,
        "meal_type": "With meal",
        "using_type": "Oral",
        "at_a_time": 1,
        "hour_qty": 3,
        "additional_description": "Take after meals",
        "created_at": "2024-09-02 12:34:56",
        "created_by": "admin",
        "answer_status": "Pending",
        "score": 85
      },
      {
        "id": 2,
        "answer_id": 102,
        "pres_id": 204,
        "cover_id": 305,
        "date": "2024-09-03",
        "name": "Jane Smith",
        "drug_name": "Ibuprofen",
        "drug_type": "Tablet",
        "drug_qty": 20,
        "morning_qty": 1,
        "afternoon_qty": 1,
        "evening_qty": 1,
        "night_qty": 1,
        "meal_type": "Before meal",
        "using_type": "Oral",
        "at_a_time": 1,
        "hour_qty": 4,
        "additional_description": "Take with water",
        "created_at": "2024-09-03 14:20:00",
        "created_by": "user1",
        "answer_status": "Completed",
        "score": 90
      }
    ]
    ```

### 2. Get Prescription Answer Submission by ID

- **Endpoint:** `GET /prescription_answer_submission/{id}/`
- **Description:** Retrieves a specific prescription answer submission by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription answer submission to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "answer_id": 101,
      "pres_id": 202,
      "cover_id": 303,
      "date": "2024-09-02",
      "name": "John Doe",
      "drug_name": "Aspirin",
      "drug_type": "Tablet",
      "drug_qty": 10,
      "morning_qty": 2,
      "afternoon_qty": 2,
      "evening_qty": 2,
      "night_qty": 2,
      "meal_type": "With meal",
      "using_type": "Oral",
      "at_a_time": 1,
      "hour_qty": 3,
      "additional_description": "Take after meals",
      "created_at": "2024-09-02 12:34:56",
      "created_by": "admin",
      "answer_status": "Pending",
      "score": 85
    }
    ```
  - **Status Code:** `404 Not Found` (If the submission does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Prescription Answer Submission

- **Endpoint:** `POST /prescription_answer_submission/`
- **Description:** Creates a new prescription answer submission.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "answer_id": 103,
      "pres_id": 205,
      "cover_id": 306,
      "date": "2024-09-04",
      "name": "Mark Lee",
      "drug_name": "Paracetamol",
      "drug_type": "Tablet",
      "drug_qty": 15,
      "morning_qty": 3,
      "afternoon_qty": 2,
      "evening_qty": 2,
      "night_qty": 3,
      "meal_type": "After meal",
      "using_type": "Oral",
      "at_a_time": 1,
      "hour_qty": 2,
      "additional_description": "Take with food",
      "created_at": "2024-09-04 10:00:00",
      "created_by": "admin",
      "answer_status": "Pending",
      "score": 80
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

### 4. Update a Prescription Answer Submission

- **Endpoint:** `PUT /prescription_answer_submission/{id}/`
- **Description:** Updates an existing prescription answer submission.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription answer submission to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "answer_id": 103,
      "pres_id": 205,
      "cover_id": 306,
      "date": "2024-09-04",
      "name": "Mark Lee",
      "drug_name": "Paracetamol",
      "drug_type": "Tablet",
      "drug_qty": 15,
      "morning_qty": 2,
      "afternoon_qty": 3,
      "evening_qty": 2,
      "night_qty": 3,
      "meal_type": "After meal",
      "using_type": "Oral",
      "at_a_time": 1,
      "hour_qty": 2,
      "additional_description": "Take with food",
      "created_at": "2024-09-04 10:00:00",
      "created_by": "admin",
      "answer_status": "Completed",
      "score": 90
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

### 5. Delete a Prescription Answer Submission

- **Endpoint:** `DELETE /prescription_answer_submission/{id}/`
- **Description:** Deletes a specific prescription answer submission by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription answer submission to delete.
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

### cURL Example for Creating a Prescription Answer Submission

```bash
curl -X POST https://api.pharmacollege.lk/prescription_answer_submission \
-H "Content-Type: application/json" \
-d '{
  "answer_id": 103,
  "pres_id": 205,
  "cover_id": 306,
  "date": "2024-09-04",
  "name": "Mark Lee",
  "drug_name": "Paracetamol",
  "drug_type": "Tablet",
  "drug_qty": 15,
  "morning_qty": 3,
  "afternoon_qty": 2,
  "evening_qty": 2,
  "night_qty": 3,
  "meal_type": "After meal",
  "using_type": "Oral",
  "at_a_time": 1,
  "hour_qty": 2,
  "additional_description": "Take with food",
  "created_at": "2024-09-04 10:00:00",
  "created_by": "admin",
  "answer_status": "Pending",
  "score": 80
}'
```
