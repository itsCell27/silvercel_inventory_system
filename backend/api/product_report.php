<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once 'database_connection.php';
require_once 'cors.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $preview = isset($_GET['preview']) && $_GET['preview'] === 'true';
    $category = isset($_GET['category']) ? $_GET['category'] : 'all';
    $product_ids = isset($_GET['product_ids']) ? $_GET['product_ids'] : [];

    // Base SQL query
    $sql = "SELECT p.id, p.name, c.name as category, p.quantity, p.price 
            FROM products p
            JOIN categories c ON p.category_id = c.id";

    $conditions = [];

    // If a category is provided, add a WHERE clause
    if ($category !== 'all') {
        $conditions[] = "c.name = '" . $conn->real_escape_string($category) . "'";
    }

    if (is_string($product_ids)) {
        $product_ids = explode(',', $product_ids);
    }

    if (!empty($product_ids)) {
        $product_id_conditions = [];
        foreach ($product_ids as $product_id) {
            $product_id_conditions[] = "p.id = " . intval($product_id);
        }
        $conditions[] = "(" . implode(' OR ', $product_id_conditions) . ")";
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }

    $sql .= " ORDER BY p.id ASC";

    $result = $conn->query($sql);

    $products_data = [];
    if ($result->num_rows > 0) {
        while($data = $result->fetch_assoc()) {
            $products_data[] = $data;
        }
    }

    if ($preview) {
        header('Content-Type: application/json');
        echo json_encode($products_data);
    } else {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', 'Name');
        $sheet->setCellValue('C1', 'Category');
        $sheet->setCellValue('D1', 'Quantity');
        $sheet->setCellValue('E1', 'Price');

        // Set column widths to auto-size
        foreach (range('A', 'E') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $row = 2;
        $id_counter = 1;
        foreach ($products_data as $data) {
            $sheet->setCellValue('A' . $row, $id_counter++);
            $sheet->setCellValue('B' . $row, $data['name']);
            $sheet->setCellValue('C' . $row, $data['category']);
            $sheet->setCellValue('D' . $row, $data['quantity']);
            $sheet->setCellValue('E' . $row, $data['price']);
            $row++;
        }

        // Set headers for download
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="products_report.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
    }

    $conn->close();
    exit;
}
?>