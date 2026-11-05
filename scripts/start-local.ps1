# Tatzli – local preview: build + preview server reachable in the Wi-Fi + open browser
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Test-Path node_modules)) { npm ci }
npm run build
$port = 4173
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1).IPAddress
Write-Host ""
Write-Host "Tatzli lokal:   http://localhost:$port/" -ForegroundColor Green
if ($ip) { Write-Host "Tatzli im WLAN: http://${ip}:$port/  (iPhone/iPad: Safari -> Teilen -> Zum Home-Bildschirm)" -ForegroundColor Green }
Start-Process "http://localhost:$port/"
npx vite preview --host --port $port --strictPort
