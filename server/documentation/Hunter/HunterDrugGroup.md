# Hunter Drug Group API Documentation

## Overview

The Hunter Drug Group API provides CRUD operations for managing drug groups within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/hunter-drug-group`

## Endpoints

### 1. Get All Drug Groups

- **Endpoint:** `GET /hunter-drug-group/`
- **Description:** Retrieves a list of all drug groups.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "drug_group": "Drug Group 1",
        "active_status": "Active",
        "created_at": "2024-09-01T12:34:56Z",
        "created_by": "admin"
      },
      {
        "id": 2,
        "drug_group": "Drug Group 2",
        "active_status": "Inactive",
        "created_at": "2024-09-02T13:00:00Z",
        "created_by": "user1"
      }
    ]
    ```

### 2. Get Drug Group by ID

- **Endpoint:** `GET /hunter-drug-group/{id}/`
- **Description:** Retrieves a specific drug group by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the drug group to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "drug_group": "Drug Group 1",
      "active_status": "Active",
      "created_at": "2024-09-01T12:34:56Z",
      "created_by": "admin"
    }
    ```
  - **Status Code:** `404 Not Found` (if the drug group does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Drug Group

- **Endpoint:** `POST /hunter-drug-group/`
- **Description:** Creates a new drug group.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "drug_group": "New Drug Group",
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

### 4. Update a Drug Group

- **Endpoint:** `PUT /hunter-drug-group/{id}/`
- **Description:** Updates an existing drug group.
- **Path Parameters:**
  - `id` (integer): The ID of the drug group to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "drug_group": "Updated Drug Group",
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

### 5. Delete a Drug Group

- **Endpoint:** `DELETE /hunter-drug-group/{id}/`
- **Description:** Deletes a specific drug group by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the drug group to delete.
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

### cURL Example for Creating a Drug Group

```bash
curl -X POST https://api.pharmacollege.lk/hunter-drug-group \
-H "Content-Type: application/json" \
-d '{
  "drug_group": "New Drug Group",
  "active_status": "Active",
  "created_by": "admin"
}'
