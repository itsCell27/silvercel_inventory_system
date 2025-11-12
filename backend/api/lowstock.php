<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT id, name, quantity, image_path
            FROM products
            WHERE quantity <= 10
            ORDER BY quantity ASC";

    $result = $conn->query($sql);
    $lowstock_products = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $lowstock_products[] = $row;
        }
    }
    echo json_encode($lowstock_products);
}

$conn->close();
?>