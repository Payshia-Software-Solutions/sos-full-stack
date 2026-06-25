<?php
$sqlFile = __DIR__ . '/../live_db_data.sql';
$outputFile = __DIR__ . '/../scratch/master_products_inserts.sql';

if (!file_exists($sqlFile)) {
    echo "Data file not found: $sqlFile\n";
    exit;
}

echo "Scanning $sqlFile for master_product insert statements...\n";
$handle = fopen($sqlFile, 'r');
$outHandle = fopen($outputFile, 'w');

$count = 0;
while (($line = fgets($handle)) !== false) {
    if (strpos($line, 'INSERT INTO `master_product`') !== false || strpos($line, 'INSERT INTO master_product') !== false) {
        fwrite($outHandle, $line);
        $count++;
    }
}

fclose($handle);
fclose($outHandle);

echo "Found $count insert statements and saved to scratch/master_products_inserts.sql\n";
