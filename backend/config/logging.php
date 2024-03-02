<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;
use Monolog\Processor\PsrLogMessageProcessor;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Log Channel
    |--------------------------------------------------------------------------
    |
    | This option defines the default log channel that gets used when writing
    | messages to the logs. The name specified in this option should match
    | one of the channels defined in the "channels" configuration array.
    |
    */

    'default' => env('LOG_CHANNEL', 'stack'),

    /*
    |--------------------------------------------------------------------------
    | Deprecations Log Channel
    |--------------------------------------------------------------------------
    |
    | This option controls the log channel that should be used to log warnings
    | regarding deprecated PHP and library features. This allows you to get
    | your application ready for upcoming major versions of dependencies.
    |
    */

    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Log Channels
    |--------------------------------------------------------------------------
    |
    | Here you may configure the log channels for your application. Out of
    | the box, Laravel uses the Monolog PHP logging library. This gives
    | you a variety of powerful log handlers / formatters to utilize.
    |
    | Available Drivers: "single", "daily", "slack", "syslog",
    |                    "errorlog", "monolog",
    |                    "custom", "stack"
    |
    */

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['single'],
            'ignore_exceptions' => false,
        ],

        'single' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'tap' => ['App\Logging\CustomizeFormatter'],
            'replace_placeholders' => true,
        ],

        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
            'tap' => ['App\Logging\CustomizeFormatter'],
            'replace_placeholders' => true,
        ],

        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => 'Laravel Log',
            'emoji' => ':boom:',
            'level' => env('LOG_LEVEL', 'critical'),
            'replace_placeholders' => true,
        ],

        'papertrail' => [
            'driver' => 'monolog',
            'level' => env('LOG_LEVEL', 'debug'),
            'handler' => env('LOG_PAPERTRAIL_HANDLER', SyslogUdpHandler::class),
            'handler_with' => [
                'host' => env('PAPERTRAIL_URL'),
                'port' => env('PAPERTRAIL_PORT'),
                'connectionString' => 'tls://'.env('PAPERTRAIL_URL').':'.env('PAPERTRAIL_PORT'),
            ],
            'processors' => [PsrLogMessageProcessor::class],
        ],

        'stderr' => [
            'driver' => 'monolog',
            'level' => env('LOG_LEVEL', 'debug'),
            'handler' => StreamHandler::class,
            'formatter' => env('LOG_STDERR_FORMATTER'),
            'with' => [
                'stream' => 'php://stderr',
            ],
            'processors' => [PsrLogMessageProcessor::class],
        ],

        'syslog' => [
            'driver' => 'syslog',
            'level' => env('LOG_LEVEL', 'debug'),
            'facility' => LOG_USER,
            'replace_placeholders' => true,
        ],

        'errorlog' => [
            'driver' => 'errorlog',
            'level' => env('LOG_LEVEL', 'debug'),
            'replace_placeholders' => true,
        ],

        'null' => [
            'driver' => 'monolog',
            'handler' => NullHandler::class,
        ],

        'emergency' => [
            'path' => storage_path('logs/laravel.log'),
        ],
        'custom' => [
            'driver' => 'single',
            'path' => storage_path('logs/custom.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'user_register' => [
            'driver' => 'single',
            'path' => storage_path('logs/user_register.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'user_password_change' => [
            'driver' => 'single',
            'path' => storage_path('logs/user_password_change.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'user_password_reset' => [
            'driver' => 'single',
            'path' => storage_path('logs/user_password_reset.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'user_login_access_log' => [
            'driver' => 'single',
            'path' => storage_path('logs/user_login_access_log.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'user_update' => [
            'driver' => 'single',
            'path' => storage_path('logs/user_update.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'user_delete' => [
            'driver' => 'single',
            'path' => storage_path('logs/user_delete.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'contact_us' => [
            'driver' => 'single',
            'path' => storage_path('logs/contact_us.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'player_register' => [
            'driver' => 'single',
            'path' => storage_path('logs/player_register.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'player_update' => [
            'driver' => 'single',
            'path' => storage_path('logs/player_update.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'player_delete' => [
            'driver' => 'single',
            'path' => storage_path('logs/player_delete.log'),
            'level' => env('LOG_LEVEL', 'debug')
        ],
        'organizations' => [
            'driver' => 'daily',
            'path' => storage_path('logs/organizations.log'),
            'tap' => ['App\Logging\CustomizeFormatter'],
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
        ],
        'action' => [
            'driver' => 'daily',
            'path' => storage_path('logs/action.log'),
            'tap' => ['App\Logging\ActionLogFormatter'],
            'level' => 'debug',
            'days' => 14,
        ],
        
    ],

    /*
    |--------------------------------------------------------------------------
    | SQL Log
    |--------------------------------------------------------------------------
    */

    'sql' => [
        'enable' => env('LOG_SQL_ENABLE', false),
        'slow_query_time' => env('LOG_SQL_SLOW_QUERY_TIME', 2000), // ms
    ],
    

];
