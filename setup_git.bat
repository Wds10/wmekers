@echo off
echo ==================================================
echo   CONFIGURACION AUTOMATICA DE GIT (PORTATIL)
echo ==================================================

REM Usamos el Git que descargue en la carpeta MinGit
set GIT=".\MinGit\cmd\git.exe"

if not exist %GIT% (
    echo ERROR: No encuentro el archivo git.exe en MinGit.
    pause
    exit
)

echo.
echo 1. Iniciando repositorio...
%GIT% init

echo.
echo 2. Configurando usuario...
%GIT% config user.email "reygarufa10@gmail.com"
%GIT% config user.name "Rey Garufa"

echo.
echo 3. Guardando archivos...
%GIT% add .
%GIT% commit -m "Commit automatico del Asistente"

echo.
echo 4. Conectando con GitHub...
%GIT% branch -M main
%GIT% remote remove origin 2>NUL
%GIT% remote add origin https://github.com/Wds10/wmekers.git

echo.
echo 5. Subiendo archivos (PUSH)...
echo --------------------------------------------------
echo ATENCION: Es posible que se abra una ventana pidiendo
echo tus credenciales de GitHub. Por favor completala.
echo --------------------------------------------------
%GIT% push -u origin main

echo.
echo ==================================================
echo   PROCESO TERMINADO
echo ==================================================
pause
