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
        if (isset($_GET['sessions'])) {
            getChatSessions($db, $user);
        } elseif (isset($_GET['session_id']) && isset($_GET['messages'])) {
            getMessages($db, $user, $_GET['session_id']);
        } else {
            sendError('Invalid request', 400);
        }
        break;
    case 'POST':
        if (isset($_GET['sessions'])) {
            createChatSession($db, $user, $input);
        } elseif (isset($_GET['session_id']) && isset($_GET['messages'])) {
            sendMessage($db, $user, $_GET['session_id'], $input);
        } else {
            sendError('Invalid request', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getChatSessions($db, $user) {
    $query = "SELECT cs.*, 
              GROUP_CONCAT(u.name) as participant_names
              FROM chat_sessions cs
              LEFT JOIN users u ON JSON_CONTAINS(cs.participants, JSON_QUOTE(u.id))
              WHERE JSON_CONTAINS(cs.participants, JSON_QUOTE(?))
              GROUP BY cs.id
              ORDER BY cs.start_time DESC";
    $stmt = $db->prepare($query);
    $stmt->execute([$user['id']]);

    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($sessions as &$session) {
        $session['participants'] = json_decode($session['participants'], true);
    }

    sendResponse($sessions);
}

function createChatSession($db, $user, $input) {
    if (!isset($input['type'])) {
        sendError('Chat type is required');
    }

    $sessionId = generateUUID();
    $participants = [$user['id']];
    
    if (isset($input['participantId'])) {
        $participants[] = $input['participantId'];
    }

    $query = "INSERT INTO chat_sessions (id, participants, type) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$sessionId, json_encode($participants), $input['type']])) {
        $selectQuery = "SELECT * FROM chat_sessions WHERE id = ?";
        $selectStmt = $db->prepare($selectQuery);
        $selectStmt->execute([$sessionId]);
        
        $newSession = $selectStmt->fetch(PDO::FETCH_ASSOC);
        $newSession['participants'] = json_decode($newSession['participants'], true);
        
        sendResponse($newSession, 201);
    } else {
        sendError('Failed to create chat session', 500);
    }
}

function getMessages($db, $user, $sessionId) {
    // Verify user is participant
    $sessionQuery = "SELECT participants FROM chat_sessions WHERE id = ?";
    $sessionStmt = $db->prepare($sessionQuery);
    $sessionStmt->execute([$sessionId]);
    $session = $sessionStmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        sendError('Session not found', 404);
    }

    $participants = json_decode($session['participants'], true);
    if (!in_array($user['id'], $participants)) {
        sendError('Access denied', 403);
    }

    $query = "SELECT cm.*, u.name as sender_name
              FROM chat_messages cm
              LEFT JOIN users u ON cm.sender_id = u.id
              WHERE cm.session_id = ?
              ORDER BY cm.timestamp ASC";
    $stmt = $db->prepare($query);
    $stmt->execute([$sessionId]);

    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse($messages);
}

function sendMessage($db, $user, $sessionId, $input) {
    if (!isset($input['content'])) {
        sendError('Message content is required');
    }

    // Verify user is participant
    $sessionQuery = "SELECT participants FROM chat_sessions WHERE id = ?";
    $sessionStmt = $db->prepare($sessionQuery);
    $sessionStmt->execute([$sessionId]);
    $session = $sessionStmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        sendError('Session not found', 404);
    }

    $participants = json_decode($session['participants'], true);
    if (!in_array($user['id'], $participants)) {
        sendError('Access denied', 403);
    }

    $messageId = generateUUID();
    $messageType = $input['messageType'] ?? 'text';

    $query = "INSERT INTO chat_messages (id, session_id, sender_id, content, sender_type, message_type)
              VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$messageId, $sessionId, $user['id'], $input['content'], $user['role'], $messageType])) {
        $selectQuery = "SELECT cm.*, u.name as sender_name
                        FROM chat_messages cm
                        LEFT JOIN users u ON cm.sender_id = u.id
                        WHERE cm.id = ?";
        $selectStmt = $db->prepare($selectQuery);
        $selectStmt->execute([$messageId]);
        
        $newMessage = $selectStmt->fetch(PDO::FETCH_ASSOC);
        sendResponse($newMessage, 201);
    } else {
        sendError('Failed to send message', 500);
    }
}
?>