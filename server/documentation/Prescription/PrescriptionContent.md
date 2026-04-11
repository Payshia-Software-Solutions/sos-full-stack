# PrescriptionContent API Documentation

## Overview

The `PrescriptionContent` API provides CRUD operations for managing prescription content within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/prescription_content

## Endpoints

### 1. Get All Prescription Contents

- **Endpoint:** `GET /prescription_content/`
- **Description:** Retrieves a list of all prescription contents.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "pres_code": "PC001",
        "cover_id": "C001",
        "content": "Prescription content details for patient 1"
      },
      {
        "id": 2,
        "pres_code": "PC002",
        "cover_id": "C002",
        "content": "Prescription content details for patient 2"
      }
    ]
    ```

### 2. Get Prescription Content by ID

- **Endpoint:** `GET /prescription_content/{id}/`
- **Description:** Retrieves a specific prescription content by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription content to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "pres_code": "PC001",
      "cover_id": "C001",
      "content": "Prescription content details for patient 1"
    }
    ```
  - **Status Code:** `404 Not Found` (If the prescription content does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Prescription Content

- **Endpoint:** `POST /prescription_content/`
- **Description:** Creates a new prescription content.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "pres_code": "PC003",
      "cover_id": "C003",
      "content": "New prescription content details"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "Prescription created successfully"
    }
    ```

### 4. Update a Prescription Content

- **Endpoint:** `PUT /prescription_content/{id}/`
- **Description:** Updates an existing prescription content.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription content to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "pres_code": "PC003",
      "cover_id": "C003",
      "content": "Updated prescription content details"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Prescription updated successfully"
    }
    ```

### 5. Delete a Prescription Content

- **Endpoint:** `DELETE /prescription_content/{id}/`
- **Description:** Deletes a specific prescription content by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription content to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Prescription deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a Prescription Content

```bash
curl -X POST https://api.pharmacollege.lk/prescription_content \
-H "Content-Type: application/json" \
-d '{
  "pres_code": "PC003",
  "cover_id": "C003",
  "content": "New prescription content details"
}'
```
