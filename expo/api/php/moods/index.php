<?php
require_once '../includes/config.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();
$user = authenticateUser($db);

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'analytics') {
            getMoodAnalytics($db, $user);
        } else {
            getMoods($db, $user);
        }
        break;
    case 'POST':
        createMood($db, $user, $input);
        break;
    default:
        sendError('Method not allowed', 405);
}

function getMoods($db, $user) {
    $query = "SELECT * FROM mood_entries WHERE user_id = :user_id ORDER BY timestamp DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();

    $moods = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse($moods);
}

function createMood($db, $user, $input) {
    if (!isset($input['mood'])) {
        sendError('Mood is required');
    }

    $moodId = generateUUID();
    $query = "INSERT INTO mood_entries (id, user_id, mood, note) VALUES (:id, :user_id, :mood, :note)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $moodId);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->bindParam(':mood', $input['mood']);
    $stmt->bindParam(':note', $input['note'] ?? null);

    if ($stmt->execute()) {
        $selectQuery = "SELECT * FROM mood_entries WHERE id = :id";
        $selectStmt = $db->prepare($selectQuery);
        $selectStmt->bindParam(':id', $moodId);
        $selectStmt->execute();
        
        $newMood = $selectStmt->fetch(PDO::FETCH_ASSOC);
        sendResponse($newMood, 201);
    } else {
        sendError('Failed to create mood entry', 500);
    }
}

function getMoodAnalytics($db, $user) {
    // Weekly moods
    $weeklyQuery = "SELECT mood, COUNT(*) as count, DATE(timestamp) as date
                    FROM mood_entries 
                    WHERE user_id = :user_id AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    GROUP BY mood, DATE(timestamp)
                    ORDER BY timestamp DESC";
    $weeklyStmt = $db->prepare($weeklyQuery);
    $weeklyStmt->bindParam(':user_id', $user['id']);
    $weeklyStmt->execute();
    $weeklyMoods = $weeklyStmt->fetchAll(PDO::FETCH_ASSOC);

    // Mood trend
    $trendQuery = "SELECT 
                    CASE mood
                        WHEN 'very-sad' THEN 1
                        WHEN 'sad' THEN 2
                        WHEN 'neutral' THEN 3
                        WHEN 'happy' THEN 4
                        WHEN 'very-happy' THEN 5
                    END as mood_score,
                    DATE(timestamp) as date
                   FROM mood_entries 
                   WHERE user_id = :user_id AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                   ORDER BY timestamp DESC";
    $trendStmt = $db->prepare($trendQuery);
    $trendStmt->bindParam(':user_id', $user['id']);
    $trendStmt->execute();
    $moodTrend = $trendStmt->fetchAll(PDO::FETCH_ASSOC);

    $averageScore = 0;
    if (count($moodTrend) > 0) {
        $totalScore = array_sum(array_column($moodTrend, 'mood_score'));
        $averageScore = $totalScore / count($moodTrend);
    }

    sendResponse([
        'weeklyMoods' => $weeklyMoods,
        'moodTrend' => $moodTrend,
        'averageScore' => $averageScore
    ]);
}
?>