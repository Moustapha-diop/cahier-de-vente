@echo off
title Cahier de Vente - Lanceur
echo ========================================================
echo   DEMARRAGE DE L'APPLICATION CAHIER DE VENTE DU MAGASIN
echo ========================================================
echo.
echo 1/2. Lancement du serveur Backend (Spring Boot)...
start "Backend Spring Boot" cmd /k "cd /d %~dp0\backend && .\mvnw.cmd spring-boot:run"

echo 2/2. Lancement du Frontend (Angular)...
timeout /t 4
start "Frontend Angular" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo ========================================================
echo   Votre navigateur va s'ouvrir automatiquement !
echo ========================================================