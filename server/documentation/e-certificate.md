# ECertificate API Documentation

## Overview
The `ECertificateController` API provides functionalities for managing electronic certificates (e-certificates) for students. It allows for the creation, retrieval, update, and deletion of certificates. The API also supports generating certificate images, including adding student details, course information, and QR codes, and uploading these images to an FTP server.

---

## Endpoints

### 1. `GET /certificates`
- **Description**: Retrieves a list of all certificates.
- **Response**:
  - **200 OK**: A JSON array of certificate objects.
- **Example Response**:
  ```json
  [
    {
      "certificate_id": "1",
      "student_name": "John Doe",
      "course_code": "CS101",
      "student_number": "12345",
      "pv_number": "PV123",
      "created_at": "2024-08-30"
    },
    ...
  ]

# 2. GET /certificate/{id}
Description: Retrieves the details of a specific certificate by ID.
Parameters:
Path Parameter: id (integer) - The ID of the certificate.
Response:
200 OK: A JSON object with the certificate details.
404 Not Found: If the certificate is not found.
Example Response:
json
Copy code
{
  "certificate_id": "1",
  "student_name": "John Doe",
  "course_code": "CS101",
  "student_number": "12345",
  "pv_number": "PV123",
  "created_at": "2024-08-30"
}


# 3. POST /certificate
Description: Creates a new certificate and generates the corresponding certificate image.
Request Body:
Content-Type: application/json
Example:

{
  "student_name": "John Doe",
  "course_code": "CS101",
  "student_number": "12345",
  "pv_number": "PV123"
}


Response:
200 OK: A JSON object indicating success.
Example:

{
  "status": "Certificate created and image generated"
}


# 4. PUT /certificate/{id}

Description: Updates an existing certificate and regenerates the corresponding certificate image.
Parameters:
Path Parameter: id (integer) - The ID of the certificate.
Request Body:
Content-Type: application/json
Example:


{
  "student_name": "John Doe",
  "course_code": "CS101",
  "student_number": "12345",
  "pv_number": "PV123"
}

Response:
200 OK: A JSON object indicating success.
Example:

{
  "status": "Certificate updated and image generated"
}

# 5. DELETE /certificate/{id}

Description: Deletes a specific certificate by ID.
Parameters:
Path Parameter: id (integer) - The ID of the certificate.
Response:
200 OK: A JSON object indicating success.
Example:


{
  "status": "Certificate deleted"
}

## Helper Methods

# 1. generateCertificateImage($data)
Description: Generates a certificate image with student details, QR code, and signature. The image is uploaded to an FTP server.
Parameters:
$data (array) - Contains certificate data including student_name, course_code, student_number, and other relevant information.
Errors:
Connection Errors: Issues with connecting to the FTP server or logging in.
File Handling Errors: Issues with downloading, saving, or uploading images and fonts.
QR Code Errors: Issues generating the QR code.
2. downloadFont($url, $path)
Description: Downloads a font from a given URL and saves it to a specified path.
Parameters:
$url (string) - The URL of the font file.
$path (string) - The path where the font file will be saved.
3. ensureDirectoryExists($ftp_conn, $dir)
Description: Ensures that a specified directory exists on the FTP server. Creates the directory if it doesn't exist.
Parameters:
$ftp_conn (resource) - The FTP connection resource.
$dir (string) - The directory path to check or create.
Error Handling
The API returns errors in JSON format. Example error response:
json
Copy code
{
  "status": "error",
  "message": "Could not connect to FTP server: ftp.example.com"
}
Common errors include:
400 Bad Request: Invalid input data.
404 Not Found: Certificate not found.
500 Internal Server Error: Server-side errors, including issues with FTP connection or image generation.
FTP Configuration
The FTP configuration is loaded from a PHP file located at ./config/ftp.php. The configuration file should return an array with the following keys:

php
Copy code
return [
    'ftp_server' => 'ftp.example.com',
    'ftp_username' => 'your_username',
    'ftp_password' => 'your_password',
];
Ensure that the FTP server is accessible and the provided credentials are correct.

Dependencies
QRCode Library: Used for generating QR codes. Imported using Composer.
GD Library: Used for image manipulation.
FTP: Used for uploading generated certificate images to the server.
Security Considerations
Ensure that the FTP credentials are securely stored and not exposed.
Input data should be validated and sanitized to prevent injection attacks or other vulnerabilities.
