<?php

require_once 'Global.php';
require __DIR__ . "/../src/PhpMailer.php";

class Events extends  GlobalMethods
{

    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function addEvent($data)
    {
        if (
            !isset(
                $data->event_name,
                $data->organizer_name,
                $data->event_start_date,
                $data->event_end_date
            )
        ) {
            return $this->sendPayload(null, 'failed', "Incomplete event data.", 400);
        }

        $event_name =  htmlspecialchars($data->event_name, ENT_QUOTES, 'UTF-8');
        $organizer_name = htmlspecialchars($data->organizer_name, ENT_QUOTES, 'UTF-8');
        $organizer_user_id = (int)$data->organizer_user_id;
        $organizer_organization = htmlspecialchars($data->organizer_organization, ENT_QUOTES, 'UTF-8');
        $event_start_date = date('Y-m-d H:i:s', strtotime($data->event_start_date));
        $event_end_date = date('Y-m-d H:i:s', strtotime($data->event_end_date));

        // Validate maximum attendees
        $max_attendees = isset($data->max_attendees) ? (int)$data->max_attendees : null;
        if ($max_attendees !== null && $max_attendees <= 0) {
            return $this->sendPayload(null, 'failed', "Maximum attendees must be a positive number.", 400);
        }

        // Validate event date order
        if ($event_start_date >= $event_end_date) {
            return $this->sendPayload(null, 'failed', "Event start date must be before event end date.", 400);
        }

        // Validate registration date order if provided
        if (isset($data->event_registration_start) && isset($data->event_registration_end)) {
            $event_registration_start = date('Y-m-d H:i:s', strtotime($data->event_registration_start));
            $event_registration_end = date('Y-m-d H:i:s', strtotime($data->event_registration_end));

            if ($event_registration_start >= $event_registration_end) {
                return $this->sendPayload(null, 'failed', "Registration start date must be before registration end date.", 400);
            }

            if ($event_registration_start >= $event_start_date) {
                return $this->sendPayload(null, 'failed', "Registration start date must be before start of the event", 400);
            }
        }

        // Check if an event with the same name and organizer overlaps in time
        $sql_check = "SELECT COUNT(*) AS count FROM events 
                    WHERE event_name = ? 
                    AND organizer_name = ?
                    AND NOT (event_end_date <= ? OR event_start_date >= ?)";

        try {
            $stmt_check = $this->pdo->prepare($sql_check);
            $stmt_check->execute([
                $event_name,
                $organizer_name,
                $event_start_date,
                $event_end_date
            ]);

            $result = $stmt_check->fetch(PDO::FETCH_ASSOC);
            if ($result['count'] > 0) {
                return $this->sendPayload(null, 'failed', "Event with same name and organizer overlaps in time.", 400);
            }

            $target_participants = [];
            if ($data->participation_type !== 'open' && !empty($data->target_participants)) {
                foreach ($data->target_participants as $department => $year_levels) {
                    if (!empty($year_levels)) {
                        $target_participants[] = [
                            'department' => $department,
                            'year_levels' => implode(', ', $year_levels)
                        ];
                    }
                }
            }

            // Proceed with inserting the new event
            $sql_insert = "INSERT INTO events (event_name, event_description, event_location, event_start_date, event_end_date, 
                            event_registration_start, event_registration_end, event_type, max_attendees, categories, organizer_user_id, organizer_organization,organizer_name, target_participants, participation_type)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

            $stmt_insert = $this->pdo->prepare($sql_insert);
            $stmt_insert->execute([
                $event_name,
                $data->event_description ?? null,
                $data->event_location ?? null,
                $event_start_date,
                $event_end_date,
                isset($data->event_registration_start) ? date('Y-m-d H:i:s', strtotime($data->event_registration_start)) : null,
                isset($data->event_registration_end) ? date('Y-m-d H:i:s', strtotime($data->event_registration_end)) : null,
                $data->event_type ?? 'physical',
                (int)($data->max_attendees ?? null),
                json_encode($data->categories) ?? null,
                $organizer_user_id,
                $organizer_organization,
                $organizer_name,
                !empty($target_participants) ? json_encode($target_participants) : null,
                $data->participation_type ?? 'open',
            ]);



            $event_id = $this->pdo->lastInsertId();
            if ($event_id) {
                $sql_approval = "INSERT INTO event_approval (event_id, status, notified_at) VALUES (?, 'Pending', NOW())";
                $stmt_approval = $this->pdo->prepare($sql_approval);
                $stmt_approval->execute([$event_id]);

                return $this->sendPayload(['event_id' => $event_id], 'success', "Event added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add event.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function editEvent($data, $event_id)
    {
        // Sanitize and validate input data
        $event_name = htmlspecialchars($data->event_name ?? '', ENT_QUOTES, 'UTF-8');
        $event_description = htmlspecialchars($data->event_description ?? '', ENT_QUOTES, 'UTF-8');
        $event_location = htmlspecialchars($data->event_location ?? '', ENT_QUOTES, 'UTF-8');
        $event_start_date = date('Y-m-d H:i:s', strtotime($data->event_start_date));
        $event_end_date = date('Y-m-d H:i:s', strtotime($data->event_end_date));
        $event_registration_start = isset($data->event_registration_start) ? date('Y-m-d H:i:s', strtotime($data->event_registration_start)) : null;
        $event_registration_end = isset($data->event_registration_end) ? date('Y-m-d H:i:s', strtotime($data->event_registration_end)) : null;
        $event_type = htmlspecialchars($data->event_type ?? 'physical', ENT_QUOTES, 'UTF-8');
        $max_attendees = isset($data->max_attendees) ? (int)$data->max_attendees : null;
        $categories = isset($data->categories) ? json_encode($data->categories) : null;
        $organizer_name = $data->organizer_name ?? ''; // No escaping here
        $participation_type = htmlspecialchars($data->participation_type ?? 'open', ENT_QUOTES, 'UTF-8');

        // Validate maximum attendees
        if ($max_attendees !== null && $max_attendees <= 0) {
            return $this->sendPayload(null, 'failed', "Maximum attendees must be a positive number.", 400);
        }

        // Date validations
        if ($event_start_date >= $event_end_date) {
            return $this->sendPayload(null, 'failed', "Event start date must be before event end date.", 400);
        }
        if ($event_registration_start && $event_registration_end && $event_registration_start >= $event_registration_end) {
            return $this->sendPayload(null, 'failed', "Registration start date must be before registration end date.", 400);
        }
        if ($event_registration_start && $event_start_date && $event_registration_start >= $event_start_date) {
            return $this->sendPayload(null, 'failed', "Registration start date must be before start of the event.", 400);
        }

        // Prepare target participants
        $target_participants = [];
        if ($participation_type !== 'open' && !empty($data->target_participants)) {
            foreach ($data->target_participants as $department => $year_levels) {
                if (!empty($year_levels)) {
                    $target_participants[] = [
                        'department' => $department,
                        'year_levels' => implode(', ', $year_levels)
                    ];
                }
            }
        }

        // Update event details in the database
        $sql = "UPDATE events SET event_name = :event_name, event_description = :event_description, event_location = :event_location,
            event_start_date = :event_start_date, event_end_date = :event_end_date, event_registration_start = :event_registration_start,
            event_registration_end = :event_registration_end, event_type = :event_type, max_attendees = :max_attendees, categories = :categories,
            organizer_name = :organizer_name, target_participants = :target_participants, participation_type = :participation_type
            WHERE event_id = :event_id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':event_name' => $event_name,
                ':event_description' => $event_description,
                ':event_location' => $event_location,
                ':event_start_date' => $event_start_date,
                ':event_end_date' => $event_end_date,
                ':event_registration_start' => $event_registration_start,
                ':event_registration_end' => $event_registration_end,
                ':event_type' => $event_type,
                ':max_attendees' => $max_attendees,
                ':categories' => $categories,
                ':organizer_name' => htmlspecialchars($organizer_name, ENT_QUOTES, 'UTF-8'), // Escape here
                ':target_participants' => json_encode($target_participants),
                ':participation_type' => $participation_type,
                ':event_id' => $event_id
            ]);

            return $this->sendPayload(null, 'success', 'Event updated successfully.', 200);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', 'Failed to update event.', 500);
        }
    }


