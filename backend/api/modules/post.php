<?php
require_once 'global.php';

class Post extends GlobalMethods
{   
    private $pdo;
    public function __construct(\PDO $pdo) 
    {
        $this->pdo = $pdo;
    }

    public function add_user($pdo, $data)
    { 
        // Check if all required properties are set
        if (!isset($data->first_name, $data->last_name, $data->year_level, $data->course,
                   $data->block, $data->email, $data->password)) {
            return $this->sendPayload(null, 'failed', "Incomplete user data.", 400);
        }
    
        // Proceed with adding the user
        $first_name = $data->first_name;
        $last_name = $data->last_name;
        $year_level = $data->year_level;
        $course = $data->course;
        $block = $data->block;
        $email = $data->email;
        $password = $data->password;
    
        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
        // Prepare and execute the SQL query
        $sql = "INSERT INTO User (First_Name, Last_Name, Year_Level, Course, Block, Email, Password) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$first_name, $last_name, $year_level, $course, $block, $email, $hashed_password]);
    
            // Check if the query executed successfully
            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add user.", 500);
            }
        } catch (PDOException $e) {
            // Handle database errors
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
    
    public function edit_user($pdo, $data, $user_id)
    {
        // Check if all required properties are set
        if (!isset($data->first_name, $data->last_name, $data->year_level, $data->course,
                   $data->block, $data->email)) {
            return $this->sendPayload(null, 'failed', "Incomplete user data.", 400);
        }
    
        // Proceed with editing the user
        $first_name = $data->first_name;
        $last_name = $data->last_name;
        $year_level = $data->year_level;
        $course = $data->course;
        $block = $data->block;
        $email = $data->email;
    
        // Prepare and execute the SQL query
        $sql = "UPDATE User 
                SET First_Name = ?, Last_Name = ?, Year_Level = ?, Course = ?, Block = ?, 
                Email = ?
                WHERE User_Id = ?";
       try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$first_name, $last_name, $year_level, $course, $block, $email, $user_id]);
    
            // Check if the query executed successfully
            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User updated successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to update user.", 500);
            }
        } catch (PDOException $e) {
            // Handle database errors
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

public function delete_user($pdo, $user_id)
{
    // Prepare and execute the SQL query
    $sql = "DELETE FROM User WHERE User_Id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);

        // Check if the query executed successfully
        if ($stmt->rowCount() > 0) {
            return $this->sendPayload(null, 'success', "User deleted successfully.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to delete user.", 500);
        }
    } catch (PDOException $e) {
        // Handle database errors
        return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    }
}
    public function add_event($pdo, $data)
{
    // Check if all required properties are set
    if (!isset($data->event_name, $data->event_description, $data->event_location,
               $data->event_start_date, $data->event_end_date,
               $data->event_registration_start, $data->event_registration_end,
               $data->requirement_id, $data->session_id,
               $data->created_by)) {
        return $this->sendPayload(null, 'failed', "Incomplete event data.", 400);
    }

    $event_name = $data->event_name;
    $event_description = $data->event_description;
    $event_location = $data->event_location;
    $event_start_date = $data->event_start_date;
    $event_end_date = $data->event_end_date;
    $event_registration_start = $data->event_registration_start;
    $event_registration_end= $data->event_registration_end;
    $requirement_id = $data->requirement_id; 
    $session_id = $data->session_id; 
    $created_by = $data->created_by; 

    // Prepare and execute the SQL query
    $sql = "INSERT INTO Events (Event_Name, Event_Description, Event_Location, Event_Start_Date, Event_End_Date, 
            Event_Registration_Start, Event_Registration_End, Requirement_Id, Session_Id, 
            Created_By) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_name, $event_description, $event_location, $event_start_date, $event_end_date, 
                        $event_registration_start, $event_registration_end, $requirement_id, $session_id, $created_by]);

        // Check if the query executed successfully
        if ($stmt->rowCount() > 0) {
            return $this->sendPayload(null, 'success', "Event added successfully.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to add event.", 500);
        }
    } catch (PDOException $e) {
        // Handle database errors
        return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    }
}

