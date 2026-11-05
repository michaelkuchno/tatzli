# Daily recording job (Windows Task Scheduler, after the Gemini free-tier quota reset).
# Generates the next batch of recordings (youngest level first), verifies Bärndütsch pronunciation,
# commits and pushes → GitHub Pages redeploys → the PWA and the Android/iOS apps get the new audio.
$ErrorActionPreference = 'Continue'
Set-Location (Join-Path $PSScriptRoot '..')
$log = Join-Path $PSScriptRoot 'data\daily-audio.log'
"=== $(Get-Date -Format s) ===" | Out-File $log -Append -Encoding utf8
git pull --rebase -q 2>&1 | Out-File $log -Append -Encoding utf8
npx tsx scripts/generate-audio.ts 2>&1 | Select-Object -Last 25 | Out-File $log -Append -Encoding utf8
npx tsx scripts/verify-be-audio.ts --delete-failed 2>&1 | Select-Object -Last 15 | Out-File $log -Append -Encoding utf8
npx tsx scripts/generate-audio.ts --encode-only 2>&1 | Select-Object -Last 8 | Out-File $log -Append -Encoding utf8
git add public/audio scripts/data 2>&1 | Out-Null
$status = node -e "const s=require('./scripts/data/audio-status.json').status;let d=0,t=0;for(const v of Object.values(s)){d+=v.done;t+=v.total}console.log(d+'/'+t)"
git commit -q -m "audio: daily Gemini TTS batch ($status)" 2>&1 | Out-File $log -Append -Encoding utf8
git push -q 2>&1 | Out-File $log -Append -Encoding utf8
"done: $status" | Out-File $log -Append -Encoding utf8
