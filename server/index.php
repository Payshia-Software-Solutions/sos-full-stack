<?php
require_once './vendor/autoload.php';

date_default_timezone_set('Asia/Colombo');

// Load the .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
// index.php
require_once 'config/database.php';
require_once 'routes/web.php';
