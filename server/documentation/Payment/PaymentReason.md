# Payment Reason API Documentation

## Overview

The Payment Reason API provides CRUD operations for managing payment reasons within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/payment-reason`

## Endpoints

### 1. Get All Payment Reasons

- **Endpoint:** `GET /payment-reason/`
- **Description:** Retrieves a list of all payment reasons.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "reason": "Purchase"
      },
      {
        "id": 2,
        "reason": "Refund"
      }
    ]
    ```

### 2. Get Payment Reason by ID

- **Endpoint:** `GET /payment-reason/{id}/`
- **Description:** Retrieves a specific payment reason by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the payment reason to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "reason": "Purchase"
    }
    ```
  - **Status Code:** `404 Not Found` (if the payment reason does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Payment Reason

- **Endpoint:** `POST /payment-reason/`
- **Description:** Creates a new payment reason.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "reason": "New Reason"
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

### 4. Update a Payment Reason

- **Endpoint:** `PUT /payment-reason/{id}/`
- **Description:** Updates an existing payment reason.
- **Path Parameters:**
  - `id` (integer): The ID of the payment reason to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "reason": "Updated Reason"
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

### 5. Delete a Payment Reason

- **Endpoint:** `DELETE /payment-reason/{id}/`
- **Description:** Deletes a specific payment reason by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the payment reason to delete.
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

### cURL Example for Creating a Payment Reason

```bash
curl -X POST https://api.pharmacollege.lk/payment-reason/ \
-H "Content-Type: application/json" \
-d '{
  "reason": "New Reason"
}'
```
