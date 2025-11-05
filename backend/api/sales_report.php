<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once 'database_connection.php';
require_once 'cors.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Set headers
    $sheet->setCellValue('A1', 'Order ID');
    $sheet->setCellValue('B1', 'Product Name');
    $sheet->setCellValue('C1', 'Quantity Sold');
    $sheet->setCellValue('D1', 'Total Price');
    $sheet->setCellValue('E1', 'Order Date');

    // Fetch data from the database
    $sql = "SELECT * FROM sales_orders ORDER BY order_date DESC";
    $result = $conn->query($sql);

    $row = 2;
    if ($result->num_rows > 0) {
        while($data = $result->fetch_assoc()) {
            $sheet->setCellValue('A' . $row, $data['id']);
            $sheet->setCellValue('B' . $row, $data['product_name']);
            $sheet->setCellValue('C' . $row, $data['quantity_sold']);
            $sheet->setCellValue('D' . $row, $data['total_price']);
            $sheet->setCellValue('E' . $row, $data['order_date']);
            $row++;
        }
    }

    // Set headers for download
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="sales_report.xlsx"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');

    $conn->close();
    exit;
}
?>