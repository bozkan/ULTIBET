<?php

function oracle($matchid)
{
	$res = array();

	function getString($str,$from,$to)
	{
		$sub = substr($str, strpos($str,$from)+strlen($from),strlen($str));
		return substr($sub,0,strpos($sub,$to));
	}

	// open new file
	// $data_new = file_get_contents("https://www.sportinglife.com/football/live/".$matchid."/commentary");
	$data_new = file_get_contents("new.html");
	

	$id = intval(getString($data_new,'https://www.sportinglife.com/football/live/','/commentary'));

	// make this dynamic
	$matchminute = getString($data_new,'<div class="timer"','&#x27;');
	$matchminute = explode(">", $matchminute);
	$matchminute = $matchminute[1];

	if (strpos($matchminute, "<") !== false)
	{
		$matchminute = 0;
	}

	// assign home and away team
	$teams = getString($data_new,'data-react-helmet="true">',' -');
	$teams = explode(" v ", $teams);
	$team_ha = [$teams[0] => 1, $teams[1] => 2];

	// delete everything but the commentary in the file

	$commentary = getString($data_new,'<ul class="commentary">','</ul>');

	if (!isset($commentary))
	{
		die();
	}

	// replace from old what exists in this file with nothing
	$commentary_new = str_replace("</ul>", "", $commentary);

	// open old file
	$data = file_get_contents("old_".$id.".html");

	$commentary2 = getString($data, '<ul class="commentary">','</ul>');

	$commentary_old = str_replace("</ul>", "", $commentary2);

	// this stores the new events
	$new = str_replace($commentary_old, "", $commentary_new);

	// save new to file as old
	// file_put_contents("old_".$id.".html", $data_new);

	// get all events
	preg_match_all('/<li class=\"event\"(.*?)<\/li>/s', $new, $events);

	$type = "";
	$success = 0;
	$team = "";
	$time = 0;
	$eventid = 0;

	// iterate through the new events

	if(isset($events[1]))
	{

		foreach ($events[1] as $event)
		{
			// get details
			$detail = getString($event, '<div class="detail-col">','</div>');

			if (strpos($detail, 'Attempt missed.') !== false) {
				$type = "Attempt missed";
				$eventid = 1;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'(',')');
				$success = 1;
			}
			else if (strpos($detail, 'Goal!') !== false)
			{
				$type = "Goal";
				$eventid = 2;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'(',')');
				$success = 1;
			}
			else if (strpos($detail, 'Foul by') !== false)
			{
				$type = "Foul by";
				$eventid = 3;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'(',')');
				$success = 1;
			}
			else if (strpos($detail, 'Corner') !== false)
			{
				$type = "Corner for";
				$eventid = 4;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,',  ','.');
				$success = 1;
			}
			else if (strpos($detail, 'Penalty conceded by') !== false)
			{
				$type = "Penalty conceded by";
				$eventid = 5;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'(',')');
				$success = 1;
			}
			else if (strpos($detail, 'Offside, ') !== false)
			{
				$type = "Offside by";
				$eventid = 6;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'Offside, ','.');
				$success = 1;
			}
			else if (strpos($detail, 'Substitution, ') !== false)
			{
				$type = "Substitution by";
				$eventid = 7;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'Substitution, ','.');
				$success = 1;
			}
			else if (strpos($detail, 'shown the yellow card') !== false)
			{
				$type = "Yellow card for";
				$eventid = 8;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'(',')');
				$success = 1;
			}
			else if (strpos($detail, 'shown the red card') !== false)
			{
				$type = "Red card for";
				$eventid = 9;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'(',')');
				$success = 1;
			}
			else if (strpos($detail, 'Hand ball by') !== false)
			{
				$type = "Hand ball by";
				$eventid = 10;
				$detail = str_replace("1. ", "", $detail);
				$team = getString($detail,'(',')');
				$success = 1;
			}
			else if (strpos($detail, 'First Half ends,') !== false)
			{
				$commas = explode(",", $detail);
				$home = $commas[1];
				$away = $commas[2];
				preg_match_all('!\d+!', $home, $home);
				preg_match_all('!\d+!', $away, $away);
				$home = $home[0][0];
				$away = $away[0][0];
				$time = 1;
				$success = 2;
				$type = "First half ended.";
			}
			else if (strpos($detail, 'Second Half ends,') !== false)
			{
				$commas = explode(",", $detail);
				$home = $commas[1];
				$away = $commas[2];
				preg_match_all('!\d+!', $home, $home);
				preg_match_all('!\d+!', $away, $away);
				$home = $home[0][0];
				$away = $away[0][0];
				$time = 1;
				$success = 2;
				$type = "Second half ended.";
			}
			else
			{
				continue;
			}


			// get time
			$time = getString($event, '<span class="match-time">','&#x27;</span>');

			if ($time > 0)
			{
				if ($success == 1)
				{
					// match event
					array_push($res, ["category" => "event", "type" => $type, "eventid" => $eventid, "team" => $team, "time" => $time]);
				}
				else
				{
					// first or second half ends
					array_push($res, ["category" => "half", "type" => $type, "home" => $home, "away" => $away]);
				}
				
			}
		}
	}

	array_push($res, ["category" => "timer", "matchminute" => $matchminute]);
	$res = json_encode($res);
	return $res;
}
?>
