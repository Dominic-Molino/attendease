<?php

require_once 'Global.php';


class GetStudentFunctions extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    private function get_records($table, $conditions = null, $columns = '*')
    {
        $sqlStr = "SELECT $columns FROM $table";
        if ($conditions != null) {
            $sqlStr .= " WHERE " . $conditions;
        }
        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }

    private function executeQuery($sql)
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            $statement = $this->pdo->query($sql);
            if ($statement) {
                $result = $statement->fetchAll(PDO::FETCH_ASSOC);
                foreach ($result as $record) {
                    if (isset($record['file_data'])) {

                        $record['file_data'] = base64_encode($record['file_data']);
                    }
                    array_push($data, $record);
                }
                $code = 200;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found.";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
    }

    public function getStudentInformation($user_id = null)
    {
        $columns = "user_id, first_name, last_name, year_level, block, course, email, role_id, organization, permission, is_active";
        $condition = ($user_id !== null) ? "user_id = $user_id" : null;
        return $this->get_records('user', $condition, $columns);
    }

    public function getUsersEvent($user_id)
    {
        $columns = "
            events.event_id, event_name, event_description, event_location,
            event_start_date, event_end_date, event_registration_start, event_registration_end, event_type, max_attendees, categories, event_link,organizer_user_id, organizer_name, attendance_submission_deadline";

        $sql = "
            SELECT 
                $columns
            FROM events
            INNER JOIN event_registration ON events.event_id = event_registration.event_id
            WHERE event_registration.user_id = :user_id
        ";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                return $this->sendPayload($data, 'success', "Successfully retrieved user's events.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "User has not registered for any events.", 404);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', "Database error.", 500);
        }
    }


    public function getStudentProfile($user_id)
    {
        $fileInfo = $this->getImageData($user_id);

        if ($fileInfo) {
            $fileData = $fileInfo['avatar'];

            header('Content-Type: image/png');
            header('Cache-Control: no-cache, no-store, must-revalidate');
            echo $fileData;
            exit();
        } else {
            echo "User has not uploaded an avatar yet.";
            http_response_code(404);
        }
    }

    public function getImageData($user_id = null)
    {
        $columns = "avatar";
        $condition = ($user_id !== null) ? "user_id = $user_id" : null;
        $result = $this->get_records('user', $condition, $columns);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['avatar'])) {
            $fileData = $result['payload'][0]['avatar'];
            return array("avatar" => $fileData);
        } else {
            return array("avatar" => null);
        }
    }

    public function getActivityLogs($organizerId = null)
    {
        $sql = "SELECT 
                    activity_log.log_id, 
                    activity_log.user_id, 
                    CONCAT(user.first_name, ' ', user.last_name) AS student_name,
                    activity_log.event_id, 
                    events.event_name,
                    activity_log.activity_type, 
                    activity_log.details, 
                    MIN(activity_log.created_at) AS created_at
                FROM activity_log
                INNER JOIN events ON activity_log.event_id = events.event_id
                INNER JOIN user ON activity_log.user_id = user.user_id";

        if ($organizerId !== null) {
            $sql .= " WHERE events.organizer_user_id = :organizerId";
        }

        $sql .= " GROUP BY 
                    activity_log.user_id, 
                    activity_log.event_id, 
                    activity_log.activity_type, 
                    activity_log.details, 
                    student_name, 
                    events.event_name
                  ORDER BY created_at DESC";

        try {
            $stmt = $this->pdo->prepare($sql);

            if ($organizerId !== null) {
                $stmt->bindParam(':organizerId', $organizerId, PDO::PARAM_INT);
            }

            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->sendPayload($data, 'success', "getActivityLogs", 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', "Database error.", 500);
        }
    }
}
