<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Cache-Control: no-cache, must-revalidate");


#student 
require_once './modules/Student.php';
require_once './modules/GetStudent.php';

#events
require_once './modules/Event.php';
require_once './modules/GetEvent.php';

#analytics
require_once './modules/Analytics.php';

require_once './modules/Notification.php';

require_once "./modules/Get.php";
require_once "./modules/Post.php";

require_once "./modules/Approval.php";

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

#student 
$postStudent = new PostStudentFunctions($pdo);
$getStudent = new GetStudentFunctions($pdo);

#events
$postEvents = new Events($pdo);
$getEvents = new GetEvent($pdo);

$approval = new Approval($pdo);

#anaylicts
$analytics = new Analytics($pdo);

$notify = new GetNotification($pdo);


switch ($_SERVER['REQUEST_METHOD']) {
    case 'OPTIONS':
        http_response_code(200);
        break;

    case 'GET':
        switch ($request[0]) {

                #student module
            case 'users':
                if (isset($request[1])) {
                    echo json_encode($getStudent->getStudentInformation($request[1]));
                } else {
                    echo json_encode($getStudent->getStudentInformation());
                }
                break;

            case 'userevents':
                if (isset($request[1])) {
                    echo json_encode($getStudent->getUsersEvent($request[1]));
                } else {
                    echo "User ID not provided";
                    http_response_code(400);
                }
                break;

            case 'user_registered_events_notification':
                if (isset($request[1])) {
                    echo json_encode($notify->getUserNotification($request[1]));
                } else {
                    echo "User ID not provided";
                    http_response_code(400);
                }
                break;

            case 'getavatar':
                if (isset($request[1])) {
                    $getStudent->getStudentProfile($request[1]);
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

                #events
            case 'events':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getEvents($request[1]));
                } else {
                    echo json_encode($getEvents->getEvents());
                }
                break;

            case 'allevents':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getAllEvents($request[1]));
                } else {
                    echo json_encode($getEvents->getAllEvents());
                }
                break;

            case 'registeredUser':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getRegisteredUsersForApprovedEvents($request[1]));
                } else {
                    echo json_encode($getEvents->getRegisteredUsersForApprovedEvents());
                }
                break;

            case 'geteventid':
                if (isset($request[1])) {
                    $eventId = $getEvents->getEventById($request[1]);
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

            case 'geteventimage':
                if (isset($request[1])) {
                    $getEvents->getEventImage($request[1]);
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

                #end of events

                # anylytics
            case 'total':
                echo json_encode($analytics->get_attendees_total($request[1]));
                break;


            case 'totalAttendees':
                echo json_encode($analytics->get_all_attendee_counts());
                break;

            case 'getcoursecount':
                echo json_encode($analytics->get_registered_users_by_course($request[0]));
                break;

            case 'getyearlevelcount':
                echo json_encode($analytics->get_registered_users_by_year_level($request[0]));
                break;

            case 'getblockcount':
                echo json_encode($analytics->get_registered_users_by_block($request[0]));
                break;

            case 'getpasteventsattendance':
                echo json_encode($analytics->getTotalAttendanceInAllPastEvents($request[0]));
                break;

            case 'getAllRegisteredUser':
                echo json_encode($analytics->get_total_registered_users($request[0]));
                break;

            case 'analytics':
                if (isset($request[1])) {
                    echo json_encode($analytics->getApprovedDoneEventsWithStatus($request[1]));
                } else {
                    echo json_encode($analytics->getApprovedDoneEventsWithStatus());
                }
                break;

            case 'getalldonevents':
                if (isset($request[1])) {
                    echo json_encode($analytics->getDoneEvents($request[1]));
                } else {
                    echo json_encode($analytics->getDoneEvents());
                }
                break;

            case 'getallongoingvents':
                if (isset($request[1])) {
                    echo json_encode($analytics->getApprovedOngoingEventsWithStatus($request[1]));
                } else {
                    echo json_encode($analytics->getApprovedOngoingEventsWithStatus());
                }
                break;

            case 'getallupcomingevents':
                if (isset($request[1])) {
                    echo json_encode($analytics->getApprovedUpcomingEventsWithStatus($request[1]));
                } else {
                    echo json_encode($analytics->getApprovedUpcomingEventsWithStatus());
                }
                break;


                #end of analytics

                #admin module

            case 'roles':
                if (isset($request[1])) {
                    echo json_encode($get->get_roles($request[1]));
                } else {
                    echo json_encode($get->get_roles());
                }
                break;

            case 'notify':
                echo json_encode($notify->getAllNotifications());
                break;

            case 'getusersbyeventattendance':
                if (isset($request[1])) {
                    echo json_encode($get->getUsersByEventAttendance($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'getattendancebyuser':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($get->getAttendancebyUser($request[1], $request[2]));
                } else {
                    echo "IDs not provided";
                    http_response_code(400);
                }
                break;

            case 'getattendanceimage':
                if (isset($request[1])) {
                    $get->getAttendanceImage($request[1]);
                } else {
                    echo "IDs not provided";
                    http_response_code(400);
                }
                break;

            case 'getEventfeedback':
                if (isset($request[1])) {
                    echo json_encode($get->get_event_feedback($request[1]));
                } else {
                    echo json_encode($get->get_event_feedback());
                }
                break;

            case 'getUserFeedback':
                if (isset($request[1])) {
                    echo json_encode($get->get_user_feedback($request[1]));
                } else {
                    echo json_encode($get->get_user_feedback());
                }
                break;

            case 'getAllRemarks':
                echo json_encode($get->getAllAttendanceRemarks($request[1]));
                break;

            case 'getUserFeed':
                echo json_encode($get->getUserFeedbackByEvent($request[1], $request[2]));
                break;

            case 'getConversations':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($get->getConversation($request[1], $request[2]));
                } else {
                    echo "Invalid endpoints!";
                }
                break;

            case 'getConversationMessages':
                if (isset($request[1])) {
                    echo json_encode($get->getConversationMessages($request[1]));
                } else {
                    echo "Invalid endpoints!";
                }
                break;

            case 'getMessageRequests':
                if (isset($request[1])) {
                    echo json_encode($get->getMessageRequests($request[1]));
                } else {
                    echo "Invalid endpoints!";
                }
                break;


                #gets the approved event by org_id
            case 'getapprovedorganizerevents':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getApprovedEventsByOrganizerId($request[1]));
                } else {
                    echo 'no event id';
                }
                break;

            case 'getallorganizerevents':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getAllEventsByOrganizerId($request[1]));
                } else {
                    echo 'no event id';
                }
                break;


            case 'getdatadashboard':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getDashboardDataByOrganizerId($request[1]));
                } else {
                    echo 'no event id';
                }
                break;

            case 'getfeedbackoforgevent':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getFeedbackByOrganizer($request[1]));
                } else {
                    echo 'no event id';
                }
                break;

            case 'getreports':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getApprovedDoneEventsWithStatus($request[1]));
                } else {
                    echo 'no event id';
                }
                break;

            case 'getongoingreports':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getApprovedOngoingEventsWithStatus($request[1]));
                } else {
                    echo 'no event id';
                }
                break;

            case 'getupcomingreports':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getApprovedUpcomingEventsWithStatus($request[1]));
                } else {
                    echo 'no event id';
                }
                break;

            case 'getdoneeventsoforg':
                if (isset($request[1])) {
                    echo json_encode($getEvents->getDoneEventsByOrganizer($request[1]));
                } else {
                    echo 'no event id';
                }
                break;

            case 'getlogs':
                if (isset($request[1])) {
                    echo json_encode($getStudent->getActivityLogs($request[1]));
                } else {
                    echo json_encode($getStudent->getActivityLogs());
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

                #global
            case 'login':
                $data = json_decode(file_get_contents("php://input"), true);

                if (!isset($data['email']) || !isset($data['password'])) {
                    throw new Exception("Missing login credentials", 400);
                }

                $user = $get->getByEmail($data['email']);
                $post->login($data, $user);
                break;

            case 'adduser':
                echo json_encode($post->add_user($data));
                break;

            case 'postrequest':
                echo json_encode($postStudent->add_profile_update_request($data));
                break;

                #admin module cases
            case 'edituserrole':
                echo json_encode($post->edit_user_role($data, $request[1]));
                break;

            case 'markattendance':
                echo json_encode($post->mark_attendance($data->event_id, $data->user_id));
                break;

            case 'toggleattendanceremark':
                echo json_encode($post->toggleAttendanceRemark($data->attendance_id, $data->newRemark));
                break;


            case 'approveevent':
                if (isset($data->event_id) && isset($data->admin_id)) {
                    echo json_encode($approval->approveEvent($data->event_id, $data->admin_id));
                } else {
                    echo json_encode(['status' => 'failed', 'message' => 'Event ID or Admin ID not provided.']);
                    http_response_code(400);
                }
                break;

            case 'rejectevent':
                if (isset($data->event_id) && isset($data->admin_id)) {
                    echo json_encode($approval->rejectEvent($data->event_id, $data->admin_id, $data->rejection_message));
                } else {
                    echo json_encode(['status' => 'failed', 'message' => 'Event ID or Admin ID not provided.']);
                    http_response_code(400);
                }
                break;

            case 'updatetime':
                $data = json_decode(file_get_contents('php://input'));

                if (isset($data->event_id) && isset($data->submission_deadline)) {
                    $event_id = $data->event_id;
                    $submission_deadline = $data->submission_deadline;
                    echo json_encode($post->updateTimeLimit($event_id, $submission_deadline));
                } else {
                    echo json_encode($post->sendPayload(null, 'failed', "Invalid parameters.", 400));
                }

                break;

                #student module cases
            case 'edituser':
                echo json_encode($postStudent->editUser($data, $request[1]));
                break;



            case 'register':
                echo json_encode($postStudent->registerUserForEvent($data->event_id, $data->user_id));
                break;

            case 'addfeedback':
                if (isset($request[1]) && isset($request[2])) {
                    $event_id = $request[1];
                    $user_id = $request[2];
                    $data = json_decode(file_get_contents('php://input'));
                    echo json_encode($postStudent->addEventFeedback($event_id, $user_id, $data));
                } else {
                    echo json_encode(['status' => 'failed', 'message' => 'Event ID or User ID not provided.']);
                    http_response_code(400);
                }
                break;

            case 'uploadattendanceimage':
                echo json_encode($postStudent->uploadStudentAttendanceImage($request[1], $request[2]));
                break;

            case 'uploadimage':
                echo json_encode($postStudent->updateStudentImage($request[1]));
                break;

                #org module cases
            case 'addevent':
                echo json_encode($postEvents->addEvent($data));
                break;

            case 'uploadevent':
                echo json_encode($postEvents->uploadEvent($request[1]));
                break;

            case 'editevent':
                echo json_encode($postEvents->editEvent($data, $request[1]));
                break;

            case 'startconversation':
                echo json_encode($post->startConversation($data));
                break;

            case 'sendmessage':
                echo json_encode($post->sendMessage($data));
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
                    echo json_encode($postEvents->deleteEvent($event_id));
                } else {
                    http_response_code(400);
                    echo json_encode(["message" => "Event ID is required for deletion"]);
                }
                break;

            case 'unregister':
                if (isset($request[1]) && isset($request[2])) {
                    $event_id = $request[1];
                    $user_id = $request[2];
                    echo json_encode($postStudent->unregisterFromEvent($event_id, $user_id));
                } else {
                    http_response_code(400);
                    echo json_encode(["message" => "Event ID and User ID are required for unregistration"]);
                }
                break;
        }
        break;


    default:
        echo "This is forbidden";
        http_response_code(403);
        break;
}