    public function deleteEvent($event_id)
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

            // Check if the event and registrations deletion were successful
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

    public function uploadEvent($event_id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);

        $sql = "UPDATE events SET event_image = ? WHERE event_id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $fileData,
                $event_id
            ]);
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function cancelEvent($event_id, $cancellation_reason)
    {
        $insertCancellationSql = "INSERT INTO event_cancellations (event_id, cancelled_at, cancellation_reason) VALUES (?, NOW(), ?)";
        $updateEventSql = "UPDATE events SET is_cancelled = 1 WHERE event_id = ?";

        $fetchRegisteredUsersSql = "SELECT u.email
        FROM event_registration AS er
        JOIN user AS u ON er.user_id = u.user_id
        WHERE er.event_id = ?";

        $mail = initializeMailer();

        try {
            $stmt = $this->pdo->prepare($insertCancellationSql);
            $stmt->execute([$event_id, $cancellation_reason]);

            $stmt = $this->pdo->prepare($updateEventSql);
            $stmt->execute([$event_id]);

            $stmt = $this->pdo->prepare($fetchRegisteredUsersSql);
            $stmt->execute([$event_id]);
            $registeredUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $organizerDetails = $this->getOrganizerDetails();
            if ($organizerDetails) {
                $organizer_email = $organizerDetails['email'];
                $organizer_name = $organizerDetails['first_name'] . ' ' . $organizerDetails['last_name'];

                foreach ($registeredUsers as $user) {
                    $to = $user['email'];
                    $subject = "Event Cancellation Notification";
                    $message = "Dear User,<br>The event has been cancelled due to the following reason:<br>$cancellation_reason<br>We apologize for any inconvenience caused.";

                    $mail->setFrom($organizer_email, $organizer_name);
                    $mail->addAddress($to);
                    $mail->Subject = $subject;
                    $mail->Body = nl2br($message);

                    if ($mail->send()) {
                        echo 'Email sent successfully to ' . $to . '<br>';
                    } else {
                        error_log('Mailer Error: ' . $mail->ErrorInfo);
                    }

                    $mail->clearAddresses();
                    $mail->clearAttachments();
                }
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "Failed to fetch organizer details.", 500);
            }

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event cancelled successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to cancel event.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function getOrganizerDetails($role_id = 2)
    {
        $sql = "SELECT email, first_name, last_name FROM user WHERE role_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$role_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result;
        } else {
            return null;
        }
    }
}
