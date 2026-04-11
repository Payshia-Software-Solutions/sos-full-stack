# Community Post Reply API Documentation

## Overview

The Community Post Reply API provides CRUD operations for managing replies to community posts, including the ability to manage ratings for each reply. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/community-post-reply`

## Endpoints

### 1. Get All Replies

- **Endpoint:** `GET /community-post-reply/`
- **Description:** Retrieves a list of all replies.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "post_id": 101,
        "reply_content": "This is a reply",
        "created_by": "user1",
        "created_at": "2024-09-30T12:34:56Z",
        "likes": 5,
        "dislikes": 0,
        "ratings": 4,
        "is_active": 1
      },
      {
        "id": 2,
        "post_id": 102,
        "reply_content": "Another reply",
        "created_by": "user2",
        "created_at": "2024-10-01T10:00:00Z",
        "likes": 3,
        "dislikes": 1,
        "ratings": 5,
        "is_active": 1
      }
    ]
    ```

### 2. Get Reply by ID

- **Endpoint:** `GET /community-post-reply/{id}/`
- **Description:** Retrieves a specific reply by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the reply to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "post_id": 101,
      "reply_content": "This is a reply",
      "created_by": "user1",
      "created_at": "2024-09-30T12:34:56Z",
      "likes": 5,
      "dislikes": 0,
      "ratings": 4,
      "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (if the reply does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Reply

- **Endpoint:** `POST /community-post-reply/`
- **Description:** Creates a new reply.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "post_id": 101,
      "reply_content": "This is a new reply",
      "created_by": "user3",
      "likes": 0,
      "dislikes": 0,
      "ratings": 5,
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

### 4. Update a Reply

- **Endpoint:** `PUT /community-post-reply/{id}/`
- **Description:** Updates an existing reply.
- **Path Parameters:**
  - `id` (integer): The ID of the reply to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "reply_content": "This is an updated reply",
      "likes": 10,
      "dislikes": 2,
      "ratings": 4,
      "is_active": 1
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

### 5. Delete a Reply

- **Endpoint:** `DELETE /community-post-reply/{id}/`
- **Description:** Deletes a specific reply by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the reply to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "Record deleted successfully"
    }
    ```

### 6. Get Reply Statistics

- **Endpoint:** `GET /community-post-reply/statistics/`
- **Description:** Retrieves statistics about replies, including the number of replies and the number of posts replied to by each student.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "student_name": "user1",
        "reply_count": 10,
        "reply_post_count": 5,
        "ratings": 4
      },
      {
        "student_name": "user2",
        "reply_count": 8,
        "reply_post_count": 4,
        "ratings": 5
      }
    ]
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a Reply

```bash
curl -X POST https://api.pharmacollege.lk/community-post-reply \
-H "Content-Type: application/json" \
-d '{
  "post_id": 101,
  "reply_content": "This is a new reply",
  "created_by": "user3",
  "likes": 0,
  "dislikes": 0,
  "ratings": 5,
  "is_active": 1
}'
```
