<?php

class GlobalMethods
{
    public function sendPayload($data, $remarks, $message, $code)
    {
        $status = array("remarks" => $remarks, "message" => $message);
        http_response_code($code);
        return array(
            "status" => $status,
            "payload" => $data,
            "prepared_by" => "Dominic Molino",
            "timestamp" => date_create()
        );
    }
}
