<?php

require_once 'global.php';

class Get extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // Private method to fetch records from the database table
    private function get_records($table, $conditions = null)
    {
        $sqlStr = "SELECT * FROM $table";
        if ($conditions != null) {
            $sqlStr .= " WHERE " . $conditions;
        }
        return $this->executeQuery($sqlStr); // Adjusted call to executeQuery()
    }

    // Private method to execute a SQL query and handle exceptions
    private function executeQuery($sql)
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                return $this->sendPayload($data, 'success', "Successfully retrieved data.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "No data found.", 404);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }


    public function get_user_events($user_id)
    {
        $sql = "SELECT events.* FROM events 
            INNER JOIN event_registration ON events.event_id = event_registration.event_id 
            WHERE event_registration.user_id = :user_id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rowCount = $stmt->rowCount();

        if ($rowCount > 0) {
            return $this->sendPayload($data, 'success', "Successfully retrieved user's events.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "User has not registered for any events.", 404);
        }
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

    public function get_users($user_id = null)
    {
        $condition = $user_id ? "user_id=$user_id" : null;
        return $this->get_records('user', $condition);
    }


    // Method to fetch roles from the database
    public function get_roles($id = null)
    {
        $condition = $id ? "id=$id" : null;
        return $this->get_records('role', $condition);
    }

    // Method to fetch events from the database
    public function get_events($event_id = null)
    {
        $condition = $event_id ? "event_id = $event_id" : null;
        return $this->get_records('events', $condition);
    }

    // Method to fetch all events from the database
    public function get_all_events()
    {
        return $this->get_records('events');
    }

    // Method to fetch feedback for a specific event
    public function get_event_feedback($event_id)
    {
        $condition = $event_id ? "Event_Id=$event_id" : null;
        return $this->get_records('EventFeedback', $condition);
    }

    // Method to fetch all feedback for a specific event
    public function get_all_event_feedback()
    {
        return $this->get_records('EventFeedback'); // Corrected method call
    }

    public function get_student($user_id = null)
    {
        $condition = ($user_id !== null) ? "user_id = $user_id" : null;
        $result = $this->get_records('user', $condition);

        if ($result['status']['remarks'] === 'success') {

            $payloadData = $result['payload'];


            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }

    public function get_event($event_id = null)
    {
        $condition = ($event_id !== null) ? "event_id = $event_id" : null;
        $result = $this->get_records('events', $condition);


        if ($result['status']['remarks'] === 'success') {

            $payloadData = $result['payload'];


            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }

    public function get_registered_users_for_event($event_id)
    {
        // SQL query to fetch users registered for the specified event
        $sql = "SELECT u.first_name, u.last_name, u.email FROM user u
        INNER JOIN event_registration er ON u.user_id = er.user_id 
        WHERE er.event_id = :event_id";

        // Prepare the SQL statement
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
        $stmt->execute();

        // Fetch the data
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rowCount = $stmt->rowCount();

        // Check if users are found
        if ($rowCount > 0) {
            return $this->sendPayload($data, 'success', "Successfully retrieved users registered for the event.", 200);
        } else {
            return $this->sendPayload(null, 'failed', "No users registered for the event.", 404);
        }
    }

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


    // public function get_avatar($id)
    // {
    //     $fileInfo = $this->get_imageData($id);

    //     // Check if file info exists            
    //     if ($fileInfo) {
    //         $fileData = $fileInfo['avatar'];

    //         // Set headers for file download
    //         header('Content-Type: image/png');
    //         echo $fileData;
    //         exit();
    //     } else {
    //         echo "User has not uploaded an avatar yet.";
    //         http_response_code(404);
    //     }
    // }
    // public function get_imageData($user_id = null)
    // {
    //     $columns = "avatar";
    //     $condition = ($user_id !== null) ? "user_id = $user_id" : null;
    //     $result = $this->get_records('user', $condition, $columns);

    //     if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['avatar'])) {
    //         $fileData = $result['payload'][0]['avatar'];
    //         return array("avatar" => $fileData);
    //     } else {
    //         return array("avatar" => null);
    //     }
    // }
}
