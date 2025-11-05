<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT DATE(order_date) as date, SUM(total_price) as total_sales
            FROM sales_orders
            WHERE order_date >= CURDATE() - INTERVAL 30 DAY
            GROUP BY DATE(order_date)
            ORDER BY date ASC";

    $result = $conn->query($sql);
    $sales_trend = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $sales_trend[] = $row;
        }
    }
    echo json_encode($sales_trend);
}

$conn->close();
?>