public function register_for_event($pdo, $event_id, $user_id)
{
    try {
        // Check if the user and event exist
        $userExists = $this->checkUserExists($pdo, $user_id);
        $eventExists = $this->checkEventExists($pdo, $event_id);

        if (!$userExists) {
            return $this->sendPayload(null, 'failed', "User does not exist.", 400);
        }

        if (!$eventExists) {
            return $this->sendPayload(null, 'failed', "Event does not exist.", 400);
        }

        // Check if the user is already registered for the event
        $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row['count'] != 0) {
            return $this->sendPayload(null, 'failed', "User is already registered for this event.", 400);
        }

        // Check if the event registration end date has passed
        $sql = "SELECT event_registration_end FROM Events WHERE Event_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (strtotime($event['event_registration_end']) < time()) {
            return $this->sendPayload(null, 'failed', "Event registration has ended.", 400);
        }

        // Check if the user has given feedback for all previous events they attended
        $sql = "SELECT COUNT(*) AS count 
                FROM Events 
                LEFT JOIN event_registration ON Events.Event_Id = event_registration.Event_Id 
                LEFT JOIN attendance ON Events.Event_Id = attendance.Event_Id 
                LEFT JOIN Feedback ON Events.Event_Id = Feedback.Event_Id 
                WHERE Events.Event_End_Date < NOW() AND event_registration.User_Id = ? 
                AND attendance.User_Id = ? AND Feedback.User_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $user_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row['count'] != 0) {
            return $this->sendPayload(null, 'failed', "Please give feedback for all previous events before registering for another event.", 400);
        }

        // If user is not already registered, event registration is open, and user has given feedback for all previous events, proceed to register them for the event
        $sql = "INSERT INTO event_registration (Event_Id, User_Id) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);

        // Check if the query executed successfully
        if ($stmt->rowCount() != 0) {
            // Increment the registration count for the event (if needed)
            // $this->incrementRegistrationCount($pdo, $event_id);
            return $this->sendPayload(null, 'success', "User registered for event successfully.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to register user for event.", 500);
        }
    } catch (PDOException $e) {
        // Handle database errors
        return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    }
}

// Helper method to check if the user exists
private function checkUserExists($pdo, $user_id) {
    $sql = "SELECT COUNT(*) AS count FROM User WHERE User_Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row['count'] > 0;
}

// Helper method to check if the event exists
private function checkEventExists($pdo, $event_id) {
    $sql = "SELECT COUNT(*) AS count FROM Events WHERE Event_Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$event_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row['count'] > 0;
}

public function unregister_from_event($pdo, $event_id, $user_id)
{
    // Prepare and execute the SQL query to unregister the user from the event
    $sql = "DELETE FROM event_registration WHERE Event_Id = ? AND User_Id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);

        // Check if the query executed successfully
        if ($stmt->rowCount() > 0) {
            // Decrement the registration count for the event
            $this->decrementRegistrationCount($pdo, $event_id);
            return $this->sendPayload(null, 'success', "User unregistered from event successfully.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to unregister user from event.", 500);
        }
    } catch (PDOException $e) {
        // Handle database errors
        return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    }
}

// Method to decrement the registration count for an event
private function decrementRegistrationCount($pdo, $event_id) {
    $sql = "UPDATE Events SET registration_count = registration_count - 1 WHERE Event_Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$event_id]);
}

