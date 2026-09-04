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

echo "==================================================="
echo "  GITHUB GUNCELLEME BETIGI"
echo "==================================================="
echo ""

echo "[1/4] Degisiklikler taraniyor..."
git status -s
echo ""

echo "[2/4] Tum degisiklikler sahneye ekleniyor..."
git add -A
if [ $? -ne 0 ]; then
    echo "HATA: git add basarisiz oldu."
    read -p "Kapatmak icin Enter'a basin..."
    exit 1
fi
echo ""

read -p "Commit mesaji yazin (bos birakirsaniz: Sistem guncellemeleri): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Sistem guncellemeleri"
fi

echo "[3/4] Degisiklikler commit ediliyor..."
git commit -m "$commit_msg"
if [ $? -ne 0 ]; then
    echo ""
    echo "UYARI: Commit edilecek degisiklik yok veya bir hata olustu."
    echo "Zaten guncel olabilirsiniz."
    read -p "Kapatmak icin Enter'a basin..."
    exit 1
fi
echo ""

echo "[4/4] Kodlar GitHub'a gonderiliyor..."
git push
if [ $? -ne 0 ]; then
    echo ""
    echo "==================================================="
    echo "  HATA: git push basarisiz oldu."
    echo "  Internet baglantinizi veya kimlik bilgilerinizi kontrol edin."
    echo "==================================================="
    read -p "Kapatmak icin Enter'a basin..."
    exit 1
fi

echo ""
echo "==================================================="
echo "  BASARILI: Kodlar GitHub'a yuklendi!"
echo "  Vercel otomatik olarak yayina alma islemini baslatti."
echo "==================================================="
echo ""
read -p "Kapatmak icin Enter'a basin..."
