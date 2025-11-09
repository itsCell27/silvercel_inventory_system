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
        $sql_insert = "INSERT INTO sales_orders (product_name, quantity_sold, total_price) VALUES (?, ?, ?)";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param("sid", $product_name, $quantity_sold, $total_price);
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

    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Get the original quantity sold from the database
        $sql_select_original = "SELECT quantity_sold FROM sales_orders WHERE id = ?";
        $stmt_select_original = $conn->prepare($sql_select_original);
        $stmt_select_original->bind_param("i", $id);
        $stmt_select_original->execute();
        $result_original = $stmt_select_original->get_result();
        $original_order = $result_original->fetch_assoc();
        $original_quantity_sold = $original_order['quantity_sold'];
        $stmt_select_original->close();

        // 2. Revert the stock by adding back the original quantity
        $sql_update_stock_revert = "UPDATE products SET quantity = quantity + ? WHERE name = ?";
        $stmt_revert = $conn->prepare($sql_update_stock_revert);
        $stmt_revert->bind_param("is", $original_quantity_sold, $product_name);
        $stmt_revert->execute();
        $stmt_revert->close();

        // 3. Check if there is enough stock for the new quantity
        $sql_select_product = "SELECT quantity FROM products WHERE name = ?";
        $stmt_select_product = $conn->prepare($sql_select_product);
        $stmt_select_product->bind_param("s", $product_name);
        $stmt_select_product->execute();
        $result_product = $stmt_select_product->get_result();
        $product = $result_product->fetch_assoc();
        $current_stock = $product['quantity'];
        $stmt_select_product->close();

        if ($current_stock < $quantity_sold) {
            throw new Exception('Insufficient stock for the updated quantity');
        }

        // 4. Update the stock with the new quantity
        $sql_update_stock = "UPDATE products SET quantity = quantity - ? WHERE name = ?";
        $stmt_update_stock = $conn->prepare($sql_update_stock);
        $stmt_update_stock->bind_param("is", $quantity_sold, $product_name);
        $stmt_update_stock->execute();
        $stmt_update_stock->close();

        // 5. Update the sales order
        $sql_update_order = "UPDATE sales_orders SET product_name = ?, quantity_sold = ?, total_price = ?, order_date = ? WHERE id = ?";
        $stmt_update_order = $conn->prepare($sql_update_order);
        $stmt_update_order->bind_param("sidsi", $product_name, $quantity_sold, $total_price, $order_date, $id);
        $stmt_update_order->execute();
        $stmt_update_order->close();

        // Commit transaction
        $conn->commit();

        echo json_encode(['message' => 'Order updated successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(400);
        echo json_encode(['message' => $e->getMessage()]);
    }
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