<?php
// Test-only adapter. Never copied into deploy. It exercises the real PHP HTTP handler.
require dirname(__DIR__, 2) . '/server/contact/handler.php';
if (parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) !== '/api/contact') {
    http_response_code(404);
    exit;
}
$config = [
    'RESEND_API_KEY' => 're_test_not_a_real_key',
    'CONTACT_FROM_EMAIL' => 'info@hydraboost-infuzije.rs',
    'CONTACT_RATE_SECRET' => str_repeat('test-only-', 8),
    'CONTACT_ALLOWED_ORIGIN' => 'http://127.0.0.1:4000',
    'CONTACT_STATE_DIR' => getenv('CONTACT_TEST_STATE_DIR'),
];
contact_respond($config, static function ($email, $key, $idempotency): bool {
    file_put_contents(getenv('CONTACT_TEST_STATE_DIR') . '/captured.json', json_encode(['email' => $email, 'idempotency' => $idempotency]));
    return !str_contains($email['text'], 'SIMULATE_PROVIDER_FAILURE');
});
