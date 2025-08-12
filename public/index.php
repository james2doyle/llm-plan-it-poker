<?php

require __DIR__ . '/../vendor/autoload.php';

use Jamesdoyle\SwipePoker\CardCollection;
use Symfony\AI\Agent\Agent;
use Symfony\AI\Agent\StructuredOutput\AgentProcessor;
use Symfony\AI\Agent\StructuredOutput\ResponseFormatFactory;
use Symfony\AI\Platform\Bridge\Gemini\Gemini;
use Symfony\AI\Platform\Bridge\Gemini\PlatformFactory;
use Symfony\AI\Platform\Message\Message;
use Symfony\AI\Platform\Message\MessageBag;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ArrayDenormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

Flight::set('flight.log_errors', true);

Flight::map('config', function (string $name, $default = null) {
    $config = require __DIR__ . '/../config/config.php';
    return data_get($config, $name, $default);
});

// This is where you can register a database connection so you can use it in any of your routes below
Flight::register('db', \flight\database\PdoWrapper::class, ['sqlite:' . Flight::config('database_path')], function ($db) {
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
});

$router = Flight::router();

$router->get('/cards', function () {
    $platform = PlatformFactory::create(Flight::config('gemini.api_key'));
    $model = new Gemini('gemini-2.5-flash');

    // The serializer is used by the AgentProcessor to convert the JSON string from the model into the Cards object
    $serializer = new Serializer([new ObjectNormalizer(), new ArrayDenormalizer()], [new JsonEncoder()]);

    // Create the AgentProcessor and pass the serializer to it
    $processor = new AgentProcessor(new ResponseFormatFactory(), $serializer);

    // Create the Agent with the configured processor
    $agent = new Agent($platform, $model, [$processor], [$processor]);

    // Define the user's request for multiple cards
    $messages = new MessageBag(
        Message::ofUser('Give me a list of 15 e-commerce features but named as fantastical creatures or characters that you might find in a fantasy card game like Magic The Gathering card. Stick to unique features that would be added to a e-commerce platform like Shopify. So "secure checkout" would not be a good feature. But "wish list" or "back in stock notification" would be. The output will be a JSON array. The name of field must follow this format: ["CREATURE NAME", "(ORIGINAL FEATURE NAME)"] all other fields should follow the suggested format')
    );

    // Call the agent, specifying that the output_structure should be the Cards class
    $result = $agent->call($messages, ['output_structure' => CardCollection::class]);

    // The result is an instance of the Cards class, containing an array of Card objects
    $cards = $result->getContent();

    Flight::response()
        ->setHeader('Content-Type', 'application/json')
        ->write($cards);
});

$router->map('/', function () {
    return Flight::render('homepage.html', []);
})->stream();

Flight::start();
