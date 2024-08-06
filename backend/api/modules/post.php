<?php
require_once 'Global.php';
require __DIR__ . "/../../vendor/autoload.php";

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
            if (!password_verify($data['password'], $user['password'])) {
                return $this->sendPayload(null, "failed", "Invalid Credentials.", 401);
            }

            $JwtController = new Jwt($_ENV["SECRET_KEY"]);
            $tokenData = [
                "user_id" => $user['user_id'],
                "email" => $user['email'],
                "role_id" => $user['role_id'],
            ];

            if ($user['role_id'] == 2) {
                $organizer = $this->getOrganizerByEmail($user['email']);

                if ($organizer && isset($organizer['is_active']) && $organizer['is_active'] == 1) {
                    $tokenData['is_active'] = $organizer['is_active'];
                } else {
                    return $this->sendPayload(null, "failed", "Organizer account not activated.", 403);
                }
            }

            $token = $JwtController->encode($tokenData);

            http_response_code(200);
            echo json_encode(["token" => $token]);
        } else {
            if ($user === false) {
                return $this->sendPayload(null, "failed", "User not found.", 404);
            } else {
                return $this->sendPayload(null, "failed", "Invalid credentials or user data.", 401);
            }
        }
    }

    private function getOrganizerByEmail($email)
    {
        $sql = "SELECT * FROM user WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
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
        $year_level = $data->year_level;
        $course = $data->course;
        $block = $data->block;
        $password = $data->password;
        $role_id = isset($data->role_id) ? $data->role_id : 3;


        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO user (first_name, last_name, email, year_level, course, block, password, role_id ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$first_name, $last_name, $email, $year_level, $course, $block, $hashed_password,  $role_id]);

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

    public function activate_organizer_account($user_id)
    {
        $updateSql = "UPDATE user SET is_active = 1 WHERE user_id = ?";
        $getEmailSql = "SELECT email FROM user WHERE user_id = ?";
        $mail = initializeMailer();

        try {
            $stmt = $this->pdo->prepare($updateSql);
            $stmt->execute([$user_id]);

            $stmtGetEmail = $this->pdo->prepare($getEmailSql);
            $stmtGetEmail->execute([$user_id]);
            $organizerEmail = $stmtGetEmail->fetchColumn();

            if ($stmt->rowCount() > 0) {
                $mail->setFrom('attendeaseadmin@gmail.com', 'Attendease Admin');
                $mail->addAddress($organizerEmail);
                $mail->Subject = 'Organizer Account Activation';

                $mail->Body =
                    $mail->Body = <<<END
                Your organizer account has been successfully activated. You can now log in.
                 <a href="http://localhost:4200/login">Login</a> here.
                END;


                if ($mail->send()) {
                    return $this->sendPayload(null, 'success', "Organizer account successfully activated. Activation email sent.", 200);
                } else {
                    error_log('Failed to send activation email: ' . $mail->ErrorInfo);
                    return $this->sendPayload(null, 'failed', "Organizer account activated, but failed to send activation email.", 200);
                }
            } else {
                return $this->sendPayload(null, 'failed', "Failed to activate account.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function editOrganizer($data, $user_id)
    {
        if (!isset($data->organization)) {
            return $this->sendPayload(null, 'failed', "Organization data not provided.", 400);
        }

        $sql = "UPDATE user 
                SET organization = ?, is_complete = CASE WHEN organization IS NOT NULL AND organization <> '' THEN 1 ELSE is_complete END
                WHERE user_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->organization,
                $user_id
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Organizer updated successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to update organizer.", 500);
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

    public function updateTimeLimit($event_id, $submission_deadline)
    {
        $sql = "UPDATE events SET attendance_submission_deadline = ? WHERE event_id = ?";
        try {
            $submission_deadline = date('Y-m-d H:i:s', strtotime($submission_deadline));
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $submission_deadline,
                $event_id
            ]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Updated time limit.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to update time limit.", 500);
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
