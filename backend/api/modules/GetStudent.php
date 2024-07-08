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
                    // Handle BLOB data
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
        $columns = "user_id, first_name, last_name, year_level, block, course, email, role_id, organization, permission";
        $condition = ($user_id !== null) ? "user_id = $user_id" : null;
        return $this->get_records('user', $condition, $columns);
    }

    public function getUsersEvent($user_id)
    {
        $columns = "
            events.event_id, event_name, event_description, event_location,
            event_start_date, event_end_date, event_registration_start, event_registration_end, event_type, max_attendees, categories, organizer_user_id, organizer_name, attendance_submission_deadline";

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

        // Check if file info exists
        if ($fileInfo) {
            $fileData = $fileInfo['avatar'];

            // Set headers for file download
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
}
