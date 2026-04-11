# WinPharmaSubmission API Documentation

## Overview

The `WinPharmaSubmission` API provides CRUD operations for managing submissions within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/win_pharma_submission

## Endpoints

### 1. Get All Submissions

- **Endpoint:** `GET /win_pharma_submission/`
- **Description:** Retrieves a list of all submissions.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "submission_id": 1,
        "index_number": "12345",
        "level_id": 2,
        "resource_id": 3,
        "submission": "Sample submission text",
        "grade": "A",
        "grade_status": "Approved",
        "date_time": "2024-09-02 12:34:56",
        "attempt": 1,
        "course_code": "CS101",
        "reason": "Completed on time",
        "update_by": "admin",
        "update_at": "2024-09-02 12:34:56",
        "recorrection_count": 0,
        "payment_status": "Paid"
      },
      {
        "submission_id": 2,
        "index_number": "67890",
        "level_id": 1,
        "resource_id": 2,
        "submission": "Another sample submission",
        "grade": "B",
        "grade_status": "Pending",
        "date_time": "2024-09-02 13:00:00",
        "attempt": 2,
        "course_code": "CS102",
        "reason": "Resubmission required",
        "update_by": "admin",
        "update_at": "2024-09-02 13:00:00",
        "recorrection_count": 1,
        "payment_status": "Pending"
      }
    ]
    ```

### 2. Get Submission by ID

- **Endpoint:** `GET /win_pharma_submission/{id}/`
- **Description:** Retrieves a specific submission by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the submission to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "submission_id": 1,
      "index_number": "12345",
      "level_id": 2,
      "resource_id": 3,
      "submission": "Sample submission text",
      "grade": "A",
      "grade_status": "Approved",
      "date_time": "2024-09-02 12:34:56",
      "attempt": 1,
      "course_code": "CS101",
      "reason": "Completed on time",
      "update_by": "admin",
      "update_at": "2024-09-02 12:34:56",
      "recorrection_count": 0,
      "payment_status": "Paid"
    }
    ```
  - **Status Code:** `404 Not Found` (If the submission does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Submission

- **Endpoint:** `POST /win_pharma_submission/`
- **Description:** Creates a new submission.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "index_number": "12345",
      "level_id": 2,
      "resource_id": 3,
      "submission": "New submission text",
      "grade": "A",
      "grade_status": "Approved",
      "date_time": "2024-09-02 12:34:56",
      "attempt": 1,
      "course_code": "CS101",
      "reason": "Completed on time",
      "update_by": "admin",
      "update_at": "2024-09-02 12:34:56",
      "recorrection_count": 0,
      "payment_status": "Paid"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "status": "WinPharmaSubmission created"
    }
    ```

### 4. Update a Submission

- **Endpoint:** `PUT /win_pharma_submission/{id}/`
- **Description:** Updates an existing submission.
- **Path Parameters:**
  - `id` (integer): The ID of the submission to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "submission_id": 1,
      "index_number": "12345",
      "level_id": 2,
      "resource_id": 3,
      "submission": "Updated submission text",
      "grade": "B",
      "grade_status": "Pending",
      "date_time": "2024-09-02 12:34:56",
      "attempt": 2,
      "course_code": "CS102",
      "reason": "Revised",
      "update_by": "admin",
      "update_at": "2024-09-02 12:34:56",
      "recorrection_count": 1,
      "payment_status": "Pending"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "status": "WinPharmaSubmission updated"
    }
    ```

### 5. Delete a Submission

- **Endpoint:** `DELETE /win_pharma_submission/{id}/`
- **Description:** Deletes a specific submission by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the submission to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "status": "WinPharmaSubmission deleted"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a Submission

```bash
curl -X POST https://api.pharmacollege.lk/win_pharma_submission \
-H "Content-Type: application/json" \
-d '{
  "index_number": "12345",
  "level_id": 2,
  "resource_id": 3,
  "submission": "New submission text",
  "grade": "A",
  "grade_status": "Approved",
  "date_time": "2024-09-02 12:34:56",
  "attempt": 1,
  "course_code": "CS101",
  "reason": "Completed on time",
  "update_by": "admin",
  "update_at": "2024-09-02 12:34:56",
  "recorrection_count": 0,
  "payment_status": "Paid"
}'
```
