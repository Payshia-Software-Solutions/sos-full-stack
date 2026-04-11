# CommunityPostReplyRatings API Documentation

## Overview

The CommunityPostReplyRatings API provides CRUD operations for managing ratings for community post replies. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/`

## Endpoints

### 1. Get All Reply Ratings

- **Endpoint:** `GET /community-post-reply-ratings/`
- **Description:** Retrieves a list of all ratings for replies.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "reply_id": 1,
        "created_by": "user123",
        "ratings": 5
      },
      {
        "reply_id": 2,
        "created_by": "user456",
        "ratings": 4
      }
    ]
    ```

### 2. Get Reply Rating by Reply ID

- **Endpoint:** `GET /community-post-reply-ratings/{reply_id}/`
- **Description:** Retrieves a specific rating by its reply ID.
- **Path Parameters:**
  - `reply_id` (integer): The ID of the reply rating to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "reply_id": 1,
      "created_by": "user123",
      "ratings": 5
    }
    ```
  - **Status Code:** `404 Not Found` (if the rating does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Reply Rating

- **Endpoint:** `POST /community-post-reply-ratings/`
- **Description:** Creates a new rating for a reply.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "reply_id": 3,
      "created_by": "user789",
      "ratings": 5
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

### 4. Update a Reply Rating

- **Endpoint:** `PUT /community-post-reply-ratings/{reply_id}/`
- **Description:** Updates an existing rating for a reply.
- **Path Parameters:**
  - `reply_id` (integer): The ID of the reply rating to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "created_by": "user789",
      "ratings": 4
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

### 5. Delete a Reply Rating

- **Endpoint:** `DELETE /community-post-reply-ratings/{reply_id}/`
- **Description:** Deletes a specific reply rating by its reply ID.
- **Path Parameters:**
  - `reply_id` (integer): The ID of the reply rating to delete.
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

### cURL Example for Creating a Reply Rating

```bash
curl -X POST https://api.pharmacollege.lk/community-post-reply-ratings \
-H "Content-Type: application/json" \
-d '{
  "reply_id": 3,
  "created_by": "user789",
  "ratings": 5
}'
```
