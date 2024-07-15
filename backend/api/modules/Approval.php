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

    public function rejectEvent($event_id, $admin_id, $rejection_message)
    {
        $adminCheckSql = "SELECT COUNT(*) FROM user WHERE user_id = ? AND role_id = 1";
        $adminCheckStmt = $this->pdo->prepare($adminCheckSql);
        $adminCheckStmt->execute([$admin_id]);
        $adminExists = $adminCheckStmt->fetchColumn();

        if (!$adminExists) {
            return $this->sendPayload(null, 'failed', "Invalid administrator ID.", 400);
        }

        $sql = "UPDATE event_approval 
                SET status = 'Rejected', approved_by = ?, approved_at = NOW(), rejection_message = ? 
                WHERE event_id = ? AND status = 'Pending'";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$admin_id, $rejection_message, $event_id]);

            if ($stmt->rowCount() > 0) {
                $organizerDetails = $this->getOrganizerDetailsFromEventApproval($event_id);
                if (!$organizerDetails) {
                    return $this->sendPayload(null, 'failed', "Failed to fetch organizer details.", 500);
                }

                $mail = initializeMailer();

                $organizer_email = $organizerDetails['email'];
                $event_name = $organizerDetails['event_name'];
                $organizer_name = $organizerDetails['first_name'] . ' ' . $organizerDetails['last_name'];
                $subject = "Event Rejection Notification";
                $message = "Dear $organizer_name,<br>Your event $event_name has been rejected.<br>Rejection Reason:<br>$rejection_message";

                $mail->setFrom('attendeaseadmin@gmail.com', 'Attendease Admin');
                $mail->addAddress($organizer_email, $organizer_name);
                $mail->Subject = $subject;
                $mail->Body = nl2br($message);

                if (!$mail->send()) {
                    error_log('Mailer Error: ' . $mail->ErrorInfo);
                    return $this->sendPayload(null, 'failed', "Failed to send rejection email to organizer.", 500);
                }

                return $this->sendPayload(null, 'success', "Event rejected successfully.", 200);
            } else {
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

    private function getOrganizerDetailsFromEventApproval($event_id)
    {
        $sql = "SELECT u.email, u.first_name, u.last_name, e.event_name
            FROM event_approval AS ea
            JOIN events AS e ON ea.event_id = e.event_id
            JOIN user AS u ON e.organizer_user_id = u.user_id
            WHERE ea.event_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$event_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
