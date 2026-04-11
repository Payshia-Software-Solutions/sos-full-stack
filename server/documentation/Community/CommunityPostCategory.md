# Community Post Category API Documentation

## Overview

The Community Post Category API provides CRUD operations for managing community post categories within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/community-post-category`

## Endpoints

### 1. Get All Post Categories

- **Endpoint:** `GET /community-post-category/`
- **Description:** Retrieves a list of all community post categories.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "category_name": "Category 1",
        "bg_color": "primary",
        "is_active": 1,
        "created_by": "admin",
        "created_at": "2024-09-01T12:34:56Z"
      },
      {
        "id": 2,
        "category_name": "Category 2",
        "bg_color": "secondary",
        "is_active": 1,
        "created_by": "user1",
        "created_at": "2024-09-02T13:00:00Z"
      }
    ]
    ```

### 2. Get Post Category by ID

- **Endpoint:** `GET /community-post-category/{id}/`
- **Description:** Retrieves a specific community post category by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the community post category to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "category_name": "Category 1",
      "bg_color": "primary",
      "is_active": 1,
      "created_by": "admin",
      "created_at": "2024-09-01T12:34:56Z"
    }
    ```
  - **Status Code:** `404 Not Found` (if the community post category does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Post Category

- **Endpoint:** `POST /community-post-category/`
- **Description:** Creates a new community post category.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "category_name": "New Category",
      "bg_color": "primary",
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

### 4. Update a Post Category

- **Endpoint:** `PUT /community-post-category/{id}/`
- **Description:** Updates an existing community post category.
- **Path Parameters:**
  - `id` (integer): The ID of the community post category to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "category_name": "Updated Category",
      "bg_color": "secondary",
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

### 5. Delete a Post Category

- **Endpoint:** `DELETE /community-post-category/{id}/`
- **Description:** Deletes a specific community post category by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the community post category to delete.
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

### cURL Example for Creating a Post Category

```bash
curl -X POST https://api.pharmacollege.lk/community-post-category/ \
-H "Content-Type: application/json" \
-d '{
  "category_name": "New Category",
  "bg_color": "primary",
  "is_active": 1,
  "created_by": "admin"
}'
```
