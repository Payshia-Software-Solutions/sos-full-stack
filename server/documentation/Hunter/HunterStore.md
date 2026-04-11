# Hunter Store API Documentation

## Overview

The Hunter Store API provides CRUD operations for managing the storage of medicines within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/hunter-store`

## Endpoints

### 1. Get All Stores

- **Endpoint:** `GET /hunter-store/`
- **Description:** Retrieves a list of all stores.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "medicine_id": 101,
        "rack_id": 5,
        "dosageID": 2,
        "created_at": "2024-09-01T12:34:56Z",
        "created_by": "admin"
      },
      ...
    ]
    ```

### 2. Get Store by ID

- **Endpoint:** `GET /hunter-store/{id}/`
- **Description:** Retrieves a specific store by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the store to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "medicine_id": 101,
      "rack_id": 5,
      "dosageID": 2,
      "created_at": "2024-09-01T12:34:56Z",
      "created_by": "admin"
    }
    ```
  - **Status Code:** `404 Not Found` (if the store does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Store

- **Endpoint:** `POST /hunter-store/`
- **Description:** Creates a new store record.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "medicine_id": 101,
      "rack_id": 5,
      "dosageID": 2,
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

### 4. Update a Store

- **Endpoint:** `PUT /hunter-store/{id}/`
- **Description:** Updates an existing store record.
- **Path Parameters:**
  - `id` (integer): The ID of the store to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "medicine_id": 102,
      "rack_id": 6,
      "dosageID": 3,
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

### 5. Delete a Store

- **Endpoint:** `DELETE /hunter-store/{id}/`
- **Description:** Deletes a specific store by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the store to delete.
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

### cURL Example for Creating a Store

```bash
curl -X POST https://api.pharmacollege.lk/hunter-store \
-H "Content-Type: application/json" \
-d '{
  "medicine_id": 101,
  "rack_id": 5,
  "dosageID": 2,
  "created_by": "admin"
}'
