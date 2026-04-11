# Hunter Dosage API Documentation

## Overview

The Hunter Dosage API provides CRUD operations for managing dosage forms within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/hunter-dosage`

## Endpoints

### 1. Get All Dosages

- **Endpoint:** `GET /hunter-dosage/`
- **Description:** Retrieves a list of all dosage forms.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "dosageForm": "Dosage Form 1",
        "active_status": "Active",
        "created_at": "2024-09-01T12:34:56Z",
        "created_by": "admin"
      },
      {
        "id": 2,
        "dosageForm": "Dosage Form 2",
        "active_status": "Inactive",
        "created_at": "2024-09-02T13:00:00Z",
        "created_by": "user1"
      }
    ]
    ```

### 2. Get Dosage by ID

- **Endpoint:** `GET /hunter-dosage/{id}/`
- **Description:** Retrieves a specific dosage by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the dosage to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "dosageForm": "Dosage Form 1",
      "active_status": "Active",
      "created_at": "2024-09-01T12:34:56Z",
      "created_by": "admin"
    }
    ```
  - **Status Code:** `404 Not Found` (if the dosage does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Dosage

- **Endpoint:** `POST /hunter-dosage/`
- **Description:** Creates a new dosage.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "dosageForm": "New Dosage Form",
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

### 4. Update a Dosage

- **Endpoint:** `PUT /hunter-dosage/{id}/`
- **Description:** Updates an existing dosage.
- **Path Parameters:**
  - `id` (integer): The ID of the dosage to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "dosageForm": "Updated Dosage Form",
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

### 5. Delete a Dosage

- **Endpoint:** `DELETE /hunter-dosage/{id}/`
- **Description:** Deletes a specific dosage by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the dosage to delete.
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

### cURL Example for Creating a Dosage

```bash
curl -X POST https://api.pharmacollege.lk/hunter-dosage \
-H "Content-Type: application/json" \
-d '{
  "dosageForm": "New Dosage Form",
  "active_status": "Active",
  "created_by": "admin"
}'
