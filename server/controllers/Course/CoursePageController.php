<?php
// controllers/Course/CoursePageController.php

require_once __DIR__ . '/../../models/Course/CoursePageSchema.php';
require_once __DIR__ . '/../../models/Course/CoursePageContent.php';
require_once __DIR__ . '/../../models/SiteContent.php';

class CoursePageController
{
    private $pages;
    private $site;

    public function __construct($pdo)
    {
        $this->pages = new CoursePageContent($pdo);
        $this->site = new SiteContent($pdo);
    }

    private function fail(int $status, string $message): void
    {
        http_response_code($status);
        echo json_encode(['success' => false, 'message' => $message]);
    }

    /** Parses the JSON request body into an array, or answers 400 and returns null. */
    private function readBody(): ?array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            $this->fail(400, 'Invalid JSON body');
            return null;
        }
        return $data;
    }

    // GET /api/course-pages/{slug} — published content only
    public function getPublic($slug)
    {
        $page = $this->pages->getPublishedBySlug($slug);
        if (!$page) {
            return $this->fail(404, 'Course page not published');
        }
        $refund = $this->site->get('refund_policy');
        echo json_encode([
            'success' => true,
            'course_code' => $page['course_code'],
            'slug' => $page['slug'],
            'published_at' => $page['published_at'],
            'content' => CoursePageSchema::normalizeContent($page['content']),
            'refund_policy' => $refund === null ? null : CoursePageSchema::normalizeRefundPolicy($refund),
        ]);
    }

    // GET /api/course-pages/admin/{course_code} — draft + published for the editor
    public function getAdmin($courseCode)
    {
        $row = $this->pages->getByCourseCode($courseCode);
        if (!$row) {
            echo json_encode([
                'success' => true,
                'course_code' => $courseCode,
                'status' => 'none',
                'draft' => null,
                'published' => null,
                'published_at' => null,
                'updated_at' => null,
            ]);
            return;
        }
        echo json_encode(['success' => true] + $row);
    }

    // PUT /api/course-pages/{course_code}
    public function saveDraft($courseCode)
    {
        $data = $this->readBody();
        if ($data === null) {
            return;
        }
        if (!isset($data['content']) || !is_array($data['content'])) {
            return $this->fail(400, 'content is required');
        }
        if (!$this->pages->courseExists($courseCode)) {
            return $this->fail(400, 'Unknown course_code');
        }
        $this->pages->saveDraft($courseCode, CoursePageSchema::normalizeContent($data['content']));
        $row = $this->pages->getByCourseCode($courseCode);
        echo json_encode(['success' => true, 'status' => $row['status'] ?? 'draft']);
    }

    // POST /api/course-pages/{course_code}/publish
    public function publish($courseCode)
    {
        $publishedAt = $this->pages->publish($courseCode);
        if ($publishedAt === null) {
            return $this->fail(404, 'No draft to publish');
        }
        echo json_encode(['success' => true, 'published_at' => $publishedAt]);
    }

    // GET /api/site-content/{setting_name}
    public function getSiteContent($key)
    {
        if (!in_array($key, SiteContent::ALLOWED_KEYS, true)) {
            return $this->fail(400, 'Unknown content key');
        }
        $value = $this->site->get($key);
        if ($value === null) {
            return $this->fail(404, 'Content not set');
        }
        echo json_encode(['success' => true, 'key' => $key, 'value' => CoursePageSchema::normalizeRefundPolicy($value)]);
    }

    // PUT /api/site-content/{setting_name}
    public function saveSiteContent($key)
    {
        if (!in_array($key, SiteContent::ALLOWED_KEYS, true)) {
            return $this->fail(400, 'Unknown content key');
        }
        $data = $this->readBody();
        if ($data === null) {
            return;
        }
        if (!isset($data['value']) || !is_array($data['value'])) {
            return $this->fail(400, 'value is required');
        }
        $this->site->set($key, CoursePageSchema::normalizeRefundPolicy($data['value']));
        echo json_encode(['success' => true]);
    }

    // GET /run-course-page-migration/ — creates tables and seeds CCPP + refund policy if absent
    public function migrate()
    {
        try {
            $this->pages->createTable();
            $this->site->createTable();

            $seedDir = __DIR__ . '/../../seeds';
            $pageSeed = json_decode(file_get_contents($seedDir . '/course_page_ccpp.en.json'), true);
            $refundSeed = json_decode(file_get_contents($seedDir . '/refund_policy.en.json'), true);
            if (!is_array($pageSeed) || !is_array($refundSeed)) {
                throw new RuntimeException('Seed files are missing or invalid');
            }

            $seededPage = $this->pages->seedIfAbsent('CS0001', CoursePageSchema::normalizeContent(['en' => $pageSeed]));
            $seededRefund = $this->site->setIfAbsent('refund_policy', CoursePageSchema::normalizeRefundPolicy(['en' => $refundSeed]));

            echo json_encode([
                'success' => true,
                'message' => 'Course page tables ready.',
                'seeded_course_page_CS0001' => $seededPage,
                'seeded_refund_policy' => $seededRefund,
            ]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
