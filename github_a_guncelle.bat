@echo off
chcp 65001 > nul
title GitHub Guncelleme Yardimcisi
cd /d "%~dp0"

echo ===================================================
echo   GITHUB GUNCELLEME BETIGI
echo ===================================================
echo.

echo [1/4] Degisiklikler taraniyor...
git status -s
echo.

echo [2/4] Tum degisiklikler sahneye ekleniyor...
git add -A
if %errorlevel% neq 0 (
    echo HATA: git add basarisiz oldu.
    pause
    exit /b 1
)
echo.

set /p "commit_msg=Commit mesaji yazin (bos birakirsaniz: Sistem guncellemeleri): "
if "%commit_msg%"=="" set "commit_msg=Sistem guncellemeleri"

echo [3/4] Degisiklikler commit ediliyor...
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo.
    echo UYARI: Commit edilecek degisiklik yok veya bir hata olustu.
    echo Zaten guncel olabilirsiniz.
    pause
    exit /b 1
)
echo.

echo [4/4] Kodlar GitHub'a gonderiliyor...
git push
if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo   HATA: git push basarisiz oldu.
    echo   Internet baglantinizi veya kimlik bilgilerinizi kontrol edin.
    echo ===================================================
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   BASARILI: Kodlar GitHub'a yuklendi!
echo   Vercel otomatik olarak yayina alma islemini baslatti.
echo ===================================================
echo.
pause
