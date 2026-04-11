<?php
require_once './models/Ecertificate.php';
require_once './vendor/autoload.php'; // Include Composer's autoload file

use chillerlan\QRCode\{QRCode, QROptions};
use chillerlan\QRCode\Data\QRMatrix;
use chillerlan\QRCode\Output\QROutputInterface;

class ECertificateController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new ECertificate($pdo);
        $this->ftpConfig = include('./config/ftp.php'); // Load FTP configuration
    }

    public function getCertificates()
    {
        // echo $this->ftpConfig['ftp_server'];
        $certificates = $this->model->getAllCertificates();
        echo json_encode($certificates);
    }

    public function getCertificate($id)
    {
        $certificate = $this->model->getCertificateById($id);
        echo json_encode($certificate);
    }

    public function getCourseCompletionByTitle($course_code, $username, $title)
    {
        $certificate = $this->model->getCourseCompletionByTitle($course_code, $username, $title);
        if ($certificate) {
            echo json_encode($certificate);
        } else {
            // Error
            echo json_encode(["error" => "No data found for " . $username . " the given course (" . $course_code . ") and user."]);
        }
    }
    public function getCourseCompletion($course_code, $username)
    {
        $certificate = $this->model->getCourseCompletion($course_code, $username);
        if ($certificate) {
            echo json_encode($certificate);
        } else {
            echo json_encode(["error" => "No data found for " . $username . " the given course (" . $course_code . ") and user."]);
        }
    }

    public function createCertificate()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createCertificate($data);
        $this->generateCertificateImage($data); // Generate the certificate image
        echo json_encode(['status' => 'Certificate created and image generated']);
    }

    public function updateCertificate($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateCertificate($id, $data);
        $this->generateCertificateImage($data); // Generate the certificate image
        echo json_encode(['status' => 'Certificate updated and image generated']);
    }

    public function deleteCertificate($id)
    {
        $this->model->deleteCertificate($id);
        echo json_encode(['status' => 'Certificate deleted']);
    }

    private function downloadFont($url, $path)
    {
        $fontContent = file_get_contents($url);
        file_put_contents($path, $fontContent);
    }

    private function ensureDirectoryExists($ftp_conn, $dir)
    {
        $parts = explode('/', $dir);
        $path = '';
        foreach ($parts as $part) {
            if (empty($part)) {
                continue;
            }
            $path .= '/' . $part;
            if (!@ftp_chdir($ftp_conn, $path)) {
                if (!ftp_mkdir($ftp_conn, $path)) {
                    throw new Exception("Could not create directory: $path on FTP server.");
                }
            }
        }
    }


    private function generateCertificateImage($data)
    {
        try {

            ini_set('memory_limit', '256M'); // Increase to 256 MB or higher if needed
            $ftp_server = $this->ftpConfig['ftp_server'];
            $ftp_username = $this->ftpConfig['ftp_username'];
            $ftp_password = $this->ftpConfig['ftp_password'];
            $ftp_target_dir = '/content-provider/certificates/e-certificate/' . $data['student_number'] . '/';

            // Attempt to connect to the FTP server
            $ftp_conn = ftp_connect($ftp_server);
            if (!$ftp_conn) {
                throw new Exception("Could not connect to FTP server: $ftp_server");
            }

            // Attempt to log in to the FTP server
            $login = ftp_login($ftp_conn, $ftp_username, $ftp_password);
            if (!$login) {
                throw new Exception("Could not log in to FTP server with username: $ftp_username");
            }

            // Ensure that the target directory exists
            try {
                $this->ensureDirectoryExists($ftp_conn, $ftp_target_dir);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
                ftp_close($ftp_conn);
                return;
            }

            // Ensure that the local temporary directory exists
            $tempDir = './tmp';
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0777, true);
            }

            // Load the existing image from the remote URL
            $imageUrl = 'https://content-provider.pharmacollege.lk/certificate-template/e-certificate.jpg';
            $imagePath = $tempDir . '/e-certificate.jpg';


            $imageData = file_get_contents($imageUrl);
            if (!$imageData) {
                throw new Exception("Failed to download image from: $imageUrl");
            }

            // Save the image to a temporary file
            if (!file_put_contents($imagePath, $imageData)) {
                throw new Exception("Failed to save image to: $imagePath");
            }

            // Load the image from the temporary file
            $image = imagecreatefromjpeg($imagePath);
            if (!$image) {
                throw new Exception("Failed to load image from: $imagePath");
            }

            // Set the text color
            $textColor = imagecolorallocate($image, 0, 0, 0); // RGB for black
            // if (!$textColor) {
            //     throw new Exception("Failed to allocate color for the image.");
            // }

            // Font URLs
            $fontUrl = 'https://content-provider.pharmacollege.lk/fonts/arial.ttf';
            $nameFontUrl = 'https://content-provider.pharmacollege.lk/fonts/chaparral-pro-bold-Italic.ttf';

            // Paths for temporary font files
            $fontFile = '/tmp/arial.ttf';
            $nameFontFile = '/tmp/chaparral-pro-bold-Italic.ttf';

            // Download the fonts
            $this->downloadFont($fontUrl, $fontFile);


            $fontData = file_get_contents($fontUrl);
            // Save the image to a temporary file
            if (!file_put_contents($fontFile, $fontData)) {
                throw new Exception("Failed to save image to: $fontFile");
            }

            if (!file_exists($fontFile)) {
                throw new Exception("Failed to download or save font file: $fontFile");
            }


            $nameFontData = file_get_contents($nameFontUrl);
            // Save the image to a temporary file
            if (!file_put_contents($nameFontFile, $nameFontData)) {
                throw new Exception("Failed to save image to: $imagePath");
            }

            if (!file_exists($nameFontFile)) {
                throw new Exception("Failed to download or save font file: $nameFontFile");
            }



            // Text to be added
            $text = $data['student_name'];
            $pvNumber = $data['pv_number'];
            $courseCode = $data['course_code'];
            $certificateId = $data['certificate_id'];
            $studentNumber = $data['student_number'];
            $dateText = 'Date : ' . date('Y-m-d');
            $indexNumberText = 'Index Number: ' . $studentNumber;
            $certificateIdText = 'Certificate ID: ' . $certificateId;

            // Font size
            $fontSize = 35;

            // Get text dimensions
            $textDimensions = imagettfbbox($fontSize, 0, $fontFile, $text);
            if (!$textDimensions) {
                throw new Exception("Failed to calculate text dimensions for: $text");
            }
            $textWidth = $textDimensions[4] - $textDimensions[0];
            $textHeight = $textDimensions[1] - $textDimensions[7];

            // Calculate x-coordinate to center the text horizontally
            $imageWidth = imagesx($image);
            $textX = intval(($imageWidth - $textWidth) / 2);


            // Y-coordinate
            $textY = 560; // Adjust as needed

            // Add text to the image
            if (!imagettftext($image, $fontSize, 0, $textX, $textY, $textColor, $nameFontFile, $text)) {
                throw new Exception("Failed to add text to the image.");
            }
            imagettftext($image, 15, 0, 1620, 35, $textColor, $fontFile, $pvNumber);
            imagettftext($image, 15, 0, 50, 1140, $textColor, $fontFile, $dateText);
            imagettftext($image, 15, 0, 50, 1165, $textColor, $fontFile, $indexNumberText);
            imagettftext($image, 15, 0, 50, 1190, $textColor, $fontFile, $certificateIdText);

            // QR code related data
            $textForQR = "https://pharmacollege.lk/result-view.php?CourseCode=" . $courseCode . "&LoggedUser=" . $studentNumber;

            $options = new QROptions;
            $options->outputType = QROutputInterface::GDIMAGE_JPG;

            $qrImageData = (new QRCode($options))->render($textForQR);
            if (!$qrImageData) {
                throw new Exception("Failed to generate QR code.");
            }
            $qrImageData = str_replace('data:image/jpg;base64,', '', $qrImageData);
            // Decode the Base64 string to get the binary image data
            $qrImageData = base64_decode($qrImageData);
            if (!$qrImageData) {
                throw new Exception("Failed to decode Base64 data.");
            }
            if (!$qrImageData) {
                throw new Exception("Failed to decode Base64 data.");
            }
            // Create an image resource from the decoded data
            $qrImage = imagecreatefromstring($qrImageData);
            if (!$qrImage) {
                throw new Exception("Failed to create image from QR code data.");
            }

            // Merge QR code with certificate image
            imagecopy($image, $qrImage, 50, 980, 0, 0, imagesx($qrImage), imagesy($qrImage));

            // Get image string for signature image
            $signatureImageUrl = 'https://content-provider.pharmacollege.lk/signatures/signature.png';
            $signatureImgPath = $tempDir . '/signature.jpg';

            $signatureImageData = file_get_contents($signatureImageUrl);
            if (!$signatureImageData) {
                throw new Exception("Failed to download image from: $signatureImageUrl");
            }

            // Save the image to a temporary file
            if (!file_put_contents($signatureImgPath, $signatureImageData)) {
                throw new Exception("Failed to save image to: $signatureImgPath");
            }

            if (!file_exists($signatureImgPath)) {
                throw new Exception("Signature image file does not exist: $signatureImgPath");
            }

            $signatureImg = imagecreatefrompng($signatureImgPath);
            if (!$signatureImg) {
                throw new Exception("Failed to load signature image from: $signatureImgPath");
            }

            // Desired width and height for the resized signature image
            $newWidth = 300; // Adjust this as needed
            $signatureImgResized = imagescale($signatureImg, $newWidth);
            if (!$signatureImgResized) {
                throw new Exception("Failed to resize signature image.");
            }

            // Position and add the resized signature image to the main image
            imagecopy($image, $signatureImgResized, 1040, 1050, 0, 0, imagesx($signatureImgResized), imagesy($signatureImgResized));

            // Save the modified image to a local temporary path
            $tempImagePath = '/tmp/CeylonPharmaCollege-e-Certificate-' . $studentNumber . '.jpg';
            if (!imagejpeg($image, $tempImagePath)) {
                throw new Exception("Failed to save certificate image to: $tempImagePath");
            }

            // Upload the image to the FTP server
            $remoteFilePath = $ftp_target_dir . 'CeylonPharmaCollege-e-Certificate-' . $studentNumber . '.jpg';
            if (!ftp_put($ftp_conn, $remoteFilePath, $tempImagePath, FTP_BINARY)) {
                throw new Exception("Error uploading certificate image to FTP server at: $remoteFilePath");
            }

            // Clean up
            unlink($tempImagePath); // Delete the temporary file
            imagedestroy($image);
            ftp_close($ftp_conn); // Close the FTP connection

            // Remove temporary font files
            unlink($fontFile);
            unlink($nameFontFile);
        } catch (Exception $e) {
            // Handle the exception and return a JSON response with the error message
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
