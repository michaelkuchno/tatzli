# Sets the GitHub Actions secrets for Tatzli (run once by the owner; values never leave your machine except to GitHub).
#   powershell -ExecutionPolicy Bypass -File scripts\set-secrets.ps1
$ErrorActionPreference = 'Stop'
$repo = 'michaelkuchno/tatzli'
$ks = Join-Path $HOME 'baerni-keystore\tatzli-release.p12'
$readme = Join-Path $HOME 'baerni-keystore\README.txt'
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($ks))
$pw = (Select-String 'password: (.+)$' $readme).Matches[0].Groups[1].Value.Trim()
gh secret set TATZLI_KEYSTORE_B64 --body $b64 -R $repo
gh secret set TATZLI_KEYSTORE_PASSWORD --body $pw -R $repo
$key = [Environment]::GetEnvironmentVariable('GEMINI_API_KEY', 'User')
if ($key) { gh secret set GEMINI_API_KEY --body $key -R $repo } else { Write-Warning 'GEMINI_API_KEY not set – daily audio workflow will not run' }
gh secret list -R $repo
Write-Host 'OK – secrets set.' -ForegroundColor Green
