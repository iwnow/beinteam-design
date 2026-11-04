#!/usr/bin/env bash
# Обновить сайт из макетов: копирует new-design и переписывает ссылки на документацию под GitHub Pages
set -euo pipefail
SRC="${1:-$(dirname "$0")/../frontbit/web/new-design}"
DST="$(cd "$(dirname "$0")" && pwd)"
rm -rf "${DST:?}/assets" "${DST:?}/docs" "${DST:?}"/*.html
cp -r "$SRC/assets" "$SRC/docs" "$DST/"
cp "$SRC"/*.html "$DST/"
# Jekyll на GitHub Pages собирает docs/*.md в .html, README.md — в docs/index.html
sed -i -E 's#href="docs/README\.md"#href="docs/"#; s#href="docs/([^"]+)\.md"#href="docs/\1.html"#g' "$DST/index.html"
echo "Готово: $DST"
