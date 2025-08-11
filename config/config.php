<?php

return [
    'database_path' => __DIR__.'/../' . $_ENV['DB_NAME'],
    'gemini' => [
        'api_key' => $_ENV['GEMINI_API_KEY'] ?? '',
        'url' => $_ENV['GEMINI_URL'] ?? 'https://generativelanguage.googleapis.com/v1beta/models',
    ],
    'flux' => [
        'api_key' => $_ENV['FLUX_API_KEY'] ?? '',
        'url' => $_ENV['FLUX_URL'] ?? 'https://api.bfl.ai/v1/flux-kontext-pro',
    ],
];