<?php
header('Content-Type: application/json');
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List all students
        $result = $conn->query("SELECT student_id, student_name, remarks FROM students");
        $students = [];
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }
        echo json_encode($students);
        break;

    case 'POST':
        // Add new student
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['student_id'], $data['student_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        $student_id = $conn->real_escape_string($data['student_id']);
        $student_name = $conn->real_escape_string($data['student_name']);
        $remarks = isset($data['remarks']) ? $conn->real_escape_string($data['remarks']) : '';

        // Check if student_id exists
        $check = $conn->query("SELECT id FROM students WHERE student_id = '$student_id'");
        if ($check->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Student ID already exists']);
            exit;
        }

        $sql = "INSERT INTO students (student_id, student_name, remarks) VALUES ('$student_id', '$student_name', '$remarks')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $conn->error]);
        }
        break;

    case 'PUT':
        // Update student
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['student_id'], $data['student_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        $student_id = $conn->real_escape_string($data['student_id']);
        $student_name = $conn->real_escape_string($data['student_name']);
        $remarks = isset($data['remarks']) ? $conn->real_escape_string($data['remarks']) : '';

        // Check if student exists
        $check = $conn->query("SELECT id FROM students WHERE student_id = '$student_id'");
        if ($check->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            exit;
        }

        $sql = "UPDATE students SET student_name = '$student_name', remarks = '$remarks' WHERE student_id = '$student_id'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $conn->error]);
        }
        break;

    case 'DELETE':
        // Delete student
        parse_str(file_get_contents("php://input"), $data);
        if (!isset($data['student_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing student_id']);
            exit;
        }
        $student_id = $conn->real_escape_string($data['student_id']);

        $sql = "DELETE FROM students WHERE student_id = '$student_id'";
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
