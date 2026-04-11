# Care Instruction Pre API Documentation

## Overview

The `Care Instruction Pre` API provides CRUD operations for managing care instructions that are in a pre-approved state within the system. This documentation outlines the available endpoints, request parameters, response structures, and error codes.

**Base URL**: `https://api.pharmacollege.lk/`

## Endpoints

### 1. Get All Care Instructions Pre

- **Endpoint**: `GET /care-instructions-pre/`
- **Description**: Retrieve a list of all pre-approved care instructions.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: JSON array of care instructions pre.

**Example Response**:

```json
[
  {
    "id": 1,
    "created_by": "user123",
    "instruction": "Review patient history before prescribing.",
    "created_at": "2024-09-01T10:00:00"
  }
]
```

### 2. Get a Single Care Instruction Pre by ID

- **Endpoint**: `GET /care-instructions-pre/{id}/`
- **Description**: Retrieve details of a specific pre-approved care instruction by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the care instruction.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: JSON object of the care instruction details.

**Example Response**:

```json
{
  "id": 1,
  "created_by": "user123",
  "instruction": "Review patient history before prescribing.",
  "created_at": "2024-09-01T10:00:00"
}
```

### 3. Create a New Care Instruction Pre

- **Endpoint**: `POST /care-instructions-pre/`
- **Description**: Create a new pre-approved care instruction.
- **Request Body**:
  - `created_by` (string): The user creating the instruction.
  - `instruction` (string): The content of the care instruction.
  - `created_at` (datetime): The creation timestamp (optional).
- **Response**:
  - **Status Code**: `201 Created`
  - **Content**: Success message or the ID of the created care instruction.

**Example Response**:

```json
{
  "message": "Care instruction pre created successfully",
  "id": 1
}
```

### 4. Update an Existing Care Instruction Pre

- **Endpoint**: `PUT /care-instructions-pre/{id}/`
- **Description**: Update an existing pre-approved care instruction by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the care instruction.
- **Request Body**: Same as the `POST /care-instructions-pre/` endpoint.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: Success message.

**Example Response**:

```json
{
  "message": "Care instruction pre updated successfully"
}
```

### 5. Delete a Care Instruction Pre

- **Endpoint**: `DELETE /care-instructions-pre/{id}/`
- **Description**: Delete a pre-approved care instruction by its ID.
- **Path Parameters**:
  - `id` (integer): The ID of the care instruction.
- **Response**:
  - **Status Code**: `200 OK`
  - **Content**: Success message.

**Example Response**:

```json
{
  "message": "Care instruction pre deleted successfully"
}
```

## Error Handling

In case of errors, the API will return an appropriate HTTP status code along with an error message in JSON format:

- **404 Not Found**: When the specified care instruction pre ID does not exist.
- **400 Bad Request**: When the request data is invalid or incomplete.
- **500 Internal Server Error**: For any server-related issues.
