<?php

declare(strict_types=1);

ini_set('display_errors', '0');
$handler = dirname(__DIR__, 2) . '/hydraboost-private/contact/handler.php';
if (!is_file($handler)) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    echo '{"ok":false}';
    exit;
}
require $handler;
contact_respond();
