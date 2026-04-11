# WinPharmaLevelResource API Documentation

## Overview

The `WinPharmaLevelResource` API provides CRUD operations for managing resources within the `win_pharma_level_resources` table. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/win_pharma_level_resources

## Notes

- `task_cover` can be provided either as a string path/filename (JSON) or as a file upload (multipart/form-data, field name: `task_cover`).
- `video_url` is optional and can store a YouTube/video URL for embedding in the student view.

## Endpoints

### 1. Get All WinPharma Level Resources

- **Endpoint:** `GET /win_pharma_level_resources/`
- **Description:** Retrieves a list of all WinPharma level resources.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "resource_id": 1,
        "level_id": 1,
        "resource_title": "Resource 1",
        "resource_data": "Data for resource 1",
        "created_by": "admin",
        "task_cover": "cover1.jpg",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "is_active": 1
      },
      {
        "resource_id": 2,
        "level_id": 2,
        "resource_title": "Resource 2",
        "resource_data": "Data for resource 2",
        "created_by": "user1",
        "task_cover": "cover2.jpg",
        "is_active": 1
      }
    ]
    ```

### 2. Get WinPharma Level Resource by ID

- **Endpoint:** `GET /win_pharma_level_resources/{id}/`
- **Description:** Retrieves a specific WinPharma level resource by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the resource to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "resource_id": 1,
      "level_id": 1,
      "resource_title": "Resource 1",
      "resource_data": "Data for resource 1",
      "created_by": "admin",
      "task_cover": "cover1.jpg",
      "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (If the resource does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New WinPharma Level Resource

- **Endpoint:** `POST /win_pharma_level_resources/`
- **Description:** Creates a new WinPharma level resource.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "level_id": 1,
      "resource_title": "New Resource",
      "resource_data": "Data for new resource",
      "created_by": "admin",
      "task_cover": "cover.jpg",
      "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "is_active": 1
    }
  ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:**
    ```json
    {
      "message": "WinPharmaLevelResource created successfully"
    }
    ```

### 4. Update a WinPharma Level Resource

- **Endpoint:** `PUT /win_pharma_level_resources/{id}/`
- **Description:** Updates an existing WinPharma level resource.
- **Path Parameters:**
  - `id` (integer): The ID of the resource to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "resource_id": 1,
      "level_id": 2,
      "resource_title": "Updated Resource",
      "resource_data": "Updated data",
      "created_by": "admin",
      "task_cover": "updated_cover.jpg",
      "is_active": 0
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "WinPharmaLevelResource updated successfully"
    }
    ```

### 5. Delete a WinPharma Level Resource

- **Endpoint:** `DELETE /win_pharma_level_resources/{id}/`
- **Description:** Deletes a specific WinPharma level resource by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the resource to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "message": "WinPharmaLevelResource deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a WinPharma Level Resource

```bash
curl -X POST https://api.pharmacollege.lk/win_pharma_level_resources \
-H "Content-Type: application/json" \
-d '{
  "level_id": 1,
  "resource_title": "New Resource",
  "resource_data": "Data for new resource",
  "created_by": "admin",
  "task_cover": "cover.jpg",
  "is_active": 1
}'
```
