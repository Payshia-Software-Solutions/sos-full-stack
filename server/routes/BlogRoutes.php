<?php
// routes/BlogRoutes.php

require_once __DIR__ . '/../controllers/BlogController.php';

$blogController = new BlogController($pdo);

return [
    'GET /api/blogs' => function () use ($blogController) {
        $blogController->getAllBlogs();
    },
    'GET /api/blogs/{slug}' => function ($slug) use ($blogController) {
        $blogController->getBlogBySlug($slug);
    },
    'GET /api/blogs/id/{id}' => function ($id) use ($blogController) {
        $blogController->getBlogById($id);
    },
    'POST /api/blogs/upload-image' => function () use ($blogController) {
        $blogController->uploadImage();
    },
    'POST /api/blogs' => function () use ($blogController) {
        $blogController->createBlog();
    },
    'PUT /api/blogs/{id}' => function ($id) use ($blogController) {
        $blogController->updateBlog($id);
    },
    'DELETE /api/blogs/{id}' => function ($id) use ($blogController) {
        $blogController->deleteBlog($id);
    }
];
