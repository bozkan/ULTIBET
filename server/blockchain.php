<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version2X;

require __DIR__ . '/vendor/autoload.php';

$client = new Client(new Version2X('http://localhost:1338', [
    'headers' => [
        'X-My-Header: websocket rocks',
        'Authorization: Bearer 12b3c4d5e6f7g8h9i'
    ]
]));

if (!isset($_POST['blockchain']))
{
	die("Missing file.");
}

$myfile = fopen("blockchain.txt", "w") or die("Unable to open file!");
$txt = urldecode($_POST['blockchain']);
fwrite($myfile, $txt);
fclose($myfile);

$client->initialize();
$client->emit('emit_blockchain', [$txt]);
$client->close();

?>