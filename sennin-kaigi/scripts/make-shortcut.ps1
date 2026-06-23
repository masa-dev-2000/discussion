# 先人会議: ビルド済み実行ファイルへのデスクトップショートカットを作成 (Windows)
# 使い方:
#   1) npm run tauri build
#   2) powershell -ExecutionPolicy Bypass -File scripts\make-shortcut.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot          # sennin-kaigi
$rel = Join-Path $root "src-tauri\target\release"

if (-not (Test-Path $rel)) {
  Write-Host "release フォルダが見つかりません: $rel"
  Write-Host "先に 'npm run tauri build' を実行してください。"
  exit 1
}

# 実行ファイルを探す(productName / cargo名 / フォールバック)
$exe = $null
foreach ($name in @("先人会議.exe", "sennin-kaigi.exe")) {
  $p = Join-Path $rel $name
  if (Test-Path $p) { $exe = $p; break }
}
if (-not $exe) {
  $exe = (Get-ChildItem -Path $rel -Filter *.exe -File | Select-Object -First 1).FullName
}
if (-not $exe) {
  Write-Host "実行ファイル(.exe)が見つかりません。'npm run tauri build' が成功しているか確認してください。"
  exit 1
}

$desktop = [Environment]::GetFolderPath("Desktop")
$lnk = Join-Path $desktop "先人会議.lnk"

$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut($lnk)
$sc.TargetPath = $exe
$sc.WorkingDirectory = Split-Path -Parent $exe
$sc.IconLocation = $exe
$sc.Description = "先人会議 — アイデアエーション討議"
$sc.Save()

Write-Host "デスクトップにショートカットを作成しました:"
Write-Host "  $lnk"
Write-Host "  -> $exe"
