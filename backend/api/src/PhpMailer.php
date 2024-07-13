<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . "/../../vendor/autoload.php";

function initializeMailer()
{
    $mail = new PHPMailer(true);
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->SMTPAuth = true;
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->Username = "dommolino28@gmail.com";
    $mail->Password = "dapzlvecgxoallyl";
    $mail->isHTML(true);
    return $mail;
}