public function mark_attendance($pdo, $event_id, $user_id)
    {
        // Check if the event is ongoing (current date is between event start and end dates)
        $sql = "SELECT Event_Id FROM Events WHERE Event_Id = ? AND Event_Start_Date <= NOW() AND Event_End_Date >= NOW()";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return $this->sendPayload(null, 'failed', "Event is not ongoing.", 400);
        }

        $sql = "SELECT COUNT(*) AS count FROM event_registration WHERE Event_Id = ? AND User_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['count'] == 0) {
            return $this->sendPayload(null, 'failed', "User is not registered for this event.", 400);
        }

         // Check if the user is already marked as attended for this event
         $sql = "SELECT COUNT(*) AS count FROM attendance WHERE Event_Id = ? AND User_Id = ?";
         $stmt = $pdo->prepare($sql);
         $stmt->execute([$event_id, $user_id]);
         $row = $stmt->fetch(PDO::FETCH_ASSOC);
         if ($row['count'] > 0) {
             return $this->sendPayload(null, 'failed', "User is already marked as attended for this event.", 400);
         }

         // Proceed to mark attendance
        // Prepare and execute the SQL query to mark attendance
        $sql = "INSERT INTO attendance (Event_Id, User_Id) VALUES (?, ?)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            // Check if the query executed successfully
            if ($stmt->rowCount() > 0) {
                // Increment the attendance count for the event
                $this->incrementAttendanceCount($pdo, $event_id);
                return $this->sendPayload(null, 'success', "Attendance marked successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to mark attendance.", 500);
            }
        } catch (PDOException $e) {
            // Handle database errors
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    private function incrementAttendanceCount($pdo, $event_id) {
        $sql = "UPDATE Events SET attendance_count = attendance_count + 1 WHERE Event_Id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id]);
    }

    public function add_event_feedback($pdo, $data)
{
    // Check if all required properties are set
    if (!isset($data->event_id, $data->user_id, $data->feedback_given)) {
        // Debugging message
        error_log("Incomplete feedback data. Please provide event_id, user_id, and feedback_given.");
        return $this->sendPayload(null, 'failed', "Incomplete feedback data. Please provide event_id, user_id, and feedback_given.", 400);
    }

    $event_id = $data->event_id;
    $user_id = $data->user_id;
    $feedback_given = $data->feedback_given;

    // Check if the user is registered for the event
    $sql = "SELECT COUNT(*) AS count 
            FROM event_registration 
            WHERE Event_Id = ? AND User_Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$event_id, $user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row['count'] == 0) {
        // Debugging message
        error_log("User is not registered for the event. Event ID: $event_id, User ID: $user_id");
        return $this->sendPayload(null, 'failed', "You are not registered for this event.", 400);
    }

    // Check if the user has attended the event
    $sql = "SELECT COUNT(*) AS count 
            FROM attendance 
            WHERE Event_Id = ? AND User_Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$event_id, $user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row['count'] == 0) {
        // Debugging message
        error_log("User has not attended the event. Event ID: $event_id, User ID: $user_id");
        return $this->sendPayload(null, 'failed', "You have not attended this event.", 400);
    }

    // Prepare and execute the SQL query
    $sql = "INSERT INTO EventFeedback (Event_Id, User_Id, feedback_given) VALUES (?, ?, ?)";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id, $user_id, $feedback_given]);

        // Check if the query executed successfully
        if ($stmt->rowCount() > 0) {
            // Mark feedback as given for this event registration
            $this->markFeedbackGiven($pdo, $event_id, $user_id);
            return $this->sendPayload(null, 'success', "Feedback added successfully.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to add feedback.", 500);
        }
    } catch (PDOException $e) {
        // Handle database errors
        error_log("Database error: " . $e->getMessage());
        return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    }
}

// Method to mark feedback as given for a specific event registration
private function markFeedbackGiven($pdo, $event_id, $user_id) {
    $sql = "UPDATE event_registration SET Feedback_Given = 1 WHERE Event_Id = ? AND User_Id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$event_id, $user_id]);
}

public function edit_event($pdo, $data, $event_id)
{
    // Check if all required properties are set
    if (!isset($data->event_name, $data->event_description, $data->event_location,
               $data->event_start_date, $data->event_end_date,
               $data->event_registration_start, $data->event_registration_end,
               $data->requirement_id, $data->session_id)) {
        return $this->sendPayload(null, 'failed', "Incomplete event data.", 400);
    }

    $event_name = $data->event_name;
    $event_description = $data->event_description;
    $event_location = $data->event_location;
    $event_start_date = $data->event_start_date;
    $event_end_date = $data->event_end_date;
    $event_registration_start = $data->event_registration_start;
    $event_registration_end = $data->event_registration_end;
    $requirement_id = $data->requirement_id; 
    $session_id = $data->session_id; 

    // Prepare and execute the SQL query
    $sql = "UPDATE Events 
            SET Event_Name = ?, Event_Description = ?, Event_Location = ?, 
            Event_Start_Date = ?, Event_End_Date = ?, 
            Event_Registration_Start = ?, Event_Registration_End = ?, 
            Requirement_Id = ?, Session_Id = ?
            WHERE Event_Id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_name, $event_description, $event_location, 
                        $event_start_date, $event_end_date, 
                        $event_registration_start, $event_registration_end, 
                        $requirement_id, $session_id, $event_id]);

        // Check if the query executed successfully
        if ($stmt->rowCount() > 0) {
            return $this->sendPayload(null, 'success', "Event updated successfully.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to update event.", 500);
        }
    } catch (PDOException $e) {
        // Handle database errors
        return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    }
}

public function delete_event($pdo, $event_id)
{
    // Prepare and execute the SQL query
    $sql = "DELETE FROM Events WHERE Event_Id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$event_id]);

        // Check if the query executed successfully
        if ($stmt->rowCount() > 0) {
            return $this->sendPayload(null, 'success', "Event deleted successfully.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to delete event.", 500);
        }
    } catch (PDOException $e) {
        // Handle database errors
        return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    }
}
}   