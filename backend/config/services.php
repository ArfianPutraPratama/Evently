<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'midtrans' => [
        'merchant_id' => env('MIDTRANS_MERCHANT_ID', 'G441882517'),
        'client_key' => env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-Qx6UwA5DFHHUPt2B'),
        'server_key' => env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-pk8dlBip3clCK6pGOmkSAF18'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    ],

];
