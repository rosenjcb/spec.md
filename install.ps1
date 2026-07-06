<#
.SYNOPSIS
  spec.md installer for Windows — drop the spec-md skill and/or agent rule files into a project.

.EXAMPLE
  irm https://raw.githubusercontent.com/rosenjcb/spec.md/main/install.ps1 | iex

.EXAMPLE
  ./install.ps1 -All
  ./install.ps1 -Claude -Cursor

  With no agent switches it installs the Claude Code skill globally
  (~/.claude/skills/spec-md) and writes AGENTS.md into the current project.
#>
[CmdletBinding()]
param(
  [switch]$Claude,
  [switch]$Cursor,
  [switch]$Windsurf,
  [switch]$Cline,
  [switch]$Copilot,
  [switch]$Agents,
  [switch]$All,
  [switch]$Local,
  [string]$Dir = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$Repo   = "rosenjcb/spec.md"
$Branch = if ($env:SPEC_MD_REF) { $env:SPEC_MD_REF } else { "main" }
$Base   = "https://raw.githubusercontent.com/$Repo/$Branch"

# Local checkout detection.
$SrcDir = $null
if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot "SKILL.md"))) { $SrcDir = $PSScriptRoot }

function Say  ($m) { Write-Host "› $m" -ForegroundColor Blue }
function Ok   ($m) { Write-Host "✓ $m" -ForegroundColor Green }

function Fetch ($rel, $dest) {
  $destDir = Split-Path -Parent $dest
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }
  if ($SrcDir -and (Test-Path (Join-Path $SrcDir $rel))) {
    Copy-Item (Join-Path $SrcDir $rel) $dest -Force
  } else {
    Invoke-WebRequest -UseBasicParsing -Uri "$Base/$rel" -OutFile $dest
  }
}

if ($All) { $Claude=$true; $Cursor=$true; $Windsurf=$true; $Cline=$true; $Copilot=$true; $Agents=$true }
$any = $Claude -or $Cursor -or $Windsurf -or $Cline -or $Copilot -or $Agents
if (-not $any) { $Claude = $true; $Agents = $true }

Write-Host "spec.md installer  ($Repo@$Branch)`n" -ForegroundColor White
if ($SrcDir) { Say "using local checkout" } else { Say "downloading from GitHub" }

if ($Claude) {
  $skillDir = if ($Local) { Join-Path $Dir ".claude/skills/spec-md" } else { Join-Path $HOME ".claude/skills/spec-md" }
  Fetch "SKILL.md"   (Join-Path $skillDir "SKILL.md")
  Fetch "TESTING.md" (Join-Path $skillDir "TESTING.md")
  Ok "Claude Code skill -> $skillDir"
}
if ($Cursor)   { Fetch ".cursor/rules/spec-md.mdc"        (Join-Path $Dir ".cursor/rules/spec-md.mdc");        Ok "Cursor rule installed" }
if ($Windsurf) { Fetch ".windsurf/rules/spec-md.md"       (Join-Path $Dir ".windsurf/rules/spec-md.md");       Ok "Windsurf rule installed" }
if ($Cline)    { Fetch ".clinerules/spec-md.md"           (Join-Path $Dir ".clinerules/spec-md.md");           Ok "Cline rule installed" }
if ($Copilot)  { Fetch ".github/copilot-instructions.md"  (Join-Path $Dir ".github/copilot-instructions.md");  Ok "Copilot instructions installed" }
if ($Agents)   { Fetch "AGENTS.md"                        (Join-Path $Dir "AGENTS.md");                        Ok "AGENTS.md installed" }

Write-Host "`nDone." -ForegroundColor Green
Say "Next: npm i -D spec-md   then   npx spec-md check"
