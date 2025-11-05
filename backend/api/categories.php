<?php
require_once 'database_connection.php';
require_once 'cors.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT * FROM categories";
    $result = $conn->query($sql);
    $categories = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
    }
    echo json_encode($categories);
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'];

    if (isset($data['id'])) {
        // Update
        $id = $data['id'];
        $sql = "UPDATE categories SET name = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $name, $id);
    } else {
        // Create
        $sql = "INSERT INTO categories (name) VALUES (?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $name);
    }

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Category saved successfully']);
    } else {
        echo json_encode(['message' => 'Error saving category']);
    }
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $sql = "DELETE FROM categories WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Category deleted successfully']);
    } else {
        echo json_encode(['message' => 'Error deleting category']);
    }
    $stmt->close();
}

$conn->close();
?>