<?php
// Local PHP development only. Never copied to the deployment artifact.
if (!in_array(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), ['/api/contact', '/api/contact.php'], true)) {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/server/contact/handler.php';
contact_respond();
