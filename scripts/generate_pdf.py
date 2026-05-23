import sys
import json
import io
import urllib.request
from PIL import Image, ImageDraw, ImageFont

def create_offer_pdf(json_file_path, output_pdf_path):
    # 1. Read JSON data
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    customer = data.get("customer", {})
    car = data.get("car", {})
    
    # 2. Create A4 Canvas (High Res for Print - 300 DPI - 2480x3508 Pixels)
    width, height = 2480, 3508
    img = Image.new('RGB', (width, height), color='#0c0c0e') # Deep black background matching the HTML mockup
    draw = ImageDraw.Draw(img)
    
    scale = 2 # Scale factor for 300 DPI vs 150 DPI
    
    # Fonts loading with fallback to Montserrat (verified to exist in local scripts/)
    try:
        font_brand = ImageFont.truetype("Sora-SemiBold.ttf", 32 * scale) 
        font_title = ImageFont.truetype("Sora-Light.ttf", 54 * scale) 
        font_heading = ImageFont.truetype("Sora-SemiBold.ttf", 22 * scale) 
        font_body = ImageFont.truetype("Inter-Regular.ttf", 18 * scale) 
        font_value = ImageFont.truetype("Inter-Medium.ttf", 18 * scale)
        font_highlight_label = ImageFont.truetype("Sora-Regular.ttf", 20 * scale)
        font_highlight_value = ImageFont.truetype("Sora-SemiBold.ttf", 44 * scale)
        font_footer = ImageFont.truetype("Inter-Regular.ttf", 14 * scale)
    except IOError:
        try:
            # Montserrat fallbacks
            font_brand = ImageFont.truetype("Montserrat-Bold.ttf", 32 * scale)
            font_title = ImageFont.truetype("Montserrat-Regular.ttf", 54 * scale)
            font_heading = ImageFont.truetype("Montserrat-Bold.ttf", 22 * scale)
            font_body = ImageFont.truetype("Montserrat-Regular.ttf", 18 * scale)
            font_value = ImageFont.truetype("Montserrat-Bold.ttf", 18 * scale)
            font_highlight_label = ImageFont.truetype("Montserrat-Regular.ttf", 20 * scale)
            font_highlight_value = ImageFont.truetype("Montserrat-Bold.ttf", 44 * scale)
            font_footer = ImageFont.truetype("Montserrat-Regular.ttf", 14 * scale)
        except IOError:
            font_brand = font_title = font_heading = font_body = font_value = font_highlight_label = font_highlight_value = font_footer = ImageFont.load_default()
            
    # Color Palette - Modern Rose Red & Slate
    brand_red = "#e11d48" # Rose-600
    brand_dark = "#131316" # Header background
    brand_surface = "#1c1c21" # Card background
    text_white = "#ffffff"
    text_gray = "#94a3b8" # gray-400
    text_muted = "#71717a" # gray-500
    divider_color = "#27272a"
    
    # 3. Draw Main Glass Card Container (Centered A4 Card Layout)
    card_x1, card_y1, card_x2, card_y2 = 200, 200, 2280, 3308
    draw.rounded_rectangle([(card_x1, card_y1), (card_x2, card_y2)], radius=40, fill=brand_surface, outline="#27272a", width=3)
    
    # Draw Header Section inside the Card
    header_h = 450
    draw.rounded_rectangle([(card_x1, card_y1), (card_x2, card_y1 + header_h)], radius=40, fill=brand_dark)
    # Cover bottom rounded corners of the header to make it clean
    draw.rectangle([(card_x1, card_y1 + header_h - 40), (card_x2, card_y1 + header_h)], fill=brand_dark)
    # Header border divider
    draw.line([(card_x1, card_y1 + header_h), (card_x2, card_y1 + header_h)], fill="#27272a", width=3)
    
    # --- HEADER CONTENT ---
    y = 310
    brand_dortmund = "DORTMUND "
    brand_fleet = "FLEET "
    brand_finance = "FINANCE"
    
    w_dort = draw.textlength(brand_dortmund, font=font_brand)
    w_fleet = draw.textlength(brand_fleet, font=font_brand)
    
    draw.text((300, y), brand_dortmund, font=font_brand, fill=text_white)
    draw.text((300 + w_dort, y), brand_fleet, font=font_brand, fill=brand_red)
    draw.text((300 + w_dort + w_fleet, y), brand_finance, font=font_brand, fill=text_white)
    
    y += 90 * scale
    draw.text((300, y), "Finanzierungsangebot", font=font_title, fill=brand_red)
    
    # Start drawing content below Header
    y = card_y1 + header_h + 80
    
    # Section Header Helper
    def draw_section_header(title, pos_y):
        # Draw small vertical rounded rectangle (bullet)
        draw.rounded_rectangle([(300, pos_y + 4), (308, pos_y + 44)], radius=4, fill=brand_red)
        draw.text((330, pos_y), title, font=font_heading, fill=text_white)
        
    # --- CUSTOMER INFO SECTION ---
    draw_section_header("Kunde (Müşteri):", y)
    y += 70 * scale
    
    customer_fields = [
        ("Name:", customer.get('name', 'N/A').upper(), font_value),
        ("E-Mail:", customer.get('email', 'N/A'), font_body),
        ("Tel:", customer.get('phone', 'N/A'), font_body)
    ]
    
    for label, val, font_style in customer_fields:
        draw.text((330, y), label, font=font_body, fill=text_gray)
        draw.text((550, y), val, font=font_style, fill=text_white)
        y += 35 * scale
        
    y += 30 * scale
    # Divider (rose-faded style simulation)
    draw.line([(300, y), (2180, y)], fill=divider_color, width=2)
    y += 50 * scale
    
    # --- VEHICLE INFO SECTION ---
    draw_section_header("Fahrzeug (Araç):", y)
    y += 70 * scale
    draw.text((330, y), "Modell:", font=font_body, fill=text_gray)
    draw.text((550, y), car.get('title', 'N/A').upper(), font=font_brand, fill=brand_red)
    
    y += 60 * scale
    draw.line([(300, y), (2180, y)], fill=divider_color, width=2)
    y += 50 * scale
    
    # --- FINANCING DETAILS SECTION ---
    draw_section_header("Ihre Finanzierungsdetails:", y)
    y += 80 * scale
    
    try:
        price = float(car.get('price', 0) or 0)
        down_payment = float(car.get('down_payment', 0) or 0)
        monthly_rate = float(car.get('monthly_rate', 0) or 0)
    except:
        price = down_payment = monthly_rate = 0.0
        
    net_loan = price - down_payment
    
    details = [
        ("Fahrzeugpreis", "Araç Fiyatı", f"{price:,.2f} EUR"),
        ("Anzahlung", "Peşinat", f"{down_payment:,.2f} EUR"),
        ("Nettodarlehensbetrag", "Net Kredi", f"{net_loan:,.2f} EUR"),
        ("Laufzeit", "Vade", f"{car.get('term_months', 48)} Monate"),
        ("Sollzins p.a.", "Yıllık Faiz", f"{car.get('interest_rate', 1.89)} %")
    ]
    
    for de_label, tr_label, value in details:
        draw.line([(300, y), (2180, y)], fill=divider_color, width=1)
        y += 20 * scale
        
        # Bilingual Labels
        draw.text((330, y), de_label, font=font_body, fill=text_white)
        draw.text((330, y + 25 * scale), tr_label, font=font_footer, fill=text_muted)
        
        # Value aligned to the right
        val_w = draw.textlength(value, font=font_value)
        draw.text((2150 - val_w, y + 10 * scale), value, font=font_value, fill=text_white)
        
        y += 65 * scale
        
    y += 50 * scale
    
    # --- MONATLICHE RATE HIGHLIGHT BOX ---
    box_x1, box_y1, box_x2, box_y2 = 300, y, 2180, y + 200
    # Red translucent box representation in PIL
    draw.rounded_rectangle([(box_x1, box_y1), (box_x2, box_y2)], radius=20, fill="#2a171d", outline=brand_red, width=3)
    
    # Left Label in Box
    lbl_de = "Monatliche Rate"
    lbl_tr = "(Aylık Taksit)"
    draw.text((box_x1 + 50, box_y1 + 40), lbl_de, font=font_heading, fill=brand_red)
    draw.text((box_x1 + 50, box_y1 + 40 + 26 * scale), lbl_tr, font=font_body, fill=brand_red)
    
    # Right Value in Box
    val_rate = f"{monthly_rate:,.2f} EUR"
    val_rate_w = draw.textlength(val_rate, font=font_highlight_value)
    draw.text((box_x2 - 50 - val_rate_w, box_y1 + 50), val_rate, font=font_highlight_value, fill=brand_red)
    
    # --- FOOTER SECTION ---
    y_footer = card_y2 - 250
    draw.line([(300, y_footer), (2180, y_footer)], fill=divider_color, width=2)
    
    footer_text1 = "Alle Preisangaben inklusive Mehrwertsteuer. Dieses Angebot ist unverbindlich."
    footer_text2 = "Gültig bis zum Widerruf oder Änderung der Konditionen."
    
    w1 = draw.textlength(footer_text1, font=font_footer)
    w2 = draw.textlength(footer_text2, font=font_footer)
    
    draw.text(((width - w1) // 2, y_footer + 50), footer_text1, font=font_footer, fill=text_muted)
    draw.text(((width - w2) // 2, y_footer + 85), footer_text2, font=font_footer, fill=text_muted)
    
    # --- APPEND EXTRA VEHICLE IMAGES AS PAGES ---
    extra_pages = []
    image_urls = car.get("images", [])
    if isinstance(image_urls, list):
        for url in image_urls[:4]:  # Limit to 4 images
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    img_data = response.read()
                
                pic = Image.open(io.BytesIO(img_data)).convert('RGB')
                
                # New A4 black canvas at 300 DPI (2480x3508)
                page = Image.new('RGB', (width, height), color='#0c0c0e')
                
                # Resize keeping aspect ratio
                pic_w, pic_h = pic.size
                ratio = min(2080 / pic_w, 3108 / pic_h)
                new_w, new_h = int(pic_w * ratio), int(pic_h * ratio)
                pic_resized = pic.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                # Center on the page
                x_offset = (width - new_w) // 2
                y_offset = (height - new_h) // 2
                page.paste(pic_resized, (x_offset, y_offset))
                
                extra_pages.append(page)
            except Exception as e:
                print(f"Resim indirilemedi: {url} Hata: {e}")
                
    # 4. Save Multi-page PDF
    if extra_pages:
        img.save(output_pdf_path, "PDF", resolution=300.0, save_all=True, append_images=extra_pages)
    else:
        img.save(output_pdf_path, "PDF", resolution=300.0)
        
    print(f"Stunning Rose Theme PDF Generated: {output_pdf_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(1)
    create_offer_pdf(sys.argv[1], sys.argv[2])
