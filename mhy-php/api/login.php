<?php
header('Content-Type: application/json');
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing username or password']);
    exit;
}

$username = $conn->real_escape_string($data['username']);
$password = $data['password'];

$sql = "SELECT id, username, password_hash, role, name FROM users WHERE username = '$username'";
$result = $conn->query($sql);

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit;
}

$user = $result->fetch_assoc();

if (password_verify($password, $user['password_hash'])) {
    // Remove password_hash before sending response
    unset($user['password_hash']);
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
}

$conn->close();
?>
