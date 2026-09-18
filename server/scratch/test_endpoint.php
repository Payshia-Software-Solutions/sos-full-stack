<?php
function testReq($url, $method, $data) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "$method $url -> $code : $res\n";
}

testReq('https://chat-server.pharmacollege.lk/api/tickets/325/status/', 'POST', ['newStatus' => 'Open']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/category', 'POST', ['category' => 'Payment']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/category/', 'POST', ['category' => 'Payment']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/priority', 'POST', ['priority' => 'High']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/priority/', 'POST', ['priority' => 'High']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/edit', 'POST', ['category' => 'Payment']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/edit/', 'POST', ['category' => 'Payment']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/update', 'POST', ['category' => 'Payment']);
testReq('https://chat-server.pharmacollege.lk/api/tickets/325/update/', 'POST', ['category' => 'Payment']);


