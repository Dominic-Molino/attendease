<?php
require_once 'global.php';

class Post extends GlobalMethods
{
    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }
    public function login($data, $user)
    {
        if ($user !== false && isset($user['password'])) {
            // Verify the password
            if (!password_verify($data['password'], $user['password'])) {
                return $this->sendPayload(null, "failed", "Invalid Credentials.", 401);
            }

            // Generate JWT token
            $JwtController = new Jwt($_ENV["SECRET_KEY"]);
            $token = $JwtController->encode([
                "user_id" => $user['user_id'],
                "email" => $user['email'],
                "role_id" => $user['role_id'],
            ]);

            // Respond with the generated token
            http_response_code(200);
            echo json_encode(["token" => $token]);
        } else {
            // Check if user was found or not
            if ($user === false) {
                return $this->sendPayload(null, "failed", "User not found.", 404);
            } else {
                // This block handles cases where $user['password'] is not set or other unexpected scenarios
                return $this->sendPayload(null, "failed", "Invalid credentials or user data.", 401);
            }
        }
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

        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            return $this->sendPayload(null, 'failed', "Invalid email format.", 400);
        }

        if (strlen($data->password) < 8) {
            return $this->sendPayload(null, 'failed', "Password must be at least 8 characters long.", 400);
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
        $sql = "UPDATE user 
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
                $data->organizer_name,
                $data->event_start_date,
                $data->event_end_date
            )
        ) {
            return $this->sendPayload(null, 'failed', "Incomplete event data.", 400);
        }

        $event_name =  htmlspecialchars($data->event_name, ENT_QUOTES, 'UTF-8');
        $organizer_name = htmlspecialchars($data->organizer_name, ENT_QUOTES, 'UTF-8');
        $event_start_date = date('Y-m-d H:i:s', strtotime($data->event_start_date));
        $event_end_date = date('Y-m-d H:i:s', strtotime($data->event_end_date));

        // Validate maximum attendees
        $max_attendees = isset($data->max_attendees) ? (int)$data->max_attendees : null;
        if ($max_attendees !== null && $max_attendees <= 0) {
            return $this->sendPayload(null, 'failed', "Maximum attendees must be a positive number.", 400);
        }

        // Validate event date order
        if ($event_start_date >= $event_end_date) {
            return $this->sendPayload(null, 'failed', "Event start date must be before event end date.", 400);
        }

        // Validate registration date order if provided
        if (isset($data->event_registration_start) && isset($data->event_registration_end)) {
            $event_registration_start = date('Y-m-d H:i:s', strtotime($data->event_registration_start));
            $event_registration_end = date('Y-m-d H:i:s', strtotime($data->event_registration_end));

            if ($event_registration_start >= $event_registration_end) {
                return $this->sendPayload(null, 'failed', "Registration start date must be before registration end date.", 400);
            }

            if ($event_registration_start >= $event_start_date) {
                return $this->sendPayload(null, 'failed', "Registration start date must be before start of the event", 400);
            }
        }

        // Check if an event with the same name and organizer overlaps in time
        $sql_check = "SELECT COUNT(*) AS count FROM events 
                    WHERE event_name = ? 
                    AND organizer_name = ?
                    AND NOT (event_end_date <= ? OR event_start_date >= ?)";

        try {
            $stmt_check = $this->pdo->prepare($sql_check);
            $stmt_check->execute([
                $event_name,
                $organizer_name,
                $event_start_date,
                $event_end_date
            ]);

            $result = $stmt_check->fetch(PDO::FETCH_ASSOC);
            if ($result['count'] > 0) {
                return $this->sendPayload(null, 'failed', "Event with same name and organizer overlaps in time.", 400);
            }

            // Proceed with inserting the new event
            $sql_insert = "INSERT INTO events (event_name, event_description, event_location, event_start_date, event_end_date, 
                            event_registration_start, event_registration_end, session, max_attendees, categories, organizer_name)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt_insert = $this->pdo->prepare($sql_insert);
            $stmt_insert->execute([
                $event_name,
                $data->event_description ?? null,
                $data->event_location ?? null,
                $event_start_date,
                $event_end_date,
                isset($data->event_registration_start) ? date('Y-m-d H:i:s', strtotime($data->event_registration_start)) : null,
                isset($data->event_registration_end) ? date('Y-m-d H:i:s', strtotime($data->event_registration_end)) : null,
                isset($data->session) ?? null,
                (int)($data->max_attendees ?? null),
                json_encode($data->categories) ?? null,
                $organizer_name,
            ]);

            $event_id = $this->pdo->lastInsertId();
            if ($event_id) {
                return $this->sendPayload(['event_id' => $event_id], 'success', "Event added successfully.", 200);
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

            // Check if the user is already registered for the event
            $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE event_id = ? AND user_id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row['count'] != 0) {
                return $this->sendPayload(null, 'failed', "User is already registered for this event.", 400);
            }

            // Check if the event registration dates are valid
            $sql = "SELECT event_registration_start, event_registration_end FROM events WHERE event_id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            $currentDate = date('Y-m-d');
            $registrationStartDate = date('Y-m-d', strtotime($event['event_registration_start']));
            $registrationEndDate = date('Y-m-d', strtotime($event['event_registration_end']));

            if ($currentDate < $registrationStartDate) {
                return $this->sendPayload(null, 'failed', "Event registration is not yet available.", 400);
            }

            if ($currentDate > $registrationEndDate) {
                return $this->sendPayload(null, 'failed', "Event registration has ended.", 400);
            }

            // Check if the event has reached maximum attendees
            $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE event_id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id]);
            $attendeeCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            $sql = "SELECT max_attendees FROM events WHERE event_id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id]);
            $maxAttendees = $stmt->fetch(PDO::FETCH_ASSOC)['max_attendees'];

            if ($attendeeCount >= $maxAttendees) {
                return $this->sendPayload(null, 'failed', "Event has reached maximum attendees.", 400);
            }

            // Register the user for the event
            $sql = "INSERT INTO event_registration (event_id, user_id) VALUES (?, ?)";
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
        $sql = "SELECT COUNT(*) AS count FROM user WHERE user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] > 0;
    }

    private function checkEventExists($event_id)
    {
        $sql = "SELECT COUNT(*) AS count FROM events WHERE event_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] > 0;
    }

    public function mark_attendance($event_id, $user_id)
    {
        $sql = "SELECT event_id FROM events WHERE event_id = ? AND event_start_date <= NOW()";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return $this->sendPayload(null, 'failed', "Event is not ongoing.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE event_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['count'] == 0) {
            return $this->sendPayload(null, 'failed', "User is not registered for this event.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM attendance WHERE event_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['count'] > 0) {
            return $this->sendPayload(null, 'failed', "User is already marked as attended for this event.", 400);
        }

        $sql = "INSERT INTO attendance (event_id, user_id) VALUES (?, ?)";
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

    public function edit_event($data, $event_id)
    {
        $event_name = $data->event_name ?? null;
        $event_description = $data->event_description ?? null;
        $event_location = $data->event_location ?? null;
        $event_start_date = date('Y-m-d H:i:s', strtotime($data->event_start_date));
        $event_end_date = date('Y-m-d H:i:s', strtotime($data->event_end_date));
        $event_registration_start = isset($data->event_registration_start) ? date('Y-m-d H:i:s', strtotime($data->event_registration_start)) : null;
        $event_registration_end = isset($data->event_registration_end) ? date('Y-m-d H:i:s', strtotime($data->event_registration_end)) : null;
        $session = $data->session ?? null;
        $max_attendees = (int)($data->max_attendees ?? null);
        $categories = isset($data->categories) ? json_encode($data->categories) : null;
        $organizer_name = $data->organizer_name ?? null;

        // Date validations
        if ($event_start_date >= $event_end_date) {
            return $this->sendPayload(null, 'failed', "Event start date must be before event end date.", 400);
        }
        if ($event_registration_start && $event_registration_end && $event_registration_start >= $event_registration_end) {
            return $this->sendPayload(null, 'failed', "Registration start date must be before registration end date.", 400);
        }
        if ($event_registration_start && $event_start_date && $event_registration_start >= $event_start_date) {
            return $this->sendPayload(null, 'failed', "Registration start date must be before start of the event.", 400);
        }

        // Update the event
        $sql = "UPDATE events 
                SET event_name = ?, event_description = ?, event_location = ?, 
                    event_start_date = ?, event_end_date = ?, 
                    event_registration_start = ?, event_registration_end = ?, session = ?, max_attendees = ?, categories = ?, organizer_name = ?
                WHERE event_id = ?";

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
                $max_attendees,
                $categories,
                json_encode($organizer_name),
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

        $sql = "UPDATE events SET event_image = ? WHERE event_id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $fileData,
                $event_id
            ]);
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function uploadAttendanceImage($event_id, $user_id)
    {
        // Check if user has already submitted an image for this event
        $sql_check = "SELECT COUNT(*) AS count FROM attendance WHERE event_id = ? AND user_id = ?";
        try {
            $stmt_check = $this->pdo->prepare($sql_check);
            $stmt_check->execute([$event_id, $user_id]);
            $result = $stmt_check->fetch(PDO::FETCH_ASSOC);

            if ($result['count'] > 0) {
                return $this->sendPayload(null, 'failed', "You have already submitted an image for this event.", 400);
            }

            // Proceed with uploading the attendance image
            $fileData = file_get_contents($_FILES["file"]["tmp_name"]);

            $sql_insert = "INSERT INTO attendance (event_id, user_id, image) VALUES (?, ?, ?)";
            $stmt_insert = $this->pdo->prepare($sql_insert);
            $stmt_insert->execute([$event_id, $user_id, $fileData]);

            if ($stmt_insert->rowCount() > 0) {
                return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
            } else {
                return $this->sendPayload(null, "failed", "Failed to upload attendance image.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, "failed", $e->getMessage(), 500);
        }
    }

    public function toggleAttendanceRemark($submissionId, $newRemark)
    {
        $sql = "UPDATE attendance SET remarks = ? WHERE attendance_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$newRemark, $submissionId]);
            return $this->sendPayload(null, "success", "Remark toggled successfully", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }

    public function add_event_feedback($event_id, $user_id, $data)
    {
        if (!isset($data->overall_satisfaction) || !isset($data->content_quality) || !isset($data->speaker_effectiveness) || !isset($data->venue_rating) || !isset($data->logistics_rating) || !isset($data->satisfied) || !isset($data->joined) || !isset($data->learned) || !isset($data->future) || !isset($data->liked) || !isset($data->attend) || !isset($data->recommend)) {
            return $this->sendPayload(null, 'failed', "Incomplete feedback data.", 400);
        }

        $overall_satisfaction = $data->overall_satisfaction;
        $content_quality = $data->content_quality;
        $speaker_effectiveness = $data->speaker_effectiveness;
        $venue_rating = $data->venue_rating;
        $logistics_rating = $data->logistics_rating;
        $satisfied = $data->satisfied;
        $joined = $data->joined;
        $learned = $data->learned;
        $future = $data->future;
        $liked = $data->liked;
        $attend = $data->attend;
        $recommend = $data->recommend;
        $improvement_suggestions = $data->improvement_suggestions ?? '';
        $additional_comments = $data->additional_comments ?? '';
        $remarks = 'Feedback submitted';

        // Check if the event has ended
        $sql = "SELECT event_end_date FROM events WHERE event_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$event || strtotime($event['event_end_date']) > time()) {
            return $this->sendPayload(null, 'failed', "Feedback submission is only allowed after the event has ended.", 400);
        }

        // Check if the user is registered for the event
        $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE event_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row['count'] == 0) {
            return $this->sendPayload(null, 'failed', "You are not registered for this event.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM feedback WHERE event_id = ? AND user_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row['count'] > 0) {
            return $this->sendPayload(null, 'failed', "You have already submitted feedback for this event.", 400);
        }

        $sql = "INSERT INTO feedback (event_id, user_id, overall_satisfaction, content_quality, speaker_effectiveness, venue_rating, logistics_rating, satisfied, joined, learned, future, liked, attend, recommend, improvement_suggestions, additional_comments, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,? ,? ,?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id, $overall_satisfaction, $content_quality, $speaker_effectiveness, $venue_rating, $logistics_rating, $satisfied, $joined, $learned, $future, $liked, $attend, $recommend, $improvement_suggestions, $additional_comments, $remarks]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Feedback added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add feedback.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}
