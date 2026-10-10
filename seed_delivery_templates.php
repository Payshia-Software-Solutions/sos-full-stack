<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        INSERT IGNORE INTO `sms_templates` (`template_name`, `template_content`) VALUES 
        ('delivery-order-placed', 'Dear {index_number},\n\nWe have successfully received your delivery order for {delivery_item}.\nWe will process it shortly!\n\nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk'),
        ('delivery-order-packed', 'Dear {index_number},\n\nYour order is ready for delivery!\n\nProduct - {delivery_item} \nTracking Number - {tracking_number} \n\nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk'),
        ('delivery-order-dispatched', 'Dear {index_number},\n\nYour order has been handed over to the delivery partner!\n\nProduct - {delivery_item} \nTracking Number - {tracking_number} \nCOD Amount - {cod_amount} \nDelivery Partner - Royal Express Courier \n    \nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk'),
        ('delivery-order-received', 'Dear {index_number},\n\nYour delivery order for {delivery_item} has been marked as successfully received.\n\nThank you!\nCeylon Pharma College\nwww.pharmacollege.lk')
    ");
    echo "Inserted delivery templates successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
