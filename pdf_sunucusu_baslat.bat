@echo off
title AutoRaten - PDF API Sunucusu
echo ==================================================
echo       AutoRaten - PDF API Sunucusu    
echo ==================================================
echo.

:: Python kontrolü
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Bilgisayarinizda Python bulunamadi!
    echo Lutfen Python'i yukleyin ve PATH ortam degiskenine eklediginizden emin olun.
    echo Python indirmek icin: https://www.python.org/downloads/
    goto error
)

:: Flask ve Pillow paket kontrolü ve kurulumu
echo Gerekli kutuphaneler kontrol ediliyor (Flask, Pillow)...
python -c "import flask, PIL" >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Flask veya Pillow eksik gorunuyor. Kuruluyor...
    pip install flask pillow
    if %errorlevel% neq 0 (
        echo [HATA] Paketler kurulurken bir hata olustu! Lutfen internet baglantinizi kontrol edin.
        goto error
    )
)

echo.
echo [BASARILI] Kutuphaneler hazir!
echo.
echo PDF API Sunucusu baslatiliyor (Port: 8000)...
echo Webhook URL: http://localhost:8000/webhook/generate-pdf
echo n8n Docker icin: http://host.docker.internal:8000/webhook/generate-pdf
echo.
echo Kapatmak icin bu pencereyi kapatabilir veya Ctrl+C basabilirsiniz.
echo ==================================================
echo.

python scripts\api_server.py
goto end

:error
echo.
echo Sunucu baslatilamadi. Lutfen yukaridaki hatalari giderip tekrar deneyin.
echo.

:end
pause
