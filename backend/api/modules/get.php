<?php

require_once 'global.php';

class Get extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    private function get_records($table, $conditions = null)
    {
        $sqlStr = "SELECT * FROM $table";
        if ($conditions != null) {
            $sqlStr = $sqlStr . " WHERE " . $conditions;
        }
        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            // Check if the table contains BLOB data
            if ($table == 'submissions' && isset($result['data'][0]['file_data'])) {
                return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code'], true);
            } else {
                return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
            }
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }

    private function executeQuery($sql)
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            $statement = $this->pdo->query($sql);
            if ($statement) {
                $result = $statement->fetchAll(PDO::FETCH_ASSOC);
                foreach ($result as $record) {
                    // Handle BLOB data
                    if (isset($record['file_data'])) {

                        $record['file_data'] = base64_encode($record['file_data']);
                    }
                    array_push($data, $record);
                }
                $code = 200;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found.";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
    }

    public function get_users($student_id = null)
    {
        $condition = null;
        if ($student_id != null) {
            $condition = "student_id=$student_id";
        }
        return $this->get_records('students', $condition);
    }

    public function get_student($student_id = null)
    {
        $condition = ($student_id !== null) ? "student_id = $student_id" : null;
        $result = $this->get_records('students', $condition);

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

    public function get_events($event_id = null)
    {
        $condition = null;
        if ($event_id != null) {
            $condition = "event_id=$event_id";
        }
        return $this->get_records('events', $condition);
    }
}
