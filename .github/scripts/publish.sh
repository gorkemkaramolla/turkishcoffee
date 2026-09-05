#!/usr/bin/env bash
# Wraps the release script so a publish failure reaches the run's annotations.
# Step logs need admin rights to download; annotations do not.
set -o pipefail

npm run release 2>&1 | tee /tmp/publish.log
code=${PIPESTATUS[0]}

if [ "$code" -ne 0 ]; then
  detail=$(grep -iE "npm (error|ERR!)|E[0-9]{3}|forbidden|not found|denied" /tmp/publish.log \
    | tail -20 | tr '\n' ' ' | cut -c1-900)
  echo "::error::publish failed (${code}): ${detail:-no npm error lines captured}"
fi

exit "$code"
