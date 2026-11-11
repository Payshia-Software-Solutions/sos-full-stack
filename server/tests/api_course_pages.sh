#!/usr/bin/env bash
# API checks for the course page CMS. Usage:
#   API=http://localhost/sos-full-stack/server bash server/tests/api_course_pages.sh
# WRITES to the database behind $API: it edits the CS0001 draft and republishes the seed
# content at the end (also on abort, via the EXIT trap). Needs node and curl.
set -u
API="${API:?set API to the server base URL}"
SLUG="certificate-course-in-pharmacy-practice"
CODE="CS0001"
UNPUBLISHED_SLUG="${UNPUBLISHED_SLUG:-advanced-course-in-pharmacy-practice}"
DIR="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
fails=0
mutated=0

# Bodies are always sent from a file: passing JSON with non-ASCII characters (en/em dashes)
# as a command-line argument gets mangled on Windows and the server then rejects it.
req() { # method path [body] -> prints body, then status on the last line
  local method="$1" path="$2" body="${3:-}"
  if [ -n "$body" ]; then
    printf '%s' "$body" > "$TMP/body.json"
    curl -s -m 30 -X "$method" -H 'Content-Type: application/json' --data-binary "@$TMP/body.json" -w '\n%{http_code}' "$API$path"
  else
    curl -s -m 30 -X "$method" -w '\n%{http_code}' "$API$path"
  fi
}
status_of() { tail -n1 <<<"$1"; }
body_of() { sed '$d' <<<"$1"; }
# check NAME RESPONSE WANT_STATUS JS_EXPR  (b = parsed body)
check() {
  local name="$1" resp="$2" want_status="$3" expr="${4:-true}"
  local st; st="$(status_of "$resp")"
  local ok
  ok="$(body_of "$resp" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{let b={};try{b=JSON.parse(s)}catch(e){};try{console.log(($expr)?'yes':'no')}catch(e){console.log('no')}})")"
  if [ "$st" = "$want_status" ] && [ "$ok" = "yes" ]; then
    echo "PASS $name"
  else
    echo "FAIL $name (status $st, want $want_status; check: $expr)"; body_of "$resp" | head -c 300; echo
    fails=$((fails+1))
  fi
}

# Seed wrapper built from the seed file through stdin (node cannot resolve bash-style paths on Windows).
SEED_CONTENT="$(node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.stringify({content:{en:JSON.parse(s),si:{},ta:{},overrides:{si:[],ta:[]}}})))" < "$DIR/../seeds/course_page_ccpp.en.json")"
# Fail fast, before any write, so a broken seed can never be published by this script.
if [ -z "$SEED_CONTENT" ]; then echo "FAIL could not build seed content from server/seeds/course_page_ccpp.en.json"; rm -rf "$TMP"; exit 2; fi

# Puts the seed back as the draft and republishes it. Publishes ONLY if the draft restore succeeded.
restore_seed() {
  local put; put="$(req PUT "/api/course-pages/$CODE" "$SEED_CONTENT")"
  if [ "$(status_of "$put")" = "200" ]; then
    local pub; pub="$(req POST "/api/course-pages/$CODE/publish")"
    [ "$(status_of "$pub")" = "200" ] && return 0
  fi
  return 1
}
cleanup() {
  if [ "$mutated" = "1" ]; then
    if restore_seed; then echo "(cleanup: seed content restored and republished)"; else echo "WARNING: could not restore CS0001 seed content - restore it by hand"; fi
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

r="$(req GET "/api/course-pages/$SLUG")"
check "public page returns seeded content" "$r" 200 "b.content.en.hero.headline==='Start Your Journey in Pharmacy Practice' && b.content.en.modules.items.length===10 && b.refund_policy.en.items.length===7 && b.course_code==='$CODE'"

mutated=1
r="$(req PUT "/api/course-pages/$CODE" '{"content":{"en":{"hero":{"title":"Draft T"}}}}')"
check "save draft" "$r" 200 "b.success===true"

r="$(req GET "/api/course-pages/$SLUG")"
check "draft does not leak to public" "$r" 200 "b.content.en.hero.title==='Certificate Course in Pharmacy Practice'"

r="$(req GET "/api/course-pages/admin/$CODE")"
check "admin sees draft" "$r" 200 "b.draft.en.hero.title==='Draft T' && b.status==='published' && b.published.en.hero.title==='Certificate Course in Pharmacy Practice'"

r="$(req PUT "/api/course-pages/$CODE" 'not json')"
check "invalid JSON rejected" "$r" 400 "b.success===false"

r="$(req PUT "/api/course-pages/$CODE" '{"nothing":1}')"
check "missing content rejected" "$r" 400 "b.success===false"

r="$(req PUT "/api/course-pages/NOPE999" '{"content":{"en":{}}}')"
check "unknown course rejected" "$r" 400 "b.message==='Unknown course_code'"

r="$(req GET "/api/course-pages/$UNPUBLISHED_SLUG")"
check "unpublished course is 404" "$r" 404 "b.success===false"

r="$(req PUT "/api/site-content/hack" '{"value":{"a":1}}')"
check "site content key allow-list" "$r" 400 "b.success===false"

r="$(req GET "/api/site-content/refund_policy")"
check "refund policy readable" "$r" 200 "b.value.en.items.length===7"

# Cover upload: validation paths only. A successful upload would copy a file to the live content server
# and change the course's cover, so that path is verified by hand in the editor.
WTMP="$(cygpath -m "$TMP" 2>/dev/null || echo "$TMP")" # curl -F needs a path curl itself can open (Windows)
upload() { # path file-name-in-tmp [type] -> body, then status
  curl -s -m 30 -X POST -F "image=@$WTMP/$2;type=${3:-application/octet-stream}" -w '
%{http_code}' "$API$1"
}
printf 'plain text pretending to be a picture' > "$TMP/fake.jpg"
printf '%s' 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' | base64 -d > "$TMP/ok.png"

r="$(curl -s -m 30 -X POST -w '
%{http_code}' "$API/api/course-pages/$CODE/cover")"
check "cover: no file is rejected" "$r" 400 "b.message==='No image provided'"

r="$(upload "/api/course-pages/$CODE/cover" fake.jpg image/jpeg)"
check "cover: non-image rejected" "$r" 400 "b.message==='The file must be a JPG, PNG or WebP image'"

r="$(upload "/api/course-pages/NOPE999/cover" ok.png image/png)"
check "cover: unknown course rejected before any upload" "$r" 400 "b.message==='Unknown course_code'"

# restore through the same path the cleanup uses, then verify what students would see
if restore_seed; then echo "PASS restore seed and publish"; mutated=0; else echo "FAIL restore seed and publish"; fails=$((fails+1)); fi
r="$(req GET "/api/course-pages/$SLUG")"
check "published seed visible after restore" "$r" 200 "b.content.en.hero.title==='Certificate Course in Pharmacy Practice' && b.content.en.modules.items.length===10"

echo "$fails failed"
[ "$fails" -eq 0 ]
