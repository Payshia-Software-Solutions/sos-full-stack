# Payment Request API Documentation

## Overview

The Payment Request API provides CRUD operations for managing payment requests within the system. Each payment request can have an associated image file, which is uploaded and stored on the server. The URL of the uploaded image is saved in the database.

## Base URL

`https://api.pharmacollege.lk/payment-request`

## Endpoints

### 1. Get All Payment Requests

- **Endpoint:** `GET /payment-request/`
- **Description:** Retrieves a list of all payment requests.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "created_by": "user1",
        "created_at": "2024-10-12T08:00:00Z",
        "course_id": "C12345",
        "image": "https://api.pharmacollege.lk/uploads/images/Payments/image1.jpg",
        "reason": 1,
        "extra_note": "This is a test note",
        "status": 0,
        "reference_number": "REF12345"
      }
    ]
    ```

### 2. Get Payment Request by ID

- **Endpoint:** `GET /payment-request/{id}/`
- **Description:** Retrieves a specific payment request by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the payment request to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "created_by": "user1",
      "created_at": "2024-10-12T08:00:00Z",
      "course_id": "C12345",
      "image": "https://api.pharmacollege.lk/uploads/images/Payments/image1.jpg",
      "reason": 1,
      "extra_note": "This is a test note",
      "status": 0,
      "reference_number": "REF12345"
    }
    ```
  - **Status Code:** `404 Not Found`
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Payment Request

- **Endpoint:** `POST /payment-request/`
- **Description:** Creates a new payment request and uploads an associated image.
- **Request Body:**
  - **Content-Type:** `multipart/form-data`
  - **Body:**
    - `created_by`: (string) The creator of the request.
    - `course_id`: (string) The course ID associated with the request.
    - `image`: (file) The image file to be uploaded.
    - `reason`: (int) The reason for the request.
    - `extra_note`: (string) Additional notes.
    - `reference_number`: (string) The reference number.
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "Record created successfully"
    }
    ```

### 4. Update a Payment Request

- **Endpoint:** `PUT /payment-request/{id}/`
- **Description:** Updates an existing payment request and optionally updates the associated image.
- **Path Parameters:**
  - `id` (integer): The ID of the payment request to update.
- **Request Body:**
  - **Content-Type:** `multipart/form-data`
  - **Body:**
    - Any fields from the payment request can be updated.
    - **Optional:** `image` (file) to update the image.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Record updated successfully"
    }
    ```

### 5. Delete a Payment Request

- **Endpoint:** `DELETE /payment-request/{id}/`
- **Description:** Deletes a specific payment request by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the payment request to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Record deleted successfully"
    }
    ```

## Example Usage

### Creating a New Payment Request

```bash
curl -X POST https://api.pharmacollege.lk/payment-request/ \
  -F "created_by=user1" \
  -F "course_id=C12345" \
  -F "image=@/path/to/image.jpg" \
  -F "reason=1" \
  -F "extra_note=This is a test note" \
  -F "reference_number=REF12345"
```
