import { PromotionItem } from '../types/promotion';

/**
 * Robust CSV parser that handles quotes, escaped quotes, and commas within quotes
 */
export function parseCSVLines(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.length > 0 && currentRow.some(c => c.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(c => c.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Parse numeric price values like "  87,900 ", "18,000", "5,100.5", "-"
 */
export function parsePrice(val: string | undefined): number {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.]/g, '');
  if (!clean) return 0;
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Extract clean, concise Model Name (ชื่อรุ่น) from product name
 * e.g. "Samsung Smartphone Galaxy Z Fold7 (16+1TB) Black (5G)" -> "Galaxy Z Fold7"
 * e.g. "Huawei Smartphone Mate X6 (12+512GB) Gray (HMS)" -> "Mate X6"
 */
export function extractModelName(productName: string, brand?: string): string {
  if (!productName) return '';
  let str = productName.trim();

  // Strip brand prefix if present
  if (brand) {
    const brandRegex = new RegExp(`^${brand}\\s*`, 'i');
    str = str.replace(brandRegex, '');
  }
  str = str.replace(/^(Samsung|Realme|Infinix|Alldocube|Alldoucube|Vivo|iQOO|Xiaomi|Honor|Tecno|TECNO|Nothing|OPPO|Huawei|ZTE)\s+/i, '');

  // Strip generic category indicators at start
  str = str.replace(/^(Smartphone|Tablet Smartphone|Tablet)\s+/i, '');

  // Check special editions
  const specialEditionMatch = str.match(/\((Harry Potter Edition|MOLLY|Photographer Kit|Special Edition)[^)]*\)/i);
  const specialEdition = specialEditionMatch ? ` ${specialEditionMatch[0]}` : '';

  // Extract core model by removing the first memory spec pattern like (16+1TB), (12+512GB), (8+256)
  const parenIdx = str.search(/\(\s*\d+\s*\+\s*\d+/);
  if (parenIdx !== -1) {
    str = str.substring(0, parenIdx).trim();
  } else {
    // If no (RAM+ROM), clean trailing network/region suffixes
    str = str.replace(/\s+(5G|4G|LTE|Wi-Fi|F\+|HMS)\b/gi, '').trim();
  }

  // Clean trailing spaces or commas
  str = str.replace(/[,.-]+$/, '').trim();

  return str ? `${str}${specialEdition}`.trim() : productName;
}

/**
 * Extract freebies, warranty, and estimated total value from promo description
 */
export function analyzePromoDetails(details: string): {
  giftValue?: number;
  giftsList: string[];
  warrantyDetails: string[];
} {
  const giftsList: string[] = [];
  const warrantyDetails: string[] = [];
  let giftValue: number | undefined = undefined;

  if (!details) {
    return { giftsList, warrantyDetails };
  }

  // Extract total gift value e.g. "มูลค่ารวม 4059 บาท" or "รวมมูลค่า 13,630 บาท"
  const valueMatch = details.match(/(?:มูลค่ารวม|รวมมูลค่า|มูลค่าของแถม|มูลค่า)\s*([0-9,]+)\s*บาท/i);
  if (valueMatch && valueMatch[1]) {
    giftValue = parsePrice(valueMatch[1]);
  }

  // Extract warranty
  if (details.includes('ประกันเพิ่ม') || details.includes('ประกันเครื่อง 2 ปี') || details.includes('CarePlus')) {
    warrantyDetails.push('ประกันตัวเครื่อง 2 ปี');
  }
  if (details.includes('ประกันจอแตก 2 ปี')) {
    warrantyDetails.push('ประกันหน้าจอแตก 2 ปี');
  } else if (details.includes('ประกันจอแตก 1 ปี') || details.includes('Screen Care 1 Year') || details.includes('ScreenCare 2 Year')) {
    warrantyDetails.push('ประกันหน้าจอแตก 1 ปี');
  } else if (details.includes('180วัน') || details.includes('180 Days')) {
    warrantyDetails.push('ประกันหน้าจอแตก 180 วัน');
  } else if (details.includes('90วัน') || details.includes('90 Days')) {
    warrantyDetails.push('ประกันหน้าจอแตก 90 วัน');
  }
  if (details.includes('Cyber Care') || details.includes('CyberCare')) {
    warrantyDetails.push('Cyber Care+ คุ้มครองความปลอดภัยไซเบอร์');
  }

  // Split details into items
  // Split by comma or "รับฟรี"
  const cleanDetails = details.replace(/^รับส่วนลด\s*[0-9,.]+\s*บาท/i, '').replace(/^รับฟรี/i, '');
  const segments = cleanDetails.split(/[,，\n]/).map(s => s.trim()).filter(s => s.length > 1);

  for (const seg of segments) {
    // filter out value statement
    if (/มูลค่ารวม|รวมมูลค่า|รับส่วนลด/.test(seg)) continue;
    // clean prefix
    const cleanItem = seg.replace(/^รับฟรี\s*/, '').replace(/^\+/, '').trim();
    if (cleanItem.length > 2 && !giftsList.includes(cleanItem)) {
      giftsList.push(cleanItem);
    }
  }

  return { giftValue, giftsList, warrantyDetails };
}

/**
 * Extract specs like RAM, ROM, Color, 5G from Product Name
 */
export function extractSpecs(productName: string) {
  const is5G = /5G/i.test(productName);
  
  // Extract RAM/ROM like (16+1TB), (12+512GB), (8+256), (4+128)
  let ram: string | undefined;
  let rom: string | undefined;
  const ramRomMatch = productName.match(/\((\d+)\+(\d+)(GB|TB)?\)/i);
  if (ramRomMatch) {
    ram = `${ramRomMatch[1]}GB`;
    const unit = ramRomMatch[3] ? ramRomMatch[3].toUpperCase() : 'GB';
    rom = `${ramRomMatch[2]}${unit}`;
  }

  // Extract potential color names
  const colors = [
    'Black', 'Dark Blue', 'Silver', 'Dark Green', 'Light Blue', 'White', 
    'TITANIUM SILVER', 'TITANIUM GRAY', 'TITANIUM BLUE', 'TITANIUM BLACK', 
    'SILVER SHADOW', 'NAVY', 'MINT', 'BLUE', 'Light Green', 'Light pink', 
    'Light Violet', 'Coral Red', 'Lavender', 'Moonstone Gray', 'Graphite', 
    'Beige', 'Sky Blue', 'COBALT VIOLET', 'Red', 'Gold', 'Violet', 'Gray',
    'Grey', 'Space Gray', 'Purple', 'Orange', 'Yellow'
  ];
  let color: string | undefined;
  for (const c of colors) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(productName)) {
      color = c;
      break;
    }
  }

  return { ram, rom, color, is5G };
}

