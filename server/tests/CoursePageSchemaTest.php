<?php
require_once __DIR__ . '/../models/Course/CoursePageSchema.php';

function test_normalize_drops_unknown_keys_and_non_strings()
{
    $out = CoursePageSchema::normalizeDoc(['hero' => ['title' => ' CCPP ', 'evil' => 'x'], 'bogus' => [1]], true);
    assert_same(['hero' => ['title' => 'CCPP']], $out);
}

function test_scalar_field_given_array_is_dropped()
{
    $out = CoursePageSchema::normalizeDoc(['hero' => ['title' => ['x'], 'headline' => 'H']], true);
    assert_same(['hero' => ['headline' => 'H']], $out);
}

function test_caps_list_length_at_50()
{
    $items = [];
    for ($i = 0; $i < 60; $i++) {
        $items[] = ['question' => "Q$i", 'answer' => "A$i"];
    }
    $out = CoursePageSchema::normalizeDoc(['faq' => ['items' => $items]], true);
    assert_same(50, count($out['faq']['items']));
}

function test_drops_empty_list_items()
{
    $out = CoursePageSchema::normalizeDoc([
        'audience' => ['items' => ['A', '', ' ']],
        'modules' => ['title' => 'M', 'items' => [['title' => '', 'description' => '']]],
    ], true);
    assert_same(['A'], $out['audience']['items']);
    assert_same([], $out['modules']['items']);
}

function test_unknown_icon_becomes_award()
{
    $out = CoursePageSchema::normalizeDoc(['features' => ['items' => [['icon' => 'rocket', 'title' => 'T']]]], true);
    assert_same('award', $out['features']['items'][0]['icon']);
}

function test_known_icon_is_kept()
{
    $out = CoursePageSchema::normalizeDoc(['features' => ['items' => [['icon' => 'pill', 'title' => 'T']]]], true);
    assert_same('pill', $out['features']['items'][0]['icon']);
}

function test_shared_fields_only_kept_in_english()
{
    $doc = [
        'cta' => ['title' => 'සි', 'phone' => '071'],
        'lecturers' => ['items' => [['name' => 'N', 'photo_url' => 'http://x/y.jpg']]],
        'features' => ['items' => [['icon' => 'pill', 'title' => 'T']]],
    ];
    $si = CoursePageSchema::normalizeDoc($doc, false);
    assert_same(['title' => 'සි'], $si['cta']);
    assert_same([['name' => 'N']], $si['lecturers']['items']);
    assert_same([['title' => 'T']], $si['features']['items']);
    $en = CoursePageSchema::normalizeDoc($doc, true);
    assert_same('071', $en['cta']['phone']);
}

function test_normalize_content_always_has_three_languages()
{
    $out = CoursePageSchema::normalizeContent(['en' => []]);
    assert_same(['en', 'si', 'ta', 'overrides'], array_keys($out));
    assert_same(['si' => [], 'ta' => []], $out['overrides']);
}

function test_overrides_keep_only_path_strings()
{
    $out = CoursePageSchema::normalizeContent(['overrides' => ['si' => ['hero.title', 5, 'bad path!'], 'ta' => 'x']]);
    assert_same(['hero.title'], $out['overrides']['si']);
    assert_same([], $out['overrides']['ta']);
}

function test_normalize_refund_policy()
{
    $out = CoursePageSchema::normalizeRefundPolicy([
        'en' => ['title' => 'R', 'items' => [['title' => '1', 'body' => 'B'], ['title' => '', 'body' => '']], 'x' => 1],
    ]);
    assert_same(['title' => 'R', 'items' => [['title' => '1', 'body' => 'B']]], $out['en']);
    assert_same([], $out['si']);
    assert_same(['en', 'si', 'ta'], array_keys($out));
}
