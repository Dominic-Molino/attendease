<?php

require_once 'global.php';

class Post extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
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
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function loginStudent($data)
    {
        $email = $data->email;
        $password = $data->pwd;

        $sql = "SELECT * FROM students WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if (password_verify($password, $user['pwd'])) {
                return $this->sendPayload(null, 'success', 'Login successful', 200);
            } else {
                return $this->sendPayload(null, 'failed', 'Incorrect password', 401);
            }
        } else {
            return $this->sendPayload(null, 'failed', 'User not found', 404);
        }
    }

    // public function addUser($data)

    // {
    //     $sql = "INSERT INTO user(first_name, last_name, year_level, block, course, email, password) VALUES(?, ?, ?, ?, ?, ?, ?)";

    //     $stmt = $this->pdo->prepare($sql);
    //     try {
    //         $stmt->execute([
    //             $data->first_name,
    //             $data->last_name,
    //             $data->year_level,
    //             $data->block,
    //             $data->course,
    //             $data->email,
    //             $data->password,
    //         ]);

    //         return $this->sendPayload(null, 'success', "User added successfully.", 200);
    //         // if ($stmt->rowCount() > 0) {
    //         // } else {
    //         //     return $this->sendPayload(null, 'failed', "Failed to add student.", 500);
    //         // }
    //     } catch (PDOException $e) {
    //         return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    //     }
    // }


    // public function editUser($data, $user_id)
    // {
    //     $first_name = $data->first_name;
    //     $last_name = $data->last_name;
    //     $year_level = $data->year_level;
    //     $block = $data->block;
    //     $course = $data->course;
    //     $email = $data->email;

    //     $sql = "UPDATE user SET first_name = ?, last_name = ?, year_level = ?, block = ?, course = ?, email = ? WHERE user_id = ? ";

    //     try {
    //         $stmt = $this->pdo->prepare($sql);
    //         $stmt->execute([$first_name, $last_name, $year_level, $course, $block, $email, $user_id]);

    //         if ($stmt->rowCount() > 0) {
    //             return $this->sendPayload(null, 'success', "User updated successfully.", 200);
    //         } else {
    //             return $this->sendPayload(null, 'failed', "Failed to update user.", 500);
    //         }
    //     } catch (PDOException $e) {
    //         return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    //     }
    // }

    // public function addEvent($data)
    // {
    //     $event_name = $data->event_name;
    //     $event_description = $data->event_description;
    //     $event_location = $data->event_location;
    //     $event_create_date = $data->event_create_date;
    //     $event_start_date = $data->event_start_date;
    //     $event_end_date = $data->event_end_date;
    //     $event_registration_start = $data->event_registration_start;
    //     $event_registration_end = $data->event_registration_end;
    //     $event_status = $data->event_status;
    //     $requirement_id = $data->requirement_id;
    //     $session_id = $data->session_id;

    //     $sql = "INSERT INTO events(event_name,event_description, event_location, event_create_date, event_start_date, event_end_date, event_registration_start, event_registration_end, event_status, requirement_id, session_id) VALUES (:event_name, :event_description, :event_location, :event_create_date, :event_start_date, :event_end_date, :event_registration_start, :event_registration_end, :event_status,  :requirement_id, :session_id)";

    //     try {
    //         $stmt = $this->pdo->prepare($sql);
    //         $stmt->bindParam(':event_name', $event_name);
    //         $stmt->bindParam(':event_description', $event_description);
    //         $stmt->bindParam(':event_location', $event_location);
    //         $stmt->bindParam(':event_create_date', $event_create_date);
    //         $stmt->bindParam(':event_start_date', $event_start_date);
    //         $stmt->bindParam(':event_end_date', $event_end_date);
    //         $stmt->bindParam(':event_registration_start', $event_registration_start);
    //         $stmt->bindParam(':event_registration_end', $event_registration_end);
    //         $stmt->bindParam(':event_status', $event_status);
    //         $stmt->bindParam(':requirement_id', $requirement_id);
    //         $stmt->bindParam(':session_id', $session_id);
    //         $stmt->execute();

    //         if ($stmt->rowCount() > 0) {
    //             return $this->sendPayload(null, 'success', "Event added successfully.", 200);
    //         } else {
    //             return $this->sendPayload(null, 'failed', "Failed to add event.", 500);
    //         }
    //     } catch (PDOException $e) {
    //         return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    //     }
    // }

    // public function editEvent($data, $event_id)
    // {
    //     $event_name = $data->event_name;
    //     $event_description = $data->event_description;
    //     $event_location = $data->event_location;
    //     $event_create_date = $data->event_create_date;
    //     $event_start_date = $data->event_start_date;
    //     $event_end_date = $data->event_end_date;
    //     $event_registration_start = $data->event_registration_start;
    //     $event_registration_end = $data->event_registration_end;
    //     $event_status = $data->event_status;
    //     $requirement_id = $data->requirement_id;
    //     $session_id = $data->session_id;

    //     $sql = "UPDATE events SET event_name = ?,event_description = ?, event_location = ?, event_create_date = ?, event_start_date = ?, event_end_date = ?, event_registration_start = ?, event_registration_end = ?, event_status = ?, requirement_id = ?, session_id = ? WHERE event_id = ?";

    //     try {
    //         $stmt = $this->pdo->prepare($sql);
    //         $stmt->execute([$event_name, $event_description, $event_location, $event_create_date, $event_start_date, $event_end_date, $event_registration_start, $event_registration_end, $event_status, $requirement_id, $session_id, $event_id]);

    //         if ($stmt->rowCount() > 0) {
    //             return $this->sendPayload(null, 'success', "User updated successfully.", 200);
    //         } else {
    //             return $this->sendPayload(null, 'failed', "Failed to update user.", 500);
    //         }
    //     } catch (PDOException $e) {
    //         return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    //     }
    // }

    // public function deleteEvent($event_id)
    // {
    //     $sql = "DELETE FROM events WHERE event_id = ?";

    //     try {
    //         $stmt = $this->pdo->prepare($sql);
    //         $stmt->execute(
    //             [$event_id]
    //         );

    //         if ($stmt->rowCount() > 0) {
    //             return $this->sendPayload(null, 'success', "Event deleted successfully.", 200);
    //         } else {
    //             return $this->sendPayload(null, 'failed', "No event found with the given ID.", 404);
    //         }
    //     } catch (PDOException $e) {
    //         return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
    //     }
    // }


}