/**
 * Main parser: converts raw CSV text into typed PromotionItem array
 */
export function parseCsvToPromotions(csvText: string): PromotionItem[] {
  const rows = parseCSVLines(csvText);
  if (rows.length < 2) return [];

  // Determine headers
  const headerRow = rows[0].map(h => h.trim().toLowerCase());
  
  // Find column indices
  let noIdx = headerRow.findIndex(h => h.includes('no'));
  let catIdx = headerRow.findIndex(h => h.includes('cat') && !h.includes('code') && !h.includes('name'));
  let brandIdx = headerRow.findIndex(h => h.includes('brand'));
  let codeIdx = headerRow.findIndex(h => h.includes('code'));
  let nameIdx = headerRow.findIndex(h => h.includes('name') || h.includes('product'));
  let promoIdx = headerRow.findIndex(h => h.includes('promotion') || h.includes('โปรโมชั่น'));
  let regPriceIdx = headerRow.findIndex(h => h.includes('ราคาปกติ'));
  let discountIdx = headerRow.findIndex(h => h.includes('ส่วนลด'));
  let promoPriceIdx = headerRow.findIndex(h => h.includes('ราคาโปร'));
  let noGiftPriceIdx = headerRow.findIndex(h => h.includes('ไม่รับของแถม'));
  let startIdx = headerRow.findIndex(h => h.includes('เริ่ม'));
  let endIdx = headerRow.findIndex(h => h.includes('สิ้นสุด') || h.includes('หมด'));

  // Fallback positional indexing if headers match standard sheet layout:
  // 0: No, 1: Cat, 2: Brand, 3: Product Code, 4: Product Name, 5: Promo details, 6: Reg price, 7: Discount, 8: Promo price, 9: No gift price, 10: empty, 11: start, 12: end
  if (noIdx === -1) noIdx = 0;
  if (catIdx === -1) catIdx = 1;
  if (brandIdx === -1) brandIdx = 2;
  if (codeIdx === -1) codeIdx = 3;
  if (nameIdx === -1) nameIdx = 4;
  if (promoIdx === -1) promoIdx = 5;
  if (regPriceIdx === -1) regPriceIdx = 6;
  if (discountIdx === -1) discountIdx = 7;
  if (promoPriceIdx === -1) promoPriceIdx = 8;
  if (noGiftPriceIdx === -1) noGiftPriceIdx = 9;
  if (startIdx === -1) startIdx = 11;
  if (endIdx === -1) endIdx = 12;

  const results: PromotionItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5) continue;

    const productName = row[nameIdx] || '';
    if (!productName || productName.trim() === '') continue;

    const brand = (row[brandIdx] || 'Other').trim();
    const category = (row[catIdx] || 'Smartphone').trim();
    const productCode = (row[codeIdx] || '').trim();
    const promoDetails = row[promoIdx] || '';
    
    const regularPrice = parsePrice(row[regPriceIdx]);
    const discount = parsePrice(row[discountIdx]);
    let promoPrice = parsePrice(row[promoPriceIdx]);
    
    // If promoPrice is 0 or empty, calculate from regularPrice - discount
    if (promoPrice === 0 && regularPrice > 0) {
      promoPrice = regularPrice - discount;
    }

    const noGiftVal = row[noGiftPriceIdx] ? parsePrice(row[noGiftPriceIdx]) : null;
    const noGiftPrice = (noGiftVal && noGiftVal > 0) ? noGiftVal : null;

    const startDate = (row[startIdx] || '1 ตุลาคม 2026').trim();
    const endDate = (row[endIdx] || '31 ตุลาคม 2026').trim();

    const { giftValue, giftsList, warrantyDetails } = analyzePromoDetails(promoDetails);
    const specs = extractSpecs(productName);
    // User requirement: modelName is pulled directly from "Sub.Cat./Product Name" column
    const modelName = productName.trim();

    results.push({
      id: `promo-${i}-${productCode || Math.random().toString(36).substring(2, 7)}`,
      no: row[noIdx] || i,
      category,
      brand,
      modelName,
      productCode,
      productName,
      promoDetails,
      regularPrice,
      discount,
      promoPrice,
      noGiftPrice,
      startDate,
      endDate,
      giftValue,
      giftsList,
      warrantyDetails,
      specs
    });
  }

  return results;
}
