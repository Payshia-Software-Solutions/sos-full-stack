<?php
$ftp = include('config/ftp.php');
$conn = ftp_connect($ftp['ftp_server']);
ftp_login($conn, $ftp['ftp_username'], $ftp['ftp_password']);
ftp_pasv($conn, true);
print_r(ftp_nlist($conn, '/'));
