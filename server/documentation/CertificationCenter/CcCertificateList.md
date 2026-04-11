# CcCertificateList API Documentation

## Overview

The `CcCertificateList` API provides CRUD operations for managing certificate lists within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

https://api.pharmacollege.lk/cc-certificate-list

## Endpoints

### 1. Get All Certificates

- **Endpoint:** `GET /cc-certificate-list/`
- **Description:** Retrieves a list of all certificates.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "list_name": "Certificate List 1",
        "criteria_group_id": 101,
        "price": 150.0,
        "is_active": 1,
        "created_by": "admin",
        "created_at": "2024-10-02 14:30:00"
      },
      {
        "id": 2,
        "list_name": "Certificate List 2",
        "criteria_group_id": 102,
        "price": 200.0,
        "is_active": 1,
        "created_by": "user1",
        "created_at": "2024-10-05 11:45:00"
      }
    ]
    ```

### 2. Get Certificate by ID

- **Endpoint:** `GET /cc-certificate-list/{id}/`
- **Description:** Retrieves a specific certificate by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the certificate to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "list_name": "Certificate List 1",
      "criteria_group_id": 101,
      "price": 150.0,
      "is_active": 1,
      "created_by": "admin",
      "created_at": "2024-10-02 14:30:00"
    }
    ```
  - **Status Code:** `404 Not Found` (If the certificate does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Certificate

- **Endpoint:** `POST /cc-certificate-list/`
- **Description:** Creates a new certificate entry.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "list_name": "New Certificate List",
      "criteria_group_id": 103,
      "price": 175.0,
      "is_active": 1,
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

### 4. Update a Certificate

- **Endpoint:** `PUT /cc-certificate-list/{id}/`
- **Description:** Updates an existing certificate entry.
- **Path Parameters:**
  - `id` (integer): The ID of the certificate to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "list_name": "Updated Certificate List",
      "criteria_group_id": 104,
      "price": 180.0,
      "is_active": 0,
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

### 5. Delete a Certificate

- **Endpoint:** `DELETE /cc-certificate-list/{id}/`
- **Description:** Deletes a specific certificate by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the certificate to delete.
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

### cURL Example for Creating a Certificate

```bash
curl -X POST https://api.example.com/cc-certificate-list \
-H "Content-Type: application/json" \
-d '{
  "list_name": "New Certificate List",
  "criteria_group_id": 103,
  "price": 175.00,
  "is_active": 1,
  "created_by": "admin"
}'
```
