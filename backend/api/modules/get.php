<?php

require_once 'Global.php';

class Get extends GlobalMethods
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

    public function getByEmail(string $email = null): array|false
    {
        $conditions = ($email !== null) ? "email = '$email'" : null;
        $result = $this->get_records('user', $conditions);

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            return $result['payload'][0];
        } else {
            return false;
        }
    }

    public function checkOrganizer($user_id)
    {
        $columns = "is_complete";
        $sqlStr = "SELECT $columns FROM user WHERE user_id = :user_id";

        try {
            $statement = $this->pdo->prepare($sqlStr);
            $statement->execute([':user_id' => $user_id]);
            $result = $statement->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                return $this->sendPayload($result, 'success', "User found.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "User not found.", 404);
            }
        } catch (\PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }


    public function get_roles($id = null)
    {
        $condition = $id ? "role_id=$id" : null;
        return $this->get_records('roles', $condition);
    }

    public function getUsersByEventAttendance($event_id)
    {

        $sql = "SELECT DISTINCT u.user_id, u.first_name, u.last_name, u.year_level, u.block, u.course
        FROM `attendance` a
        INNER JOIN `user` u ON a.user_id = u.user_id
        WHERE a.event_id = :event_id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rowCount = $stmt->rowCount();

        if ($rowCount > 0) {
            return $this->sendPayload($data, 'success', "Successfully retrieved users registered for the event.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "No users registered for the event.", 404);
        }
    }

    public function getAttendancebyUser($userId, $eventId)
    {
        try {
            $sql = "SELECT attendance_id, remarks, created_at FROM attendance WHERE user_id = :user_id AND event_id = :event_id";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':event_id', $eventId, PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($data)) {
                return $this->sendPayload($data, 'success', "Successfully retrieved users registered for the event.", 200);
            } else {
                return false;
            }
        } catch (PDOException $e) {
            return false;
        }
    }

    public function getAttendanceImage($id = null)
    {
        $fileInfo = $this->getattendanceImg($id);

        if ($fileInfo) {
            $fileData = $fileInfo['image'];

            header('Content-Type: image/png');
            header('Cache-Control: no-cache, no-store, must-revalidate');
            echo $fileData;
            exit();
        } else {
            echo "User has not uploaded an image yet.";
            http_response_code(404);
        }
    }

    public function getattendanceImg($id = null)
    {
        $columns = "image";
        $condition = ($id !== null) ? "attendance_id = $id" : null;
        $result = $this->get_records('attendance', $condition, $columns);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['image'])) {
            $fileData = $result['payload'][0]['image'];
            return array("image" => $fileData);
        } else {
            return array("image" => null);
        }
    }


    public function get_event_feedback($event_id = null)
    {
        $columns = "feedback_id, event_id, user_id, overall_satisfaction, content_quality, speaker_effectiveness,
            venue_rating, logistics_rating, improvement_suggestions, additional_comments, feedback_date, remarks";
        $condition = ($event_id !== null) ? "event_id = $event_id" : null;
        return $this->get_records('feedback', $condition, $columns);
    }


    public function get_user_feedback($user_id = null)
    {
        $columns = "feedback_id, event_id, user_id, overall_satisfaction, content_quality, speaker_effectiveness,
            venue_rating, logistics_rating, improvement_suggestions, additional_comments, feedback_date, remarks";
        $condition = ($user_id !== null) ? "user_id = $user_id" : null;
        return $this->get_records('feedback', $condition, $columns);
    }


    public function getAllAttendanceRemarks($event_id)
    {
        $sql = "
        SELECT 
            a.user_id, u.first_name, u.last_name, u.year_level, u.block, u.course, a.attendance_id, a.remarks
        FROM 
            attendance a
        INNER JOIN 
            user u ON a.user_id = u.user_id
            WHERE a.event_id = :event_id
    ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rowCount = $stmt->rowCount();

        if ($rowCount > 0) {
            return $this->sendPayload($data, 'success', "Successfully retrieved users registered for the event.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "No users registered for the event.", 404);
        }
    }

    public function getUserFeedbackByEvent($eventId, $userId = null)
    {
        $conditions = "event_id = $eventId";
        if ($userId !== null) {
            $conditions .= " AND user_id = $userId";
        }
        return $this->get_records('feedback', $conditions);
    }


    public function getConversation($currentuser, $otheruser)
    {
        $sql = "SELECT 
        c.*,
        u1.first_name AS user1_first_name,
        u1.last_name AS user1_last_name,
        u2.first_name AS user2_first_name,
        u2.last_name AS user2_last_name
        FROM 
        conversations c
        JOIN 
        user u1 ON c.user1 = u1.user_id
        JOIN 
        user u2 ON c.user2 = u2.user_id
        WHERE 
        (c.user1 = $currentuser AND c.user2 = $otheruser) OR (c.user1 = $otheruser AND c.user2 = $currentuser)";


        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$result) {
            $sql2 = "INSERT INTO conversations (user1, user2) VALUES (?, ?)";
            try {
                $stmt = $this->pdo->prepare($sql2);
                $stmt->execute([
                    $currentuser,
                    $otheruser
                ]);
            } catch (PDOException $e) {
                error_log("Database error: " . $e->getMessage());
                return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
            }

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return $this->sendPayload($result, 'success', "Successfully retrieved conversation.", 200);
    }


    public function getConversationMessages($conversation_id)
    {
        $sql = "SELECT 
        ce.*,
        e.first_name AS senderFirstName,
        e.last_name AS senderLastName
        FROM 
        conversation_messages ce
        JOIN 
        user e ON ce.sender_id = e.user_id
        WHERE 
        ce.conversation_id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$conversation_id]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->sendPayload($result, 'success', "Successfully retrieved messages", 200);
        } catch (PDOException $e) {
            return $this->sendPayload([], 'error', "Failed to retrieve messages: " . $e->getMessage(), 500);
        }
    }

    public function getMessageRequests($currentuser)
    {
        $sql = "SELECT 
            u.user_id, 
            u.first_name, 
            u.last_name
            FROM 
            user u
            JOIN 
            (
            SELECT DISTINCT 
            CASE 
                WHEN user1 = $currentuser THEN user2 
                ELSE user1 
            END AS user_id
            FROM 
            conversations
            WHERE 
            user1 = $currentuser OR user2 = $currentuser
            ) AS c ON u.user_id = c.user_id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->sendPayload($result, 'success', "Successfully retrieved messages", 200);
        } catch (PDOException $e) {
            return $this->sendPayload([], 'error', "Failed to retrieve messages: " . $e->getMessage(), 500);
        }
    }
}
