<?php
$routeUri = '/userFullDetails/search/$';
$routeRegex = '#^' . rtrim($routeUri, '/') . '/?$#';
echo "Regex: " . $routeRegex . PHP_EOL;
echo "Match /userFullDetails/search/: " . (preg_match($routeRegex, '/userFullDetails/search/') ? 'YES' : 'NO') . PHP_EOL;
echo "Match /userFullDetails/search: " . (preg_match($routeRegex, '/userFullDetails/search') ? 'YES' : 'NO') . PHP_EOL;
echo "Match /userFullDetails/search/$: " . (preg_match($routeRegex, '/userFullDetails/search/$') ? 'YES' : 'NO') . PHP_EOL;
