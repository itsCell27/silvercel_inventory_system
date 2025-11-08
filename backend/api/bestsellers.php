<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT p.id, so.product_name, SUM(so.quantity_sold) as total_quantity_sold
            FROM sales_orders so
            JOIN products p ON so.product_name = p.name
            GROUP BY p.id, so.product_name
            ORDER BY total_quantity_sold DESC
            LIMIT 5"; // Get top 5 best-selling products

    $result = $conn->query($sql);
    $bestsellers = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $bestsellers[] = $row;
        }
    }
    echo json_encode($bestsellers);
}

$conn->close();
?>