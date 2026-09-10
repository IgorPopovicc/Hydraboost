<?php

declare(strict_types=1);

const CONTACT_RECIPIENT = 'info@hydraboost-infuzije.rs';
const CONTACT_MAX_BODY = 16384;

function contact_config(): array
{
    $file = __DIR__ . '/config.php';
    $config = is_file($file) ? require $file : [];
    if (!is_array($config)) {
        throw new RuntimeException('config');
    }
    foreach (['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_ALLOWED_ORIGIN', 'CONTACT_RATE_SECRET'] as $key) {
        $environment = getenv($key);
        if ($environment !== false) {
            $config[$key] = $environment;
        }
    }
    $config['CONTACT_ALLOWED_ORIGIN'] ??= 'https://www.hydraboost-infuzije.rs';
    $config['CONTACT_STATE_DIR'] ??= __DIR__ . '/state';
    return $config;
}

function contact_email_valid(string $value): bool
{
    if (strlen($value) > 254 || !filter_var($value, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $parts = explode('@', $value);
    return strlen($parts[0]) <= 64
        && preg_match("/^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*$/D", $parts[0]) === 1
        && preg_match('/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/D', $parts[1]) === 1;
}

function contact_validate(string $body): ?array
{
    try {
        $decoded = json_decode($body, false, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        return null;
    }
    if (!$decoded instanceof stdClass) {
        return null;
    }
    $data = (array) $decoded;
    $limits = ['fullName' => [2, 100], 'phone' => [7, 40], 'email' => [0, 254], 'location' => [2, 200], 'message' => [10, 3000], 'website' => [0, 200]];
    if (array_diff(array_keys($data), array_keys($limits)) || count($data) !== count($limits)) {
        return null;
    }
    foreach ($limits as $field => [$min, $max]) {
        if (!isset($data[$field]) || !is_string($data[$field])) {
            return null;
        }
        $value = preg_replace('/^[\s\x{FEFF}]+|[\s\x{FEFF}]+$/u', '', $data[$field]);
        if ($value === null) {
            return null;
        }
        $length = strlen(mb_convert_encoding($value, 'UTF-16LE', 'UTF-8')) / 2;
        $controls = $field === 'message' ? '/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/' : '/[\x00-\x1f\x7f]/';
        if ($length < $min || $length > $max || preg_match($controls, $value)) {
            return null;
        }
        $data[$field] = $value;
    }
    $digits = preg_replace('/\D/', '', $data['phone']);
    if (!preg_match('/^\+?[\d\s()\/.-]+$/D', $data['phone']) || strlen($digits) < 7 || strlen($digits) > 15
        || ($data['email'] !== '' && !contact_email_valid($data['email'])) || $data['website'] !== '') {
        return null;
    }
    return $data;
}

// One bounded, locked state file: no personal messages or plain IP addresses on disk.
// Refuse sending if rate-limit storage is unavailable rather than bypassing protection.
function contact_allow_request(array $config, string $ip): bool
{
    $directory = $config['CONTACT_STATE_DIR'];
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('rate_storage');
    }
    $file = fopen($directory . '/rate.json', 'c+');
    if ($file === false) {
        throw new RuntimeException('rate_storage');
    }
    try {
        if (!flock($file, LOCK_EX)) {
            throw new RuntimeException('rate_lock');
        }
        $raw = stream_get_contents($file, 262145);
        if ($raw === false || strlen($raw) > 262144) {
            throw new RuntimeException('rate_storage');
        }
        $events = $raw === '' ? [] : json_decode($raw, true, 8, JSON_THROW_ON_ERROR);
        if (!is_array($events)) {
            throw new RuntimeException('rate_storage');
        }
        $now = time();
        $events = array_values(array_filter($events, fn ($event) => $event['time'] > $now - 3600));
        $ipHash = hash_hmac('sha256', $ip, $config['CONTACT_RATE_SECRET']);
        $recent = array_filter($events, fn ($event) => $event['ip'] === $ipHash && $event['time'] > $now - 900);
        if (count($events) >= 60 || count($recent) >= 5) {
            return false;
        }
        $events[] = ['time' => $now, 'ip' => $ipHash];
        $encoded = json_encode($events, JSON_THROW_ON_ERROR);
        if (!ftruncate($file, 0) || !rewind($file) || fwrite($file, $encoded) !== strlen($encoded) || !fflush($file)) {
            throw new RuntimeException('rate_storage');
        }
        return true;
    } finally {
        flock($file, LOCK_UN);
        fclose($file);
    }
}

function contact_email(array $data, string $sender): array
{
    $email = [
        'from' => 'HydraBoost Infuzije <' . $sender . '>',
        'to' => [CONTACT_RECIPIENT],
        'subject' => 'HydraBoost – Novi upit sa sajta',
        // Plain text avoids HTML injection and renders consistently in email clients.
        'text' => implode("\n", [
            'HydraBoost – Novi upit sa sajta', '',
            'Ime i prezime: ' . $data['fullName'],
            'Telefon: ' . $data['phone'],
            'E-pošta: ' . ($data['email'] ?: 'Nije navedena'),
            'Željena lokacija: ' . $data['location'], '',
            'Poruka:', $data['message'],
        ]),
    ];
    if ($data['email'] !== '') {
        $email['reply_to'] = $data['email'];
    }
    return $email;
}

function contact_provider_accepted(bool $completed, int $status, string $response): bool
{
    $decoded = json_decode($response, true);
    return $completed && $status >= 200 && $status < 300
        && is_array($decoded) && isset($decoded['id']) && is_string($decoded['id'])
        && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/Di', $decoded['id']) === 1
        && !isset($decoded['error']);
}

function contact_send_resend(array $email, string $key, string $idempotencyKey): bool
{
    $curl = curl_init('https://api.resend.com/emails');
    if ($curl === false) {
        throw new RuntimeException('transport');
    }
    $response = '';
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($email, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $key, 'Content-Type: application/json',
            'Idempotency-Key: hydraboost-contact/' . $idempotencyKey,
        ],
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 18,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$response): int {
            if (strlen($response) + strlen($chunk) > 65536) {
                return 0;
            }
            $response .= $chunk;
            return strlen($chunk);
        },
    ]);
    try {
        $completed = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $accepted = contact_provider_accepted($completed !== false, $status, $response);
        if (!$accepted) {
            error_log('HydraBoost contact: provider_rejected status=' . $status . ' transport=' . curl_errno($curl));
        }
        return $accepted;
    } finally {
        curl_close($curl);
    }
}

