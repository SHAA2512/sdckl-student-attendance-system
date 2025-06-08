<?php
header('Content-Type: application/json');
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username'], $data['password'], $data['role'], $data['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$username = $conn->real_escape_string($data['username']);
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$role = $conn->real_escape_string($data['role']);
$name = $conn->real_escape_string($data['name']);

// Check if username exists
$sql = "SELECT id FROM users WHERE username = '$username'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Username already exists']);
    exit;
}

// Insert new user
$sql = "INSERT INTO users (username, password_hash, role, name) VALUES ('$username', '$password', '$role', '$name')";
if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $conn->error]);
}
$conn->close();
?>
