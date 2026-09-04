#!/bin/bash
cd "$(dirname "$0")"

# Terminal olmadan (çift tıkla) çalıştırılırsa otomatik terminal penceresi aç
if [ ! -t 0 ]; then
  if command -v ptyxis &>/dev/null; then
    exec ptyxis -- bash "$0"
  elif command -v gnome-terminal &>/dev/null; then
    exec gnome-terminal -- bash "$0"
  elif command -v x-terminal-emulator &>/dev/null; then
    exec x-terminal-emulator -e bash "$0"
  fi
fi

echo "=================================================="
echo "      AutoRaten - PDF API Sunucusu    "
echo "=================================================="
echo ""

# Python kontrolü
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "[HATA] Bilgisayarinizda Python bulunamadi!"
        echo "Lutfen Python'i yukleyin."
        read -p "Kapatmak icin Enter'a basin..."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Flask ve Pillow paket kontrolü ve kurulumu
echo "Gerekli kutuphaneler kontrol ediliyor (Flask, Pillow)..."
$PYTHON_CMD -c "import flask, PIL" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[INFO] Flask veya Pillow eksik gorunuyor. Kuruluyor..."
    pip3 install flask pillow || pip install flask pillow
    if [ $? -ne 0 ]; then
        echo "[HATA] Paketler kurulurken bir hata olustu! Lutfen internet baglantinizi kontrol edin."
        read -p "Kapatmak icin Enter'a basin..."
        exit 1
    fi
fi

echo ""
echo "[BASARILI] Kutuphaneler hazir!"
echo ""
echo "PDF API Sunucusu baslatiliyor (Port: 8000)..."
echo "Webhook URL: http://localhost:8000/webhook/generate-pdf"
echo "n8n Docker icin: http://host.docker.internal:8000/webhook/generate-pdf"
echo ""
echo "Kapatmak icin Ctrl+C basabilirsiniz."
echo "=================================================="
echo ""

$PYTHON_CMD scripts/api_server.py
read -p "Kapatmak icin Enter'a basin..."
