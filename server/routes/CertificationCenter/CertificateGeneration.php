<?php
// require('fpdf.php');

// // Generate the Certificate
// if (isset($_GET['name'])) {
//     $name = $_GET['name']; // Get the name dynamically from the query string

//     // Create a new PDF instance
//     $pdf = new FPDF('L', 'mm', 'A4'); // Landscape orientation, mm units, A4 size
//     $pdf->AddPage();

//     // Add certificate background
//     $pdf->Image('tmp/e-certificate.jpge.jpg', 0, 0, 297, 210); // Adjust to fit A4 size

//     // Add dynamic name
//     $pdf->SetFont('Arial', 'B', 24); // Font style and size
//     $pdf->SetTextColor(0, 0, 0); // Black text
//     $pdf->SetXY(50, 100); // Position of the name
//     $pdf->Cell(200, 10, $name, 0, 1, 'C'); // Name centered in the specified area

//     // Output the PDF
//     $pdf->Output('D', 'certificate.pdf'); // Force download
// } else {
//     echo "Please provide a name in the query string. Example: ?name=John%20Doe";
// }
?>
