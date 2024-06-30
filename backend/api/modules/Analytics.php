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

    //new function
    // Function to get all approved and done events with status and student information
    public function getApprovedDoneEventsWithStatus()
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT 
                e.event_id, e.event_name, e.event_start_date, e.event_end_date, e.max_attendees,
                CASE 
                    WHEN e.event_end_date < NOW() THEN 'done'
                    ELSE 'ongoing'
                END AS event_status
            FROM events e
            JOIN event_approval ea ON e.event_id = ea.event_id
            WHERE ea.status = 'Approved' AND e.event_end_date < NOW()
        ");
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($events as &$event) {
                // Get registered count for the event
                $registeredCount = $this->getRegisteredCount($event['event_id']);
                $event['registered_users'] = $registeredCount;

                // Get student details for the event
                $event['student_details'] = $this->getStudentDetails($event['event_id']);

                // Calculate number of students who submitted both attendance and feedback
                $presentCount = $this->getPresentCount($event['event_id']);

                // Calculate attendance and feedback counts individually
                $attendanceCount = $this->getAttendanceCount($event['event_id']);
                $feedbackCount = $this->getFeedbackCount($event['event_id']);

                // Calculate percentages
                if ($registeredCount > 0) {
                    $event['attendance_percentage'] = round(($attendanceCount / $registeredCount) * 100, 2);
                    $event['feedback_percentage'] = round(($feedbackCount / $registeredCount) * 100, 2);
                    $event['present_percentage'] = round(($presentCount / $registeredCount) * 100, 2);
                } else {
                    $event['attendance_percentage'] = 0;
                    $event['feedback_percentage'] = 0;
                    $event['present_percentage'] = 0;
                }

                // Calculate average feedback scores
                $averageFeedback = $this->getAverageFeedback($event['event_id']);
                $event['average_feedback'] = $averageFeedback['avg_overall_satisfaction'];
            }

            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }



    // Function to get student details for an event
    // Function to get student details for an event including course and year level
    private function getStudentDetails($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT 
                u.user_id, u.first_name, u.last_name, u.email, u.year_level, u.course, u.block
            FROM user u
            JOIN event_registration er ON u.user_id = er.user_id
            WHERE er.event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return [];
        }
    }


    // Function to get present count for an event (students who submitted both attendance and feedback)
    private function getPresentCount($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT COUNT(DISTINCT a.student_id) as present_count
            FROM attendance a
            JOIN feedback f ON a.event_id = f.event_id AND a.student_id = f.student_id
            WHERE a.event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['present_count'];
        } catch (PDOException $e) {
            return 0;
        }
    }

    // Function to get attendance count for an event
    private function getAttendanceCount($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT COUNT(*) as attendance_count
            FROM attendance
            WHERE event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['attendance_count'];
        } catch (PDOException $e) {
            return 0;
        }
    }

    // Function to get feedback count for an event
    private function getFeedbackCount($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT COUNT(*) as feedback_count
            FROM feedback
            WHERE event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['feedback_count'];
        } catch (PDOException $e) {
            return 0;
        }
    }

    // Function to get registered count for an event
    private function getRegisteredCount($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT COUNT(*) as registered_count
            FROM event_registration
            WHERE event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['registered_count'];
        } catch (PDOException $e) {
            return 0;
        }
    }

    // Function to get average feedback scores for an event
    private function getAverageFeedback($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT 
                AVG(overall_satisfaction) as avg_overall_satisfaction
            FROM feedback
            WHERE event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return [
                'avg_overall_satisfaction' => $result['avg_overall_satisfaction']
            ];
        } catch (PDOException $e) {
            return [
                'avg_overall_satisfaction' => null
            ];
        }
    }
}
