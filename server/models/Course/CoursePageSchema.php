<?php
// models/Course/CoursePageSchema.php
// Normalizes course page content documents (en/si/ta) before they are stored.
// Unknown keys are dropped, strings are trimmed, empty list items removed,
// lists capped, and language-independent fields kept only in English.

class CoursePageSchema
{
    const MAX_ITEMS = 50;
    const LANGUAGES = ['en', 'si', 'ta'];

    const ICONS = [
        'gamepad-2', 'pill', 'calculator', 'book-open', 'video', 'play-circle', 'trophy', 'stethoscope',
        'briefcase', 'graduation-cap', 'flask-conical', 'clipboard-check', 'users', 'shield-check', 'heart-pulse', 'award',
    ];

    // Fields that are the same in every language; stored only in the English document.
    const SHARED_FIELDS = ['icon', 'photo_url', 'phone'];

    // block => ['scalars' => [...], 'strings' => listKey|null, 'objects' => [listKey => [itemFields]]]
    const BLOCKS = [
        'hero' => ['scalars' => ['eyebrow', 'title', 'headline', 'promise']],
        'facts' => ['scalars' => ['next_intake', 'mode', 'medium', 'entry_requirements', 'study_materials', 'learning_style', 'support', 'certificate', 'class_day', 'class_time']],
        'overview' => ['scalars' => ['title'], 'strings' => 'paragraphs'],
        'audience' => ['scalars' => ['title', 'intro', 'note'], 'strings' => 'items'],
        'features' => ['scalars' => ['title', 'intro', 'closing'], 'objects' => ['items' => ['icon', 'title', 'description']]],
        'learn' => ['scalars' => ['title', 'intro', 'closing'], 'strings' => 'items'],
        'modules' => ['scalars' => ['title'], 'objects' => ['items' => ['title', 'description']]],
        'assessment' => ['scalars' => ['title', 'intro', 'note'], 'strings' => 'items'],
        'schedule' => ['scalars' => ['title', 'note', 'recordings']],
        'lecturers' => ['scalars' => ['title'], 'objects' => ['items' => ['name', 'qualifications', 'photo_url']]],
        'faq' => ['scalars' => ['title'], 'objects' => ['items' => ['question', 'answer']]],
        'cta' => ['scalars' => ['title', 'subtitle', 'tagline', 'phone']],
    ];

    private static function cleanString($value): ?string
    {
        if (!is_scalar($value)) {
            return null;
        }
        $s = trim((string)$value);
        return $s === '' ? null : $s;
    }

    private static function cleanField(string $field, $value, bool $isEnglish): ?string
    {
        if (!$isEnglish && in_array($field, self::SHARED_FIELDS, true)) {
            return null;
        }
        $s = self::cleanString($value);
        if ($s !== null && $field === 'icon' && !in_array($s, self::ICONS, true)) {
            return 'award';
        }
        return $s;
    }

    public static function normalizeDoc($doc, bool $isEnglish): array
    {
        if (!is_array($doc)) {
            return [];
        }
        $out = [];
        foreach (self::BLOCKS as $block => $spec) {
            if (!isset($doc[$block]) || !is_array($doc[$block])) {
                continue;
            }
            $in = $doc[$block];
            $clean = [];
            foreach ($spec['scalars'] as $field) {
                if (array_key_exists($field, $in)) {
                    $v = self::cleanField($field, $in[$field], $isEnglish);
                    if ($v !== null) {
                        $clean[$field] = $v;
                    }
                }
            }
            if (isset($spec['strings']) && isset($in[$spec['strings']]) && is_array($in[$spec['strings']])) {
                $items = [];
                foreach ($in[$spec['strings']] as $item) {
                    $v = self::cleanString($item);
                    if ($v !== null) {
                        $items[] = $v;
                    }
                }
                $clean[$spec['strings']] = array_slice($items, 0, self::MAX_ITEMS);
            }
            foreach ($spec['objects'] ?? [] as $listKey => $itemFields) {
                if (!isset($in[$listKey]) || !is_array($in[$listKey])) {
                    continue;
                }
                $items = [];
                foreach ($in[$listKey] as $item) {
                    if (!is_array($item)) {
                        continue;
                    }
                    $cleanItem = [];
                    foreach ($itemFields as $field) {
                        if (array_key_exists($field, $item)) {
                            $v = self::cleanField($field, $item[$field], $isEnglish);
                            if ($v !== null) {
                                $cleanItem[$field] = $v;
                            }
                        }
                    }
                    if ($cleanItem) {
                        $items[] = $cleanItem;
                    }
                }
                $clean[$listKey] = array_slice($items, 0, self::MAX_ITEMS);
            }
            if ($clean) {
                $out[$block] = $clean;
            }
        }
        return $out;
    }

    private static function cleanPaths($paths): array
    {
        if (!is_array($paths)) {
            return [];
        }
        $out = [];
        foreach ($paths as $p) {
            if (is_string($p) && preg_match('/^[a-z_]+(\.[a-z0-9_]+)*$/', $p)) {
                $out[] = $p;
            }
        }
        return array_values(array_unique($out));
    }

    public static function normalizeContent($content): array
    {
        $content = is_array($content) ? $content : [];
        $out = [];
        foreach (self::LANGUAGES as $lang) {
            $out[$lang] = self::normalizeDoc($content[$lang] ?? [], $lang === 'en');
        }
        $overrides = is_array($content['overrides'] ?? null) ? $content['overrides'] : [];
        $out['overrides'] = [
            'si' => self::cleanPaths($overrides['si'] ?? []),
            'ta' => self::cleanPaths($overrides['ta'] ?? []),
        ];
        return $out;
    }

    public static function normalizeRefundPolicy($value): array
    {
        $value = is_array($value) ? $value : [];
        $out = [];
        foreach (self::LANGUAGES as $lang) {
            $doc = is_array($value[$lang] ?? null) ? $value[$lang] : [];
            $clean = [];
            $title = self::cleanString($doc['title'] ?? null);
            if ($title !== null) {
                $clean['title'] = $title;
            }
            if (isset($doc['items']) && is_array($doc['items'])) {
                $items = [];
                foreach ($doc['items'] as $item) {
                    if (!is_array($item)) {
                        continue;
                    }
                    $ci = [];
                    foreach (['title', 'body'] as $f) {
                        $v = self::cleanString($item[$f] ?? null);
                        if ($v !== null) {
                            $ci[$f] = $v;
                        }
                    }
                    if ($ci) {
                        $items[] = $ci;
                    }
                }
                $clean['items'] = array_slice($items, 0, self::MAX_ITEMS);
            }
            $out[$lang] = $clean;
        }
        return $out;
    }
}
