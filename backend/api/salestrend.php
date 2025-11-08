<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

require_once 'database_connection.php';
require_once 'cors.php';

// Get the time range from the query parameters, default to '90d'
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

$sql = "SELECT $dateExpression as order_day, COALESCE(SUM(total_price), 0) as total_sales, COALESCE(SUM(quantity_sold), 0) as total_items_sold
        FROM sales_orders
        $whereClause
        GROUP BY order_day
        ORDER BY order_day";

$result = $conn->query($sql);

if (!$result) {
    error_log("SQL Error: " . $conn->error);
    die("An error occurred while fetching data.");
}

$sales_data = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $sales_data[] = array(
            'order_day' => $row['order_day'],
            'total_sales' => (float)$row['total_sales'],
            'items_sold' => (int)$row['total_items_sold']
        );
    }
}

error_log("Sales data for timeRange=$timeRange: " . print_r($sales_data, true));

// Close the database connection
$conn->close();

// Set the content type to application/json
header('Content-Type: application/json');

// Output the sales data as JSON
echo json_encode($sales_data);
?>