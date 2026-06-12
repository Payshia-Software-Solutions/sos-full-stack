<?php
// controllers/BlogController.php

require_once __DIR__ . '/../models/Blog.php';

class BlogController
{
    private $blogModel;

    public function __construct($pdo)
    {
        $this->blogModel = new Blog($pdo);
    }

    public function getAllBlogs()
    {
        $blogs = $this->blogModel->getAllBlogs();
        echo json_encode(['success' => true, 'blogs' => $blogs]);
    }

    public function getBlogBySlug($slug)
    {
        $blog = $this->blogModel->getBlogBySlug($slug);
        if ($blog) {
            echo json_encode(['success' => true, 'blog' => $blog]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Blog not found']);
        }
    }

    public function getBlogById($id)
    {
        $blog = $this->blogModel->getBlogById($id);
        if ($blog) {
            echo json_encode(['success' => true, 'blog' => $blog]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Blog not found']);
        }
    }

    public function createBlog()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['title']) || !isset($data['slug']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title, slug, and content are required']);
            return;
        }

        // Check if slug exists
        if ($this->blogModel->getBlogBySlug($data['slug'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Slug already exists']);
            return;
        }

        $result = $this->blogModel->createBlog($data);

        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Blog created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create blog']);
        }
    }

    public function updateBlog($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['title']) || !isset($data['slug']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title, slug, and content are required']);
            return;
        }

        // Check if slug exists for other blogs
        $existing = $this->blogModel->getBlogBySlug($data['slug']);
        if ($existing && $existing['id'] != $id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Slug already exists']);
            return;
        }

        $result = $this->blogModel->updateBlog($id, $data);

        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Blog updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update blog']);
        }
    }

    public function deleteBlog($id)
    {
        $result = $this->blogModel->deleteBlog($id);

        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Blog deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete blog']);
        }
    }

    public function uploadImage()
    {
        if (!isset($_FILES['image'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No image provided']);
            return;
        }

        $file = $_FILES['image'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File upload error']);
            return;
        }

        $ftpConfig = include(__DIR__ . '/../config/ftp.php');
        $ftp_server = $ftpConfig['ftp_server'];
        $ftp_username = $ftpConfig['ftp_username'];
        $ftp_password = $ftpConfig['ftp_password'];

        $uploadDirectory = '/content-provider/uploads/blogs/';
        
        $ftpConn = ftp_connect($ftp_server);
        if (!$ftpConn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'FTP connection failed']);
            return;
        }

        $login = ftp_login($ftpConn, $ftp_username, $ftp_password);
        if (!$login) {
            ftp_close($ftpConn);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'FTP login failed']);
            return;
        }

        ftp_pasv($ftpConn, true);

        // Ensure directory exists
        $parts = explode('/', trim($uploadDirectory, '/'));
        $path = '';
        foreach ($parts as $part) {
            $path .= '/' . $part;
            if (!@ftp_chdir($ftpConn, $path)) {
                ftp_mkdir($ftpConn, $path);
            }
        }
        ftp_chdir($ftpConn, '/');

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('blog_') . '.' . $extension;
        $remoteFilePath = $uploadDirectory . $filename;
        $tempPath = $file['tmp_name'];

        if (ftp_put($ftpConn, $remoteFilePath, $tempPath, FTP_BINARY)) {
            ftp_close($ftpConn);
            // Return only filename as requested by user
            echo json_encode(['success' => true, 'url' => $filename]);
        } else {
            ftp_close($ftpConn);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to upload file to FTP']);
        }
    }
}
