<?php
// Copy to config.php ONLY inside /home/CPANEL_USER/hydraboost-private/contact/.
// Never place a populated copy in public_html, Angular assets, or Git.
return [
    'RESEND_API_KEY' => '', // Resend > API Keys > Sending access, restricted to verified domain.
    'CONTACT_FROM_EMAIL' => 'info@hydraboost-infuzije.rs', // Verify this domain in Resend first.
    'CONTACT_RATE_SECRET' => '', // Generate: openssl rand -hex 32
    'CONTACT_ALLOWED_ORIGIN' => 'https://www.hydraboost-infuzije.rs',
    // Optional: defaults to __DIR__ . '/state'; must be private and writable by PHP.
    // 'CONTACT_STATE_DIR' => __DIR__ . '/state',
];
