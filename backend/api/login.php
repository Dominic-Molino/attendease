<?php

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('ALLOW: POST');
    exit();
}

$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';


if ($contentType !== 'application/json') {
    http_response_code(415);
    echo json_encode(["message" => "Only JSON content is supported"]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if ($data === null) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid JSON data"]);
    exit();
}


if (!array_key_exists('email', $data) || !array_key_exists('password', $data)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing login credentials"]);
    exit();
}


//create a class instance called $user_gateway and pass our $database connection to it. 
// $user_gateway = new UserGateway($database);

//retrieve user data based on the provided username from the $user_gateway instance using the getByUsername() method.
$user = $user_gateway->getByEmail($data['email']);

//if no user is found
if ($user === false) {
    http_response_code(401);
    echo json_encode(["message" => "invalid authentication"]);
    exit;
}

//note: *we validate the provided password against the hashed password stored in the user data.*

//if the password verification fails
if (!password_verify($data['password'], $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["message" => "invalid authentication"]);
    exit;
}

//note: *If authentication is successful, we construct a payload containing the user's ID and name.*

$payload = [
    "id" => $user['user_id'],
    "email" => $user["email"]
];

//we create a JWT token by encoding the payload using the Jwt class instantiated with the secret key from the environment variables.
$JwtController = new Jwt($_ENV["SECRET_KEY"]);

$token = $JwtController->encode($payload);

//finally, we respond with this generated token in JSON format
echo json_encode(["token" => $token]);

// $user = new UserGateway($database);


// $gateway = new StudentGateway($database);

// $controller = new StudentController($gateway);


$controller->processRequest($_SERVER['REQUEST_METHOD']);
