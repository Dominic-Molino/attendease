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
        return $this->executeQuery($this->pdo, $sqlStr); // Adjusted call to executeQuery()
    }

    // Private method to execute a SQL query and handle exceptions
    private function executeQuery($pdo, $sql)
    {
        try {
            $stmt = $pdo->prepare($sql);
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

    // usergateway
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
        $condition = $event_id ? "event_id=$event_id" : null;
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
        return $this->get_all_event_feedback();
    }

    public function get_student($user_id = null)
    {
        $condition = ($user_id !== null) ? "id = $user_id" : null;
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
}
