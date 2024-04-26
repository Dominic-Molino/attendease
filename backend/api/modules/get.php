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

    public function getStudentId($student_id = null)
    {
        $conditions = ($student_id !== null) ? "student_id=$student_id" : null;
        return $this->getRecords('students', $conditions);
    }
}
