<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $data = array();

    // Get total sales
    $sql_sales = "SELECT SUM(total_price) as total_sales FROM sales_orders";
    $result_sales = $conn->query($sql_sales);
    $row_sales = $result_sales->fetch_assoc();
    $data['total_sales'] = $row_sales['total_sales'] ? $row_sales['total_sales'] : 0;

    $sql_products_list = "SELECT * FROM products";
    $result_products_list = $conn->query($sql_products_list);
    $products = array();
    if ($result_products_list->num_rows > 0) {
        while($row = $result_products_list->fetch_assoc()) {
            $products[] = $row;
        }
    }
    $data['products'] = $products;

    // Get total categories
    $sql_categories = "SELECT COUNT(*) as total_categories FROM categories";
    $result_categories = $conn->query($sql_categories);
    $row_categories = $result_categories->fetch_assoc();
    $data['total_categories'] = $row_categories['total_categories'];

    echo json_encode($data);
}

$conn->close();
?>