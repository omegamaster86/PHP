<?php

namespace App\Logging;
use Monolog\Formatter\LineFormatter;
use Monolog\Logger;
use Monolog\Processor\IntrospectionProcessor;

class CustomizeFormatter
{
    public function __invoke($logger)
    {
        //$uidprocessor = app()->make('Monolog\Processor\UidProcessor');
        $format = "[%datetime%] [%level_name%] - %extra.class%@%extra.function%(Line.%extra.line%) - %message%" . PHP_EOL;
        $dateFormat = "Y-m-d H:i:s.v";
        $lineFormatter = new LineFormatter($format, $dateFormat, true, true);
        $introspectionProcessor = new IntrospectionProcessor(Logger::DEBUG, ['Illuminate\\']);

        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter($lineFormatter);
            $handler->pushProcessor($introspectionProcessor);
            //$handler->pushProcessor($uidprocessor);
        }
    }
}