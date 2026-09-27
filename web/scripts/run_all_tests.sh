#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${WEB_DIR}"

echo "================================================================================"
echo "🏗️  CONCORDIA GAMIFIED CONSTRUCTION TIMELINE: AUTOMATED TEST RUNNER"
echo "================================================================================"
echo "Working Directory: ${WEB_DIR}"
echo ""

SUITES=(
  "src/tests/TactileNode.component.test.tsx"
  "src/tests/StageDetailsDrawer.component.test.tsx"
  "src/tests/m1_empirical_stress.test.tsx"
  "src/tests/m2_drawer_stress.test.tsx"
  "src/tests/m2_empirical_challenge.test.tsx"
)

TOTAL_SUITES=${#SUITES[@]}
PASSED_SUITES=0
FAILED_SUITES=0

for suite in "${SUITES[@]}"; do
  echo "--------------------------------------------------------------------------------"
  echo "▶ Running Suite: ${suite}"
  echo "--------------------------------------------------------------------------------"
  
  if TSX_TSCONFIG_PATH=./tsconfig.app.json npx tsx "./${suite}"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
    echo "✓ Suite Passed: ${suite}"
  else
    FAILED_SUITES=$((FAILED_SUITES + 1))
    echo "✗ Suite FAILED: ${suite}"
  fi
  echo ""
done

echo "================================================================================"
echo "📊 ALL TEST SUITES EXECUTION SUMMARY"
echo "================================================================================"
echo "Total Suites:  ${TOTAL_SUITES}"
echo "Passed Suites: ${PASSED_SUITES}"
echo "Failed Suites: ${FAILED_SUITES}"
echo "================================================================================"

if [ "${FAILED_SUITES}" -gt 0 ]; then
  echo "❌ TEST EXECUTION FAILED: ${FAILED_SUITES} suite(s) had errors."
  exit 1
else
  echo "✅ ALL TEST SUITES PASSED WITH 100% SUCCESS!"
  exit 0
fi
