<?php

require_once 'Global.php';


class Approval extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function approveEvent($event_id, $admin_id)
    {
        // Check if admin_id exists in user table
        $adminCheckSql = "SELECT COUNT(*) FROM user WHERE user_id = ? AND role_id = 1";
        $adminCheckStmt = $this->pdo->prepare($adminCheckSql);
        $adminCheckStmt->execute([$admin_id]);
        $adminExists = $adminCheckStmt->fetchColumn();

        if (!$adminExists) {
            return $this->sendPayload(null, 'failed', "Invalid administrator ID.", 400);
        }

        $sql = "UPDATE event_approval SET status = 'Approved', approved_by = ?, approved_at = NOW() WHERE event_id = ? AND status = 'Pending'";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$admin_id, $event_id]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event approved successfully.", 200);
            } else {
                // Check if event_id exists in event_approval
                $existsSql = "SELECT COUNT(*) FROM event_approval WHERE event_id = ?";
                $existsStmt = $this->pdo->prepare($existsSql);
                $existsStmt->execute([$event_id]);
                $exists = $existsStmt->fetchColumn();

                if ($exists > 0) {
                    return $this->sendPayload(null, 'failed', "Event is not pending approval.", 400);
                } else {
                    return $this->sendPayload(null, 'failed', "Event with ID $event_id not found in event_approval.", 404);
                }
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function rejectEvent($event_id, $admin_id)
    {
        // Check if admin_id exists in user table
        $adminCheckSql = "SELECT COUNT(*) FROM user WHERE user_id = ? AND  role_id = 1";
        $adminCheckStmt = $this->pdo->prepare($adminCheckSql);
        $adminCheckStmt->execute([$admin_id]);
        $adminExists = $adminCheckStmt->fetchColumn();

        if (!$adminExists) {
            return $this->sendPayload(null, 'failed', "Invalid administrator ID.", 400);
        }

        $sql = "UPDATE event_approval SET status = 'Rejected', approved_by = ?, approved_at = NOW() WHERE event_id = ? AND status = 'Pending'";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$admin_id, $event_id]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event rejected successfully.", 200);
            } else {
                // Check if event_id exists in event_approval
                $existsSql = "SELECT COUNT(*) FROM event_approval WHERE event_id = ?";
                $existsStmt = $this->pdo->prepare($existsSql);
                $existsStmt->execute([$event_id]);
                $exists = $existsStmt->fetchColumn();

                if ($exists > 0) {
                    return $this->sendPayload(null, 'failed', "Event is not pending approval.", 400);
                } else {
                    return $this->sendPayload(null, 'failed', "Event with ID $event_id not found in event_approval.", 404);
                }
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}
