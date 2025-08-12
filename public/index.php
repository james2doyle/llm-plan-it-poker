<?php

require __DIR__ . '/../vendor/autoload.php';

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

Flight::route('/', function () {
    return Flight::render('homepage.html', []);
})->stream();

// class Card
// {
//     /**
//      * The name of the creature. Example: ["CREATURE NAME", "(ORIGINAL FEATURE NAME)"]
//      * * @param string[] $name
//      * @param string $estimated_impact_to_project
//      * @param string $estimated_t_shirt_size_to_build How long this feature might take to build. Example "large", "xlarge"
//      * @param string[] $mana_cost Formatted as ["{1}{W}{U}"] or ["{2}{W}", "{1}{B}"]
//      * @param string $image_description
//      * @param string $card_type "Enchantment", "Artifact", etc.
//      * @param string[] $card_subtypes Example ["Oracle", "Weaver"]
//      * @param string $card_text The details of the card. Should be easy to tell what the feature is
//      * @param string|null $flavor_text The special quote to use - optional
//      * @param int[]|null $power_defense Optional. Example, "3/5" as [3, 5]
//      */
//     public function __construct(
//         public array $name,
//         public string $estimated_impact_to_project,
//         public string $estimated_t_shirt_size_to_build,
//         public array $mana_cost,
//         public string $image_description,
//         public string $card_type,
//         public array $card_subtypes,
//         public string $card_text,
//         public ?string $flavor_text = null,
//         public ?array $power_defense = null
//     ) {}

//     /**
//      * Creates an instance of Card from a JSON string.
//      *
//      * @param string $json
//      * @return self
//      * @throws JsonException
//      */
//     public static function fromJson(string $json): self
//     {
//         $data = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

//         return new self(
//             name: $data['name'],
//             estimated_impact_to_project: $data['estimated_impact_to_project'],
//             estimated_t_shirt_size_to_build: $data['estimated_t_shirt_size_to_build'],
//             mana_cost: $data['mana_cost'],
//             image_description: $data['image_description'],
//             card_type: $data['card_type'],
//             card_subtypes: $data['card_subtypes'],
//             card_text: $data['card_text'],
//             flavor_text: $data['flavor_text'] ?? null,
//             power_defense: $data['power_defense'] ?? null
//         );
//     }

//     /**
//      * Converts the object to a JSON string.
//      *
//      * @return string
//      * @throws JsonException
//      */
//     public function toJson(): string
//     {
//         return json_encode(get_object_vars($this), JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT);
//     }
// }

// class Cards
// {
//     /** @var Card[] */
//     public array $items;
// }

// Flight::route('/cards', function () {
//     $cards = (new StructuredOutput)
//         ->with(
//             model: 'gemini-2.5-flash',
//             messages: [['role' => 'user', 'content' => 'Give me a list of 15 e-commerce features but named as fantastical creatures or characters that you might find in a fantasy card game like Magic The Gathering card. Stick to unique features that would be added to a e-commerce platform like Shopify. So "secure checkout" would not be a good feature. But "wish list" or "back in stock notification" would be. The output will be a JSON array. The name of field must follow this format: ["CREATURE NAME", "(ORIGINAL FEATURE NAME)"] all other fields should follow the suggested format']],
//             responseModel: Cards::class,
//             examples: [
//                 new Card(
//                     name: ['Creature Name', '(Feature Idea)'],
//                     estimated_impact_to_project: 'High',
//                     estimated_t_shirt_size_to_build: 'M',
//                     mana_cost: ['{2}{R}', '{1}{W}'],
//                     image_description: 'An ethereal knight holding a glowing sword, standing on a floating island.',
//                     card_type: 'Creature',
//                     card_subtypes: ['Human', 'Knight'],
//                     card_text: 'When this card is played, it creates a new API endpoint. The new endpoint can be used to retrieve user data.',
//                     flavor_text: 'The best features are the ones you build yourself.',
//                     power_defense: [3, 4]
//                 )
//             ],
//             mode: OutputMode::Json
//         )
//         ->get();

//     return $cards;
// })->stream();

Flight::start();
