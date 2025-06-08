<?php
header('Content-Type: application/json');
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get attendance records, optionally filtered by student_id, class_id, date range
        $student_id = isset($_GET['student_id']) ? $conn->real_escape_string($_GET['student_id']) : null;
        $class_id = isset($_GET['class_id']) ? $conn->real_escape_string($_GET['class_id']) : null;
        $start_date = isset($_GET['start_date']) ? $conn->real_escape_string($_GET['start_date']) : null;
        $end_date = isset($_GET['end_date']) ? $conn->real_escape_string($_GET['end_date']) : null;

        $sql = "SELECT * FROM attendance_records WHERE 1=1";

        if ($student_id) {
            $sql .= " AND student_id = '$student_id'";
        }
        if ($class_id) {
            $sql .= " AND class_id = '$class_id'";
        }
        if ($start_date) {
            $sql .= " AND timestamp >= '$start_date 00:00:00'";
        }
        if ($end_date) {
            $sql .= " AND timestamp <= '$end_date 23:59:59'";
        }

        $sql .= " ORDER BY timestamp DESC";

        $result = $conn->query($sql);
        $records = [];
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }
        echo json_encode($records);
        break;

    case 'POST':
        // Record attendance
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['student_id'], $data['class_id'], $data['timestamp'], $data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        $student_id = $conn->real_escape_string($data['student_id']);
        $class_id = $conn->real_escape_string($data['class_id']);
        $timestamp = $conn->real_escape_string($data['timestamp']);
        $status = $conn->real_escape_string($data['status']);

        $sql = "INSERT INTO attendance_records (student_id, class_id, timestamp, status) VALUES ('$student_id', '$class_id', '$timestamp', '$status')";
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
