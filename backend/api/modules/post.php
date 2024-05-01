<?php

require_once 'global.php';

class Post extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function loginStudent($data)
    {
        $email = $data->email;
        $password = $data->pwd;

        $sql = "SELECT * FROM students WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($student) {
            if ($password == $student['pwd']) {

                return $this->sendPayload(null, 'success', 'Login successful', 200);
            } else {
                return $this->sendPayload(null, 'failed', 'Incorrect password', 401);
            }
        } else {
            return $this->sendPayload(null, 'failed', 'User not found', 404);
        }
    }

    public function addStudent($data)
    {
        $sql = "INSERT INTO students(first_name, last_name, year_level, student_block, course, email, pwd) VALUES (?,?,?,?,?,?,?)";

        $stmt = $this->pdo->prepare($sql);

        try {
            $stmt->execute([
                $data->first_name,
                $data->last_name,
                $data->year_level,
                $data->student_block,
                $data->course,
                $data->email,
                $data->pwd,
            ]);
            return $this->sendPayload(null, 'success', 'Student added successfully', 200);
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed",  $errmsg ?? "An error occurred", $code ?? 500);
    }

    public function editStudent($data, $student_id)
    {
        $sql = "UPDATE students SET first_name = ?, last_name = ?, year_level = ?, student_block = ?, course = ?, email = ? WHERE student_id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->first_name,
                $data->last_name,
                $data->year_level,
                $data->student_block,
                $data->course,
                $data->email,
                $student_id
            ]);
            return $this->sendPayload(null, 'success', 'Successfully updated student', 200);
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg ?? "An error occured", $code ?? 500);
    }

    public function addEvent($data)
    {
        $sql = "INSERT INTO events(event_name, event_description, event_location, event_start_date, event_end_date, event_mode, event_registration_start_date, event_registration_end_date, event_status, event_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $stmt = $this->pdo->prepare($sql);

            $stmt->execute([
                $data->event_name,
                $data->event_description,
                $data->event_location,
                $data->event_start_date,
                $data->event_end_date,
                $data->event_mode,
                $data->event_registration_start_date,
                $data->event_registration_end_date,
                $data->event_status,
                $data->event_image
            ]);
            return $this->sendPayload(null, 'success', "Event added successfully.", 200);
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed",  $errmsg ?? "An error occurred", $code ?? 500);
    }

    public function editEvent($data, $event_id)
    {
        $sql = "UPDATE events SET event_name = ?, event_description = ?, event_location = ?, event_start_date = ?, event_end_date = ?, event_mode = ?, event_registration_start_date = ?, event_registration_end_date = ?, event_status = ?, event_image = ? WHERE event_id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->event_name,
                $data->event_description,
                $data->event_location,
                $data->event_start_date,
                $data->event_end_date,
                $data->event_mode,
                $data->event_registration_start_date,
                $data->event_registration_end_date,
                $data->event_status,
                $data->event_image,
                $event_id
            ]);
            return $this->sendPayload(null, 'success', "Successfully update event", 200);
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed",  $errmsg ?? "An error occurred", $code ?? 500);
    }


    public function deleteEvent($event_id)
    {
        $sql = "DELETE FROM events WHERE event_id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [$event_id]
            );

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Event deleted successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "No event found with the given ID.", 404);
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed",  $errmsg ?? "An error occurred", $code ?? 500);
    }
}
