<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'silver_cel';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  throw new Exception("Connection failed: " . $conn->connect_error);
}
?>