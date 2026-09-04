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

echo "Uygulama baslatiliyor ve n8n Paneli aciliyor..."
npm run n8n
read -p "Kapatmak icin Enter'a basin..."
