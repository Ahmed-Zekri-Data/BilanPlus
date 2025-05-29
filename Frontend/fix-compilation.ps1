# Script pour nettoyer et recompiler le projet Angular

Write-Host "🧹 Nettoyage du cache et recompilation..." -ForegroundColor Yellow

# 1. Nettoyer le cache npm
Write-Host "1. Nettoyage du cache npm..." -ForegroundColor Cyan
npm cache clean --force

# 2. Supprimer node_modules et package-lock.json
Write-Host "2. Suppression de node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

# 3. Réinstaller les dépendances
Write-Host "3. Réinstallation des dépendances..." -ForegroundColor Cyan
npm install

# 4. Nettoyer le cache Angular
Write-Host "4. Nettoyage du cache Angular..." -ForegroundColor Cyan
if (Test-Path ".angular") {
    Remove-Item -Recurse -Force ".angular"
}

# 5. Compiler le projet
Write-Host "5. Compilation du projet..." -ForegroundColor Cyan
ng build --configuration development

Write-Host "✅ Nettoyage et compilation terminés!" -ForegroundColor Green
