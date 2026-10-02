import json
import re

# We will create a rich json dataset containing all the smartphone and tablet promotion data
# with clean fields for fast and smooth client-side filtering, searching, and calculation.

def clean_num(val):
    if not val:
        return 0
    c = re.sub(r'[^0-9.]', '', str(val))
    return int(float(c)) if c else 0

def extract_gifts(promo_str):
    if not promo_str:
        return {"value": 0, "gifts": [], "warranty": []}
    
    val_m = re.search(r'(?:มูลค่ารวม|รวมมูลค่า|มูลค่าของแถม|มูลค่า)\s*([0-9,]+)\s*บาท', promo_str)
    val = clean_num(val_m.group(1)) if val_m else 0
    
    warranty = []
    if 'ประกันเพิ่ม' in promo_str or 'ปีที่ 2' in promo_str or 'ปีที่2' in promo_str:
        warranty.append('ประกันเครื่องเพิ่มเป็น 2 ปี')
    if 'ประกันจอแตก 2 ปี' in promo_str:
        warranty.append('ประกันจอแตก 2 ปี')
    elif 'ประกันจอแตก 1 ปี' in promo_str or 'Screen Care 1 Year' in promo_str:
        warranty.append('ประกันจอแตก 1 ปี')
    elif '180วัน' in promo_str or '180 Days' in promo_str:
        warranty.append('ประกันจอแตก 180 วัน')
    elif '90วัน' in promo_str or '90 Days' in promo_str:
        warranty.append('ประกันจอแตก 90 วัน')
    if 'Cyber Care' in promo_str or 'CyberCare' in promo_str:
        warranty.append('Cyber Care+ ความปลอดภัยไซเบอร์')
        
    gifts = []
    # common gifts detector
    gift_patterns = [
        ('Power Bank 10000 mAh', r'Power\s*Bank|PowerBank'),
        ('True Wireless BT-17', r'True Wireless|BT-17'),
        ('ลำโพง Bluetooth ใหญ่', r'ลำโพง Bluetooth ใหญ่'),
        ('ลำโพง Bluetooth เล็ก', r'ลำโพง Bluetooth เล็ก|SP-07|SP-02'),
        ('กระเป๋า 2Tone', r'กระเป๋า 2Tone|กระเป๋า 2 Tone'),
        ('กระเป๋าล้อลาก 20 นิ้ว', r'กระเป๋าล้อลาก'),
        ('กระเป๋าเป้', r'กระเป๋าเป้|Backpack'),
        ('พัดลม Mini Fan', r'Mini Fan|Neck Fan'),
        ('ปากกา Stylus / Pencil', r'Pen|Pencil|Stylus'),
        ('เคสแท้ / Flip Case', r'Case|เคส'),
        ('คีย์บอร์ด Keyboard Case', r'Keyboard'),
        ('หัวชาร์จ Fast Charger', r'Adapter|Charger'),
        ('Smartwatch / Band', r'Watch|Band')
    ]
    for name, pat in gift_patterns:
        if re.search(pat, promo_str, re.IGNORECASE):
            gifts.append(name)
            
    return {"value": val, "gifts": gifts, "warranty": warranty}

def extract_specs(name):
    is_5g = bool(re.search(r'5G', name, re.I))
    ram, rom = None, None
    m = re.search(r'\((\d+)\+(\d+)(GB|TB)?\)', name)
    if m:
        ram = f"{m.group(1)}GB"
        unit = m.group(3).upper() if m.group(3) else "GB"
        rom = f"{m.group(2)}{unit}"
    return {"ram": ram, "rom": rom, "is5G": is_5g}

print("Script template ready")
