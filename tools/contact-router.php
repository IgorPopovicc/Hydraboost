<?php
// Local PHP development only. Never copied to the deployment artifact.
if (parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) !== '/api/contact') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/server/contact/handler.php';
contact_respond();
