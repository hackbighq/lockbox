#!/usr/bin/env bash
# Stolen-cookie replay: log in, copy the session cookie, log out, then reuse the
# old cookie. A real logout must make the old cookie dead on the server.
set -e
BASE="${BASE:-http://localhost:8787}"
EMAIL="${1:-asha@lockbox.app}"
PASS="${2:-123456}"

# 1. log in and grab the sid cookie the server set
SID=$(curl -s -i -X POST "$BASE/api/login" -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  | grep -i '^set-cookie: sid=' | sed -E 's/.*sid=([^;]+).*/\1/' | tr -d '\r')
echo "stolen cookie: sid=$SID"

# 2. read notes while logged in (proves the cookie works)
echo "while logged in: $(curl -s "$BASE/api/notes" -H "Cookie: sid=$SID")"

# 3. log out
curl -s -X POST "$BASE/api/logout" -H "Cookie: sid=$SID" > /dev/null
echo "logged out."

# 4. replay the SAME old cookie
echo "after logout:   $(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/notes" -H "Cookie: sid=$SID") on /api/notes"
echo "body:           $(curl -s "$BASE/api/notes" -H "Cookie: sid=$SID")"
