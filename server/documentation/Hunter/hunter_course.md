# HunterCourse API Documentation

## Overview

The HunterCourse API provides CRUD operations for managing courses within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/`

## Endpoints

### 1. Get All Courses

- **Endpoint:** `GET /hunter-course/`
- **Description:** Retrieves a list of all courses.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "CourseCode": "CS101",
        "MediID": "M001",
        "status": "Active"
      },
      {
        "id": 2,
        "CourseCode": "CS102",
        "MediID": "M002",
        "status": "Inactive"
      }
    ]
    ```

### 2. Get Course by ID

- **Endpoint:** `GET /hunter-course/{id}/`
- **Description:** Retrieves a specific course by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the course to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "CourseCode": "CS101",
      "MediID": "M001",
      "status": "Active"
    }
    ```
  - **Status Code:** `404 Not Found` (if the course does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Course

- **Endpoint:** `POST /hunter-course/`
- **Description:** Creates a new course.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "CourseCode": "CS103",
      "MediID": "M003",
      "status": "Active"
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

### 4. Update a Course

- **Endpoint:** `PUT /hunter-course/{id}/`
- **Description:** Updates an existing course.
- **Path Parameters:**
  - `id` (integer): The ID of the course to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "CourseCode": "CS101",
      "MediID": "M001",
      "status": "Inactive"
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

### 5. Delete a Course

- **Endpoint:** `DELETE /hunter-course/{id}/`
- **Description:** Deletes a specific course by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the course to delete.
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

### cURL Example for Creating a Course

```bash
curl -X POST https://api.pharmacollege.lk/hunter-course \
-H "Content-Type: application/json" \
-d '{
  "CourseCode": "CS103",
  "MediID": "M003",
  "status": "Active"
}'
