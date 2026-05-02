# Envoie la branche main du dossier FRA vers GitHub : francoisraifaud-cpu/FRA
# (meme identifiants Windows / Git Credential Manager que d'habitude.)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "git push vers origin (FRA)..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "OK : https://github.com/francoisraifaud-cpu/FRA" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "Erreur. Copie le message ci-dessus." -ForegroundColor Red
}

Write-Host ""
$null = Read-Host "Entree pour fermer"
