# Community Post API Documentation

## Overview

The Community Post API provides CRUD operations for managing community posts within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/community-post`

## Endpoints

### 1. Get All Community Posts

- **Endpoint:** `GET /community-post/`
- **Description:** Retrieves a list of all community posts.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "title": "Post Title 1",
        "user_account": "user1",
        "submitted_time": "2024-09-01T12:34:56Z",
        "type": 1,
        "category": 2,
        "content": "Content of post 1.",
        "current_status": 1,
        "is_active": 1,
        "views": 10
      },
      {
        "id": 2,
        "title": "Post Title 2",
        "user_account": "user2",
        "submitted_time": "2024-09-02T13:00:00Z",
        "type": 2,
        "category": 1,
        "content": "Content of post 2.",
        "current_status": 1,
        "is_active": 1,
        "views": 5
      }
    ]
    ```

### 2. Get Community Post by ID

- **Endpoint:** `GET /community-post/{id}/`
- **Description:** Retrieves a specific community post by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the community post to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "title": "Post Title 1",
      "user_account": "user1",
      "submitted_time": "2024-09-01T12:34:56Z",
      "type": 1,
      "category": 2,
      "content": "Content of post 1.",
      "current_status": 1,
      "is_active": 1,
      "views": 10
    }
    ```
  - **Status Code:** `404 Not Found` (if the community post does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Community Post

- **Endpoint:** `POST /community-post/`
- **Description:** Creates a new community post.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "title": "New Post Title",
      "user_account": "admin",
      "type": 1,
      "category": 2,
      "content": "Content for the new post.",
      "current_status": 1,
      "is_active": 1,
      "views": 0
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

### 4. Update a Community Post

- **Endpoint:** `PUT /community-post/{id}/`
- **Description:** Updates an existing community post.
- **Path Parameters:**
  - `id` (integer): The ID of the community post to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "title": "Updated Post Title",
      "user_account": "admin",
      "type": 2,
      "category": 1,
      "content": "Updated content for the post.",
      "current_status": 1,
      "is_active": 1,
      "views": 15
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

### 5. Delete a Community Post

- **Endpoint:** `DELETE /community-post/{id}/`
- **Description:** Deletes a specific community post by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the community post to delete.
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

- **Create a New Post:**
  ```bash
  curl -X POST https://api.pharmacollege.lk/community-post/ -H "Content-Type: application/json" -d '{"title": "New Post Title", "user_account": "admin", "type": 1, "category": 2, "content": "Content for the new post.", "current_status": 1, "is_active": 1, "views": 0}'
  ```
