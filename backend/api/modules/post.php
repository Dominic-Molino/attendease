<?php
require_once 'global.php';

class Post extends GlobalMethods
{
    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function add_user($data)
    {
        if (
            !isset(
                $data->first_name,
                $data->last_name,
                $data->email,
                $data->password
            )
        ) {
            return $this->sendPayload(null, 'failed', "Incomplete user data.", 400);
        }

        $first_name = $data->first_name;
        $last_name = $data->last_name;
        $email = $data->email;
        $password = $data->password;

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO user (first_name, last_name, email, password) 
                VALUES (?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$first_name, $last_name, $email, $hashed_password]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add user.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
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
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function edit_user_role($data, $user_id)
    {
        $sql = "UPDATE user 
                SET role_id = ?
                WHERE user_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->role_id,
                $user_id
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User updated successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to update user.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function add_event($data)
    {
        if (
            !isset(
                $data->event_name,
                $data->event_description,
                $data->event_location,
                $data->event_start_date,
                $data->event_end_date,
                $data->event_registration_start,
                $data->event_registration_end,
                $data->session
            )
        ) {
            return $this->sendPayload(null, 'failed', "Incomplete event data.", 400);
        }

        $event_name = $data->event_name;
        $event_description = $data->event_description;
        $event_location = $data->event_location;
        $event_start_date = date('Y-m-d H:i:s', strtotime($data->event_start_date));
        $event_end_date = date('Y-m-d H:i:s', strtotime($data->event_end_date));
        $event_registration_start = date('Y-m-d H:i:s', strtotime($data->event_registration_start));
        $event_registration_end = date('Y-m-d H:i:s', strtotime($data->event_registration_end));
        $session = $data->session;

        $sql = "INSERT INTO events (event_name, event_description, event_location, event_start_date, event_end_date, 
            event_registration_start, event_registration_end, session
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $event_name,
                $event_description,
                $event_location,
                $event_start_date,
                $event_end_date,
                $event_registration_start,
                $event_registration_end,
                $session,
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add event.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }


    public function register_for_event($event_id, $user_id)
    {
        try {
            $userExists = $this->checkUserExists($user_id);
            $eventExists = $this->checkEventExists($event_id);

            if (!$userExists) {
                return $this->sendPayload(null, 'failed', "User does not exist.", 400);
            }

            if (!$eventExists) {
                return $this->sendPayload(null, 'failed', "Event does not exist.", 400);
            }

            $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE Event_Id = ? AND User_Id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row['count'] !== 0) {
                return $this->sendPayload(null, 'failed', "User is already registered for this event.", 400);
            }

            $sql = "SELECT event_registration_end FROM Events WHERE Event_Id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            if (strtotime($event['event_registration_end']) < time()) {
                return $this->sendPayload(null, 'failed', "Event registration has ended.", 400);
            }

            $sql = "SELECT COUNT(*) AS count 
                FROM Events 
                LEFT JOIN event_registration ON Events.Event_Id = event_registration.Event_Id 
                LEFT JOIN attendance ON Events.Event_Id = attendance.Event_Id 
                LEFT JOIN Feedback ON Events.Event_Id = Feedback.Event_Id 
                WHERE Events.Event_End_Date < NOW() AND event_registration.User_Id = ? 
                AND attendance.User_Id = ? AND Feedback.User_Id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$user_id, $user_id, $user_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row['count'] != 0) {
                return $this->sendPayload(null, 'failed', "Please give feedback for all previous events before registering for another event.", 400);
            }


            $sql = "INSERT INTO event_registration (Event_Id, User_Id) VALUES (?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            if ($stmt->rowCount() != 0) {
                return $this->sendPayload(null, 'success', "User registered for event successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to register user for event.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    private function checkUserExists($user_id)
    {
        $sql = "SELECT COUNT(*) AS count FROM User WHERE User_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] > 0;
    }

    private function checkEventExists($event_id)
    {
        $sql = "SELECT COUNT(*) AS count FROM Events WHERE Event_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] > 0;
    }


    public function unregister_from_event($event_id, $user_id)
    {
        $sql = "DELETE FROM event_registration WHERE Event_Id = ? AND User_Id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            if ($stmt->rowCount() > 0) {
                $this->decrementRegistrationCount($event_id);
                return $this->sendPayload(null, 'success', "User unregistered from event successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to unregister user from event.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    private function decrementRegistrationCount($event_id)
    {
        $sql = "UPDATE Events SET registration_count = registration_count - 1 WHERE Event_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
    }

    public function mark_attendance($event_id, $user_id)
    {
        $sql = "SELECT Event_Id FROM Events WHERE Event_Id = ? AND Event_Start_Date <= NOW()";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return $this->sendPayload(null, 'failed', "Event is not ongoing.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['count'] == 0) {
            return $this->sendPayload(null, 'failed', "User is not registered for this event.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM attendance WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['count'] > 0) {
            return $this->sendPayload(null, 'failed', "User is already marked as attended for this event.", 400);
        }

        $sql = "INSERT INTO attendance (Event_Id, User_Id) VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Attendance marked successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to mark attendance.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    private function incrementAttendanceCount($event_id)
    {
        $sql = "UPDATE Events SET attendance_count = attendance_count + 1 WHERE Event_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
    }

    public function add_event_feedback($data)
    {
        if (!isset($data->event_id, $data->user_id, $data->feedback_given)) {
            error_log("Incomplete feedback data. Please provide event_id, user_id, and feedback_given.");
            return $this->sendPayload(null, 'failed', "Incomplete feedback data. Please provide event_id, user_id, and feedback_given.", 400);
        }

        $event_id = $data->event_id;
        $user_id = $data->user_id;
        $feedback_given = $data->feedback_given;

        $sql = "SELECT COUNT(*) AS count 
            FROM event_registration 
            WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row['count'] == 0) {
            error_log("User is not registered for the event. Event ID: $event_id, User ID: $user_id");
            return $this->sendPayload(null, 'failed', "You are not registered for this event.", 400);
        }

        $sql = "SELECT COUNT(*) AS count 
            FROM attendance 
            WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row['count'] == 0) {
            error_log("User has not attended the event. Event ID: $event_id, User ID: $user_id");
            return $this->sendPayload(null, 'failed', "You have not attended this event.", 400);
        }

        $sql = "INSERT INTO EventFeedback (Event_Id, User_Id, feedback_given) VALUES (?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id, $feedback_given]);

            if ($stmt->rowCount() > 0) {
                $this->markFeedbackGiven($event_id, $user_id);
                return $this->sendPayload(null, 'success', "Feedback added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add feedback.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    private function markFeedbackGiven($event_id, $user_id)
    {
        $sql = "UPDATE event_registration SET Feedback_Given = 1 WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
    }

    public function edit_event($data, $event_id)
    {
        $sql = "UPDATE Events 
                SET event_name = ?, event_description = ?, event_location = ?, 
                    event_start_date = ?, event_end_date = ?, 
                    event_registration_start = ?, event_registration_end = ? , session = ?
                WHERE event_id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->event_name,
                $data->event_description,
                $data->event_location,
                $data->event_start_date,
                $data->event_end_date,
                $data->event_registration_start,
                $data->event_registration_end,
                $data->session,
                $event_id
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event updated successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to update event.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }


    public function delete_event($event_id)
    {
        $sql = "DELETE FROM events WHERE event_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event deleted successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to delete event.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function uploadAvatar($user_id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);

        $sql = "UPDATE user SET avatar = ? WHERE user_id = $user_id";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {

            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function uploadEvent($event_id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);

        $sql = "UPDATE events SET event_image = ? WHERE event_id = $event_id";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {

            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
}
