<?php

declare(strict_types=1);
require dirname(__DIR__, 2) . '/server/contact/handler.php';

$directory = sys_get_temp_dir() . '/hydraboost-contact-test-' . bin2hex(random_bytes(8));
$config = [
    'RESEND_API_KEY' => 're_test_not_a_real_key',
    'CONTACT_FROM_EMAIL' => 'info@hydraboost-infuzije.rs',
    'CONTACT_RATE_SECRET' => str_repeat('test-only-', 8),
    'CONTACT_ALLOWED_ORIGIN' => 'https://www.hydraboost-infuzije.rs',
    'CONTACT_STATE_DIR' => $directory,
];
$server = [
    'REQUEST_METHOD' => 'POST', 'CONTENT_TYPE' => 'application/json',
    'HTTP_ORIGIN' => $config['CONTACT_ALLOWED_ORIGIN'], 'REMOTE_ADDR' => '192.0.2.1',
    'HTTP_IDEMPOTENCY_KEY' => '36e32e36-f41d-4dfc-b4e2-d11576ab0e73',
];
$data = ['fullName' => '  Ana Anić  ', 'phone' => '+381 (65) 369-8376', 'email' => ' ana@example.com ', 'location' => ' Vračar ', 'message' => "Termin sutra.\nHvala!", 'website' => ''];
$count = 0;
$checks = 0;
$sent = [];
$send = function ($email, $key, $idempotency) use (&$count, &$sent): bool { ++$count; $sent = [$email, $key, $idempotency]; return true; };
function check(bool $condition, string $label): void {
    global $checks;
    if (!$condition) throw new RuntimeException('FAIL: ' . $label);
    ++$checks;
    echo 'PASS: ' . $label . "\n";
}
function request(array $data, array $serverOverrides = [], array $configOverrides = [], ?callable $sender = null): array {
    global $server, $config, $send;
    return contact_handle(array_replace($server, $serverOverrides), json_encode($data, JSON_UNESCAPED_UNICODE), array_replace($config, $configOverrides), $sender ?? $send);
}
try {
    $acceptedBody = '{"id":"36e32e36-f41d-4dfc-b4e2-d11576ab0e73"}';
    check(contact_provider_accepted(true, 200, $acceptedBody), 'provider requires valid message ID');
    foreach ([[false, 200, $acceptedBody], [true, 500, $acceptedBody], [true, 200, '{}'], [true, 200, '<html>OK</html>'], [true, 200, '{"id":"fake"}'], [true, 200, '{"id":"------------------------------------"}']] as $responseCase) {
        check(!contact_provider_accepted(...$responseCase), 'malformed/failed provider response rejected');
    }
    $response = request($data);
    check($response[0] === 200 && $response[1] === ['ok' => true, 'status' => 'accepted'] && $count === 1, 'acceptance follows transport');
    check($sent[0]['to'] === ['info@hydraboost-infuzije.rs'] && $sent[0]['from'] === 'HydraBoost Infuzije <info@hydraboost-infuzije.rs>', 'fixed recipient and configured From');
    check($sent[0]['reply_to'] === 'ana@example.com' && str_contains($sent[0]['text'], 'Ana Anić') && str_contains($sent[0]['text'], 'Vračar'), 'trimmed UTF-8 body and Reply-To');
    check($sent[2] === $server['HTTP_IDEMPOTENCY_KEY'], 'idempotency forwarded');
    request(array_replace($data, ['email' => '']));
    check(!isset($sent[0]['reply_to']), 'email remains optional');
    foreach ([
        ['fullName' => '    '], ['fullName' => str_repeat('x', 101)], ['message' => str_repeat('x', 3001)],
        ['message' => '          '], ['phone' => '+1234567890123456'], ['phone' => 'abc12345678'],
        ['email' => 'a@bad'], ['email' => "a@example.com\r\nBcc: spam@example.com"],
        ['fullName' => "Ana\r\nBcc: spam@example.com"], ['website' => 'https://spam.invalid'], ['to' => 'attacker@example.com'],
        ['location' => []], ['email' => null],
    ] as $index => $override) {
        check(request(array_replace($data, $override))[0] === 422, 'reject invalid payload #' . $index);
    }
    check($count === 2, 'validation and honeypot never invoke provider');
    foreach (['null', '[]', '{bad json}', '{"fullName":"Ana"}'] as $body) {
        check(contact_handle($server, $body, $config, $send)[0] === 422, 'reject malformed/incomplete body');
    }
    check(request($data, ['REQUEST_METHOD' => 'GET'])[0] === 405, 'POST only');
    check(request($data, ['CONTENT_TYPE' => 'text/plain'])[0] === 415, 'JSON only');
    check(request($data, ['HTTP_ORIGIN' => 'https://evil.invalid'])[0] === 403, 'foreign origin rejected');
    check(request($data, ['HTTP_ORIGIN' => ''])[0] === 403, 'missing origin rejected');
    check(request($data, ['HTTP_SEC_FETCH_SITE' => 'cross-site'])[0] === 403, 'cross-site rejected');
    check(request($data, ['HTTP_IDEMPOTENCY_KEY' => "bad\r\nHeader: x"])[0] === 400, 'unsafe key rejected');
    check(contact_handle($server, str_repeat('x', CONTACT_MAX_BODY + 1), $config, $send)[0] === 413, 'body limit');
    check(request($data, [], ['RESEND_API_KEY' => ''])[0] === 503, 'missing credentials fail closed');
    check(request($data, [], ['CONTACT_FROM_EMAIL' => 'visitor@gmail.com'])[0] === 503, 'foreign sender rejected');
    check(request($data, [], [], fn () => false)[0] === 502, 'provider failure never reports success');
    request($data); request($data);
    $limited = request($data, ['HTTP_X_FORWARDED_FOR' => '192.0.2.2']);
    check($limited[0] === 429 && $limited[2]['Retry-After'] === '900', 'persistent IP limit ignores spoofed proxy header');
    $stored = file_get_contents($directory . '/rate.json');
    check(!str_contains($stored, '192.0.2.1') && !str_contains($stored, 'Ana') && strlen($stored) < 262144, 'rate storage contains no message/plain IP');
    $events = array_fill(0, 60, ['time' => time(), 'ip' => 'other']);
    file_put_contents($directory . '/rate.json', json_encode($events));
    check(request($data, ['REMOTE_ADDR' => '192.0.2.99'])[0] === 429, 'global hourly cap');
    file_put_contents($directory . '/rate.json', json_encode([['time' => time() - 3601, 'ip' => 'old']]));
    check(request($data)[0] === 200, 'old rate entries expire');
    check(count(json_decode(file_get_contents($directory . '/rate.json'), true)) === 1, 'expired hashes pruned');
    echo "\n{$checks} backend assertions passed. No external email sent.\n";
} finally {
    @unlink($directory . '/rate.json');
    @rmdir($directory);
}
