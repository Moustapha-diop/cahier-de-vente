@echo off
echo ==============================================
echo Demarrage du Backend Spring Boot (MySQL / H2)
echo ==============================================
cd /d "%~dp0\backend"
.\mvnw.cmd spring-boot:run
pause