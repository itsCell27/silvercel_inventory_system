<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $data = array();

    // Get total products in stock
    $sql_total_quantity = "SELECT SUM(quantity) as total_quantity FROM products";
    $result_total_quantity = $conn->query($sql_total_quantity);
    $row_total_quantity = $result_total_quantity->fetch_assoc();
    $data['total_quantity'] = $row_total_quantity['total_quantity'] ? (int)$row_total_quantity['total_quantity'] : 0;

    // Get total inventory value
    $sql_inventory_value = "SELECT SUM(price * quantity) as inventory_value FROM products";
    $result_inventory_value = $conn->query($sql_inventory_value);
    $row_inventory_value = $result_inventory_value->fetch_assoc();
    $data['inventory_value'] = $row_inventory_value['inventory_value'] ? (float)$row_inventory_value['inventory_value'] : 0;

    // Get sales this month
    $sql_sales_month = "SELECT SUM(total_price) as sales_this_month FROM sales_orders WHERE MONTH(order_date) = MONTH(CURRENT_DATE) AND YEAR(order_date) = YEAR(CURRENT_DATE)";
    $result_sales_month = $conn->query($sql_sales_month);
    $row_sales_month = $result_sales_month->fetch_assoc();
    $data['sales_this_month'] = $row_sales_month['sales_this_month'] ? (float)$row_sales_month['sales_this_month'] : 0;

    // Get low stock items count
    $sql_low_stock = "SELECT COUNT(*) as low_stock_count FROM products WHERE quantity < 10";
    $result_low_stock = $conn->query($sql_low_stock);
    $row_low_stock = $result_low_stock->fetch_assoc();
    $data['low_stock_count'] = $row_low_stock['low_stock_count'] ? (int)$row_low_stock['low_stock_count'] : 0;

    echo json_encode($data);
}

$conn->close();
?>