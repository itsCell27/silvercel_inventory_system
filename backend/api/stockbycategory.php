<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT c.name as category_name, SUM(p.quantity) as total_quantity
            FROM products p
            JOIN categories c ON p.category_id = c.id
            GROUP BY c.name
            ORDER BY c.name ASC";

    $result = $conn->query($sql);
    $stock_by_category = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $stock_by_category[] = $row;
        }
    }
    echo json_encode($stock_by_category);
}

$conn->close();
?>