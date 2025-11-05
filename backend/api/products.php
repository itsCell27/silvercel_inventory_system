<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT p.*, c.name AS category FROM products p JOIN categories c ON p.category_id = c.id";
    $result = $conn->query($sql);
    $products = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $row['category_id'] = (int)$row['category_id'];
            $row['quantity'] = (int)$row['quantity'];
            $row['price'] = (float)$row['price'];
            $products[] = $row;
        }
    }
    echo json_encode($products);
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $category_name = $_POST['category'];
    $quantity = $_POST['quantity'];
    $price = $_POST['price'];
    $image_path = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $upload_dir = __DIR__ . '/uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $image_filename = uniqid() . '-' . basename($_FILES['image']['name']);
        $target_file = $upload_dir . $image_filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $host = $_SERVER['HTTP_HOST'];
            $path = dirname($_SERVER['PHP_SELF']);
            $image_path = "$protocol://$host$path/uploads/$image_filename";
        } else {
            error_log("Error uploading file.");
        }
    }

    // Get category_id from category name
    $category_id = null;
    $sql_cat = "SELECT id FROM categories WHERE name = ?";
    $stmt_cat = $conn->prepare($sql_cat);
    $stmt_cat->bind_param("s", $category_name);
    $stmt_cat->execute();
    $result_cat = $stmt_cat->get_result();
    if ($result_cat->num_rows > 0) {
        $row_cat = $result_cat->fetch_assoc();
        $category_id = $row_cat['id'];
    }
    $stmt_cat->close();

    if (!$category_id) {
        echo json_encode(['message' => 'Error: Category not found']);
        exit();
    }

    if (isset($_POST['id'])) {
        // Update
        $id = $_POST['id'];
        if ($image_path) {
            $sql = "UPDATE products SET name = ?, category_id = ?, quantity = ?, price = ?, image_path = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("siidsi", $name, $category_id, $quantity, $price, $image_path, $id);
        } else {
            $sql = "UPDATE products SET name = ?, category_id = ?, quantity = ?, price = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("siidi", $name, $category_id, $quantity, $price, $id);
        }

        if ($stmt->execute()) {
            $sql = "SELECT * FROM products WHERE id = ?";
            $stmt_select = $conn->prepare($sql);
            $stmt_select->bind_param("i", $id);
            $stmt_select->execute();
            $result = $stmt_select->get_result();
            $updated_product = $result->fetch_assoc();
            echo json_encode($updated_product);
            $stmt_select->close();
        } else {
            error_log("Error updating product: " . $stmt->error);
            echo json_encode(['message' => 'Error updating product']);
        }
    } else {
        // Create
        $sql = "INSERT INTO products (name, category_id, quantity, price, image_path) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("siids", $name, $category_id, $quantity, $price, $image_path);
        if ($stmt->execute()) {
            $new_id = $conn->insert_id;
            $sql = "SELECT * FROM products WHERE id = ?";
            $stmt_select = $conn->prepare($sql);
            $stmt_select->bind_param("i", $new_id);
            $stmt_select->execute();
            $result = $stmt_select->get_result();
            $new_product = $result->fetch_assoc();
            echo json_encode($new_product);
            $stmt_select->close();
        } else {
            echo json_encode(['message' => 'Error creating product: ' . $stmt->error]);
        }
    }
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $sql = "DELETE FROM products WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Product deleted successfully']);
    } else {
        echo json_encode(['message' => 'Error deleting product']);
    }
    $stmt->close();
}

$conn->close();
?>