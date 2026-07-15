import sys
import json
from PIL import Image, ImageDraw, ImageFont

def create_offer_pdf(json_file_path, output_pdf_path):
    # 1. JSON verisini n8n'den oku
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    customer = data.get("customer", {})
    car = data.get("car", {})
    
    # 2. A4 Tuval Oluştur (150 DPI - 1240x1754 Piksel)
    # Tasarıma sadık kalmak için koyu gri/siyah arka plan (Tailwind zinc-900)
    img = Image.new('RGB', (1240, 1754), color='#18181b')
    draw = ImageDraw.Draw(img)
    
    try:
        # Eski değer 60'tı, başlığı 48'e düşürebilirsin
        font_title = ImageFont.truetype("Montserrat-Bold.ttf", 48) 
        
        # Eski değer 40'tı, alt başlıkları 32'ye düşürebilirsin
        font_heading = ImageFont.truetype("Montserrat-Bold.ttf", 32) 
        
        # Eski değer 35'ti, gövde metnini 24-26 arasına çekebilirsin
        font_body = ImageFont.truetype("Montserrat-Regular.ttf", 26) 
        
        # Eski değer 45'ti, vurgulu alanı 36 yapabilirsin
        font_highlight = ImageFont.truetype("Montserrat-Bold.ttf", 36) 

    except IOError:
        print("Hata: Font dosyaları bulunamadı. Lütfen Montserrat-Bold.ttf ve Montserrat-Regular.ttf dosyalarını dizine ekleyin.")
        sys.exit(1)
        
    # Renk Paleti
    text_white = "#ffffff"
    text_gray = "#a1a1aa" # zinc-400
    brand_red = "#dc2626" # red-600
    
    # --- BAŞLIK (HEADER) ---
    draw.text((100, 100), "AutoRaten", font=font_title, fill=text_white)
    draw.text((100, 170), "FINANZIERUNGSANGEBOT", font=font_heading, fill=brand_red)
    draw.line([(100, 230), (1140, 230)], fill=text_gray, width=2)
    
    # --- MÜŞTERİ BİLGİLERİ ---
    draw.text((100, 280), "Kunde (Müşteri):", font=font_heading, fill=text_white)
    draw.text((100, 330), f"Name: {customer.get('name', 'N/A')}", font=font_body, fill=text_gray)
    draw.text((100, 380), f"E-Mail: {customer.get('email', 'N/A')}", font=font_body, fill=text_gray)
    draw.text((100, 430), f"Tel: {customer.get('phone', 'N/A')}", font=font_body, fill=text_gray)
    
    # --- ARAÇ BİLGİLERİ ---
    draw.text((100, 530), "Fahrzeug (Araç):", font=font_heading, fill=text_white)
    draw.text((100, 580), f"Modell: {car.get('title', 'N/A')}", font=font_body, fill=brand_red)
    
    # --- FİNANSMAN TABLOSU ---
    draw.line([(100, 680), (1140, 680)], fill=text_gray, width=2)
    draw.text((100, 720), "Ihre Finanzierungsdetails:", font=font_heading, fill=text_white)
    
    # Satır satır hesaplamalar ve yazdırma
    try:
        price = float(car.get('price', 0) or 0)
    except:
        price = 0.0
        
    try:
        down_payment = float(car.get('down_payment', 0) or 0)
    except:
        down_payment = 0.0
        
    try:
        monthly_rate = float(car.get('monthly_rate', 0) or 0)
    except:
        monthly_rate = 0.0
        
    net_loan = price - down_payment
    
    y_offset = 800
    line_spacing = 60
    
    try:
        term_months = int(car.get('term_months', 48) or 48)
    except:
        term_months = 48
        
    try:
        interest_rate = float(car.get('interest_rate', 3.8) or 3.8)
    except:
        interest_rate = 3.8
        
    total_loan_payment = monthly_rate * term_months
    total_interest = max(0.0, total_loan_payment - net_loan) if price > 0 else 0.0
    total_cost = total_loan_payment + down_payment if price > 0 else 0.0
    
    # Sol kolon etiketleri, Sağ kolon değerleri
    details = [
        ("Fahrzeugpreis (Araç Fiyatı):", f"{price:,.2f} EUR"),
        ("Anzahlung (Peşinat):", f"{down_payment:,.2f} EUR"),
        ("Nettodarlehensbetrag (Net Kredi):", f"{net_loan:,.2f} EUR"),
        ("Laufzeit (Vade):", f"{term_months} Monate"),
        ("Sollzins p.a. (Yıllık Faiz):", f"{interest_rate} %"),
        ("Gesamtzins (Toplam Faiz):", f"{total_interest:,.2f} EUR"),
        ("Gesamtkosten (Toplam Ödenecek):", f"{total_cost:,.2f} EUR")
    ]
    
    for label, value in details:
        draw.text((100, y_offset), label, font=font_body, fill=text_gray)
        draw.text((800, y_offset), str(value), font=font_body, fill=text_white)
        y_offset += line_spacing
        
    # Vurgulu Kısım (Aylık Taksit)
    y_offset += 40
    draw.rectangle([(90, y_offset - 20), (1150, y_offset + 80)], outline=brand_red, width=3)
    draw.text((100, y_offset), "Monatliche Rate:", font=font_highlight, fill=brand_red)
    draw.text((800, y_offset), f"{monthly_rate:,.2f} EUR", font=font_highlight, fill=brand_red)
    
    # --- ALT BİLGİ (FOOTER) ---
    draw.line([(100, 1500), (1140, 1500)], fill=text_gray, width=2)
    footer_text = "Alle Preisangaben inklusive Mehrwertsteuer. Dieses Angebot ist unverbindlich."
    draw.text((100, 1530), footer_text, font=ImageFont.truetype("Montserrat-Regular.ttf", 25), fill=text_gray)
    
    # 4. Resmi PDF olarak kaydet
    img.save(output_pdf_path, "PDF", resolution=100.0)
    print(f"PDF Başarıyla Üretildi: {output_pdf_path}")

if __name__ == "__main__":
    # Terminalden argüman olarak JSON yolu ve çıktı yolu alınacak
    if len(sys.argv) != 3:
        print("Kullanım: python generate_pdf.py <input_json> <output_pdf>")
        sys.exit(1)
        
    input_json = sys.argv[1]
    output_pdf = sys.argv[2]
    create_offer_pdf(input_json, output_pdf)
