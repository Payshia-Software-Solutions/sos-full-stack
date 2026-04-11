# HpCategories API Documentation

## Overview
The `HpCategories` API provides CRUD operations for managing categories within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL
https://api.pharmacollege.lk/hp-categories


## Endpoints

### 1. Get All Categories
- **Endpoint:** `GET /hp-categories/`
- **Description:** Retrieves a list of all categories.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "id": 1,
            "name": "Category 1",
            "is_active": 1,
            "created_by": "admin",
            "created_at": "2024-09-02 12:34:56"
        },
        {
            "id": 2,
            "name": "Category 2",
            "is_active": 1,
            "created_by": "user1",
            "created_at": "2024-09-02 13:00:00"
        }
    ]
    ```

### 2. Get Category by ID
- **Endpoint:** `GET /hp-categories/{id}/`
- **Description:** Retrieves a specific category by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the category to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "id": 1,
        "name": "Category 1",
        "is_active": 1,
        "created_by": "admin",
        "created_at": "2024-09-02 12:34:56"
    }
    ```
  - **Status Code:** `404 Not Found` (If the category does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Category
- **Endpoint:** `POST /hp-categories/`
- **Description:** Creates a new category.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "New Category",
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

### 4. Update a Category
- **Endpoint:** `PUT /hp-categories/{id}/`
- **Description:** Updates an existing category.
- **Path Parameters:**
  - `id` (integer): The ID of the category to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "name": "Updated Category",
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

### 5. Delete a Category
- **Endpoint:** `DELETE /hp-categories/{id}/`
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
curl -X POST https://api.pharmacollege.lk/hp-categories \
-H "Content-Type: application/json" \
-d '{
  "name": "New Category",
  "is_active": 1,
  "created_by": "admin"
}'
