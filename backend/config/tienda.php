<?php
return [
    'jwt' => env('JWT_SECRET'),
    'stripe' => env('STRIPE_SECRET'),
    'webhook' => env('STRIPE_WEBHOOK_SECRET'),
];
