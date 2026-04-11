# Hunter Category API Documentation

## Overview

The Hunter Category API provides CRUD operations for managing hunter categories within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/hunter-category`

## Endpoints

### 1. Get All Categories

- **Endpoint:** `GET /hunter-category/`
- **Description:** Retrieves a list of all hunter categories.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "category_name": "Category 1",
        "active_status": "Active",
        "created_at": "2024-09-01T12:34:56Z",
        "created_by": "admin"
      },
      {
        "id": 2,
        "category_name": "Category 2",
        "active_status": "Inactive",
        "created_at": "2024-09-02T13:00:00Z",
        "created_by": "user1"
      }
    ]
    ```

### 2. Get Category by ID

- **Endpoint:** `GET /hunter-category/{id}/`
- **Description:** Retrieves a specific category by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the category to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "category_name": "Category 1",
      "active_status": "Active",
      "created_at": "2024-09-01T12:34:56Z",
      "created_by": "admin"
    }
    ```
  - **Status Code:** `404 Not Found` (if the category does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Category

- **Endpoint:** `POST /hunter-category/`
- **Description:** Creates a new category.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "category_name": "New Category",
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

### 4. Update a Category

- **Endpoint:** `PUT /hunter-category/{id}/`
- **Description:** Updates an existing category.
- **Path Parameters:**
  - `id` (integer): The ID of the category to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "category_name": "Updated Category",
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

### 5. Delete a Category

- **Endpoint:** `DELETE /hunter-category/{id}/`
- **Description:** Deletes a specific category by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the category to delete.
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

### cURL Example for Creating a Category

```bash
curl -X POST https://api.pharmacollege.lk/hunter-category \
-H "Content-Type: application/json" \
-d '{
  "category_name": "New Category",
  "active_status": "Active",
  "created_by": "admin"
}'
