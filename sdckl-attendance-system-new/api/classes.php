<?php
header('Content-Type: application/json');
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List all classes
        $result = $conn->query("SELECT class_id, class_name FROM classes");
        $classes = [];
        while ($row = $result->fetch_assoc()) {
            $classes[] = $row;
        }
        echo json_encode($classes);
        break;

    case 'POST':
        // Add new class
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['class_id'], $data['class_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        $class_id = $conn->real_escape_string($data['class_id']);
        $class_name = $conn->real_escape_string($data['class_name']);

        // Check if class_id exists
        $check = $conn->query("SELECT id FROM classes WHERE class_id = '$class_id'");
        if ($check->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Class ID already exists']);
            exit;
        }

        $sql = "INSERT INTO classes (class_id, class_name) VALUES ('$class_id', '$class_name')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $conn->error]);
        }
        break;

    case 'PUT':
        // Update class
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['class_id'], $data['class_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        $class_id = $conn->real_escape_string($data['class_id']);
        $class_name = $conn->real_escape_string($data['class_name']);

        // Check if class exists
        $check = $conn->query("SELECT id FROM classes WHERE class_id = '$class_id'");
        if ($check->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Class not found']);
            exit;
        }

        $sql = "UPDATE classes SET class_name = '$class_name' WHERE class_id = '$class_id'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $conn->error]);
        }
        break;

    case 'DELETE':
        // Delete class
        parse_str(file_get_contents("php://input"), $data);
        if (!isset($data['class_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing class_id']);
            exit;
        }
        $class_id = $conn->real_escape_string($data['class_id']);

        $sql = "DELETE FROM classes WHERE class_id = '$class_id'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $conn->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

$conn->close();
?>
