# CommunityKnowledgebase API Documentation

## Overview

The CommunityKnowledgebase API provides CRUD operations for managing knowledgebase articles within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/`

## Endpoints

### 1. Get All Knowledgebase Articles

- **Endpoint:** `GET /community-knowledgebase/`
- **Description:** Retrieves a list of all knowledgebase articles.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "title": "How to Use the Portal",
        "user_account": "user123",
        "submitted_time": "2023-01-01 12:00:00",
        "type": 1,
        "category": 2,
        "content": "This is the content of the article...",
        "current_status": 1,
        "is_active": 1,
        "views": 10
      },
      {
        "id": 2,
        "title": "FAQ",
        "user_account": "user456",
        "submitted_time": "2023-01-05 14:30:00",
        "type": 1,
        "category": 3,
        "content": "Frequently Asked Questions...",
        "current_status": 1,
        "is_active": 1,
        "views": 25
      }
    ]
    ```

### 2. Get Knowledgebase Article by ID

- **Endpoint:** `GET /community-knowledgebase/{id}/`
- **Description:** Retrieves a specific knowledgebase article by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the article to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "title": "How to Use the Portal",
      "user_account": "user123",
      "submitted_time": "2023-01-01 12:00:00",
      "type": 1,
      "category": 2,
      "content": "This is the content of the article...",
      "current_status": 1,
      "is_active": 1,
      "views": 10
    }
    ```
  - **Status Code:** `404 Not Found` (if the article does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Knowledgebase Article

- **Endpoint:** `POST /community-knowledgebase/`
- **Description:** Creates a new knowledgebase article.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "title": "New Knowledgebase Article",
      "user_account": "user789",
      "submitted_time": "2023-09-25 10:00:00",
      "type": 1,
      "category": 4,
      "content": "This is the content of the new article...",
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

### 4. Update a Knowledgebase Article

- **Endpoint:** `PUT /community-knowledgebase/{id}/`
- **Description:** Updates an existing knowledgebase article.
- **Path Parameters:**
  - `id` (integer): The ID of the article to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "title": "Updated Knowledgebase Article",
      "user_account": "user789",
      "submitted_time": "2023-09-25 10:00:00",
      "type": 1,
      "category": 4,
      "content": "Updated content...",
      "current_status": 1,
      "is_active": 1,
      "views": 10
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

### 5. Delete a Knowledgebase Article

- **Endpoint:** `DELETE /community-knowledgebase/{id}/`
- **Description:** Deletes a specific knowledgebase article by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the article to delete.
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

### cURL Example for Creating a Knowledgebase Article

```bash
curl -X POST https://api.pharmacollege.lk/community-knowledgebase \
-H "Content-Type: application/json" \
-d '{
  "title": "New Knowledgebase Article",
  "user_account": "user789",
  "submitted_time": "2023-09-25 10:00:00",
  "type": 1,
  "category": 4,
  "content": "This is the content of the new article...",
  "current_status": 1,
  "is_active": 1,
  "views": 0
}'
```
