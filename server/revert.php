<?php
require './config/database.php';
$pdo->query('UPDATE delivery_orders SET current_status = 1, packed_date = NULL, send_date = NULL WHERE id = 6510');
echo 'Done';
