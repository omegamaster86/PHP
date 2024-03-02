<?php

namespace App\Logging;
//use Hikaeme\Monolog\Formatter\LtsvFormatter;
use Monolog\Formatter\LineFormatter;
use Monolog\Logger;
use Monolog\Processor\IntrospectionProcessor;
use Monolog\Processor\WebProcessor;

class ActionLogFormatter
{
    public function __invoke($logger)
    {
        $format = $format = "[%datetime%] %level_name% %message% %context% url=%extra.url% method=%extra.http_method% \n";
        $dateFormat = "Y-m-d H:i:s.v";
        $lineFormatter = new LineFormatter($format, $dateFormat, true, true);
        $webProcessor = new WebProcessor();
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter($lineFormatter);
            $handler->pushProcessor($webProcessor);
        }
    }
}