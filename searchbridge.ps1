$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BundledKujo = Join-Path $Root "runtime\kujo.exe"
$Kujo = if ($env:KUJO_BIN) { $env:KUJO_BIN } elseif (Test-Path $BundledKujo) { $BundledKujo } elseif (Get-Command kujo -ErrorAction SilentlyContinue) { "kujo" } else { Join-Path $Root "..\kujo\target\release\kujo.exe" }
if (-not (Get-Command $Kujo -ErrorAction SilentlyContinue) -and -not (Test-Path $Kujo)) { Write-Error "SearchBridge: Kujo runtime not found. Set KUJO_BIN."; exit 2 }
Push-Location $Root
try { & $Kujo run searchbridge.kujo -- @args; exit $LASTEXITCODE } finally { Pop-Location }