/** Test transport is dependency-injected only by the test harness; never from HTTP/config. */
function contact_handle(array $server, string $body, array $config, ?callable $send = null): array
{
    if (($server['REQUEST_METHOD'] ?? '') !== 'POST') {
        return [405, ['ok' => false], ['Allow' => 'POST']];
    }
    if (strlen($body) > CONTACT_MAX_BODY || (int) ($server['CONTENT_LENGTH'] ?? 0) > CONTACT_MAX_BODY) {
        return [413, ['ok' => false], []];
    }
    if (strtolower(trim(explode(';', $server['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        return [415, ['ok' => false], []];
    }
    if (($server['HTTP_ORIGIN'] ?? '') !== ($config['CONTACT_ALLOWED_ORIGIN'] ?? '')
        || ($server['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
        return [403, ['ok' => false], []];
    }
    $key = $server['HTTP_IDEMPOTENCY_KEY'] ?? '';
    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/Di', $key)) {
        return [400, ['ok' => false], []];
    }
    $data = contact_validate($body);
    if ($data === null) {
        return [422, ['ok' => false], []];
    }
    if (!preg_match('/^re_[a-zA-Z0-9_-]+$/D', $config['RESEND_API_KEY'] ?? '')
        || strlen($config['CONTACT_RATE_SECRET'] ?? '') < 32
        || !contact_email_valid($config['CONTACT_FROM_EMAIL'] ?? '')
        || !str_ends_with($config['CONTACT_FROM_EMAIL'], '@hydraboost-infuzije.rs')) {
        error_log('HydraBoost contact: configuration_missing_or_invalid');
        return [503, ['ok' => false], []];
    }
    // REMOTE_ADDR must be normalized by the hosting's trusted proxy configuration.
    // Never trust user-controlled X-Forwarded-For / CF-Connecting-IP here.
    if (!contact_allow_request($config, $server['REMOTE_ADDR'] ?? 'unknown')) {
        return [429, ['ok' => false], ['Retry-After' => '900']];
    }
    $send ??= 'contact_send_resend';
    if (!$send(contact_email($data, $config['CONTACT_FROM_EMAIL']), $config['RESEND_API_KEY'], $key)) {
        return [502, ['ok' => false], []];
    }
    return [200, ['ok' => true, 'status' => 'accepted'], []];
}

function contact_respond(?array $config = null, ?callable $send = null): void
{
    ini_set('display_errors', '0');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    try {
        $body = file_get_contents('php://input', false, null, 0, CONTACT_MAX_BODY + 1);
        if ($body === false) {
            throw new RuntimeException('body');
        }
        [$status, $response, $headers] = contact_handle($_SERVER, $body, $config ?? contact_config(), $send);
    } catch (Throwable) {
        // Never log payloads, addresses, API response bodies or credentials.
        error_log('HydraBoost contact: internal_failure');
        [$status, $response, $headers] = [503, ['ok' => false], []];
    }
    http_response_code($status);
    foreach ($headers as $name => $value) {
        header($name . ': ' . $value);
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}
