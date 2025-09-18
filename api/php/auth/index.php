<?php
require_once '../includes/config.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'POST':
        if (isset($_GET['action'])) {
            switch($_GET['action']) {
                case 'login':
                    login($db, $input);
                    break;
                case 'register':
                    register($db, $input);
                    break;
                case 'logout':
                    logout($db);
                    break;
                default:
                    sendError('Invalid action', 404);
            }
        } else {
            sendError('Action required', 400);
        }
        break;
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'me') {
            getCurrentUser($db);
        } else {
            sendError('Invalid action', 404);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function register($db, $input) {
    if (!isset($input['username']) || !isset($input['email']) || !isset($input['password']) || !isset($input['name']) || !isset($input['role'])) {
        sendError('Missing required fields');
    }

    // Check if user exists
    $query = "SELECT id FROM users WHERE username = :username OR email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $input['username']);
    $stmt->bindParam(':email', $input['email']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        sendError('Username or email already exists');
    }

    // Hash password
    $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);
    $userId = generateUUID();

    // Insert user
    $query = "INSERT INTO users (id, username, email, password_hash, name, role, college, 
              student_id, year, department, emergency_contact, license_number, 
              specializations, experience, qualifications, volunteer_type, availability, 
              training_completed) 
              VALUES (:id, :username, :email, :password_hash, :name, :role, :college,
              :student_id, :year, :department, :emergency_contact, :license_number,
              :specializations, :experience, :qualifications, :volunteer_type, :availability,
              :training_completed)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $userId);
    $stmt->bindParam(':username', $input['username']);
    $stmt->bindParam(':email', $input['email']);
    $stmt->bindParam(':password_hash', $passwordHash);
    $stmt->bindParam(':name', $input['name']);
    $stmt->bindParam(':role', $input['role']);
    $stmt->bindParam(':college', $input['college'] ?? null);
    $stmt->bindParam(':student_id', $input['studentId'] ?? null);
    $stmt->bindParam(':year', $input['year'] ?? null);
    $stmt->bindParam(':department', $input['department'] ?? null);
    $stmt->bindParam(':emergency_contact', $input['emergencyContact'] ?? null);
    $stmt->bindParam(':license_number', $input['licenseNumber'] ?? null);
    $stmt->bindParam(':specializations', isset($input['specializations']) ? json_encode($input['specializations']) : null);
    $stmt->bindParam(':experience', $input['experience'] ?? null);
    $stmt->bindParam(':qualifications', $input['qualifications'] ?? null);
    $stmt->bindParam(':volunteer_type', $input['volunteerType'] ?? null);
    $stmt->bindParam(':availability', $input['availability'] ?? null);
    $stmt->bindParam(':training_completed', $input['trainingCompleted'] ?? false);

    if ($stmt->execute()) {
        $token = generateJWT($userId);
        sendResponse([
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'username' => $input['username'],
                'email' => $input['email'],
                'name' => $input['name'],
                'role' => $input['role'],
                'isOnboarded' => false
            ]
        ], 201);
    } else {
        sendError('Registration failed', 500);
    }
}

function login($db, $input) {
    if (!isset($input['username']) || !isset($input['password'])) {
        sendError('Username and password required');
    }

    $query = "SELECT * FROM users WHERE username = :username OR email = :username";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $input['username']);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($input['password'], $user['password_hash'])) {
        sendError('Invalid credentials', 401);
    }

    $token = generateJWT($user['id']);

    // Store session
    $sessionQuery = "INSERT INTO user_sessions (user_id, token, expires_at) VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL 24 HOUR))";
    $sessionStmt = $db->prepare($sessionQuery);
    $sessionStmt->bindParam(':user_id', $user['id']);
    $sessionStmt->bindParam(':token', $token);
    $sessionStmt->execute();

    // Remove password from response
    unset($user['password_hash']);
    
    // Parse JSON fields
    if ($user['specializations']) {
        $user['specializations'] = json_decode($user['specializations'], true);
    }
    if ($user['languages']) {
        $user['languages'] = json_decode($user['languages'], true);
    }

    sendResponse([
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
}

function logout($db) {
    $user = authenticateUser($db);
    
    $headers = getallheaders();
    $authHeader = $headers['Authorization'];
    $token = str_replace('Bearer ', '', $authHeader);

    $query = "DELETE FROM user_sessions WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    sendResponse(['message' => 'Logout successful']);
}

function getCurrentUser($db) {
    $user = authenticateUser($db);
    
    unset($user['password_hash']);
    
    if ($user['specializations']) {
        $user['specializations'] = json_decode($user['specializations'], true);
    }
    if ($user['languages']) {
        $user['languages'] = json_decode($user['languages'], true);
    }

    sendResponse(['user' => $user]);
}
?>