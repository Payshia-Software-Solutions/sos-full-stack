<?php
require_once __DIR__ . '/../models/Course/CourseCover.php';

function cover_tmp_file(string $bytes): string
{
    $path = tempnam(sys_get_temp_dir(), 'cover');
    file_put_contents($path, $bytes);
    return $path;
}

// 1x1 transparent PNG
const COVER_TEST_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

function test_cover_rejects_missing_file_and_upload_errors()
{
    assert_same('No image provided', CourseCover::validate(null));
    assert_same('File upload error', CourseCover::validate(['error' => UPLOAD_ERR_PARTIAL, 'tmp_name' => '', 'size' => 0]));
}

function test_cover_rejects_files_that_are_not_images()
{
    $tmp = cover_tmp_file('this is plain text, not a picture');
    $msg = CourseCover::validate(['error' => UPLOAD_ERR_OK, 'tmp_name' => $tmp, 'size' => filesize($tmp), 'name' => 'cover.jpg']);
    unlink($tmp);
    assert_same('The file must be a JPG, PNG or WebP image', $msg);
}

function test_cover_rejects_files_over_5mb()
{
    $tmp = cover_tmp_file(base64_decode(COVER_TEST_PNG));
    $msg = CourseCover::validate(['error' => UPLOAD_ERR_OK, 'tmp_name' => $tmp, 'size' => 6 * 1024 * 1024, 'name' => 'big.png']);
    unlink($tmp);
    assert_same('The image must be 5 MB or smaller', $msg);
}

function test_cover_accepts_a_real_png()
{
    $tmp = cover_tmp_file(base64_decode(COVER_TEST_PNG));
    $msg = CourseCover::validate(['error' => UPLOAD_ERR_OK, 'tmp_name' => $tmp, 'size' => filesize($tmp), 'name' => 'cover.png']);
    $ext = CourseCover::extensionFor($tmp);
    unlink($tmp);
    assert_same(null, $msg);
    assert_same('png', $ext);
}

function test_cover_remote_dir_only_for_safe_course_codes()
{
    assert_same('/courses/CS0001/', CourseCover::remoteDir('CS0001'));
    assert_same(null, CourseCover::remoteDir('../etc'));
    assert_same(null, CourseCover::remoteDir('CS 0001'));
    assert_same(null, CourseCover::remoteDir(''));
}

function test_cover_file_names_are_unique_and_safe()
{
    $a = CourseCover::fileName('png');
    $b = CourseCover::fileName('png');
    assert_same(1, preg_match('/^cover_[a-z0-9]+\.png$/', $a));
    assert_same(true, $a !== $b);
}

function test_cover_public_url()
{
    assert_same('https://content-provider.pharmacollege.lk/courses/CS0001/cover_x.png', CourseCover::publicUrl('CS0001', 'cover_x.png'));
}
