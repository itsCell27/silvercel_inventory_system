<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT * FROM sales_orders ORDER BY order_date DESC";
    $result = $conn->query($sql);
    $orders = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
    }
    echo json_encode($orders);
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $product_name = $data->product_name;
    $quantity_sold = $data->quantity_sold;
    $total_price = $data->total_price;
    $order_date = $data->order_date;

    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Get current product quantity
        $sql_select = "SELECT quantity FROM products WHERE name = ?";
        $stmt_select = $conn->prepare($sql_select);
        $stmt_select->bind_param("s", $product_name);
        $stmt_select->execute();
        $result = $stmt_select->get_result();
        $product = $result->fetch_assoc();
        $current_quantity = $product['quantity'];
        $stmt_select->close();

        if ($current_quantity < $quantity_sold) {
            throw new Exception('Insufficient stock');
        }

        // 2. Update product quantity
        $new_quantity = $current_quantity - $quantity_sold;
        $sql_update = "UPDATE products SET quantity = ? WHERE name = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("is", $new_quantity, $product_name);
        $stmt_update->execute();
        $stmt_update->close();

        // 3. Insert sales order
        $sql_insert = "INSERT INTO sales_orders (product_name, quantity_sold, total_price, order_date) VALUES (?, ?, ?, ?)";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param("sids", $product_name, $quantity_sold, $total_price, $order_date);
        $stmt_insert->execute();
        $new_id = $conn->insert_id;
        $stmt_insert->close();

        // Commit transaction
        $conn->commit();

        // Fetch and return the newly created order
        $sql_select_order = "SELECT * FROM sales_orders WHERE id = ?";
        $stmt_select_order = $conn->prepare($sql_select_order);
        $stmt_select_order->bind_param("i", $new_id);
        $stmt_select_order->execute();
        $new_order = $stmt_select_order->get_result()->fetch_assoc();
        $stmt_select_order->close();

        echo json_encode($new_order);

    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(400);
        echo json_encode(['message' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    $id = $data->id;
    $product_name = $data->product_name;
    $quantity_sold = $data->quantity_sold;
    $total_price = $data->total_price;
    $order_date = $data->order_date;

    $sql = "UPDATE sales_orders SET product_name = ?, quantity_sold = ?, total_price = ?, order_date = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sidsi", $product_name, $quantity_sold, $total_price, $order_date, $id);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Order updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to update order']);
    }

    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];

    $sql = "DELETE FROM sales_orders WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Order deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to delete order']);
    }

    $stmt->close();
}

$conn->close();
?>