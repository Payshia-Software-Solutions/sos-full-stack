# Hunter Medicine API Documentation

## Overview

The Hunter Medicine API provides CRUD operations for managing medicines within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/hunter-medicine`

## Endpoints

### 1. Get All Medicines

- **Endpoint:** `GET /hunter-medicine/`
- **Description:** Retrieves a list of all medicines.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "category_id": 1,
        "product_code": "P12345",
        "medicine_name": "Medicine 1",
        "file_path": "/path/to/file",
        "active_status": "Active",
        "created_at": "2024-09-01T12:34:56Z",
        "created_by": "admin"
      },
      {
        "id": 2,
        "category_id": 2,
        "product_code": "P67890",
        "medicine_name": "Medicine 2",
        "file_path": "/path/to/file",
        "active_status": "Inactive",
        "created_at": "2024-09-02T13:00:00Z",
        "created_by": "user1"
      }
    ]
    ```

### 2. Get Medicine by ID

- **Endpoint:** `GET /hunter-medicine/{id}/`
- **Description:** Retrieves a specific medicine by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the medicine to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "category_id": 1,
      "product_code": "P12345",
      "medicine_name": "Medicine 1",
      "file_path": "/path/to/file",
      "active_status": "Active",
      "created_at": "2024-09-01T12:34:56Z",
      "created_by": "admin"
    }
    ```
  - **Status Code:** `404 Not Found` (if the medicine does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Medicine

- **Endpoint:** `POST /hunter-medicine/`
- **Description:** Creates a new medicine.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "category_id": 1,
      "product_code": "P11111",
      "medicine_name": "New Medicine",
      "file_path": "/path/to/file",
      "active_status": "Active",
      "created_by": "admin"
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

### 4. Update a Medicine

- **Endpoint:** `PUT /hunter-medicine/{id}/`
- **Description:** Updates an existing medicine.
- **Path Parameters:**
  - `id` (integer): The ID of the medicine to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "category_id": 1,
      "product_code": "P11111",
      "medicine_name": "Updated Medicine",
      "file_path": "/path/to/file",
      "active_status": "Inactive",
      "created_by": "admin"
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

### 5. Delete a Medicine

- **Endpoint:** `DELETE /hunter-medicine/{id}/`
- **Description:** Deletes a specific medicine by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the medicine to delete.
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

### cURL Example for Creating a Medicine

```bash
curl -X POST https://api.pharmacollege.lk/hunter-medicine \
-H "Content-Type: application/json" \
-d '{
  "category_id": 1,
  "product_code": "P11111",
  "medicine_name": "New Medicine",
  "file_path": "/path/to/file",
  "active_status": "Active",
  "created_by": "admin"
}'
