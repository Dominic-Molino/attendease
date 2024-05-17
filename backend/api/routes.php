<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: *");


require_once "./modules/get.php";
require_once "./modules/post.php";
require_once "./config/database.php";
require_once __DIR__ . '/bootstrap.php';
require_once "./src/Jwt.php";

if (isset($_REQUEST['request'])) {
    $request = explode('/', $_REQUEST['request']);
} else {
    echo "Not Found";
    http_response_code(404);
    exit();
}

$con = new Connection();
$pdo = $con->connect();
$get = new Get($pdo);
$post = new Post($pdo);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'OPTIONS':
        http_response_code(200);
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
                if (isset($request[1])) {
                    echo json_encode($get->get_roles($request[1]));
                } else {
                    echo json_encode($get->get_roles());
                }
                break;

            case 'events':
                if (isset($request[1])) {
                    echo json_encode($get->get_events($request[1]));
                } else {
                    echo json_encode($get->get_all_events());
                }
                break;

            case 'userevents':
                if (isset($request[1])) {
                    echo json_encode($get->get_user_events($request[1]));
                } else {
                    echo "User ID not provided";
                    http_response_code(400);
                }
                break;

            case 'registeredUser':
                if (isset($request[1])) {
                    echo json_encode($get->get_registered_users_for_event($request[1]));
                } else {
                    echo "User ID not provided";
                    http_response_code(400);
                }
                break;

            case 'geteventid':
                if (isset($request[1])) {
                    $eventId = $get->getEventById($request[1]);
                    if ($eventId !== false) {
                        echo json_encode(['event_id' => $eventId]);
                    } else {
                        echo "Event not found";
                        http_response_code(404);
                    }
                } else {
                    echo "Event id not provided";
                    http_response_code(400);
                }
                break;

            case 'getavatar':
                if (isset($request[1])) {
                    $get->get_avatar($request[1]);
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'geteventimage':
                if (isset($request[1])) {
                    $get->getEventImage($request[1]);
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;
    case 'POST':
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

                    if (!password_verify($data['password'], $user['password'])) {
                        http_response_code(401);
                        echo json_encode(["message" => "Invalid Credentials!"]);
                        exit;
                    }

                    $JwtController = new Jwt($_ENV["SECRET_KEY"]);
                    $token = $JwtController->encode([
                        "user_id" => $user['user_id'],
                        "email" => $user['email'],
                        "role_id" => $user['role_id'],
                    ]);

                    http_response_code(200);
                    echo json_encode(["token" => $token]);
                    exit();
                } else {
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
            case 'edituserrole':
                echo json_encode($post->edit_user_role($data, $request[1]));
                break;

            case 'addevent':
                echo json_encode($post->add_event($pdo, $data));
                break;

            case 'editevent':
                echo json_encode($post->edit_event($pdo, $data, $request[1]));
                break;

            case 'uploadimage':
                echo json_encode($post->uploadAvatar($request[1]));
                break;

            case 'uploadevent':
                echo json_encode($post->uploadEvent($request[1]));
                break;

            case 'register':
                echo json_encode($post->register_for_event($pdo, $data->event_id, $data->user_id));
                break;

            case 'markattendance':
                echo json_encode($post->mark_attendance($pdo, $data->event_id, $data->user_id));
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

    case 'DELETE':
        switch ($request[0]) {
            case 'deleteevent':
                if (isset($request[1])) {
                    $event_id = $request[1];
                    echo json_encode($post->delete_event($pdo, $event_id));
                } else {
                    http_response_code(400);
                    echo json_encode(["message" => "Event ID is required for deletion"]);
                }
        }
        break;

    default:
        echo "Method not available";
        http_response_code(404);
        break;
}
