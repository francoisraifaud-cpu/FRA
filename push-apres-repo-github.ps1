# Sauvegarde FRA sur GitHub SANS creer un second depot.
# Tout part sur le meme repo que le site : branche "fra-source-n8n".
# Meme identifiants que pour site-rapports-astro (Git Credential Manager).

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$siteUrl = "https://github.com/francoisraifaud-cpu/site-rapports-astro.git"
$branch  = "fra-source-n8n"

if (-not (git remote get-url site 2>$null)) {
  git remote add site $siteUrl
}

Write-Host "Envoi de la branche locale main vers GitHub : site-rapports-astro / $branch" -ForegroundColor Cyan
git push -u site "main:${branch}"

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "OK. Voir sur GitHub (onglet branches, choisir $branch) :" -ForegroundColor Green
  Write-Host "  https://github.com/francoisraifaud-cpu/site-rapports-astro/branches"
} else {
  Write-Host ""
  Write-Host "Erreur. Copie le message ci-dessus." -ForegroundColor Red
}

Write-Host ""
$null = Read-Host "Entree pour fermer"
