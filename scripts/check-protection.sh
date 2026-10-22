#!/usr/bin/env bash
# check-protection.sh: verify that main's protection rules are active on GitHub.
# Usage: scripts/check-protection.sh
set -euo pipefail

REPO="Abnet-Melaku1/core-api"
fail=0

rules=$(gh api "repos/$REPO/rules/branches/main" --jq '.[].type')
# gh api = call GitHub's API directly, using your gh login
# rules/branches/main = "which rules apply to the main branch?"
# --jq '.[].type' = keep just each rule's type name (Day 3's jq!)

for rule in pull_request required_status_checks required_signatures non_fast_forward deletion; do
  if grep -qx "$rule" <<< "$rules"; then
  # <<< "$rules" = feed the text in the variable to grep, as if it came from a pipe
    echo "✅ $rule"
  else
    echo "❌ $rule is NOT active"; fail=1
  fi
done

exit $fail