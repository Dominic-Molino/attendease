<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


require_once "./modules/get.php";
require_once "./modules/post.php";
require_once "./config/database.php";

session_start();

$connection = new Connection();
$pdo = $connection->connect();
$get = new Get($pdo);
$post = new Post($pdo);

// Check if 'request' parameter is set in the request
if (isset($_REQUEST['request'])) {
    // Split the request into an array based on '/'
    $request = explode('/', $_REQUEST['request']);
} else {
    // If 'request' parameter is not set, return a 404 response
    echo "Not Found";
    http_response_code(404);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'OPTIONS':
        http_response_code(200);
        exit();

    case 'GET':
        switch ($request[0]) {
            case 'getstudent':
                $token = $_SESSION['token'] ?? null;
                if (!$token) {
                    echo json_encode(["error" => "Token not found in session storage"]);
                    http_response_code(404);
                    break;
                } else {
                    echo json_encode($get->getLoggedinStudent($token));
                    break;
                }
                break;
                // case 'users':
                //     echo json_encode($get->getStudentData($request[1]));
                //     break;
                // case 'getstudentdata':
                //     $student_id = $_SESSION['student_id'] ?? null;
                //     if (!$student_id) {
                //         echo json_encode(["error" => "Student ID not found in session storage"]);
                //         http_response_code(404);
                //         break;
                //     } else {
                //         echo json_encode($get->getStudentData($student_id));
                //         break;
                //     }
                // case 'event':
                //     echo json_encode($get->get_events($request[1]));
                //     break;
            case "events":
                echo json_encode($get->getAllEvents());
                break;
            default:
                echo "This is forbidden";
                http_response_code(404);
                break;
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'addstudent':
                echo json_encode($post->addStudent($data));
                break;
            case 'loginstudent':
                echo json_encode($post->loginStudent($data));
                break;
                // case 'edituser':
                //     echo json_encode($post->editUser($data, $request[1]));
                //     break;
                // case 'addevent':
                //     echo json_encode($post->addEvent($data));
                //     break;
                // case 'editevent' :
                //     echo json_encode($post->editEvent($data, $request[1]));
                //     break;
                // case 'deleteevent':
                //     echo json_encode($post->deleteEvent($request[1]));
                //     break;
            default:
                echo json_encode(["error" => "Endpoint Not Found"]);
                http_response_code(404);
                break;
        }
        break;
    default:
        echo "Method not available";
        http_response_code(404);
        break;
}
