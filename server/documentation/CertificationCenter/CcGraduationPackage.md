# Creating a markdown file for the documentation as requested

documentation_content = """

# CcGraduationPackage API Documentation

## Overview

The `CcGraduationPackage` API provides CRUD operations for managing graduation packages within the certification center system. This API allows clients to fetch, create, update, and delete graduation packages.

## Base URL

https://api.pharmacollege.lk/cc-graduation-package

## Endpoints

### 1. Get All Graduation Packages

- **Endpoint:** `GET /cc-graduation-package/`
- **Description:** Retrieves a list of all graduation packages.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "package_name": "Package 1",
        "price": 12000.0,
        "items": "Items included: Certificate, Medal",
        "created_at": "2024-11-10 11:48:44",
        "created_by": "admin",
        "is_active": 1
      },
      {
        "id": 2,
        "package_name": "Package 2",
        "price": 15000.0,
        "items": "Items included: Certificate, Medal, Document Folder",
        "created_at": "2024-11-11 12:00:00",
        "created_by": "user1",
        "is_active": 1
      }
    ]
    ```

### 2. Get Graduation Package by ID

- **Endpoint:** `GET /cc-graduation-package/{id}/`
- **Description:** Retrieves a specific graduation package by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the graduation package to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "package_name": "Package 1",
      "price": 12000.0,
      "items": "Items included: Certificate, Medal",
      "created_at": "2024-11-10 11:48:44",
      "created_by": "admin",
      "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (If the graduation package does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Graduation Package

- **Endpoint:** `POST /cc-graduation-package/`
- **Description:** Creates a new graduation package.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "package_name": "Package 3",
      "price": 18000.0,
      "items": "Items included: Certificate, Medal, Document Folder",
      "created_at": "2024-11-12 14:00:00",
      "created_by": "admin",
      "is_active": 1
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "Graduation Package created successfully"
    }
    ```

### 4. Update a Graduation Package

- **Endpoint:** `PUT /cc-graduation-package/{id}/`
- **Description:** Updates an existing graduation package.
- **Path Parameters:**
  - `id` (integer): The ID of the graduation package to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "package_name": "Updated Package",
      "price": 20000.0,
      "items": "Items included: Certificate, Medal, Document Folder, Lapel Pin",
      "created_at": "2024-11-12 15:00:00",
      "created_by": "admin",
      "is_active": 1
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Graduation Package updated successfully"
    }
    ```

### 5. Delete a Graduation Package

- **Endpoint:** `DELETE /cc-graduation-package/{id}/`
- **Description:** Deletes a specific graduation package by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the graduation package to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Graduation Package deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a Graduation Package

```bash
curl -X POST https://api.pharmacollege.lk/cc-graduation-package \
-H "Content-Type: application/json" \
-d '{
  "package_name": "Package 3",
  "price": 18000.00,
  "items": "Items included: Certificate, Medal, Document Folder",
  "created_at": "2024-11-12 14:00:00",
  "created_by": "admin",
  "is_active": 1
}'
```
