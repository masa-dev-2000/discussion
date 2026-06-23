# 先人会議: ビルド済み実行ファイルへのショートカットを作成 (Windows)
#   - デスクトップ(ダブルクリック起動用)
#   - スタートメニュー(Win キー検索で起動用)
# 使い方:
#   1) npm run tauri build
#   2) powershell -ExecutionPolicy Bypass -File scripts\make-shortcut.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot          # sennin-kaigi
$rel = Join-Path $root "src-tauri\target\release"

if (-not (Test-Path $rel)) {
  Write-Host "release folder not found: $rel"
  Write-Host "Run 'npm run tauri build' first."
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
  Write-Host "No .exe found. Make sure 'npm run tauri build' succeeded."
  exit 1
}

function New-Shortcut($path) {
  $ws = New-Object -ComObject WScript.Shell
  $sc = $ws.CreateShortcut($path)
  $sc.TargetPath = $exe
  $sc.WorkingDirectory = Split-Path -Parent $exe
  $sc.IconLocation = $exe
  $sc.Description = "Sennin Kaigi"
  $sc.Save()
  Write-Host "  $path"
}

Write-Host "Created shortcuts:"

# デスクトップ(ダブルクリック起動)
$desktop = [Environment]::GetFolderPath("Desktop")
New-Shortcut (Join-Path $desktop "先人会議.lnk")

# スタートメニュー(Win キー検索で起動)
$programs = [Environment]::GetFolderPath("Programs")  # %APPDATA%\Microsoft\Windows\Start Menu\Programs
New-Shortcut (Join-Path $programs "先人会議.lnk")
# ローマ字でも検索できるよう別名も用意
New-Shortcut (Join-Path $programs "Sennin Kaigi.lnk")

Write-Host ""
Write-Host "Press Win and search for the app to launch (it may take a moment to appear in search)."
