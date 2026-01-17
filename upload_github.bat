@echo off
echo ==========================================
echo    Sincronizacion Automatica con GitHub
echo ==========================================
echo.

REM Intentar detectar git
SET GIT_CMD=git
IF EXIST ".\MinGit\cmd\git.exe" SET GIT_CMD=".\MinGit\cmd\git.exe"

echo Usando Git en: %GIT_CMD%
echo.

echo 1. Comprobando y configurando repositorio...
%GIT_CMD% branch -M main

REM Configurar remoto de forma segura (set-url o add)
%GIT_CMD% remote set-url origin https://github.com/Wds10/wmekers.git >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Configurando remoto origin por primera vez...
    %GIT_CMD% remote add origin https://github.com/Wds10/wmekers.git
) ELSE (
    echo Remoto origin actualizado.
)

echo.
echo 2. Preparando archivos para subida...
%GIT_CMD% add .
%GIT_CMD% commit -m "Actualizacion automatica desde script"

echo.
echo 3. Subiendo cambios a GitHub...
%GIT_CMD% push -u origin main

echo.
echo ==========================================
IF %ERRORLEVEL% EQU 0 (
    echo    PROCESO COMPLETADO EXITOSAMENTE
) ELSE (
    echo    HUBO UN ERROR DURANTE LA SUBIDA
    echo    Por favor revisa los mensajes anteriores.
)
echo ==========================================
pause
