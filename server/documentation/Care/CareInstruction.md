# Care Instruction API Documentation

## Overview

The `Care Instruction` API provides CRUD operations for managing care instructions within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

**Base URL**: `https://api.pharmacollege.lk/`

## Endpoints

### 1. Get All Care Instructions

- **Endpoint**: `GET /care-instructions/`
- **Description**: Retrieve a list of all care instructions.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: JSON array of care instructions.

**Example Response**:

```json
[
  {
    "id": 1,
    "pres_code": "P001",
    "cover_id": "COVER001",
    "content": "Take two pills daily after meals.",
    "created_at": "2024-09-01T10:00:00"
  }
]
```

### 2. Get a Single Care Instruction by ID

- **Endpoint**: `GET /care-instructions/{id}/`
- **Description**: Retrieve details of a specific care instruction by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the care instruction.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: JSON object of the care instruction details.

**Example Response**:

```json
{
  "id": 1,
  "pres_code": "P001",
  "cover_id": "COVER001",
  "content": "Take two pills daily after meals.",
  "created_at": "2024-09-01T10:00:00"
}
```

### 3. Create a New Care Instruction

- **Endpoint**: `POST /care-instructions/`
- **Description**: Create a new care instruction.
- **Request Body**:
  - `pres_code` (string): The prescription code.
  - `cover_id` (string): The cover ID.
  - `content` (string): The content of the care instruction.
  - `created_at` (datetime): The creation timestamp (optional).
- **Response**:
  - **Status Code**: `201 Created`
  - **Content**: Success message or the ID of the created care instruction.

**Example Response**:

```json
{
  "message": "Care instruction created successfully",
  "id": 1
}
```

### 4. Update an Existing Care Instruction

- **Endpoint**: `PUT /care-instructions/{id}/`
- **Description**: Update an existing care instruction by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the care instruction.
- **Request Body**: Same as the `POST /care-instructions/` endpoint.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: Success message.

**Example Response**:

```json
{
  "message": "Care instruction updated successfully"
}
```

### 5. Delete a Care Instruction

- **Endpoint**: `DELETE /care-instructions/{id}/`
- **Description**: Delete a care instruction by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the care instruction.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: Success message.

**Example Response**:

```json
{
  "message": "Care instruction deleted successfully"
}
```

## Error Handling

In case of errors, the API will return an appropriate HTTP status code along with an error message in JSON format:

- **404 Not Found**: When the specified care instruction ID does not exist.
- **400 Bad Request**: When the request data is invalid or incomplete.
- **500 Internal Server Error**: For any server-related issues.
