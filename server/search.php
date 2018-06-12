<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// can be accessed through: txid, blockheight

// summary information
$chain = json_decode(file_get_contents("blockchain.txt"), TRUE)["chain"];
$txid = $_GET['txid'];

function findHeight($txid, $chain)
{
	foreach ($chain as $block)
	{
		if ($block["hash"] == $txid)
		{
			return $block["height"];
		}
	}
}

function findIndex($txid, $chain)
{
	$i = 0;
	foreach ($chain as $block)
	{
		if ($block["hash"] == $txid)
		{
			return $i;
		}
		$i++;
	}
}

$i = findIndex($txid, $chain);

$txid = $chain[$i]["hash"];
$appeared = $chain[$i]["height"];
$date = date("Y-m-d H:i:s", substr($chain[$i]["timestamp"], 0, -3));
$origin = $chain[$i]["payload"]["origin"];
$type = $chain[$i]["payload"]["type"];
$height = findHeight($txid, $chain);
$miner = $chain[$i]["issuer"];
$signature = $chain[$i]["signature"];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

    <title>Envision.football Blockchain</title>

    <!-- Bootstrap and Theme -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/bootstrap-theme.min.css" rel="stylesheet">
    
</head>
<body>
    <div class="container">
	<table><td>
    <a title="Back to home" href="/"><img src="http://envision.vojtadrmota.com/soccerball.png" width="30px" height="30px" /></a>
	</td><td style="padding-left: 10px;" valign="middle">
	<h1>Transaction <?php echo substr($txid, 0, 25); ?>...<h1>
	</td></table>
    <table class="table table-bordered table-condensed"><tr><td>Hash</td><td><?php echo $txid; ?></td></tr><tr><td>Appeared in</td><td><a href="search.php?txid=<?php echo $txid; ?>">envision.football Blockchain, Block <?php echo $height; ?></a> (<?php echo $date; ?>)</td></tr><tr><td>Number of inputs</td><td>1</td></tr><tr><td>Number of outputs</td><td>1</td></tr><tr><td>Size</td><td>222 bytes</td></tr><tr><td>Type</td><td><?php echo $type; ?></td></tr></table><a name="inputs"><h3>Payload</h3></a>
<table class="table table-striped">
<tr><th>Origin</th><th>Stamp</th><th>Miner</th><th>Signature</th></tr>
<tr>
<td><a href="search.php?txid=<?php echo $origin; ?>"><?php echo substr($origin, 0, 10); ?>...</a></td></td>
<td>0</td>
<td><?php echo $miner; ?></td>
<td style="max-width: 400px;"><?php echo substr($signature, 0, 25); ?>...</td>
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

