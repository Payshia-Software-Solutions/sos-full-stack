# HunterSettings API Documentation

## Overview
The `HunterSettings` API provides CRUD operations for managing settings within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/`

## Endpoints

### 1. Get All Settings
- **Endpoint:** `GET /hunter-settings/`
- **Description:** Retrieves a list of all settings.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "setting_name": "setting1",
            "value": "value1"
        },
        {
            "setting_name": "setting2",
            "value": "value2"
        }
    ]
    ```

### 2. Get Setting by Name
- **Endpoint:** `GET /hunter-settings/{setting_name}/`
- **Description:** Retrieves a specific setting by its name.
- **Path Parameters:**
  - `setting_name` (string): The name of the setting to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "setting_name": "setting1",
        "value": "value1"
    }
    ```
  - **Status Code:** `404 Not Found` (If the setting does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Setting
- **Endpoint:** `POST /hunter-settings/`
- **Description:** Creates a new setting.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "setting_name": "new_setting",
        "value": "new_value"
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

### 4. Update a Setting
- **Endpoint:** `PUT /hunter-settings/{setting_name}/`
- **Description:** Updates an existing setting.
- **Path Parameters:**
  - `setting_name` (string): The name of the setting to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "value": "updated_value"
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

### 5. Delete a Setting
- **Endpoint:** `DELETE /hunter-settings/{setting_name}/`
- **Description:** Deletes a specific setting by its name.
- **Path Parameters:**
  - `setting_name` (string): The name of the setting to delete.
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

### cURL Example for Creating a Setting
```bash
curl -X POST https://api.yourdomain.com/hunter-settings \
-H "Content-Type: application/json" \
-d '{
  "setting_name": "new_setting",
  "value": "new_value"
}'
