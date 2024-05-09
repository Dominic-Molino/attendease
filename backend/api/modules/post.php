<?php
require_once 'global.php';

class Post extends GlobalMethods
{
    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    //user functions
    public function add_user($pdo, $data)
    {
        if (!isset(
            $data->first_name,
            $data->last_name,
            $data->year_level,
            $data->course,
            $data->block,
            $data->email,
            $data->password
        )) {
            return $this->sendPayload(null, 'failed', "Incomplete user data.", 400);
        }

        $first_name = $data->first_name;
        $last_name = $data->last_name;
        $year_level = $data->year_level;
        $course = $data->course;
        $block = $data->block;
        $email = $data->email;
        $password = $data->password;

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO user (first_name, last_name, year_level, course, block, email, password) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$first_name, $last_name, $year_level, $course, $block, $email, $hashed_password]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add user.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function edit_user($data, $user_id)
    {
        $sql = "UPDATE User 
                SET first_name = ?, last_name = ?, year_level = ?, block = ?, course = ?,  
                email = ?
                WHERE user_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->first_name,
                $data->last_name,
                $data->year_level,
                $data->course,
                $data->block,
                $data->email,
                $user_id
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User updated successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to update user.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    // event fucntions
    public function add_event($pdo, $data)
    {
        if (!isset(
            $data->event_name,
            $data->event_description,
            $data->event_location,
            $data->event_start_date,
            $data->event_end_date,
            $data->event_registration_start,
            $data->event_registration_end,
            $data->requirement,
            $data->session
        )) {
            return $this->sendPayload(null, 'failed', "Incomplete event data.", 400);
        }

        $event_name = $data->event_name;
        $event_description = $data->event_description;
        $event_location = $data->event_location;
        $event_start_date = $data->event_start_date;
        $event_end_date = $data->event_end_date;
        $event_registration_start = $data->event_registration_start;
        $event_registration_end = $data->event_registration_end;
        $requirement = $data->requirement;
        $session = $data->session;


        $sql = "INSERT INTO events (event_name, event_description, event_location, event_start_date, event_end_date, 
            event_registration_start, event_registration_end, requirement, session
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $event_name, $event_description, $event_location, $event_start_date, $event_end_date,
                $event_registration_start, $event_registration_end, $requirement, $session
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add event.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }


    public function register_for_event($pdo, $event_id, $user_id)
    {
        try {
            $sql = "SELECT COUNT(*) AS count FROM EventRegistrations WHERE Event_Id = ? AND User_Id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row['count'] > 0) {
                return $this->sendPayload(null, 'failed', "User is already registered for this event.", 400);
            }

            $sql = "INSERT INTO EventRegistrations (Event_Id, User_Id) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User registered for event successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to register user for event.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function unregister_from_event($pdo, $event_id, $user_id)
    {
        $sql = "DELETE FROM EventRegistrations WHERE Event_Id = ? AND User_Id = ?";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            if ($stmt->rowCount() > 0) {
                $this->decrementRegistrationCount($pdo, $event_id);
                return $this->sendPayload(null, 'success', "User unregistered from event successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to unregister user from event.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    private function decrementRegistrationCount($pdo, $event_id)
    {
        $sql = "UPDATE Events SET registration_count = registration_count - 1 WHERE Event_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id]);
    }

    public function mark_attendance($pdo, $event_id, $user_id)
    {
        $sql = "SELECT Event_Id FROM Events WHERE Event_Id = ? AND Event_Start_Date <= NOW() AND Event_End_Date >= NOW()";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return $this->sendPayload(null, 'failed', "Event is not ongoing.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM EventRegistrations WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['count'] == 0) {
            return $this->sendPayload(null, 'failed', "User is not registered for this event.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM EventAttendance WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['count'] > 0) {
            return $this->sendPayload(null, 'failed', "User is already marked as attended for this event.", 400);
        }

        $sql = "INSERT INTO EventAttendance (Event_Id, User_Id) VALUES (?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            if ($stmt->rowCount() > 0) {
                $this->incrementAttendanceCount($pdo, $event_id);
                return $this->sendPayload(null, 'success', "Attendance marked successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to mark attendance.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    private function incrementAttendanceCount($pdo, $event_id)
    {
        $sql = "UPDATE Events SET attendance_count = attendance_count + 1 WHERE Event_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id]);
    }

    public function add_event_feedback($pdo, $data)
    {
        if (!isset($data->event_id, $data->user_id, $data->comments)) {
            return $this->sendPayload(null, 'failed', "Incomplete feedback data.", 400);
        }

        $event_id = $data->event_id;
        $user_id = $data->user_id;
        $comments = $data->comments;

        $sql = "INSERT INTO EventFeedback (Event_Id, User_Id, Comments) VALUES (?, ?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id, $comments]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Feedback added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add feedback.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function edit_event($pdo, $data, $event_id)
    {
        if (!isset(
            $data->event_name,
            $data->event_description,
            $data->event_location,
            $data->event_start_date,
            $data->event_end_date,
            $data->event_registration_start,
            $data->event_registration_end,
            $data->session,
            $data->requirement
        )) {
            return $this->sendPayload(null, 'failed', "Incomplete event data.", 400);
        }

        $event_name = $data->event_name;
        $event_description = $data->event_description;
        $event_location = $data->event_location;
        $event_start_date = $data->event_start_date;
        $event_end_date = $data->event_end_date;
        $event_registration_start = $data->event_registration_start;
        $event_registration_end = $data->event_registration_end;
        $session = $data->session;
        $requirement =  $data->requirement;

        $sql = "UPDATE Events 
            SET event_name = ?, event_description = ?, event_location = ?, 
            event_start_date = ?, event_end_date = ?, 
            event_registration_start = ?, event_registration_end = ?, 
            requirement = ?, session = ?
            WHERE event_id = ?";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $event_name, $event_description, $event_location,
                $event_start_date, $event_end_date,
                $event_registration_start, $event_registration_end,
                $session, $requirement, $event_id
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event updated successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to update event.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function delete_event($pdo, $event_id)
    {
        $sql = "DELETE FROM Events WHERE Event_Id = ?";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$event_id]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event deleted successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to delete event.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}
