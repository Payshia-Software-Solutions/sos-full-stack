# AppointmentCategory API Documentation

## Overview
The `AppointmentCategory` API provides CRUD operations for managing appointment categories within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/`


## Endpoints

### 1. Get All Appointment Categories
- **Endpoint:** `GET /appointment-category/`
- **Description:** Retrieves a list of all appointment categories.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "id": 1,
            "category_name": "Category 1",
            "created_at": "2024-09-01 12:34:56",
            "created_by": "admin",
            "last_update": "2024-09-01 12:34:56",
            "is_active": 1
        },
        {
            "id": 2,
            "category_name": "Category 2",
            "created_at": "2024-09-02 13:00:00",
            "created_by": "user1",
            "last_update": "2024-09-02 13:00:00",
            "is_active": 0
        }
    ]
    ```

### 2. Get Appointment Category by ID
- **Endpoint:** `GET /appointment-category/{id}/`
- **Description:** Retrieves a specific appointment category by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the appointment category to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "id": 1,
        "category_name": "Category 1",
        "created_at": "2024-09-01 12:34:56",
        "created_by": "admin",
        "last_update": "2024-09-01 12:34:56",
        "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (If the appointment category does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Appointment Category
- **Endpoint:** `POST /appointment-category/`
- **Description:** Creates a new appointment category.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "category_name": "New Category",
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

### 4. Update an Appointment Category
- **Endpoint:** `PUT /appointment-category/{id}/`
- **Description:** Updates an existing appointment category.
- **Path Parameters:**
  - `id` (integer): The ID of the appointment category to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "category_name": "Updated Category",
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

### 5. Delete an Appointment Category
- **Endpoint:** `DELETE /appointment-category/{id}/`
- **Description:** Deletes a specific appointment category by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the appointment category to delete.
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

### cURL Example for Creating an Appointment Category
```bash
curl -X POST https://api.pharmacollege.lk/appointment-category \
-H "Content-Type: application/json" \
-d '{
  "category_name": "New Category",
  "created_by": "admin",
  "is_active": 1
}'
