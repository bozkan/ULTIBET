<?php

function getBalance($address, $chain)
{
	$balance = 0;
	foreach($chain as $block)
	{
		if ($block["payload"]["type"] == "escrow" && in_array("Irix", $block["payload"]["from"]))
		{

		}
	}

	return array($to, $from); // to = players this address sent to; from = players this address got from
}

$address = $_GET['address'];
// summary information
$chain = json_decode(file_get_contents("../blockchain.txt"), TRUE)["chain"];
$blocks = sizeof($chain);
$age = intval((strtotime("now") - strtotime("9th June 2018")) / 86400);
$nodes = 4; // change this to request amount of connections from server.js
$transactions = findTransactions($address, $chain);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

    <title>Betcafé Blockchain</title>

    <!-- Bootstrap and Theme -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/bootstrap-theme.min.css" rel="stylesheet">
    
</head>
<body>
    <div class="container">
	<table><td>
    <a title="Back to home" href="/"><img src="http://envision.vojtadrmota.com/soccerball.png" width="30px" height="30px" /></a>
	</td><td style="padding-left: 10px;" valign="middle">
	<h1>Address <?php echo $address; ?><h1>
	</td></table>

    <h3>Balance</h3>
<table class="table table-striped">
<tr><th>Balance</th></tr>
<tr>
<td>
	<?php echo $balance; ?>
</td>
</tr>
</table>


    <br><br><br>
    <p style="font-size: smaller">
        <span style="font-style: italic">
            &copy; 2017-2018 <a href="http://vojtadrmota.com">Vojta Drmota</a>
        </span>
        
    </p>
    </div>
</body>
</html>