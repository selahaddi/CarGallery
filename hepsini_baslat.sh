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
echo "    AutoRaten - Yerel Sistem Başlatılıyor"
echo "=================================================="
echo ""

PIDS=()

cleanup() {
  echo ""
  echo "Sunucular durduruluyor..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  if [ -n "$VENV_ACTIVE" ]; then
    deactivate 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM

# 1. Yerel Veritabanı & API Sunucusu (Port 5005)
echo "[1/3] Yerel SQLite API Sunucusu başlatılıyor (Port 5005)..."
node server/index.js &
API_PID=$!
PIDS+=($API_PID)
sleep 1

# 2. Python kontrolü ve PDF API sunucusunu başlatma (Port 8000)
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    PYTHON_CMD=""
fi

if [ -n "$PYTHON_CMD" ]; then
    echo "[2/3] Python Sanal Ortam (venv) kontrol ediliyor..."
    if [ ! -d "venv" ]; then
        echo "[INFO] Sanal ortam (venv) oluşturuluyor..."
        $PYTHON_CMD -m venv venv
    fi
    
    # Sanal ortamı aktifleştir
    source venv/bin/activate
    VENV_ACTIVE=1
    
    echo "[INFO] Kütüphaneler kontrol ediliyor (Flask, Pillow)..."
    pip install flask pillow >/dev/null 2>&1
    
    echo "[2/3] PDF API Sunucusu arka planda başlatılıyor (Port 8000)..."
    python scripts/api_server.py &
    PDF_PID=$!
    PIDS+=($PDF_PID)
    sleep 1
else
    echo "[UYARI] Python bulunamadı! PDF API sunucusu atlandı."
fi

echo ""
echo "[3/3] Web Uygulaması başlatılıyor..."
echo "Uygulama: http://localhost:5173"
echo "Durdurmak için Ctrl+C basabilirsiniz."
echo "=================================================="
echo ""

# Node.js (npm) yüklü mü kontrol et
if command -v npm &> /dev/null; then
    npm run dev
else
    echo "[HATA] Sisteminizde Node.js (npm) kurulu değil!"
    read -p "Kapatmak için Enter'a basın..."
fi
