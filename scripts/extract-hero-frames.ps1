param(
    [string]$ffmpegPath = "ffmpeg",
    [string]$sourceFile = ""
)

# Dynamically resolve project root relative to the script location
$projDir = [System.IO.Path]::GetFullPath("$PSScriptRoot\..")

# Set default source file path if not provided
if ($sourceFile -eq "") {
    $sourceFile = Join-Path $projDir "source_assets\upscaled-video.mp4"
}

$outDir = Join-Path $projDir "public\hero-frames"
$videoOut = Join-Path $projDir "public\videos\hero.mp4"

# Locate FFmpeg executable
$ffmpeg = $ffmpegPath
if (-not (Get-Command $ffmpeg -ErrorAction SilentlyContinue)) {
    # Check common Winget/local user install location in AppData
    $userProfile = $env:USERPROFILE
    $wingetFFmpeg = Get-ChildItem -Path "$userProfile\AppData\Local\Microsoft\WinGet\Packages" -Filter "ffmpeg.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if ($wingetFFmpeg) {
        $ffmpeg = $wingetFFmpeg
    } else {
        Write-Error "FFmpeg executable not found in PATH or AppData. Please install FFmpeg or specify the path via -ffmpegPath."
        exit 1
    }
}

if (-not (Test-Path $sourceFile)) {
    Write-Error "Source video file not found at $sourceFile"
    exit 1
}

Write-Host "Using FFmpeg: $ffmpeg"
Write-Host "Source video: $sourceFile"
Write-Host "Output frames directory: $outDir"
Write-Host "Output video: $videoOut"

# Ensure output directories exist
New-Item -ItemType Directory -Force -Path $outDir, (Split-Path $videoOut) | Out-Null

# Copy main video to public/videos/hero.mp4
Copy-Item $sourceFile $videoOut -Force

# Clean old frames
Get-ChildItem "$outDir\frame_*.jpg" -ErrorAction SilentlyContinue | Remove-Item -Force

# Extract 360 frames at 30fps for the 12-second hero sequence.
& $ffmpeg -y -i $sourceFile -vf "fps=30,select=lt(n\,360)" -vsync 0 -q:v 2 -start_number 1 "$outDir\frame_%04d.jpg"

Write-Host "Successfully extracted $((Get-ChildItem "$outDir\frame_*.jpg").Count) frames"
