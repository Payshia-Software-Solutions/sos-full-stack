
# Appointment API Documentation

## Overview
The `Appointment` API provides CRUD operations for managing categories within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

**Base URL**: `https://api.pharmacollege.lk/`

## Endpoints

### 1. Get All Appointments
- **Endpoint**: `GET /appointments/`
- **Description**: Retrieve a list of all appointments.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: JSON array of appointments.
  
**Example Response**:
```json
[
  {
    "id": 1,
    "appointment_id": "A12345",
    "student_number": "S1001",
    "booking_date": "2024-09-01",
    "booked_time": "10:00 AM",
    "reason": "Consultation",
    "category": "General",
    "created_at": "2024-08-25 12:30:00",
    "status": "Confirmed",
    "comment": "Bring previous reports.",
    "is_active": true
  }
  ...
]
```

### 2. Get a Single Appointment by ID
- **Endpoint**: `GET /appointments/{id}/`
- **Description**: Retrieve details of a specific appointment by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the appointment.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: JSON object of the appointment details.
  
**Example Response**:
```json
{
  "id": 1,
  "appointment_id": "A12345",
  "student_number": "S1001",
  "booking_date": "2024-09-01",
  "booked_time": "10:00 AM",
  "reason": "Consultation",
  "category": "General",
  "created_at": "2024-08-25 12:30:00",
  "status": "Confirmed",
  "comment": "Bring previous reports.",
  "is_active": true
}
```

### 3. Create a New Appointment
- **Endpoint**: `POST /appointments/`
- **Description**: Create a new appointment.
- **Request Body**:
  - `appointment_id` (string): The unique ID of the appointment.
  - `student_number` (string): The student’s number.
  - `booking_date` (date): The date of the appointment.
  - `booked_time` (time): The time of the appointment.
  - `reason` (string): The reason for the appointment.
  - `category` (string): The category of the appointment.
  - `created_at` (datetime): The creation timestamp.
  - `status` (string): The status of the appointment.
  - `comment` (string, optional): Additional comments.
  - `is_active` (boolean): Whether the appointment is active.
- **Response**:
  - **Status Code**: `201 Created`
  - **Content**: Success message or the ID of the created appointment.
  
**Example Response**:
```json
{
  "message": "Appointment created successfully",
  "appointment_id": "A12345"
}
```

### 4. Update an Existing Appointment
- **Endpoint**: `PUT /appointments/{id}/`
- **Description**: Update an existing appointment by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the appointment.
- **Request Body**: Same as the `POST /appointments/` endpoint.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: Success message.
  
**Example Response**:
```json
{
  "message": "Appointment updated successfully"
}
```

### 5. Delete an Appointment
- **Endpoint**: `DELETE /appointments/{id}/`
- **Description**: Delete an appointment by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the appointment.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: Success message.
  
**Example Response**:
```json
{
  "message": "Appointment deleted successfully"
}
```

## Error Handling
In case of errors, the API will return an appropriate HTTP status code along with an error message in JSON format:

- **404 Not Found**: When the specified appointment ID does not exist.
- **400 Bad Request**: When the request data is invalid or incomplete.
- **500 Internal Server Error**: For any server-related issues.
