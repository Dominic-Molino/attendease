<?php

require_once 'Global.php';

class Analytics extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getApprovedOngoingEventsWithStatus($event_id = null)
    {
        try {
            $sql = "
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
          AND e.event_start_date <= NOW()";

            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            $stmt = $this->pdo->prepare($sql);

            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($events as &$event) {
                $event_id = $event['event_id'];

                $event['registered_users'] = $this->getOngoingRegisteredCount($event_id);

                $event['student_details'] = $this->getOngoingStudentDetails($event_id);

                $event['registered_by_course'] = $this->getRegisteredCountByCourse($event_id);

                $event['registered_by_year_level'] = $this->getRegisteredCountByYearLevel($event_id);

                $event['registered_by_block'] = $this->getRegisteredCountByBlock($event_id);
            }

            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function getApprovedUpcomingEventsWithStatus($event_id = null)
    {
        try {
            $sql = "
        SELECT 
            e.event_id, e.event_name, e.event_start_date, e.event_end_date, e.event_registration_start, e.event_registration_end, e.max_attendees, e.event_location,
            CASE 
                WHEN e.event_start_date > NOW() THEN 'upcoming'
            END AS event_status
        FROM events e
        JOIN event_approval ea ON e.event_id = ea.event_id
        WHERE ea.status = 'Approved' 
        AND e.event_start_date > NOW()";

            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            $stmt = $this->pdo->prepare($sql);

            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($events as &$event) {
                $event_id = $event['event_id'];

                $event['registered_users'] = $this->getOngoingRegisteredCount($event_id);

                $event['student_details'] = $this->getOngoingStudentDetails($event_id);

                $event['registered_by_course'] = $this->getRegisteredCountByCourse($event_id);

                $event['registered_by_year_level'] = $this->getRegisteredCountByYearLevel($event_id);

                $event['daily_registrations'] = $this->getDailyRegistrations($event_id);
            }

            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }


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

    private function getRegisteredCountByBlock($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
        SELECT u.block, COUNT(*) as count
        FROM user u
        JOIN event_registration er ON u.user_id = er.user_id
        WHERE er.event_id = :event_id
        GROUP BY u.block
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

    private function getDailyRegistrations($event_id)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT DATE(registration_date) as registration_date, COUNT(*) as count
            FROM event_registration
            WHERE event_id = :event_id
            GROUP BY DATE(registration_date)
            ORDER BY registration_date ASC
        ");
            $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    public function getAllApprovedEvents($event_id = null)
    {
        try {
            $sql = "
            SELECT 
                e.event_id, e.event_name, e.event_start_date, e.event_end_date, e.max_attendees, e.event_location,
                (SELECT COUNT(er.user_id) 
                 FROM event_registration er 
                 WHERE er.event_id = e.event_id) AS total_registered_users,
                CASE 
                    WHEN e.event_end_date < NOW() THEN 'done'
                    ELSE 'ongoing'
                END AS event_status
            FROM events e
            JOIN event_approval ea ON e.event_id = ea.event_id
            WHERE ea.status = 'Approved'";

            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            $stmt = $this->pdo->prepare($sql);

            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function getDashboardData()
    {
        $eventCountsSql = "SELECT 
                               SUM(CASE WHEN ea.status = 'Approved' THEN 1 ELSE 0 END) AS approved_events,
                               SUM(CASE WHEN ea.status = 'Pending' THEN 1 ELSE 0 END) AS pending_events,
                               SUM(CASE WHEN ea.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_events
                           FROM events e
                           LEFT JOIN event_approval ea ON e.event_id = ea.event_id";

        $registeredUsersSql = "SELECT 
            COUNT(er.user_id) AS total_registered_users
            FROM events e
            JOIN event_registration er ON e.event_id = er.event_id";

        $eventStatusSql = "SELECT 
            SUM(CASE WHEN e.event_end_date < NOW() THEN 1 ELSE 0 END) AS done_events
            FROM events e";

        $totalEventsSql = "SELECT 
            COUNT(*) AS total_events
            FROM events e";

        try {
            $stmt = $this->pdo->prepare($eventCountsSql);
            $stmt->execute();
            $eventCounts = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare($registeredUsersSql);
            $stmt->execute();
            $registeredUsers = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare($eventStatusSql);
            $stmt->execute();
            $eventStatus = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare($totalEventsSql);
            $stmt->execute();
            $totalEvents = $stmt->fetch(PDO::FETCH_ASSOC);

            $payload = [
                'approved_events' => $eventCounts['approved_events'] ?? 0,
                'pending_events' => $eventCounts['pending_events'] ?? 0,
                'rejected_events' => $eventCounts['rejected_events'] ?? 0,
                'total_registered_users' => $registeredUsers['total_registered_users'] ?? 0,
                'done_events' => $eventStatus['done_events'] ?? 0,
                'total_events' => $totalEvents['total_events'] ?? 0,
            ];

            return $this->sendPayload($payload, 'success', 'Dashboard data fetched successfully.', 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', 'Failed to fetch dashboard data.', 500);
        }
    }

    public function get_registered_users_by_course()
    {
        $sql = "SELECT u.course, COUNT(u.user_id) AS student_count 
                FROM user u
                GROUP BY u.course 
                ORDER BY u.course";

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

    public function get_all_attendee_counts()
    {
        $sql =  "SELECT 
                e.event_id, 
                e.event_name, 
                COUNT(er.user_id) AS total_registered_users
                FROM events e
                INNER JOIN event_approval ea ON e.event_id = ea.event_id AND ea.status = 'Approved'
                LEFT JOIN event_registration er ON e.event_id = er.event_id
                WHERE ea.status = 'Approved'
                GROUP BY e.event_id, e.event_name
                ORDER BY e.event_name";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($data)) {
                return $this->sendPayload(null, 'failed', "No approved events or attendees found.", 404);
            }

            return $this->sendPayload($data, 'success', "Successfully retrieved approved attendee counts for all events.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function getDoneEvents($event_id = null)
    {
        try {
            $columns = "e.event_id, e.event_name, u.user_id as organizer_id, u.first_name, u.last_name, u.organization as organizer_organization, organizer_name";


            $sql = "SELECT $columns 
                FROM events e 
                JOIN event_approval ea ON e.event_id = ea.event_id 
                JOIN user u ON e.organizer_user_id = u.user_id
                WHERE ea.status = 'Approved' 
                AND e.event_end_date < NOW()";
            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            $stmt = $this->pdo->prepare($sql);

            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }
}
