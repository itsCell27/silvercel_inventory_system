<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

require_once 'database_connection.php';
require_once 'cors.php';

// Function to send SSE data
function send_sse($data) {
    echo "data: " . json_encode($data) . "\n\n";
    ob_flush();
    flush();
}

// Main loop to watch for changes
while (true) {
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

    if ($result) {
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
        send_sse($sales_data);
    }

    // Sleep for a short interval before checking for new data again
    sleep(2); // Poll the database every 2 seconds
}

$conn->close();
?>