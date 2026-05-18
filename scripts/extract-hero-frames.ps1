$ffmpeg = "C:\Users\Lenovo\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
$source = "c:\Users\Lenovo\Documents\New project 3\upscaled-video (1).mp4"
$outDir = "c:\Users\Lenovo\Documents\New project 3\rabaz\public\hero-frames"
$videoOut = "c:\Users\Lenovo\Documents\New project 3\rabaz\public\videos\hero.mp4"

if (-not (Test-Path $ffmpeg)) {
  Write-Error "ffmpeg not found at $ffmpeg"
  exit 1
}

New-Item -ItemType Directory -Force -Path $outDir, (Split-Path $videoOut) | Out-Null
Copy-Item $source $videoOut -Force
Get-ChildItem "$outDir\frame_*.jpg" -ErrorAction SilentlyContinue | Remove-Item -Force

& $ffmpeg -y -i $source -vf "select=between(n\,0\,301)" -vsync 0 -q:v 2 -start_number 1 "$outDir\frame_%04d.jpg"
Write-Host "Extracted $((Get-ChildItem "$outDir\frame_*.jpg").Count) frames"
