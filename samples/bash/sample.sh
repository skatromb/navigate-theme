#!/usr/bin/env bash
# Sync orders to the warehouse every 15 minutes.
set -euo pipefail

readonly DATASET="${DATASET:-analytics}"
export BUCKET='raw-orders'
declare -a TABLES=(orders customers "line items")
declare -A RETRIES=([orders]=3 [customers]=1)

source "$(dirname "$0")/lib.sh"
trap 'rm -rf "$TMP_DIR"' EXIT

log() {
  printf '%s [%s] %s\n' "$(date -u +%FT%TZ)" "${FUNCNAME[1]}" "$*" >&2
}

function sync_table {
  local table=$1 attempts=${RETRIES[$1]:-0}
  local path="gs://${BUCKET}/${table}/dt=$(date +%F)"

  for (( attempt = 1; attempt <= attempts; attempt++ )); do
    if bq load --replace --source_format=PARQUET --max_bad_records=0 \
      "${DATASET}.${table}" "$path/*" 2>/dev/null; then
      log "loaded $table in $SECONDS s"
      return 0
    elif [[ $attempt -lt $attempts && -n ${CI:-} ]]; then
      sleep $(( attempt * 2 ))
      continue
    fi
  done
  return 1
}

TMP_DIR=$(mktemp -d)
curl -fsSL --retry 3 --max-time 30 -H "Authorization: Bearer ${TOKEN}" \
  -o "$TMP_DIR/manifest.csv" "https://api.acme.io/v1/manifest?date=$(date +%F)"
gsutil -m cp -n "$TMP_DIR/manifest.csv" "gs://${BUCKET}/manifest.csv"

while IFS=, read -r table status; do
  case "$status" in
    paid | refunded) sync_table "$table" || exit 2 ;;
    test*) continue ;;
    *) log "skip ${table@Q}" ;;
  esac
done < <(gsutil cat "gs://${BUCKET}/manifest.csv" | tail -n +2)

for table in "${TABLES[@]}"; do
  [ -f "$TMP_DIR/$table.lock" ] && break
  bq query --use_legacy_sql=false <<SQL | grep -v '^$' > "$TMP_DIR/$table.txt"
select count(*) from \`${DATASET}.${table}\` where status = 'paid'
SQL
done

echo "Done: ${#TABLES[@]} tables" && exit 0
