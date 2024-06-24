<?php

require_once 'Global.php';

class GetNotification extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllNotifications()
    {
        $sql = "SELECT * FROM event_approval";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->sendPayload($data, 'success', "Successfully retrieved pending approval notifications.", 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }


    public function getUserNotification($user_id)
    {
        $tomorrow = date('Y-m-d', strtotime('+1 day'));

        $sql = "
        SELECT 
            events.event_id, event_name, event_start_date, event_end_date
        FROM events
        INNER JOIN event_registration ON events.event_id = event_registration.event_id
        WHERE DATE(event_start_date) = :tomorrow
        AND event_registration.user_id = :user_id
    ";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':tomorrow', $tomorrow, PDO::PARAM_STR);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->sendPayload($data, 'success', "Successfully retrieved registered events for the user.", 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'error', $e->getMessage(), 500);
        }
    }
}
