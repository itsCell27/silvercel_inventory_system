<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    header('Content-Type: application/json');

    // Join with products table to get current product name
    $sql = "SELECT 
                so.id,
                so.sales_id,
                so.product_id,
                so.product_name,
                so.quantity_sold,
                so.total_price,
                so.order_date,
                p.name AS current_product_name
            FROM sales_orders AS so
            LEFT JOIN products AS p ON so.product_id = p.id
            ORDER BY so.id DESC;";
    
    $result = $conn->query($sql);
    $orders = array();

    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            // Explicitly cast numeric fields to correct types
            $orders[] = [
                'id' => (int)$row['id'],
                'sales_id' => $row['sales_id'],
                'product_id' => (int)$row['product_id'],
                'product_name' => $row['product_name'],
                'current_product_name' => $row['current_product_name'],
                'quantity_sold' => (int)$row['quantity_sold'],
                'total_price' => (float)$row['total_price'],
                'order_date' => $row['order_date']
            ];
        }
    }

    echo json_encode($orders);

} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    function generateSalesId($conn) {
        $prefix = 'SLC';
        $uniquePart = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6)); 
        $salesId = $prefix . $uniquePart;

        $checkQuery = "SELECT COUNT(*) as count FROM sales_orders WHERE sales_id = '$salesId'";
        $result = $conn->query($checkQuery);
        $row = $result->fetch_assoc();

        if ($row['count'] > 0) {
            return generateSalesId($conn);
        }

        return $salesId;
    }

    $sales_id = generateSalesId($conn);
    $product_id = $data->product_id; // Changed from product_name
    $quantity_sold = $data->quantity_sold;
    $total_price = $data->total_price;
    $order_date = $data->order_date;

    $conn->begin_transaction();

    try {
        // 1. Get current product info
        $sql_select = "SELECT name, quantity FROM products WHERE id = ?";
        $stmt_select = $conn->prepare($sql_select);
        $stmt_select->bind_param("i", $product_id);
        $stmt_select->execute();
        $result = $stmt_select->get_result();
        $product = $result->fetch_assoc();
        $current_quantity = $product['quantity'];
        $product_name = $product['name']; // Get name for storage
        $stmt_select->close();

        if ($current_quantity < $quantity_sold) {
            throw new Exception('Insufficient stock');
        }

        // 2. Update product quantity
        $new_quantity = $current_quantity - $quantity_sold;
        $sql_update = "UPDATE products SET quantity = ? WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("ii", $new_quantity, $product_id);
        $stmt_update->execute();
        $stmt_update->close();

        // 3. Insert sales order (store both product_id and product_name)
        $sql_insert = "INSERT INTO sales_orders (sales_id, product_id, product_name, quantity_sold, total_price, order_date) 
                       VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param("sissds", $sales_id, $product_id, $product_name, $quantity_sold, $total_price, $order_date);
        $stmt_insert->execute();
        $new_id = $conn->insert_id;
        $stmt_insert->close();

        $conn->commit();

        // Fetch and return the newly created order with product info
        $sql_select_order = "SELECT so.*, p.name as current_product_name 
                             FROM sales_orders so 
                             LEFT JOIN products p ON so.product_id = p.id 
                             WHERE so.id = ?";
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
    $product_id = $data->product_id; // Changed from product_name
    $quantity_sold = $data->quantity_sold;
    $total_price = $data->total_price;
    $order_date = $data->order_date;

    $conn->begin_transaction();

    try {
        // 1. Get the original quantity sold and product_id from the database
        $sql_select_original = "SELECT product_id, quantity_sold FROM sales_orders WHERE id = ?";
        $stmt_select_original = $conn->prepare($sql_select_original);
        $stmt_select_original->bind_param("i", $id);
        $stmt_select_original->execute();
        $result_original = $stmt_select_original->get_result();
        $original_order = $result_original->fetch_assoc();
        $original_quantity_sold = $original_order['quantity_sold'];
        $original_product_id = $original_order['product_id'];
        $stmt_select_original->close();

        // 2. Revert the stock by adding back the original quantity to the original product
        $sql_update_stock_revert = "UPDATE products SET quantity = quantity + ? WHERE id = ?";
        $stmt_revert = $conn->prepare($sql_update_stock_revert);
        $stmt_revert->bind_param("ii", $original_quantity_sold, $original_product_id);
        $stmt_revert->execute();
        $stmt_revert->close();

        // 3. Get current product info and check stock
        $sql_select_product = "SELECT name, quantity FROM products WHERE id = ?";
        $stmt_select_product = $conn->prepare($sql_select_product);
        $stmt_select_product->bind_param("i", $product_id);
        $stmt_select_product->execute();
        $result_product = $stmt_select_product->get_result();
        $product = $result_product->fetch_assoc();
        $current_stock = $product['quantity'];
        $product_name = $product['name'];
        $stmt_select_product->close();

        if ($current_stock < $quantity_sold) {
            throw new Exception('Insufficient stock for the updated quantity');
        }

        // 4. Update the stock with the new quantity
        $sql_update_stock = "UPDATE products SET quantity = quantity - ? WHERE id = ?";
        $stmt_update_stock = $conn->prepare($sql_update_stock);
        $stmt_update_stock->bind_param("ii", $quantity_sold, $product_id);
        $stmt_update_stock->execute();
        $stmt_update_stock->close();

        // 5. Update the sales order (update both product_id and product_name)
        $sql_update_order = "UPDATE sales_orders 
                             SET product_id = ?, product_name = ?, quantity_sold = ?, total_price = ?, order_date = ? 
                             WHERE id = ?";
        $stmt_update_order = $conn->prepare($sql_update_order);
        $stmt_update_order->bind_param("isidsi", $product_id, $product_name, $quantity_sold, $total_price, $order_date, $id);
        $stmt_update_order->execute();
        $stmt_update_order->close();

        $conn->commit();

        echo json_encode(['message' => 'Order updated successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(400);
        echo json_encode(['message' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];

    $conn->begin_transaction();

    try {
        // 1. Get the product_id and quantity_sold from the order being deleted
        $sql_select = "SELECT product_id, quantity_sold FROM sales_orders WHERE id = ?";
        $stmt_select = $conn->prepare($sql_select);
        $stmt_select->bind_param("i", $id);
        $stmt_select->execute();
        $result = $stmt_select->get_result();
        $order = $result->fetch_assoc();
        $product_id = $order['product_id'];
        $quantity_sold = $order['quantity_sold'];
        $stmt_select->close();

        // 2. Update the product stock
        $sql_update = "UPDATE products SET quantity = quantity + ? WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("ii", $quantity_sold, $product_id);
        $stmt_update->execute();
        $stmt_update->close();

        // 3. Delete the sales order
        $sql_delete = "DELETE FROM sales_orders WHERE id = ?";
        $stmt_delete = $conn->prepare($sql_delete);
        $stmt_delete->bind_param("i", $id);
        $stmt_delete->execute();
        $stmt_delete->close();

        $conn->commit();

        echo json_encode(['message' => 'Order deleted successfully and stock restored']);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['message' => 'Failed to delete order: ' . $e->getMessage()]);
    }
}

$conn->close();
?>