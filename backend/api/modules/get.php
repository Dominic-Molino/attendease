<?php

require_once 'global.php';

class Get extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }


    private function getRecords($table, $conditions = null)
    {
        $sql = "SELECT * FROM $table";

        if ($conditions != null) {
            $sql .= " WHERE " . $conditions;
        }
        return $this->executeQuery($sql);
    }

    private function executeQuery($sql)
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                $code = 200;
                return $this->sendPayload($data, 'success', "Successfully retrieved data.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "No data found.", 404);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function getStudent($student = null)
    {
        $conditions = null;
        if ($student != null) {
            $conditions = "student_id=$student";
        }
        return $this->getRecords('students', $conditions);
    }

    public function getLoggedinStudent($token)
    {
        if (isset($_SESSION['token']) && $_SESSION['token'] === $token) {
            $student_id = $_SESSION['student_id'];
            return $this->getStudentData($student_id);
        } else {
            return null;
        }
    }

    public function getAllEvents()
    {
        return $this->getRecords('events');
    }

    public function getStudentData($student_id)
    {
        $sql = "SELECT * FROM students WHERE student_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$student_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data;
    }

    public function getStudentInfo()
    {
        // Check if token exists in session storage
        if (isset($_SESSION['token'])) {
            // Retrieve token from session storage  
            $token = $_SESSION['token'];

            // Retrieve student information based on the token (assuming token is the student's ID)
            $sql = "SELECT * FROM students WHERE student_id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$token]); // Assuming token is the student ID
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($student) {
                // Student authenticated, return student information
                return $this->sendPayload($student, 'success', 'Student information retrieved', 200);
            } else {
                // Student not found, return error response
                return $this->sendPayload(null, 'failed', 'Unauthorized', 401);
            }
        } else {
            // Token not found in session storage, return error response
            return $this->sendPayload(null, 'failed', 'Unauthorized', 401);
        }
    }
}
