# `CcGraduationPackageItems` API Documentation

## Overview

The `CcGraduationPackageItems` API provides CRUD operations to manage graduation package items within the system. This document details the available endpoints, request parameters, response structures, and error codes.

## Base URL

```
https://api.pharmacollege.lk/cc-graduation-package-items
```

## Endpoints

### 1. Get All Graduation Package Items

- **Endpoint:** `GET /cc-graduation-package-items/`
- **Description:** Retrieves a list of all graduation package items.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "item_name": "Graduation Cap",
        "created_at": "2024-09-02 12:00:00",
        "created_by": "admin",
        "is_active": 1
      },
      {
        "id": 2,
        "item_name": "Gown",
        "created_at": "2024-09-02 12:30:00",
        "created_by": "user1",
        "is_active": 1
      }
    ]
    ```

### 2. Get Graduation Package Item by ID

- **Endpoint:** `GET /cc-graduation-package-items/{id}/`
- **Description:** Retrieves a specific graduation package item by its ID.
- **Path Parameters:**
  - `id` (integer): ID of the graduation package item to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "item_name": "Graduation Cap",
      "created_at": "2024-09-02 12:00:00",
      "created_by": "admin",
      "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (If the item does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Graduation Package Item

- **Endpoint:** `POST /cc-graduation-package-items/`
- **Description:** Creates a new graduation package item.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "item_name": "Graduation Certificate",
      "created_by": "admin",
      "is_active": 1
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

### 4. Update a Graduation Package Item

- **Endpoint:** `PUT /cc-graduation-package-items/{id}/`
- **Description:** Updates an existing graduation package item.
- **Path Parameters:**
  - `id` (integer): ID of the graduation package item to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "item_name": "Updated Graduation Cap",
      "created_by": "admin",
      "is_active": 0
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

### 5. Delete a Graduation Package Item

- **Endpoint:** `DELETE /cc-graduation-package-items/{id}/`
- **Description:** Deletes a specific graduation package item by its ID.
- **Path Parameters:**
  - `id` (integer): ID of the graduation package item to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Record deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** Invalid request or missing parameters.
- **404 Not Found:** The specified record could not be found.
- **500 Internal Server Error:** An internal server error occurred.

## Example Requests

### cURL Example for Creating a Graduation Package Item

```bash
curl -X POST https://api.pharmacollege.lk/cc-graduation-package-items \
-H "Content-Type: application/json" \
-d '{
  "item_name": "Graduation Medal",
  "created_by": "admin",
  "is_active": 1
}'
```
