<?php
header('Content-Type: application/json');
include 'db.php';

$student_id = isset($_GET['student_id']) ? $conn->real_escape_string($_GET['student_id']) : null;
$class_id = isset($_GET['class_id']) ? $conn->real_escape_string($_GET['class_id']) : null;
$start_date = isset($_GET['start_date']) ? $conn->real_escape_string($_GET['start_date']) : null;
$end_date = isset($_GET['end_date']) ? $conn->real_escape_string($_GET['end_date']) : null;

$sql = "SELECT ar.*, s.student_name, c.class_name
        FROM attendance_records ar
        JOIN students s ON ar.student_id = s.student_id
        JOIN classes c ON ar.class_id = c.class_id
        WHERE 1=1";

if ($student_id) {
    $sql .= " AND ar.student_id = '$student_id'";
}
if ($class_id) {
    $sql .= " AND ar.class_id = '$class_id'";
}
if ($start_date) {
    $sql .= " AND ar.timestamp >= '$start_date 00:00:00'";
}
if ($end_date) {
    $sql .= " AND ar.timestamp <= '$end_date 23:59:59'";
}

$sql .= " ORDER BY ar.timestamp DESC";

$result = $conn->query($sql);
$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = $row;
}
echo json_encode($records);

$conn->close();
?>
