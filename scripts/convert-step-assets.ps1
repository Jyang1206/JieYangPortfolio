param(
  [string]$InputDir = "app\model",
  [string]$OutputDir = "public\models",
  [string]$TempDir = "tmp\model-conversion"
)

$ErrorActionPreference = "Stop"

function Resolve-Tool {
  param(
    [string]$CommandName,
    [string[]]$FallbackPaths
  )

  $command = Get-Command $CommandName -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  foreach ($path in $FallbackPaths) {
    if (Test-Path -LiteralPath $path) {
      return $path
    }
  }

  throw "Could not find $CommandName. Install it first or add it to PATH."
}

$repoRoot = Resolve-Path "."
$freecadScript = Join-Path $repoRoot "scripts\freecad_step_to_obj.py"
$blenderScript = Join-Path $repoRoot "scripts\blender_obj_to_glb.py"
$inputPath = Join-Path $repoRoot $InputDir
$outputPath = Join-Path $repoRoot $OutputDir
$tempPath = Join-Path $repoRoot $TempDir

$freecadPython = Resolve-Tool "FreeCADPython" @(
  "$env:LOCALAPPDATA\Programs\FreeCAD 1.1\bin\python.exe",
  "$env:LOCALAPPDATA\Programs\FreeCAD 1.0\bin\python.exe",
  "C:\Program Files\FreeCAD 1.0\bin\python.exe",
  "C:\Program Files\FreeCAD 0.21\bin\python.exe",
  "C:\Program Files\FreeCAD\bin\python.exe"
)

$blender = Resolve-Tool "blender" @(
  "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe",
  "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe",
  "C:\Program Files\Blender Foundation\Blender 4.4\blender.exe",
  "C:\Program Files\Blender Foundation\Blender 4.3\blender.exe",
  "C:\Program Files\Blender Foundation\Blender\blender.exe"
)

New-Item -ItemType Directory -Force -Path $outputPath, $tempPath | Out-Null

$freecadHome = Join-Path $tempPath "freecad-home"
New-Item -ItemType Directory -Force -Path $freecadHome | Out-Null
$env:FREECAD_USER_HOME = $freecadHome
$env:XDG_CONFIG_HOME = $freecadHome
$env:XDG_CACHE_HOME = $freecadHome
$env:PYTHONUSERBASE = $freecadHome

$stepFiles = Get-ChildItem -LiteralPath $inputPath -File | Where-Object {
  $_.Extension -in ".step", ".stp"
}

if (-not $stepFiles) {
  throw "No STEP/STP files found in $inputPath"
}

foreach ($stepFile in $stepFiles) {
  $safeName = [IO.Path]::GetFileNameWithoutExtension($stepFile.Name).ToLowerInvariant()
  $safeName = $safeName -replace "[^a-z0-9]+", "-"
  $safeName = $safeName.Trim("-")

  $objPath = Join-Path $tempPath "$safeName.obj"
  $glbPath = Join-Path $outputPath "$safeName.glb"

  Write-Host "Converting STEP to OBJ: $($stepFile.Name)"
  $env:STEP_INPUT = $stepFile.FullName
  $env:OBJ_OUTPUT = $objPath
  & $freecadPython $freecadScript
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $objPath)) {
    throw "FreeCAD failed to create OBJ for $($stepFile.Name)"
  }

  Write-Host "Converting OBJ to GLB: $safeName.glb"
  & $blender --background --python $blenderScript -- $objPath $glbPath
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $glbPath)) {
    throw "Blender failed to create GLB for $($stepFile.Name)"
  }
}

Write-Host "Conversion complete. GLB files written to $outputPath"
