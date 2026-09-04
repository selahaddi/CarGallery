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
echo "    AutoRaten - Tüm Servisler Başlatılıyor"
echo "=================================================="
echo ""

# Python kontrolü ve PDF API sunucusunu başlatma
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    PYTHON_CMD=""
fi

if [ -n "$PYTHON_CMD" ]; then
    echo "[1/2] Python Sanal Ortam (venv) kontrol ediliyor..."
    if [ ! -d "venv" ]; then
        echo "[INFO] Sanal ortam (venv) oluşturuluyor..."
        $PYTHON_CMD -m venv venv
    fi
    
    # Sanal ortamı aktifleştir
    source venv/bin/activate
    
    echo "[INFO] Kütüphaneler kuruluyor (Flask, Pillow)..."
    pip install flask pillow >/dev/null 2>&1
    
    echo "[1/2] PDF API Sunucusu arka planda başlatılıyor (Port 8000)..."
    python scripts/api_server.py &
    PDF_PID=$!
    
    # Betik sonlandığında PDF sunucusunu da kapat
    trap "echo 'Sunucular durduruluyor...'; kill $PDF_PID 2>/dev/null; deactivate" EXIT INT TERM
    sleep 2
else
    echo "[UYARI] Python bulunamadı! PDF API sunucusu başlatılamadı."
fi

echo ""
echo "[2/2] Web Uygulaması ve n8n Paneli başlatılıyor..."
echo "Durdurmak için Ctrl+C basabilirsiniz."
echo "=================================================="
echo ""

# Node.js (npm) yüklü mü kontrol et
if command -v npm &> /dev/null; then
    # Web uygulamasını ve n8n panelini başlat
    npm run n8n
else
    echo "[HATA] Sisteminizde Node.js (npm) kurulu değil!"
    echo "Web uygulaması ve n8n paneli başlatılamadı."
    echo "Lütfen Node.js yükleyin: https://nodejs.org/"
fi

read -p "Kapatmak için Enter'a basın..."
