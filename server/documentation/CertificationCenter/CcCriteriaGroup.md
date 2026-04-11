# `CcCriteriaGroup` API Documentation

## Overview

The `CcCriteriaGroup` API provides CRUD operations to manage criteria groups within the system. This document details the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/cc-criteria-group

ruby
Copy code

## Endpoints

### 1. Get All Criteria Groups

- **Endpoint:** `GET /cc-criteria-group/`
- **Description:** Retrieves a list of all criteria groups.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "group_name": "Criteria Group 1",
        "created_at": "2024-09-02 12:00:00",
        "created_by": "admin",
        "is_active": 1
      },
      {
        "id": 2,
        "group_name": "Criteria Group 2",
        "created_at": "2024-09-02 13:00:00",
        "created_by": "user1",
        "is_active": 1
      }
    ]
    ```

### 2. Get Criteria Group by ID

- **Endpoint:** `GET /cc-criteria-group/{id}/`
- **Description:** Retrieves a specific criteria group by its ID.
- **Path Parameters:**
  - `id` (integer): ID of the criteria group to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "group_name": "Criteria Group 1",
      "created_at": "2024-09-02 12:00:00",
      "created_by": "admin",
      "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (If the group does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Criteria Group

- **Endpoint:** `POST /cc-criteria-group/`
- **Description:** Creates a new criteria group.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "group_name": "New Criteria Group",
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

### 4. Update a Criteria Group

- **Endpoint:** `PUT /cc-criteria-group/{id}/`
- **Description:** Updates an existing criteria group.
- **Path Parameters:**
  - `id` (integer): ID of the criteria group to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "group_name": "Updated Criteria Group",
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

### 5. Delete a Criteria Group

- **Endpoint:** `DELETE /cc-criteria-group/{id}/`
- **Description:** Deletes a specific criteria group by its ID.
- **Path Parameters:**
  - `id` (integer): ID of the criteria group to delete.
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

### cURL Example for Creating a Criteria Group

```bash
curl -X POST https://api.pharmacollege.lk/cc-criteria-group \
-H "Content-Type: application/json" \
-d '{
  "group_name": "Evaluation Group A",
  "created_by": "admin",
  "is_active": 1
}'
css
Copy code
```
