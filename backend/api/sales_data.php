<?php
header('Content-Type: application/json');
require_once 'database_connection.php';
require_once 'cors.php';

$timeRange = isset($_GET['timeRange']) ? $_GET['timeRange'] : '90d';

$dateExpression = "DATE(order_date)";
$whereClause = "";

if ($timeRange === 'this_year') {
    $dateExpression = "YEAR(order_date)";
    $whereClause = "WHERE order_date IS NOT NULL";
} else {
    $interval = '3 MONTH'; // Default to 90 days
    if ($timeRange === '30d') {
        $interval = '1 MONTH';
    } elseif ($timeRange === '7d') {
        $interval = '7 DAY';
    }
    $whereClause = "WHERE order_date >= CURDATE() - INTERVAL $interval";
}

$sql = "SELECT $dateExpression as order_day, 
        COALESCE(SUM(total_price), 0) as total_sales, 
        COALESCE(SUM(quantity_sold), 0) as total_items_sold
        FROM sales_orders
        $whereClause
        GROUP BY order_day
        ORDER BY order_day";

$result = $conn->query($sql);

$sales_data = array();
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $sales_data[] = array(
            'order_day' => $row['order_day'],
            'total_sales' => (float)$row['total_sales'],
            'items_sold' => (int)$row['total_items_sold']
        );
    }
}

echo json_encode($sales_data);
$conn->close();
?>