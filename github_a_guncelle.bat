@echo off
chcp 65001 > nul
title GitHub Güncelleme Yardımcısı

echo ===================================================
echo 🚀 DORTMUND FLEET FINANCE - GITHUB GÜNCELLEME BETİĞİ
echo ===================================================
echo.

echo [1/4] Değişiklikler taranıyor...
git status -s
echo.

echo [2/4] Tüm değişiklikler sahneye ekleniyor...
git add -A
echo.

set /p commit_msg="Lütfen bir commit mesajı yazın (Varsayılan: 'Sistem güncellemeleri'): "
if "%commit_msg%"=="" set commit_msg=Sistem güncellemeleri

echo [3/4] Değişiklikler commit ediliyor...
git commit -m "%commit_msg%"
echo.

echo [4/4] Kodlar GitHub'a gönderiliyor (git push)...
git push
echo.

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo ✅ BAŞARILI: Kodlar GitHub'a yüklendi!
    echo Vercel otomatik olarak yayına alma işlemini başlattı.
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo ❌ HATA: Kodlar GitHub'a yüklenemedi.
    echo Lütfen internet bağlantınızı veya kimlik bilgilerinizi kontrol edin.
    echo ===================================================
)

echo.
pause
