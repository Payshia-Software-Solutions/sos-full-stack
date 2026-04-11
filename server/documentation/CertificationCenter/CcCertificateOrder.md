# CcCertificateOrder API Documentation

## Overview

The `CcCertificateOrder` API provides CRUD operations for managing certificate orders within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL

`https://api.pharmacollege.lk/cc-certificate-order`

## Endpoints

### 1. Get All Certificate Orders

- **Endpoint:** `GET /cc-certificate-order/`
- **Description:** Retrieves a list of all certificate orders.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "created_by": "admin",
        "created_at": "2024-09-02 12:34:56",
        "updated_at": "2024-09-02 13:00:00",
        "mobile": "1234567890",
        "address_line1": "123 Main St",
        "address_line2": "Apt 4B",
        "city_id": 1,
        "type": "Certificate Type A",
        "payment": "Paid",
        "package_id": 101,
        "certificate_id": 202,
        "certificate_status": "Pending",
        "cod_amount": 100,
        "is_active": 1
      },
      {
        "id": 2,
        "created_by": "user1",
        "created_at": "2024-09-03 14:15:00",
        "updated_at": "2024-09-03 14:30:00",
        "mobile": "0987654321",
        "address_line1": "456 Another St",
        "address_line2": "Suite 3A",
        "city_id": 2,
        "type": "Certificate Type B",
        "payment": "Unpaid",
        "package_id": 102,
        "certificate_id": 203,
        "certificate_status": "Completed",
        "cod_amount": 150,
        "is_active": 1
      }
    ]
    ```

### 2. Get Certificate Order by ID

- **Endpoint:** `GET /cc-certificate-order/{id}/`
- **Description:** Retrieves a specific certificate order by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the certificate order to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "id": 1,
      "created_by": "admin",
      "created_at": "2024-09-02 12:34:56",
      "updated_at": "2024-09-02 13:00:00",
      "mobile": "1234567890",
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city_id": 1,
      "type": "Certificate Type A",
      "payment": "Paid",
      "package_id": 101,
      "certificate_id": 202,
      "certificate_status": "Pending",
      "cod_amount": 100,
      "is_active": 1
    }
    ```
  - **Status Code:** `404 Not Found` (If the certificate order does not exist)
  - **Body:**
    ```json
    {
      "error": "Record not found"
    }
    ```

### 3. Create a New Certificate Order

- **Endpoint:** `POST /cc-certificate-order/`
- **Description:** Creates a new certificate order.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "created_by": "admin",
      "created_at": "2024-09-02 12:34:56",
      "updated_at": "2024-09-02 13:00:00",
      "mobile": "1234567890",
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city_id": 1,
      "type": "Certificate Type A",
      "payment": "Paid",
      "package_id": 101,
      "certificate_id": 202,
      "certificate_status": "Pending",
      "cod_amount": 100,
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

### 4. Update a Certificate Order

- **Endpoint:** `PUT /cc-certificate-order/{id}/`
- **Description:** Updates an existing certificate order.
- **Path Parameters:**
  - `id` (integer): The ID of the certificate order to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "created_by": "admin",
      "created_at": "2024-09-02 12:34:56",
      "updated_at": "2024-09-02 13:00:00",
      "mobile": "1234567890",
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city_id": 1,
      "type": "Certificate Type A",
      "payment": "Paid",
      "package_id": 101,
      "certificate_id": 202,
      "certificate_status": "Completed",
      "cod_amount": 100,
      "is_active": 1
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

### 5. Delete a Certificate Order

- **Endpoint:** `DELETE /cc-certificate-order/{id}/`
- **Description:** Deletes a specific certificate order by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the certificate order to delete.
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

### cURL Example for Creating a Certificate Order

```bash
curl -X POST https://api.pharmacollege.lk/cc-certificate-order -H "Content-Type: application/json" -d '{
  "created_by": "admin",
  "created_at": "2024-09-02 12:34:56",
  "updated_at": "2024-09-02 13:00:00",
  "mobile": "1234567890",
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",
  "city_id": 1,
  "type": "Certificate Type A",
  "payment": "Paid",
  "package_id": 101,
  "certificate_id": 202,
  "certificate_status": "Pending",
  "cod_amount": 100,
  "is_active": 1
}'
```
