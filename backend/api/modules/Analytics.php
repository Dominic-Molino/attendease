<?php

require_once 'Global.php';

class Analytics extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
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

    // cards
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
            INNER JOIN event_registration er ON e.event_id = er.event_id
            INNER JOIN event_approval ea ON e.event_id = ea.event_id AND ea.status = 'Approved'
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



    // Function to get all done events and return the event ID and name
    public function getDoneEvents($event_id = null)
    {
        try {
            // Define the columns you need
            $columns = "e.event_id, e.event_name, u.user_id as organizer_id, u.first_name, u.last_name, u.organization as organizer_organization, organizer_name";

            // Write the base SQL query to get done events
            $sql = "SELECT $columns 
                FROM events e 
                JOIN event_approval ea ON e.event_id = ea.event_id 
                JOIN user u ON e.organizer_user_id = u.user_id
                WHERE ea.status = 'Approved' 
                AND e.event_end_date < NOW()"; // Filter for 'done' events

            // If event_id is provided, add the condition to filter by event ID
            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            // Prepare the statement
            $stmt = $this->pdo->prepare($sql);

            // Bind the event_id parameter if it is provided
            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

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



    // Function to get all approved and done events with status and student information
    public function getApprovedDoneEventsWithStatus($event_id = null)
    {
        try {
            // Adjust the SQL query based on whether the event_id is provided
            $sql = "
            SELECT 
                e.event_id, e.event_name, e.event_start_date, e.event_end_date, e.max_attendees,
                CASE 
                    WHEN e.event_end_date < NOW() THEN 'done'
                    ELSE 'ongoing'
                END AS event_status
            FROM events e
            JOIN event_approval ea ON e.event_id = ea.event_id
            WHERE ea.status = 'Approved'";

            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            } else {
                $sql .= " AND e.event_end_date < NOW()";
            }

            $stmt = $this->pdo->prepare($sql);

            // Bind the event_id parameter if it is provided
            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

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
                $student['attendance_status'] = ($student['attendance_remarks'] == 1) ? 'present' : 'absent';
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
            FROM attendance a
            WHERE a.event_id = :event_id
              AND a.remarks = 1
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



    public function getApprovedUpcomingEventsWithStatus($event_id = null)
    {
        try {
            // Define the columns you need
            $columns = "e.event_id, e.event_name, e.event_start_date, e.event_end_date, e.max_attendees,
                    CASE 
                        WHEN e.event_start_date > NOW() THEN 'upcoming'
                    END AS event_status";

            // Write the base SQL query to get ongoing approved events
            $sql = "SELECT $columns 
                FROM events e 
                JOIN event_approval ea ON e.event_id = ea.event_id 
                WHERE ea.status = 'Approved' 
                AND e.event_start_date > NOW()";

            // If event_id is provided, add the condition to filter by specific event
            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            // Prepare the statement
            $stmt = $this->pdo->prepare($sql);

            // Bind the event_id parameter if it is provided
            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

            // Execute the query
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

            // Return the payload with the events data
            return $this->sendPayload($events, 'success', "Successfully retrieved data.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }

    public function getApprovedOngoingEventsWithStatus($event_id = null)
    {
        try {
            // Define the columns you need
            $columns = "e.event_id, e.event_name, e.event_start_date, e.event_end_date, e.max_attendees,
                    CASE 
                        WHEN e.event_end_date >= NOW() AND e.event_start_date <= NOW() THEN 'ongoing'
                        ELSE 'upcoming'
                    END AS event_status";

            // Write the base SQL query to get ongoing approved events
            $sql = "SELECT $columns 
                FROM events e 
                JOIN event_approval ea ON e.event_id = ea.event_id 
                WHERE ea.status = 'Approved' 
                AND e.event_end_date >= NOW() 
                AND e.event_start_date <= NOW()";

            // If event_id is provided, add the condition to filter by specific event
            if ($event_id !== null) {
                $sql .= " AND e.event_id = :event_id";
            }

            // Prepare the statement
            $stmt = $this->pdo->prepare($sql);

            // Bind the event_id parameter if it is provided
            if ($event_id !== null) {
                $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
            }

            // Execute the query
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

            // Return the payload with the events data
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
}
