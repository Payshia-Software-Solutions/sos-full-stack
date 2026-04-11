# Creating the markdown file for Levels API Documentation

levels_api_doc = """

# Levels API Documentation

## Overview

The `Levels` API provides CRUD operations for managing levels within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/levels

## Endpoints

### 1. Get All Levels

- **Endpoint:** `GET /levels/`
- **Description:** Retrieves a list of all levels.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "batch_id": 101,
        "level_code": "L001",
        "level_name": "Beginner",
        "level_description": "This level is for beginners in the course.",
        "created_by": "admin",
        "status_active": 1,
        "created_at": "2024-09-10 10:00:00"
      },
      {
        "id": 2,
        "batch_id": 102,
        "level_code": "L002",
        "level_name": "Intermediate",
        "level_description": "This level is for intermediate students.",
        "created_by": "admin",
        "status_active": 1,
        "created_at": "2024-09-11 11:00:00"
      }
    ]
    ```

### 2. Get Level by ID

- **Endpoint:** `GET /levels/{id}/`
- **Description:** Retrieves a specific level by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the level to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "batch_id": 101,
      "level_code": "L001",
      "level_name": "Beginner",
      "level_description": "This level is for beginners in the course.",
      "created_by": "admin",
      "status_active": 1,
      "created_at": "2024-09-10 10:00:00"
    }
    ```
  - **Status Code:** `404 Not Found` (If the level does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Level

- **Endpoint:** `POST /levels/`
- **Description:** Creates a new level.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "batch_id": 103,
      "level_code": "L003",
      "level_name": "Advanced",
      "level_description": "This level is for advanced students.",
      "created_by": "admin",
      "status_active": 1
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "Level created successfully"
    }
    ```

### 4. Update a Level

- **Endpoint:** `PUT /levels/{id}/`
- **Description:** Updates an existing level.
- **Path Parameters:**
  - `id` (integer): The ID of the level to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "batch_id": 103,
      "level_code": "L003",
      "level_name": "Advanced Plus",
      "level_description": "This level is for advanced plus students.",
      "created_by": "admin",
      "status_active": 1
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Level updated successfully"
    }
    ```

### 5. Delete a Level

- **Endpoint:** `DELETE /levels/{id}/`
- **Description:** Deletes a specific level by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the level to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Level deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a Level

```bash
curl -X POST https://api.yoursite.com/levels \
-H "Content-Type: application/json" \
-d '{
  "batch_id": 103,
  "level_code": "L003",
  "level_name": "Advanced",
  "level_description": "This level is for advanced students.",
  "created_by": "admin",
  "status_active": 1
}'
```
