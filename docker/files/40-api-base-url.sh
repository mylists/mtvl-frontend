#!/bin/sh
set -eu

# Prefer VITE_API_BASE_URL, then API_BASE_URL. Written into config.js at start
# so the same image can target different backends without a rebuild.
api_base_url=$(printf '%s' "${VITE_API_BASE_URL:-${API_BASE_URL:-}}" | tr -d '\r\n')
escaped=$(printf '%s' "$api_base_url" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')

printf 'window.__API_BASE_URL__ = "%s";\n' "$escaped" > /usr/share/nginx/html/config.js
