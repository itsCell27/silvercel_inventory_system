<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once 'database_connection.php';
require_once 'cors.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $preview = isset($_GET['preview']) && $_GET['preview'] === 'true';
    $years = isset($_GET['years']) ? $_GET['years'] : [];
    $order_ids = isset($_GET['order_ids']) ? $_GET['order_ids'] : [];

    // Base SQL query
    $sql = "SELECT so.id as order_id, p.name as product_name, so.quantity_sold, so.total_price, so.order_date FROM sales_orders so JOIN products p ON so.product_id = p.id";

    $conditions = [];

    // If years are provided, add a WHERE clause
    if (!empty($years) && !in_array('all', $years)) {
        $year_conditions = [];
        foreach ($years as $year) {
            $year_conditions[] = "YEAR(so.order_date) = " . intval($year);
        }
        $conditions[] = "(" . implode(' OR ', $year_conditions) . ")";
    }

    if (!empty($order_ids)) {
        $order_id_conditions = [];
        foreach ($order_ids as $order_id) {
            $order_id_conditions[] = "so.id = " . intval($order_id);
        }
        $conditions[] = "(" . implode(' OR ', $order_id_conditions) . ")";
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }

    $sql .= " ORDER BY so.order_date DESC";

    $result = $conn->query($sql);

    $sales_data = [];
    if ($result->num_rows > 0) {
        while($data = $result->fetch_assoc()) {
            $sales_data[] = $data;
        }
    }

    if ($preview) {
        header('Content-Type: application/json');
        echo json_encode($sales_data);
    } else {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $sheet->setCellValue('A1', 'Order ID');
        $sheet->setCellValue('B1', 'Product Name');
        $sheet->setCellValue('C1', 'Quantity Sold');
        $sheet->setCellValue('D1', 'Total Price');
        $sheet->setCellValue('E1', 'Order Date');

        foreach (range('A', 'E') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $row = 2;
        $order_id_counter = 1;
        foreach ($sales_data as $data) {
            $sheet->setCellValue('A' . $row, $order_id_counter++);
            $sheet->setCellValue('B' . $row, $data['product_name']);
            $sheet->setCellValue('C' . $row, $data['quantity_sold']);
            $sheet->setCellValue('D' . $row, $data['total_price']);
            $sheet->setCellValue('E' . $row, $data['order_date']);
            $row++;
        }

        // Set headers for download
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="sales_report.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
    }

    $conn->close();
    exit;
}
?>
''