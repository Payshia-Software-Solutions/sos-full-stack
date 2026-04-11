# HpDosageForms API Documentation

## Overview
The `HpDosageForms` API provides CRUD operations for managing dosage forms within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL
https://api.pharmacollege.lk/hp-dosage-forms


## Endpoints

### 1. Get All Dosage Forms
- **Endpoint:** `GET /hp-dosage-forms/`
- **Description:** Retrieves a list of all dosage forms.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "id": 1,
            "name": "Dosage Form 1",
            "is_active": 1,
            "created_by": "admin",
            "created_at": "2024-09-01 12:34:56"
        },
        {
            "id": 2,
            "name": "Dosage Form 2",
            "is_active": 0,
            "created_by": "user1",
            "created_at": "2024-09-02 13:00:00"
        }
    ]
    ```

### 2. Get Dosage Form by ID
- **Endpoint:** `GET /hp-dosage-forms/{id}/`
- **Description:** Retrieves a specific dosage form by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the dosage form to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "id": 1,
        "name": "Dosage Form 1",
        "is_active": 1,
        "created_by": "admin",
        "created_at": "2024-09-01 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the dosage form does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Dosage Form
- **Endpoint:** `POST /hp-dosage-forms/`
- **Description:** Creates a new dosage form.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "New Dosage Form",
        "is_active": 1,
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

### 4. Update a Dosage Form
- **Endpoint:** `PUT /hp-dosage-forms/{id}/`
- **Description:** Updates an existing dosage form.
- **Path Parameters:**
  - `id` (integer): The ID of the dosage form to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "Updated Dosage Form",
        "is_active": 0,
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

### 5. Delete a Dosage Form
- **Endpoint:** `DELETE /hp-dosage-forms/{id}/`
- **Description:** Deletes a specific dosage form by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the dosage form to delete.
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

### cURL Example for Creating a Dosage Form
```bash
curl -X POST https://api.pharmacollege.lk/hp-dosage-forms \
-H "Content-Type: application/json" \
-d '{
  "name": "New Dosage Form",
  "is_active": 1,
  "created_by": "admin"
}'
