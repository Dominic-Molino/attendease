<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

session_start();

require_once "./modules/get.php";
require_once "./modules/post.php";
require_once "./config/database.php";

$connection = new Connection();
$pdo = $connection->connect();
$get = new Get($pdo);
$post = new Post($pdo);

if (isset($_REQUEST['request'])) {
    $request = explode('/', $_REQUEST['request']);
} else {
    echo "Not Found";
    http_response_code(404);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch ($request[0]) {
            case 'user':
                if (count($request) > 1) {
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
            case 'events':
                if (count($request) > 1) {
                    echo json_encode($get->get_events($request[1]));
                } else {
                    echo json_encode($get->get_events());
                }
                break;
            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'addstudent':
                echo json_encode($post->addStudent($data));
                break;
            case 'addevent':
                echo json_encode($post->addEvent($data));
                break;
            case 'deleteevent':
                echo json_encode($post->deleteEvent($request[1]));
                break;
            case 'editevent':
                echo json_encode($post->editEvent($data, $request[1]));
                break;
            case 'editstudent':
                echo json_encode($post->editStudent($data, $request[1]));
                break;
            case 'login':
                echo json_encode($post->loginStudent($data));
                break;
        }
}
