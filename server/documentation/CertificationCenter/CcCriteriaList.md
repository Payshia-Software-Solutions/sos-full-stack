# `CcCriteriaList` API Documentation

## Overview

The `CcCriteriaList` API provides CRUD operations to manage criteria within the system. This document details the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/cc-criteria-list

markdown
Copy code

## Endpoints

### 1. Get All Criteria

- **Endpoint:** `GET /cc-criteria-list/`
- **Description:** Retrieves a list of all criteria.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "criteria_name": "Criteria A",
        "created_at": "2024-09-02 10:00:00",
        "created_by": "admin",
        "is_active": 1
      },
      {
        "id": 2,
        "criteria_name": "Criteria B",
        "created_at": "2024-09-02 11:00:00",
        "created_by": "user1",
        "is_active": 1
      }
    ]
    ```

### 2. Get Criteria by ID

- **Endpoint:** `GET /cc-criteria-list/{id}/`
- **Description:** Retrieves a specific criteria by its ID.
- **Path Parameters:**
  - `id` (integer): ID of the criteria to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "criteria_name": "Criteria A",
      "created_at": "2024-09-02 10:00:00",
      "created_by": "admin",
      "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (If the criteria does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Criteria

- **Endpoint:** `POST /cc-criteria-list/`
- **Description:** Creates a new criteria.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "criteria_name": "New Criteria",
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

### 4. Update a Criteria

- **Endpoint:** `PUT /cc-criteria-list/{id}/`
- **Description:** Updates an existing criteria.
- **Path Parameters:**
  - `id` (integer): ID of the criteria to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "criteria_name": "Updated Criteria Name",
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

### 5. Delete a Criteria

- **Endpoint:** `DELETE /cc-criteria-list/{id}/`
- **Description:** Deletes a specific criteria by its ID.
- **Path Parameters:**
  - `id` (integer): ID of the criteria to delete.
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

### cURL Example for Creating a Criteria

```bash
curl -X POST https://api.pharmacollege.lk/cc-criteria-list \
-H "Content-Type: application/json" \
-d '{
  "criteria_name": "Criteria C",
  "created_by": "admin",
  "is_active": 1
}'
```
