#!/bin/sh
WWW_DIR=/usr/share/nginx/html

INJECT_FILE_SRC="${WWW_DIR}/env.template.js"
INJECT_FILE_DST="${WWW_DIR}/env.js"

envsubst < "${INJECT_FILE_SRC}" > "${INJECT_FILE_DST}"

[ -z "$@" ] && nginx -g 'daemon off;' || $@