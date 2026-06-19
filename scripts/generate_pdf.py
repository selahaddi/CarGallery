import sys
import json
import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont

def create_offer_pdf(json_file_path, output_pdf_path):
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    customer = data.get("customer", {})
    car = data.get("car", {})
    
    # Create A4 Canvas (300 DPI - 2480x3508)
    width, height = 2480, 3508
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)
    
    scale = 2
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define fallback fonts
    def load_font(primary, secondary, size):
        try:
            return ImageFont.truetype(os.path.join(script_dir, primary), int(size * scale))
        except IOError:
            try:
                return ImageFont.truetype(os.path.join(script_dir, secondary), int(size * scale))
            except IOError:
                return ImageFont.load_default()

    font_brand = load_font("Sora-Bold.ttf", "Montserrat-Bold.ttf", 44)
    font_offer = load_font("Sora-SemiBold.ttf", "Montserrat-Bold.ttf", 30)
    font_heading = load_font("Sora-SemiBold.ttf", "Montserrat-Bold.ttf", 36)
    font_label_sm = load_font("Inter-Regular.ttf", "Montserrat-Regular.ttf", 22)
    font_val_md = load_font("Inter-Medium.ttf", "Montserrat-Bold.ttf", 28)
    font_val_lg = load_font("Inter-SemiBold.ttf", "Montserrat-Bold.ttf", 34)
    font_table_lbl = load_font("Inter-Regular.ttf", "Montserrat-Regular.ttf", 32)
    font_table_val = load_font("Inter-SemiBold.ttf", "Montserrat-Bold.ttf", 36)
    font_rate_lbl = load_font("Sora-Bold.ttf", "Montserrat-Bold.ttf", 50)
    font_rate_sub = load_font("Sora-Regular.ttf", "Montserrat-Regular.ttf", 32)
    font_rate_val = load_font("Sora-Bold.ttf", "Montserrat-Bold.ttf", 80)
    font_footer = load_font("Inter-Regular.ttf", "Montserrat-Regular.ttf", 20)

    # Colors
    brand_red = "#e11d48"
    brand_black = "#111827"
    brand_gray = "#6b7280"
    brand_border = "#d1d5db"
    
    # 1. Header
    y = 180
    auto_text, raten_text = "Auto", "Raten"
    w_auto = draw.textlength(auto_text, font=font_brand)
    
    draw.text((200, y), auto_text, font=font_brand, fill=brand_black)
    draw.text((200 + w_auto, y), raten_text, font=font_brand, fill=brand_red)
    
    offer_num = "OFFER #AR-2024-001"
    w_off = draw.textlength(offer_num, font=font_offer)
    draw.text((2280 - w_off, y + 20), offer_num, font=font_offer, fill=brand_black)
    
    y += 100
    draw.rectangle([(200, y), (2280, y + 16)], fill=brand_red)
    y += 80

    # 2. Grid (Customer & Vehicle)
    box_h = 900
    # Customer Box
    draw.rounded_rectangle([(200, y), (1200, y + box_h)], radius=24, outline=brand_border, width=3)
    
    cx, cy = 250, y + 50
    draw.rectangle([(cx, cy + 10), (cx + 12, cy + 46)], fill=brand_red)
    draw.text((cx + 30, cy), "Kunde (Müşteri)", font=font_heading, fill=brand_black)
    
    cy += 120
    cust_fields = [
        ("Name:", customer.get('name', 'N/A').upper()),
        ("E-Mail:", customer.get('email', 'N/A')),
        ("Tel:", customer.get('phone', 'N/A'))
    ]
    for lbl, val in cust_fields:
        draw.text((cx, cy), lbl, font=font_label_sm, fill=brand_gray)
        cy += 50
        draw.text((cx, cy), val, font=font_val_md, fill=brand_black)
        cy += 100

    # Vehicle Box
    vx = 1280
    draw.rounded_rectangle([(vx, y), (2280, y + box_h)], radius=24, outline=brand_border, width=3)
    
    vy = y + 50
    draw.rectangle([(vx + 50, vy + 10), (vx + 62, vy + 46)], fill=brand_red)
    draw.text((vx + 80, vy), "Fahrzeug (Araç)", font=font_heading, fill=brand_black)
    
    vy += 100
    draw.text((vx + 50, vy), "Modell: ", font=font_label_sm, fill=brand_gray)
    mod_w = draw.textlength("Modell: ", font=font_label_sm)
    draw.text((vx + 50 + mod_w + 10, vy - 6), car.get('title', 'N/A').upper(), font=font_val_lg, fill=brand_black)
    
    vy += 80
    # Image Area
    img_box_x1, img_box_y1 = vx + 50, vy
    img_box_x2, img_box_y2 = 2230, y + box_h - 50
    img_w, img_h = img_box_x2 - img_box_x1, img_box_y2 - img_box_y1
    
    # Draw image border
    draw.rounded_rectangle([(img_box_x1, img_box_y1), (img_box_x2, img_box_y2)], radius=16, fill="#f3f4f6", outline=brand_border, width=2)
    
    # Fetch and paste first image
    image_urls = car.get("images", [])
    if isinstance(image_urls, list) and len(image_urls) > 0:
        first_img_url = image_urls[0]
        try:
            import io
            req = urllib.request.Request(first_img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                img_data = response.read()
            pic = Image.open(io.BytesIO(img_data)).convert('RGB')
            
            # Cover mode resize
            pic_ratio = pic.width / pic.height
            box_ratio = img_w / img_h
            if pic_ratio > box_ratio:
                new_h = img_h
                new_w = int(img_h * pic_ratio)
            else:
                new_w = img_w
                new_h = int(img_w / pic_ratio)
                
            pic_resized = pic.resize((new_w, new_h), Image.Resampling.LANCZOS)
            # Crop to center
            left = (new_w - img_w) // 2
            top = (new_h - img_h) // 2
            pic_cropped = pic_resized.crop((left, top, left + img_w, top + img_h))
            
            # Create rounded mask
            mask = Image.new("L", (img_w, img_h), 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.rounded_rectangle([(0, 0), (img_w, img_h)], radius=16, fill=255)
            
            img.paste(pic_cropped, (img_box_x1, img_box_y1), mask)
        except Exception as e:
            print(f"Resim indirilemedi: {first_img_url} Hata: {e}")
            
    y += box_h + 60
    
    # 3. Finance Details Box
    fin_h = 1300
    draw.rounded_rectangle([(200, y), (2280, y + fin_h)], radius=24, outline=brand_border, width=3)
    
    fy = y + 60
    draw.rectangle([(250, fy + 10), (262, fy + 46)], fill=brand_red)
    draw.text((280, fy), "Finanzierungsdetails", font=font_heading, fill=brand_black)
    
    fy += 120
    
    try:
        price = float(car.get('price', 0) or 0)
        down_payment = float(car.get('down_payment', 0) or 0)
        monthly_rate = float(car.get('monthly_rate', 0) or 0)
    except:
        price = down_payment = monthly_rate = 0.0
        
    net_loan = price - down_payment
    
    rows = [
        ("Fahrzeugpreis (Araç Fiyatı):", f"{price:,.2f} EUR"),
        ("Anzahlung (Peşinat):", f"{down_payment:,.2f} EUR"),
        ("Nettodarlehensbetrag (Net Kredi):", f"{net_loan:,.2f} EUR"),
        ("Laufzeit (Vade):", f"{car.get('term_months', 48)} Monate"),
        ("Sollzins p.a. (Yıllık Faiz):", f"{car.get('interest_rate', 1.89)} %")
    ]
    
    for lbl, val in rows:
        draw.line([(250, fy), (2230, fy)], fill=brand_border, width=2)
        fy += 40
        draw.text((250, fy), lbl, font=font_table_lbl, fill=brand_black)
        val_w = draw.textlength(val, font=font_table_val)
        draw.text((2230 - val_w, fy), val, font=font_table_val, fill=brand_black)
        fy += 100
        
    # Red Highlight Box
    ry = y + fin_h - 350
    draw.rounded_rectangle([(250, ry), (2230, ry + 280)], radius=24, fill=brand_red)
    
    draw.text((320, ry + 70), "MONATLICHE RATE", font=font_rate_lbl, fill="#ffffff")
    draw.text((320, ry + 160), "(AYLIK TAKSİT)", font=font_rate_sub, fill="#fcd34d") # Soft yellow/white for subtitle
    
    rate_val = f"{monthly_rate:,.2f}"
    rate_currency = "EUR"
    rv_w = draw.textlength(rate_val, font=font_rate_val)
    rc_w = draw.textlength(rate_currency, font=font_rate_lbl)
    
    draw.text((2160 - rv_w, ry + 60), rate_val, font=font_rate_val, fill="#ffffff")
    draw.text((2160 - rc_w, ry + 180), rate_currency, font=font_rate_lbl, fill="#ffffff")
    
    # 4. Footer
    foot_y = y + fin_h + 60
    f_text1 = "Alle Preisangaben inklusive Mehrwertsteuer. Dieses Angebot ist unverbindlich."
    f_text2 = "Gültig bis zum Widerruf oder Änderung der Konditionen."
    
    fw1 = draw.textlength(f_text1, font=font_footer)
    fw2 = draw.textlength(f_text2, font=font_footer)
    
    draw.text(((width - fw1) // 2, foot_y), f_text1, font=font_footer, fill=brand_gray)
    draw.text(((width - fw2) // 2, foot_y + 40), f_text2, font=font_footer, fill=brand_gray)
    
    img.save(output_pdf_path, format="PDF", resolution=300.0)
    print(f"White Theme PDF Generated: {output_pdf_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_pdf.py <input.json> <output.pdf>")
        sys.exit(1)
    create_offer_pdf(sys.argv[1], sys.argv[2])
