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
                    e.organizer_name, e.created_at, e.target_participants, 
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
        $columns = "e.event_id, e.event_name, e.event_description, e.event_location, e.event_start_date, e.event_end_date, e.event_registration_start, e.event_registration_end, e.event_type, e.max_attendees, e.categories, e.organizer_name, e.target_participants, e.participation_type";
        $condition = ($event_id !== null) ? "e.event_id = $event_id" : "ea.status = 'Approved'";

        $sql = "SELECT $columns 
                FROM events e 
                JOIN event_approval ea ON e.event_id = ea.event_id 
                WHERE $condition";

        $events = $this->executeQuery($sql);

        if ($events['code'] == 200) {
            $currentDate = new DateTime();

            foreach ($events['data'] as &$event) {
                $startDate = new DateTime($event['event_start_date']);
                $endDate = new DateTime($event['event_end_date']);

                if ($currentDate < $startDate) {
                    $event['status'] = 'upcoming';
                } elseif ($currentDate >= $startDate && $currentDate <= $endDate) {
                    $event['status'] = 'ongoing';
                } else {
                    $event['status'] = 'done';
                }
            }

            return $this->sendPayload($events['data'], 'success', "Successfully retrieved data.", 200);
        }

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
                       e.organizer_name, e.event_image, e.created_at, e.target_participants, e.participation_type
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
                       e.organizer_name, e.event_image, e.created_at, e.target_participants, e.participation_type,
                       ea.status AS approval_status
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
}
