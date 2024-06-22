<?php

require_once 'Global.php';

class Analytics extends GlobalMethods
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

    //nageexecute ng query
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

    public function get_attendees_total($event_id)
    {
        try {
            $sql = "SELECT COUNT(*) AS total_attendees FROM event_registration WHERE event_id = :event_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();

            $total_attendees = $stmt->fetchColumn();

            if (is_numeric($total_attendees)) {
                return $this->sendPayload($total_attendees, 'success', "Successfully retrieved total attendees for the event.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to retrieve total attendees.", 404);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function get_registered_users_by_course()
    {
        $sql = "SELECT u.course, COUNT(u.user_id) AS student_count 
                FROM user u
                GROUP BY u.course 
                ORDER BY u.course";

        // Prepare and execute the query
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rowCount = $stmt->rowCount();

        if ($rowCount > 0) {
            return $this->sendPayload($data, 'success', "Successfully retrieved student counts by course.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "No users found.", 404);
        }
    }

    public function get_total_registered_users()
    {
        try {
            $sql = "SELECT COUNT(DISTINCT user_id) AS total_users FROM event_registration";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            $totalUsers = $stmt->fetchColumn();

            if (is_numeric($totalUsers)) {
                return $this->sendPayload($totalUsers, 'success', "Successfully retrieved total number of registered users.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to retrieve total number of registered users.", 404);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function get_registered_users_by_year_level()
    {
        $sql = "SELECT u.year_level, COUNT(u.user_id) AS student_count 
                FROM user u
                GROUP BY u.year_level 
                ORDER BY u.year_level";

        // Prepare and execute the query
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rowCount = $stmt->rowCount();

        if ($rowCount > 0) {
            return $this->sendPayload($data, 'success', "Successfully retrieved student counts by year level.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "No users found.", 404);
        }
    }

    public function get_registered_users_by_block()
    {
        $sql = "SELECT u.block, COUNT(u.user_id) AS student_count 
                FROM user u
                GROUP BY u.block 
                ORDER BY u.block";

        // Prepare and execute the query
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rowCount = $stmt->rowCount();

        if ($rowCount > 0) {
            return $this->sendPayload($data, 'success', "Successfully retrieved student counts by block.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "No users found.", 404);
        }
    }

    public function getTotalAttendanceInAllPastEvents()
    {
        try {
            // Fetch all past events
            $sql = "SELECT event_id, event_name FROM events WHERE event_end_date < CURDATE()";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch total attendance for each event
            foreach ($events as &$event) {
                $eventId = $event['event_id'];
                $sql = "SELECT COUNT(*) AS total_attendance FROM attendance WHERE event_id = ?";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([$eventId]);
                $totalAttendance = $stmt->fetchColumn();
                $event['total_attendance'] = $totalAttendance;
            }

            // Return the events with their total attendance
            return $this->sendPayload($events, 'success', "Total attendance in all past events retrieved successfully.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function get_all_attendee_counts()
    {
        $sql = "SELECT e.event_id, e.event_name, COUNT(er.registration_id) AS total_attendees
                FROM events e
                LEFT JOIN event_registration er ON e.event_id = er.event_id
                GROUP BY e.event_id, e.event_name
                ORDER BY e.event_name"; // Optional: Order by event name

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($data)) {
                return $this->sendPayload(null, 'failed', "No events or attendees found.", 404);
            }

            return $this->sendPayload($data, 'success', "Successfully retrieved attendee counts for all events.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }
}
