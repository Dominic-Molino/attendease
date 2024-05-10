<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");


// Include required modules
require_once "./modules/get.php";
require_once "./modules/post.php";
require_once "./config/database.php";
require_once __DIR__ . '/bootstrap.php';
require_once "./src/Jwt.php";

// Check if 'request' parameter is set in the request
if (isset($_REQUEST['request'])) {
    // Split the request into an array based on '/'
    $request = explode('/', $_REQUEST['request']);
} else {
    // If 'request' parameter is not set, return a 404 response
    echo "Not Found";
    http_response_code(404);
    exit();
}



// Initialize Get and Post objects
$con = new Connection();
$pdo = $con->connect();
$get = new Get($pdo);
$post = new Post($pdo);

// Handle requests based on HTTP method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'OPTIONS':
        http_response_code(200);
        exit();
        break;
    case 'GET':
        switch ($request[0]) {
            case 'users':
                if (isset($request[1])) {
                    echo json_encode($get->get_users($request[1]));
                } else {
                    echo json_encode($get->get_users());
                }
                break;
            case 'student':
                if (count($request) > 1) {
                    echo json_encode($get->get_student($request[1]));
                } else {
                    echo json_encode($get->get_student());
                }
                break;
            case 'roles':
                echo json_encode($get->get_roles());
                break;
            case 'events':
                if (isset($request[1])) {
                    echo json_encode($get->get_events($request[1]));
                } else {
                    echo json_encode($get->get_all_events());
                }
                break;
            case 'feedback':
                if (isset($request[1])) {
                    echo json_encode($get->get_event_feedback($request[1]));
                } else {
                    echo json_encode($get->get_all_event_feedback());
                }
                break;
            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;

        // Handle POST requests
    case 'POST':
        // Retrieves JSON-decoded data from php://input using file_get_contents
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'login':
                $data = json_decode(file_get_contents("php://input"), true);

                if (!isset($data['email']) || !isset($data['password'])) {
                    http_response_code(400);
                    echo json_encode(["message" => "Missing login credentials"]);
                    exit();
                }

                $user = $get->getByEmail($data['email']);

                if ($user !== false && isset($user['password'])) {

                    // Verify the password
                    if (!password_verify($data['password'], $user['password'])) {
                        http_response_code(401);
                        echo json_encode(["message" => "Invalid Credentials!"]);
                        exit;
                    }


                    // Generate JWT token
                    $JwtController = new Jwt($_ENV["SECRET_KEY"]);
                    $token = $JwtController->encode([
                        "user_id" => $user['user_id'],
                        "email" => $user['email']
                    ]);

                    http_response_code(200); // Se
                    echo json_encode(["token" => $token]);
                    exit();
                } else {
                    // User not found or password not set
                    http_response_code(404);
                    echo json_encode(["message" => "User not found or invalid credentials"]);
                    exit;
                }
                break;
            case 'adduser':
                echo json_encode($post->add_user($pdo, $data));
                break;
            case 'edituser':
                echo json_encode($post->edit_user($data, $request[1]));
                break;
            case 'addevent':
                echo json_encode($post->add_event($pdo, $data));
                break;
            case 'editevent':
                echo json_encode($post->edit_event($pdo, $data, $request[1]));
                break;
            case 'deleteevent':
                echo json_encode($post->delete_event($pdo, $request[1]));
                break;
            case 'register_for_event':
                echo json_encode($post->register_for_event($pdo, $data->event_id, $data->user_id));
                break;
            case 'addfeedback':
                echo json_encode($post->add_event_feedback($pdo, $data));
                break;
            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;

    default:
        // Return a 404 response for unsupported HTTP methods
        echo "Method not available";
        http_response_code(404);
        break;
}
