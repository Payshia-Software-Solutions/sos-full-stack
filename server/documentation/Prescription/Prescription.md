# Prescription API Documentation

## Overview
The `Prescription` API provides CRUD operations for managing prescriptions within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

## Base URL
https://api.pharmacollege.lk/prescription

## Endpoints

### 1. Get All Prescriptions
- **Endpoint:** `GET /prescription/`
- **Description:** Retrieves a list of all prescriptions.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    [
        {
            "id": 1,
            "prescription_id": "P123",
            "prescription_name": "Prescription 1",
            "prescription_status": "active",
            "created_at": "2024-09-02 12:34:56",
            "created_by": "admin",
            "Pres_Name": "John Doe",
            "pres_date": "2024-09-02",
            "Pres_Age": 30,
            "Pres_Method": "oral",
            "doctor_name": "Dr. Smith",
            "notes": "Take one tablet daily.",
            "drugs_list": "Drug A, Drug B"
        },
        {
            "id": 2,
            "prescription_id": "P124",
            "prescription_name": "Prescription 2",
            "prescription_status": "inactive",
            "created_at": "2024-09-02 13:00:00",
            "created_by": "user1",
            "Pres_Name": "Jane Doe",
            "pres_date": "2024-09-02",
            "Pres_Age": 28,
            "Pres_Method": "injection",
            "doctor_name": "Dr. John",
            "notes": "Inject once a week.",
            "drugs_list": "Drug X, Drug Y"
        }
    ]
    ```

### 2. Get Prescription by ID
- **Endpoint:** `GET /prescription/{id}/`
- **Description:** Retrieves a specific prescription by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription to retrieve.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "id": 1,
        "prescription_id": "P123",
        "prescription_name": "Prescription 1",
        "prescription_status": "active",
        "created_at": "2024-09-02 12:34:56",
        "created_by": "admin",
        "Pres_Name": "John Doe",
        "pres_date": "2024-09-02",
        "Pres_Age": 30,
        "Pres_Method": "oral",
        "doctor_name": "Dr. Smith",
        "notes": "Take one tablet daily.",
        "drugs_list": "Drug A, Drug B"
    }
    ```
  - **Status Code:** `404 Not Found` (If the prescription does not exist)
  - **Body:** 
    ```json
    {
        "error": "Record not found"
    }
    ```

### 3. Create a New Prescription
- **Endpoint:** `POST /prescription/`
- **Description:** Creates a new prescription.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "prescription_id": "P125",
        "prescription_name": "Prescription 3",
        "prescription_status": "active",
        "created_at": "2024-09-02 14:00:00",
        "created_by": "admin",
        "Pres_Name": "Sam Smith",
        "pres_date": "2024-09-02",
        "Pres_Age": 45,
        "Pres_Method": "topical",
        "doctor_name": "Dr. Lee",
        "notes": "Apply twice a day.",
        "drugs_list": "Drug C, Drug D"
    }
    ```
- **Response:**
  - **Status Code:** `201 Created`
  - **Body:** 
    ```json
    {
        "message": "Prescription created successfully"
    }
    ```

### 4. Update a Prescription
- **Endpoint:** `PUT /prescription/{id}/`
- **Description:** Updates an existing prescription.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription to update.
- **Request Body:**
  - **Content-Type:** `application/json`
  - **Body:** 
    ```json
    {
        "prescription_id": "P123",
        "prescription_name": "Updated Prescription",
        "prescription_status": "inactive",
        "created_at": "2024-09-02 12:34:56",
        "created_by": "admin",
        "Pres_Name": "John Doe",
        "pres_date": "2024-09-02",
        "Pres_Age": 30,
        "Pres_Method": "oral",
        "doctor_name": "Dr. Smith",
        "notes": "Take one tablet daily. Updated dosage.",
        "drugs_list": "Drug A, Drug B"
    }
    ```
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "message": "Prescription updated successfully"
    }
    ```

### 5. Delete a Prescription
- **Endpoint:** `DELETE /prescription/{id}/`
- **Description:** Deletes a specific prescription by its ID.
- **Path Parameters:**
  - `id` (integer): The ID of the prescription to delete.
- **Response:**
  - **Status Code:** `200 OK`
  - **Body:** 
    ```json
    {
        "message": "Prescription deleted successfully"
    }
    ```

## Error Codes

- **400 Bad Request:** The request was invalid or cannot be served.
- **404 Not Found:** The requested resource could not be found.
- **500 Internal Server Error:** An error occurred on the server.

## Example Requests

### cURL Example for Creating a Prescription
```bash
curl -X POST https://api.pharmacollege.lk/prescription \
-H "Content-Type: application/json" \
-d '{
  "prescription_id": "P125",
  "prescription_name": "Prescription 3",
  "prescription_status": "active",
  "created_at": "2024-09-02 14:00:00",
  "created_by": "admin",
  "Pres_Name": "Sam Smith",
  "pres_date": "2024-09-02",
  "Pres_Age": 45,
  "Pres_Method": "topical",
  "doctor_name": "Dr. Lee",
  "notes": "Apply twice a day.",
  "drugs_list": "Drug C, Drug D"
}'
