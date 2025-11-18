<?php
require_once 'database_connection.php';
require_once 'cors.php';

// Always return JSON
header('Content-Type: application/json; charset=utf-8');

// Use UTF-8
$conn->set_charset('utf8mb4');

// ---------- Query ----------
// Preferred approach: aggregate in a subquery by product_name, then join products to get image_path.
// This avoids problems with ONLY_FULL_GROUP_BY mode.
$sql = "
    SELECT
        p.id,
        p.name AS product_name,
        p.image_path,
        totals.total_quantity_sold
    FROM products p
    JOIN (
        SELECT product_id, SUM(quantity_sold) AS total_quantity_sold
        FROM sales_orders
        GROUP BY product_id
    ) AS totals
      ON totals.product_id = p.id
    ORDER BY totals.total_quantity_sold DESC
    LIMIT 5
";

// Run query
if (!$result = $conn->query($sql)) {
    http_response_code(500);
    $err = ['error' => 'Query failed: ' . $conn->error];
    // In debug mode, include the SQL too:
    if ($debug) $err['sql'] = $sql;
    echo json_encode($err);
    $conn->close();
    exit;
}

// Fetch rows
$rows = [];
while ($row = $result->fetch_assoc()) {
    // Normalize image_path (optional): leave as-is or provide full URL prefix if you store relative paths.
    // Example: if images are stored in /uploads/images/, you could prepend base URL here.
    $rows[] = [
        'id' => $row['id'],
        'product_name' => $row['product_name'],
        'image_path' => $row['image_path'],
        'total_quantity_sold' => (int)$row['total_quantity_sold'],
    ];
}

// Return JSON
echo json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// Cleanup
$result->free();
$conn->close();
?>