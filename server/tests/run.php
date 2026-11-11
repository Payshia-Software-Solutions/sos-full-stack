<?php
// Minimal test runner (no framework). Usage: php server/tests/run.php
// Each *Test.php file defines functions named test_*; a test fails by throwing.

function assert_same($expected, $actual, string $message = ''): void
{
    if ($expected !== $actual) {
        throw new Exception(($message ? $message . ': ' : '') . 'expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

$before = get_defined_functions()['user'];
foreach (glob(__DIR__ . '/*Test.php') as $file) {
    require_once $file;
}
$tests = array_filter(
    array_diff(get_defined_functions()['user'], $before),
    fn($name) => strpos($name, 'test_') === 0
);

$failed = 0;
foreach ($tests as $test) {
    try {
        $test();
        echo "PASS $test\n";
    } catch (Throwable $e) {
        $failed++;
        echo "FAIL $test: " . $e->getMessage() . "\n";
    }
}
echo count($tests) . " tests, $failed failed\n";
exit($failed > 0 ? 1 : 0);
