<?php

function countAddresses($chain)
{
	$addresses = [];

	for ($i = 0, $n = sizeof($chain); $i < $n; $i++)
	{
		$block = $chain[$i];
		if (!in_array($block["issuer"], $addresses))
		{
			array_push($addresses, $block["issuer"]);
		}
		if ($i > 0)
		{
			if (!in_array($block["payload"]["from"], $addresses))
			{
				array_push($addresses, $block["payload"]["from"]);
			}
		}
	}

	return sizeof($addresses);
}

// summary information
$chain = json_decode(file_get_contents("blockchain.txt"), TRUE)["chain"];
$blocks = sizeof($chain);
$addresses = countAddresses($chain);
$age = intval((strtotime("now") - strtotime("9th June 2018")) / 86400);
$nodes = 4; // change this to request amount of connections from server.js

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

    <title>Russia 2018 CryptoStamps Blockchain</title>

    <!-- Bootstrap and Theme -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/bootstrap-theme.min.css" rel="stylesheet">

    <script>$(document).ready(function(){setInterval(function(){$("#recenttx").load('envision.football%20Blockchain/recent?random=' + Math.random().toString() )}, 5000);});</script><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" /><meta http-equiv="Pragma" content="no-cache" /><meta http-equiv="Expires" content="0" /><meta http-equiv="refresh" content="60" >
</head>
<body>
    <script>
        var s = require('./explorer.js');
        document.write(s.x);
    </script>
    <div class="container">
	<table><td>
    <a title="Back to home" href="/"><img src="http://envision.vojtadrmota.com/soccerball.png" width="30px" height="30px" /></a>
	</td><td style="padding-left: 10px;" valign="middle">
	<h1><a title="Back to home" style="color:black;" href="/">Russia 2018 CryptoStamps Blockchain</a><h1>
	</td></table>
    <p>Search by address, block number or hash:</label></p><form class="form-inline" action="search.php" method="GET"><p>
<div class="form-group"><input id="search1" type="text" name="txid" size="64" value="" style="height: 32px; margin-right: 10px;"/><button type="submit" class="btn" style="height: 32px; vertical-align: middle;">Search</button>
<p class="help-block">Address or hash search requires at least the first 6 characters.</p></div></form>

<table class="table table-striped">
<tr><th>Status</th><th>Chain</th><th>Blocks</th><th>Assets</th><th>Addresses</th><th>Streams</th><th>Nodes</th><th>Started</th><th>Age (days)</th></tr>

<tr><td><span class="label label-success">Live</span></td><td>Russia 2018 CryptoStamps Blockchain</td><td><?php echo $blocks; ?></td><td>1<td><?php echo $addresses; ?></td></td><td>1</td><td><?php echo $nodes; ?></td><td>2018-06-09</td><td><?php echo $age; ?></td></tr>
</table>

<div id="recenttx"><h3>Latest Blocks</h3><table class="table table-striped">
<tr><th>Txid</th><th>Type</th><th>Confirmation</th><th>Time</th></tr>

<?php
// 10 latest transactions
for ($i = sizeof($chain)-1, $n = sizeof($chain)-11; $i > $n; $i--)
{
	$block = $chain[$i];
	$txid =  $block["hash"];
	$type = $block["payload"]["type"];
	$confirmations = sizeof($chain) - $i - 1;
	$time =  intval((round(microtime(true) * 1000) - $block["timestamp"]) / 1000 / 86400);
?>

<tr>
	<td>
	<a href="search.php?txid=<?php echo $txid; ?>"><?php echo substr($txid, 0, 90); ?>...</a></td>
	<td>&nbsp;<span class="label label-primary"><?php echo $type; ?></span></td>
	<td><span class="label label-info"><?php echo $confirmations; ?> confirmations</span></td>
	<td><?php echo $time; ?> days</td>
</tr>

<?php
}
?>
</table>
</div>

<div id="recenttx"><h3>Latest Transactions</h3><table class="table table-striped">
<tr><th>Txid</th><th>Type</th><th>Confirmation</th><th>Time</th></tr>

<?php
// 10 latest transactions
for ($i = sizeof($chain)-1, $n = sizeof($chain)-11; $i > $n; $i--)
{
	$block = $chain[$i];
	$txid =  $block["signature"];
	$atxid = $block["hash"];
	$type = $block["payload"]["type"];
	$confirmations = sizeof($chain) - $i - 1;
	$time =  intval((round(microtime(true) * 1000) - $block["timestamp"]) / 1000 / 86400);
?>

<tr>
	<td>
	<a href="search.php?txid=<?php echo $atxid; ?>"><?php echo substr($txid, 0, 90); ?>...</a></td>
	<td>&nbsp;<span class="label label-primary"><?php echo $type; ?></span></td>
	<td><span class="label label-info"><?php echo $confirmations; ?> confirmations</span></td>
	<td><?php echo $time; ?> days</td>
</tr>

<?php
}
?>
</table>
</div>

    <br><br>
    <p style="font-size: smaller">
        <span style="font-style: italic">
            &copy; 2017-2018 <a href="http://vojtadrmota.com">Vojta Drmota</a>
        </span>
        
    </p>
</div>
</body>
</html>
