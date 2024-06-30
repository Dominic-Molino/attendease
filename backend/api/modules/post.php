<?php
require_once 'Global.php';

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
                $data->password,
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
        $organization = isset($data->organization) ? $data->organization : null;
        $role_id = isset($data->role_id) ? $data->role_id : 3;


        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO user (first_name, last_name, email, password, role_id, organization) 
                VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$first_name, $last_name, $email, $hashed_password,  $role_id, $organization]);

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

    public function startConversation($data)
    {
        $sql = "INSERT INTO conversations (user1, user2) VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->user1,
                $data->user2
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Successfully created conversation.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to create conversation.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function sendMessage($data)
    {
        $sql = "INSERT INTO conversation_messages (conversation_id, sender_id, message) VALUES (?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->conversation_id,
                $data->sender_id,
                $data->message
            ]);
            return $this->sendPayload(null, "success", "Successfully sent message", 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}
