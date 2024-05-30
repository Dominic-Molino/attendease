<?php

require_once 'global.php';

class Delete extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function delete_event($event_id)
    {
        // SQL statements for deletion
        $deleteRegistrationsSql = "DELETE FROM event_registration WHERE event_id = ?";
        $deleteEventSql = "DELETE FROM events WHERE event_id = ?";

        try {
            // Begin transaction
            $this->pdo->beginTransaction();

            // Delete entries from event_registration
            $stmt = $this->pdo->prepare($deleteRegistrationsSql);
            $stmt->execute([$event_id]);

            // Delete the event from events
            $stmt = $this->pdo->prepare($deleteEventSql);
            $stmt->execute([$event_id]);

            // Check if the event deletion was successful
            if ($stmt->rowCount() > 0) {
                // Commit transaction
                $this->pdo->commit();
                return $this->sendPayload(null, 'success', "Event and associated registrations deleted successfully.", 200);
            } else {
                // Rollback transaction if event deletion failed
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "Failed to delete event.", 500);
            }
        } catch (PDOException $e) {
            // Rollback transaction in case of error
            $this->pdo->rollBack();
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function unregister_from_event($event_id, $user_id)
    {
        $sql = "DELETE FROM event_registration WHERE Event_Id = ? AND User_Id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$event_id, $user_id]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "User unregistered from event successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to unregister user from event. No matching record found.", 404);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}
