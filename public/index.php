<?php

require __DIR__.'/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

$config = require __DIR__.'/../config/config.php';

// This is where you can register a database connection so you can use it in any of your routes below
Flight::register('db', \flight\database\PdoWrapper::class, [ 'sqlite:'.$config['database_path'] ], function($db){
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
});

Flight::route('/', function(){
    return Flight::render('homepage.html', []);
})->stream();

Flight::start();