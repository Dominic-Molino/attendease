<?php

require_once 'Global.php';

class GetEvent extends GlobalMethods
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

    public function getAllEvents($event_id = null)
    {
        $columns = "e.event_id, e.event_name, e.event_description, e.event_location, 
                    e.event_start_date, e.event_end_date, e.event_registration_start, 
                    e.event_registration_end, e.event_type, e.max_attendees, e.categories, 
                    e.organizer_name,e.organizer_organization, e.created_at, e.target_participants, 
                    e.participation_type, COALESCE(a.status, 'Pending') AS approval_status, 
                    a.notified_at, a.approved_by, a.approved_at";

        $sql = "SELECT $columns 
                FROM events e
                LEFT JOIN event_approval a ON e.event_id = a.event_id";

        if ($event_id !== null) {
            $sql .= " WHERE e.event_id = :event_id";
        }
        $stmt = $this->pdo->prepare($sql);

        if ($event_id !== null) {
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
        }

        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($data) {
            return $this->sendPayload($data, 'success', "Successfully retrieved events with approval status.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "No events found with approval status or specified event ID.", 404);
        }
    }


    // gets all approved event
    public function getEvents($event_id = null)
    {
        // Specify the columns you need
        $columns = "e.event_id, e.event_name, e.event_description, e.event_location, 
                e.event_start_date, e.event_end_date, e.event_registration_start, 
                e.event_registration_end, e.event_type, e.max_attendees, e.categories, 
                e.target_participants, e.participation_type, 
                u.user_id as organizer_id, u.first_name as first_name, 
                u.last_name as last_name, u.organization as organizer_organization";

        // Define the condition based on event_id
        $condition = ($event_id !== null) ? "e.event_id = $event_id" : "ea.status = 'Approved'";

        // Write the SQL query
        $sql = "SELECT $columns 
            FROM events e 
            JOIN event_approval ea ON e.event_id = ea.event_id 
            JOIN user u ON e.organizer_user_id = u.user_id
            WHERE $condition";

        // Log the SQL query for debugging
        error_log("SQL Query: " . $sql);

        // Execute the query
        $events = $this->executeQuery($sql);

        // Check if the query was successful
        if ($events['code'] == 200) {
            // Get the current date
            $currentDate = new DateTime();

            // Loop through the events to determine their status
            foreach ($events['data'] as &$event) {
                $startDate = new DateTime($event['event_start_date']);
                $endDate = new DateTime($event['event_end_date']);

                // Determine the event status based on the current date
                if ($currentDate < $startDate) {
                    $event['status'] = 'upcoming';
                } elseif ($currentDate >= $startDate && $currentDate <= $endDate) {
                    $event['status'] = 'ongoing';
                } else {
                    $event['status'] = 'done';
                }
            }

            // Return the payload with the events data
            return $this->sendPayload($events['data'], 'success', "Successfully retrieved data.", 200);
        }

        // Log the error if the query failed
        error_log("Query failed with code: " . $events['code']);

        // Return a failed payload if the query was not successful
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $events['code']);
    }



    public function getRegisteredUsersForApprovedEvents($event_id = null)
    {
        try {
            $sql = "SELECT u.user_id, u.first_name, u.last_name, u.year_level, u.course, u.block, u.email, er.registration_date 
                FROM user u
                INNER JOIN event_registration er ON u.user_id = er.user_id
                INNER JOIN events e ON er.event_id = e.event_id
                INNER JOIN event_approval ea ON e.event_id = ea.event_id
                WHERE ea.status = 'Approved'";

            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            $stmt = $this->pdo->prepare($sql);

            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

            $stmt->execute();

            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                return $this->sendPayload($data, 'success', "Successfully retrieved users registered for approved events.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "No users registered for approved events.", 404);
            }
        } catch (PDOException $e) {
            // Handle database errors
            return $this->sendPayload(null, 'error', "Database error: " . $e->getMessage(), 500);
        }
    }



    //returns the event id
    public function getEventById($eventId)
    {
        try {
            $sql = "SELECT event_id FROM events WHERE event_id = :event_id";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':event_id', $eventId, PDO::PARAM_INT);
            $stmt->execute();

            $eventData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($eventData) {
                return $eventData['event_id'];
            } else {
                return false;
            }
        } catch (PDOException $e) {
            return false;
        }
    }

    //gets image of evnet
    public function getEventImage($event_id)
    {
        $fileInfo = $this->geteventImg($event_id);

        if ($fileInfo['event_image'] !== null) {
            $fileData = $fileInfo['event_image'];

            header('Content-Type: image/png');
            header('Cache-Control: no-cache, no-store, must-revalidate');
            echo $fileData;
            exit();
        } else {
            echo "Event image not found or not uploaded.";
            http_response_code(404);
        }
    }

    public function geteventImg($event_id = null)
    {
        $columns = "event_image";
        $condition = ($event_id !== null) ? "event_id = $event_id" : null;
        $result = $this->get_records('events', $condition, $columns);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['event_image'])) {
            $fileData = $result['payload'][0]['event_image'];
            return array("event_image" => $fileData);
        } else {
            return array("event_image" => null);
        }
    }

    //approved event
    public function getApprovedEventsByOrganizerId($organizer_user_id)
    {
        $sql = "SELECT e.event_id, e.event_name, e.event_description, e.event_location, 
                       e.event_start_date, e.event_end_date, e.event_registration_start, e.event_registration_end,
                       e.event_type, e.max_attendees, e.categories, e.organizer_user_id, e.organizer_organization,
                       e.organizer_name, e.created_at, e.target_participants, e.participation_type
                FROM events e
                INNER JOIN event_approval ea ON e.event_id = ea.event_id
                LEFT JOIN user u ON e.organizer_user_id = u.user_id
                WHERE e.organizer_user_id = :organizer_user_id
                  AND ea.status = 'Approved'";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':organizer_user_id' => $organizer_user_id]);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Return the payload using the sendPayload method from GlobalMethods
            return $this->sendPayload($events, 'success', 'Approved events fetched successfully.', 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', 'Failed to fetch approved events.', 500);
        }
    }


    //all event of orgnizer
    public function getAllEventsByOrganizerId($organizer_user_id)
    {
        $sql = "SELECT e.event_id, e.event_name, e.event_description, e.event_location, 
                   e.event_start_date, e.event_end_date, e.event_registration_start, e.event_registration_end,
                   e.event_type, e.max_attendees, e.categories, e.organizer_user_id, e.organizer_organization,
                   e.organizer_name, e.created_at, e.target_participants, e.participation_type,
                   ea.status AS approval_status, ea.rejection_message, ea.approved_at
            FROM events e
            LEFT JOIN event_approval ea ON e.event_id = ea.event_id
            LEFT JOIN user u ON e.organizer_user_id = u.user_id
            WHERE e.organizer_user_id = :organizer_user_id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':organizer_user_id' => $organizer_user_id]);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Return the payload using the sendPayload method from GlobalMethods
            return $this->sendPayload($events, 'success', 'All events fetched successfully.', 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', 'Failed to fetch events.', 500);
        }
    }

    // for dashboard of the organizer
    public function get_total_registered_users_by_organizer($organizer_user_id)
    {
        try {
            $sql = "SELECT COUNT(DISTINCT er.user_id) AS total_users, 
                           u.user_id, u.first_name, u.last_name, u.year_level, u.course, u.block, u.email
                    FROM event_registration er
                    JOIN events e ON er.event_id = e.event_id
                    JOIN user u ON er.user_id = u.user_id
                    WHERE e.organizer_user_id = :organizer_user_id
                    GROUP BY u.user_id";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':organizer_user_id', $organizer_user_id, PDO::PARAM_INT);
            $stmt->execute();

            $usersData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($usersData) {
                $totalUsers = count($usersData);
                return $this->sendPayload(['total_users' => $totalUsers, 'users' => $usersData], 'success', "Successfully retrieved total number of registered users for the organizer.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to retrieve total number of registered users for the organizer.", 404);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function getDashboardDataByOrganizerId($organizer_user_id)
    {
        // SQL query to get the counts of approved and pending events
        $eventCountsSql = "SELECT 
                               SUM(CASE WHEN ea.status = 'Approved' THEN 1 ELSE 0 END) AS approved_events,
                               SUM(CASE WHEN ea.status = 'Pending' THEN 1 ELSE 0 END) AS pending_events
                           FROM events e
                           LEFT JOIN event_approval ea ON e.event_id = ea.event_id
                           WHERE e.organizer_user_id = :organizer_user_id";

        // SQL query to get the total number of registered students
        $registeredStudentsSql = "SELECT COUNT(DISTINCT er.user_id) AS total_registered_students
                                  FROM event_registration er
                                  JOIN events e ON er.event_id = e.event_id
                                  WHERE e.organizer_user_id = :organizer_user_id";

        try {
            // Fetch event counts
            $stmt = $this->pdo->prepare($eventCountsSql);
            $stmt->execute([':organizer_user_id' => $organizer_user_id]);
            $eventCounts = $stmt->fetch(PDO::FETCH_ASSOC);

            // Fetch total registered students
            $stmt = $this->pdo->prepare($registeredStudentsSql);
            $stmt->execute([':organizer_user_id' => $organizer_user_id]);
            $registeredStudents = $stmt->fetch(PDO::FETCH_ASSOC);

            // Prepare payload
            $payload = [
                'approved_events' => $eventCounts['approved_events'] ?? 0,
                'pending_events' => $eventCounts['pending_events'] ?? 0,
                'total_registered_students' => $registeredStudents['total_registered_students'] ?? 0
            ];

            // Return the payload using the sendPayload method from GlobalMethods
            return $this->sendPayload($payload, 'success', 'Dashboard data fetched successfully.', 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', 'Failed to fetch dashboard data.', 500);
        }
    }

    public function getFeedbackByOrganizer($organizer_user_id)
    {
        $sql = "SELECT f.feedback_id, f.event_id, f.user_id, f.overall_satisfaction, f.content_quality, 
                       f.speaker_effectiveness, f.venue_rating, f.logistics_rating, f.satisfied, f.joined, 
                       f.learned, f.future, f.liked, f.attend, f.recommend, f.improvement_suggestions, 
                       f.additional_comments, f.feedback_date, f.remarks,
                       e.event_name, e.organizer_user_id
                FROM feedback f
                JOIN events e ON f.event_id = e.event_id
                WHERE e.organizer_user_id = :organizer_user_id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':organizer_user_id', $organizer_user_id, PDO::PARAM_INT);
            $stmt->execute();

            $feedbackData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($feedbackData) {
                return $this->sendPayload($feedbackData, 'success', "Successfully retrieved feedback for the organizer's events.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "No feedback found for the organizer's events.", 404);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function getApprovedOngoingEventsWithStatus($organizer_user_id)
    {
        try {
            $stmt = $this->pdo->prepare("
        SELECT 
            e.event_id, e.event_name, e.event_start_date, e.event_end_date, e.max_attendees,
            CASE 
                WHEN e.event_end_date >= NOW() AND e.event_start_date <= NOW() THEN 'ongoing'
                ELSE 'upcoming'
            END AS event_status
        FROM events e
        JOIN event_approval ea ON e.event_id = ea.event_id
        WHERE ea.status = 'Approved' 
          AND e.event_end_date >= NOW()
          AND e.event_start_date <= NOW()
          AND e.organizer_user_id = :organizer_user_id
    ");
            $stmt->bindParam(':organizer_user_id', $organizer_user_id, PDO::PARAM_INT);
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($events as &$event) {
                // Get registered count for the event
                $registeredCount = $this->getOngoingRegisteredCount($event['event_id']);
                $event['registered_users'] = $registeredCount;

                // Get student details for the event
                $event['student_details'] = $this->getOngoingStudentDetails($event['event_id']);

                // Get registered count by course
                $registeredByCourse = $this->getRegisteredCountByCourse($event['event_id']);
                $event['registered_by_course'] = $registeredByCourse;

                // Get registered count by year level
                $registeredByYearLevel = $this->getRegisteredCountByYearLevel($event['event_id']);
                $event['registered_by_year_level'] = $registeredByYearLevel;
            }

            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    // Existing functions for reference
    private function getOngoingRegisteredCount($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
        SELECT COUNT(*) as count
        FROM event_registration
        WHERE event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        } catch (PDOException $e) {
            return 0;
        }
    }

    private function getOngoingStudentDetails($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
        SELECT u.user_id, u.first_name, u.last_name, u.email, u.year_level, u.course, u.block
        FROM user u
        JOIN event_registration er ON u.user_id = er.user_id
        WHERE er.event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    private function getRegisteredCountByCourse($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
        SELECT u.course, COUNT(*) as count
        FROM user u
        JOIN event_registration er ON u.user_id = er.user_id
        WHERE er.event_id = :event_id
        GROUP BY u.course
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    private function getRegisteredCountByYearLevel($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
        SELECT u.year_level, COUNT(*) as count
        FROM user u
        JOIN event_registration er ON u.user_id = er.user_id
        WHERE er.event_id = :event_id
        GROUP BY u.year_level
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    public function getDoneEventsByOrganizer($organizer_user_id)
    {
        try {
            // Define the columns you need
            $columns = "e.event_id, e.event_name";

            // Write the SQL query to get done events organized by organizer
            $sql = "SELECT $columns 
                FROM events e 
                JOIN event_approval ea ON e.event_id = ea.event_id 
                JOIN user u ON e.organizer_user_id = u.user_id
                WHERE ea.status = 'Approved' 
                AND e.event_end_date < NOW() 
                AND u.user_id = :organizer_user_id"; // Filter for 'done' events and specific organizer

            // Prepare the statement
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':organizer_user_id', $organizer_user_id, PDO::PARAM_INT);

            // Execute the query
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Return the payload with the events data
            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            // Handle database error gracefully
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }



    #admin


    // Function to get all approved and done events with status and student information
    public function getApprovedDoneEventsWithStatus($event_id)
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
            WHERE ea.status = 'Approved' 
              AND e.event_id = :event_id
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
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
                $event['present_count'] = $presentCount;

                // Calculate attendance and feedback counts individually
                $feedbackCount = $this->getFeedbackCount($event['event_id']);
                $event['feedback_count'] = $feedbackCount;

                $attendance_count = $this->getAttendanceCount($event['event_id']);
                $event['attendance_count'] = $attendance_count;

                // Calculate average feedback scores
                $averageFeedback = $this->getAverageFeedback($event['event_id']);
                $event['average_feedback'] = $averageFeedback['avg_overall_satisfaction'];
            }

            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    // Function to get student details for an event including course, year level, and attendance remarks
    private function getStudentDetails($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    u.user_id, u.first_name, u.last_name, u.email, u.year_level, u.course, u.block,
                    COALESCE(a.remarks, 0) as attendance_remarks
                FROM user u
                JOIN event_registration er ON u.user_id = er.user_id
                LEFT JOIN attendance a ON u.user_id = a.user_id AND a.event_id = er.event_id
                WHERE er.event_id = :event_id
            ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Map remarks to attendance status
            foreach ($result as &$student) {
                if ($student['attendance_remarks'] == 1) {
                    $student['attendance_status'] = 'present';
                } else {
                    $student['attendance_status'] = 'absent';
                }
                // Remove the raw remarks from the output if not needed separately
                unset($student['attendance_remarks']);
            }

            return $result;
        } catch (PDOException $e) {
            // Handle database error gracefully
            return [];
        }
    }

    // Function to get present count for an event (students who submitted attendance and feedback)
    private function getPresentCount($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT COUNT(*) as present_count
            FROM (
                SELECT DISTINCT a.user_id
                FROM attendance a
                JOIN feedback f ON a.event_id = f.event_id AND a.user_id = f.user_id
                WHERE a.event_id = :event_id
                  AND a.remarks = 1
            ) AS present_users
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['present_count'];
        } catch (PDOException $e) {
            return 0;
        }
    }

    // // Function to get attendance count for an event
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
