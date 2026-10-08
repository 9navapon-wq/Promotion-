import * as XLSX from 'xlsx';
import { PromotionItem } from '../types/promotion';

/**
 * Robust CSV and TSV parser that handles quotes, escaped quotes, commas, and tabs
 */
export function parseCSVLines(text: string): string[][] {
  if (!text) return [];

  // Detect if content is Tab-Separated (e.g. pasted directly from ODF Viewer / Excel / Google Sheets)
  const firstLine = text.split(/[\r\n]+/)[0] || '';
  const isTabSeparated = (firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length;

  if (isTabSeparated) {
    const rawLines = text.split(/\r?\n/);
    return rawLines
      .map(line => line.split('\t').map(cell => cell.trim().replace(/^["']|["']$/g, '')))
      .filter(row => row.some(cell => cell.length > 0));
  }

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
export function parsePrice(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Math.round(val);
  const str = String(val);
  const clean = str.replace(/[^0-9.]/g, '');
  if (!clean) return 0;
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Extract clean, concise Model Name (ชื่อรุ่น) from product name
 */
export function extractModelName(productName: string, brand?: string): string {
  if (!productName) return '';
  let str = productName.trim();

  // Strip brand prefix if present
  if (brand) {
    const brandRegex = new RegExp(`^${brand}\\s*`, 'i');
    str = str.replace(brandRegex, '');
  }
  str = str.replace(/^(Samsung|Realme|Infinix|Alldocube|Alldoucube|Vivo|iQOO|Xiaomi|Honor|Tecno|TECNO|Nothing|OPPO|Huawei|ZTE|Apple)\s+/i, '');

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
  if (details.includes('BaNANA Sure') || details.includes('Mobile Care')) {
    warrantyDetails.push('BaNANA Sure Mobile Care+');
  }

  // Split details into items
  const rawItems = details
    .replace(/(?:แถมฟรี|รับฟรี|ฟรี|ฟรี!|แถม!)/g, '|||')
    .split('|||')
    .map(s => s.trim())
    .filter(s => s.length > 2);

  if (rawItems.length > 0) {
    rawItems.forEach(item => {
      const cleaned = item
        .replace(/^[•\-\*\+]\s*/, '')
        .replace(/(?:รวมมูลค่า|มูลค่ารวม).*$/, '')
        .trim();
      if (cleaned.length > 2 && !giftsList.includes(cleaned) && !cleaned.includes('ประกัน')) {
        giftsList.push(cleaned);
      }
    });
  }

  if (giftsList.length === 0 && details.length > 0) {
    giftsList.push(details.substring(0, 120));
  }

  return { giftValue, giftsList, warrantyDetails };
}

/**
 * Extract RAM, ROM, 5G, and color from Product Name
 */
export function extractSpecs(productName: string): {
  ram?: string;
  rom?: string;
  color?: string;
  is5G?: boolean;
} {
  const specs: { ram?: string; rom?: string; color?: string; is5G?: boolean } = {};
  if (!productName) return specs;

  // Check 5G
  specs.is5G = /\b5G\b/i.test(productName);

  // Match (16+1TB), (12+512GB), (8+256)
  const memoryMatch = productName.match(/\((\d+)\+(\d+)(TB|GB)?\)/i);
  if (memoryMatch) {
    specs.ram = `${memoryMatch[1]}GB`;
    const unit = memoryMatch[3] ? memoryMatch[3].toUpperCase() : 'GB';
    specs.rom = `${memoryMatch[2]}${unit}`;
  } else {
    const romOnly = productName.match(/(\d+)(TB|GB)\b/i);
    if (romOnly) {
      specs.rom = `${romOnly[1]}${romOnly[2].toUpperCase()}`;
    }
  }

  // Colors in English/Thai
  const colorMatch = productName.match(/\b(Black|White|Silver|Gray|Grey|Titanium|Gold|Green|Blue|Purple|Pink|Violet|Orange|Yellow|Cream|Mint|Lavender|Obsidian|Forest|Sunset|Midnight|Starlight|ดำ|ขาว|เงิน|ทอง|เขียว|ฟ้า|น้ำเงิน|ชมพู|ม่วง|ส้ม|เหลือง)\b/i);
  if (colorMatch) {
    specs.color = colorMatch[0];
  }

  return specs;
}

/**
 * Parse 2D string grid to PromotionItem list
 */
export function parseGridToPromotions(rawRows: string[][]): PromotionItem[] {
  if (!rawRows || rawRows.length === 0) return [];

  // Filter out blank rows
  let rows = rawRows.filter(r => r && r.some(c => String(c || '').trim().length > 0));
  if (rows.length === 0) return [];

  // Check if first row is a header row or actually a data row
  const firstRow = rows[0];
  const firstRowLower = firstRow.map(h => String(h || '').trim().toLowerCase());

  const hasBarcodeInData = firstRow.some(c => /^\d{8,15}$/.test(c.trim()));
  const hasBrandInData = firstRow.some(c => /^(samsung|apple|xiaomi|oppo|vivo|honor|realme|infinix|tecno|redmi)$/i.test(c.trim()));
  const hasCategoryInData = firstRow.some(c => /^(smartphone|tablet|แท็บเล็ต|มือถือ)$/i.test(c.trim()));
  const hasHeaderKeywords = firstRowLower.some(c => 
    c.includes('code') || c.includes('รหัส') || c.includes('บาร์โค้ด') || 
    c.includes('brand') || c.includes('แบรนด์') || 
    c.includes('cat') || c.includes('name') || c.includes('ชื่อ') || 
    c.includes('ต้องกรอก') || c.includes('สีแดง') || c.includes('sub') || 
    c.includes('product') || c.includes('promotion') || c.includes('โปรโมชั่น')
  );

  // If first row looks like data rather than headers, synthesize standard header
  if ((hasBarcodeInData || hasBrandInData || hasCategoryInData) && !hasHeaderKeywords) {
    const isStandard11Col = firstRow.length >= 10 && (hasCategoryInData || hasBrandInData);
    const syntheticHeader = isStandard11Col
      ? ['Cat.', 'Brand', 'Cat./Product Code', 'Sub.Cat./Product Name (ต้องกรอกสีแดง)', 'รายละเอียด Promotion', 'ราคาปกติ', 'ส่วนลด', 'ราคาโปรโมชั่น', 'ราคาไม่รับของแถม', 'เริ่มต้น', 'สิ้นสุด']
      : ['No.', 'Cat.', 'Brand', 'Cat./Product Code', 'Sub.Cat./Product Name (ต้องกรอกสีแดง)', 'รายละเอียด Promotion', 'ราคาปกติ', 'ส่วนลด', 'ราคาโปรโมชั่น', 'ราคาไม่รับของแถม', 'เริ่มต้น', 'สิ้นสุด'];
    rows = [syntheticHeader, ...rows];
  }

  // Determine headers
  const headerRow = rows[0].map(h => String(h || '').trim().toLowerCase());

  // Find column indices
  let noIdx = headerRow.findIndex(h => h === 'no' || h === '#' || h.includes('ลำดับ') || h.includes('no.'));
  
  // Cat. (Category) - exclude sub.cat and code
  let catIdx = headerRow.findIndex(h => {
    const normalized = h.replace(/[\s\._\/\-]+/g, '');
    return (normalized === 'cat' || normalized === 'category' || normalized.includes('หมวด')) &&
           !normalized.includes('sub') &&
           !normalized.includes('product') &&
           !normalized.includes('code');
  });
  if (catIdx === -1) {
    catIdx = headerRow.findIndex(h => (h.includes('cat') || h.includes('หมวด')) && !h.includes('code') && !h.includes('name') && !h.includes('sub'));
  }

  let brandIdx = headerRow.findIndex(h => h.includes('brand') || h.includes('แบรนด์'));

  // Cat./Product Code
  let codeIdx = headerRow.findIndex(h => {
    const normalized = h.replace(/[\s\._\/\-]+/g, '');
    return normalized.includes('catproductcode') ||
           normalized.includes('productcode') ||
           normalized.includes('itemcode') ||
           normalized.includes('barcode') ||
           h.includes('บาร์โค้ด') ||
           h.includes('รหัส');
  });
  if (codeIdx === -1) {
    codeIdx = headerRow.findIndex(h => h.includes('code') && !h.includes('name'));
  }

  // Sub.Cat./Product Name / ช่องต้องกรอกสีแดง - Top priority for user's requested column!
  // Map "ต้องกรอกสีแดง" / "ต้องกรอก" / "สีแดง" / "sub.cat./product name" -> Product Name
  let nameIdx = headerRow.findIndex(h => {
    const normalized = h.replace(/[\s\._\/\-]+/g, '');
    return normalized.includes('subcatproductname') ||
           normalized.includes('subcat/productname') ||
           normalized.includes('ต้องกรอกสีแดง') ||
           normalized.includes('ต้องกรอก') ||
           normalized.includes('สีแดง') ||
           normalized.includes('required') ||
           (normalized.includes('subcat') && normalized.includes('product')) ||
           normalized === 'subcatproductname';
  });

  // Fallbacks for product name if exact "sub.cat./product name" not found
  if (nameIdx === -1) {
    nameIdx = headerRow.findIndex(h => {
      const normalized = h.replace(/[\s\._\/\-]+/g, '');
      return normalized.includes('subcat') || 
             normalized.includes('productname') || 
             normalized.includes('itemname') ||
             normalized.includes('ต้องกรอก') ||
             normalized.includes('สีแดง');
    });
  }

  if (nameIdx === -1) {
    nameIdx = headerRow.findIndex(h => 
      h.includes('ต้องกรอก') ||
      h.includes('สีแดง') ||
      h.includes('sub.cat') || 
      h.includes('product name') || 
      h.includes('ชื่อสินค้า') || 
      h.includes('ชื่อรุ่น') || 
      h.includes('สินค้า') ||
      (h.includes('product') && !h.includes('code') && !h.includes('cat')) ||
      (h.includes('name') && !h.includes('brand') && !h.includes('cat') && !h.includes('code'))
    );
  }

  let promoIdx = headerRow.findIndex(h => h.includes('promotion') || h.includes('โปรโมชั่น') || h.includes('ของแถม') || h.includes('รายละเอียด'));
  let regPriceIdx = headerRow.findIndex(h => h.includes('ปกติ') || h.includes('regular') || h.includes('set price') || h.includes('full price'));
  let discountIdx = headerRow.findIndex(h => h.includes('ส่วนลด') || h.includes('discount'));
  let promoPriceIdx = headerRow.findIndex(h => h.includes('ราคาโปร') || h.includes('promoprice') || h.includes('ราคาขาย') || h.includes('min price'));
  let noGiftPriceIdx = headerRow.findIndex(h => h.includes('ไม่รับของแถม') || h.includes('nogift') || h.includes('ราคาพิเศษ') || h.includes('no gift'));
  let startIdx = headerRow.findIndex(h => h.includes('เริ่ม') || h.includes('start'));
  let endIdx = headerRow.findIndex(h => h.includes('สิ้นสุด') || h.includes('หมด') || h.includes('end'));

  // Positional fallback only when missing AND safe
  if (catIdx === -1) catIdx = (noIdx === 0 ? 1 : 0);
  if (brandIdx === -1) brandIdx = (noIdx === 0 ? 2 : 1);
  if (codeIdx === -1) codeIdx = (noIdx === 0 ? 3 : 2);
  if (nameIdx === -1) nameIdx = (noIdx === 0 ? 4 : 3);
  if (promoIdx === -1) promoIdx = (noIdx === 0 ? 5 : 4);
  if (regPriceIdx === -1) regPriceIdx = (noIdx === 0 ? 6 : 5);
  if (discountIdx === -1) discountIdx = (noIdx === 0 ? 7 : 6);
  if (promoPriceIdx === -1) promoPriceIdx = (noIdx === 0 ? 8 : 7);
  if (noGiftPriceIdx === -1) noGiftPriceIdx = (noIdx === 0 ? 9 : 8);
  if (startIdx === -1) startIdx = (noIdx === 0 ? 11 : 9);
  if (endIdx === -1) endIdx = (noIdx === 0 ? 12 : 10);

  const results: PromotionItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) continue;

    let productName = (row[nameIdx] !== undefined ? String(row[nameIdx]) : '').trim();
    let productCode = (row[codeIdx] !== undefined ? String(row[codeIdx]) : '').trim();

    // Protection: If productName is purely numeric digits (like a barcode) or equal to productCode,
    // find the actual product name text from the row
    if (/^\d{8,15}$/.test(productName) || (productName === productCode && /^\d+$/.test(productName))) {
      const candidateName = row.find((cell, cellIdx) => 
        cellIdx !== codeIdx && 
        cellIdx !== promoIdx && 
        cellIdx !== regPriceIdx && 
        cellIdx !== discountIdx && 
        cellIdx !== promoPriceIdx && 
        typeof cell === 'string' && 
        cell.trim().length > 5 && 
        !/^\d+$/.test(cell.trim()) &&
        !/^\d{1,2}\s+(ตุลาคม|พฤศจิกายน|ธันวาคม|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน)/.test(cell.trim())
      );
      if (candidateName) {
        if (!productCode || !/^\d+$/.test(productCode)) {
          productCode = productName;
        }
        productName = candidateName.trim();
      }
    }

    if (!productName) continue;

    const brand = (row[brandIdx] !== undefined ? String(row[brandIdx]) : 'Other').trim();
    const category = (row[catIdx] !== undefined ? String(row[catIdx]) : 'Smartphone').trim();
    const promoDetails = row[promoIdx] !== undefined ? String(row[promoIdx]) : '';

    const regularPrice = parsePrice(row[regPriceIdx]);
    const discount = parsePrice(row[discountIdx]);
    let promoPrice = parsePrice(row[promoPriceIdx]);

    if (promoPrice === 0 && regularPrice > 0) {
      promoPrice = regularPrice - discount;
    }
    if (promoPrice === 0 && regularPrice === 0 && discount > 0) {
      promoPrice = discount;
    }

    const noGiftVal = row[noGiftPriceIdx] ? parsePrice(row[noGiftPriceIdx]) : null;
    const noGiftPrice = (noGiftVal && noGiftVal > 0) ? noGiftVal : null;

    const startDate = (row[startIdx] !== undefined && String(row[startIdx]).trim()) ? String(row[startIdx]).trim() : '1 ตุลาคม 2026';
    const endDate = (row[endIdx] !== undefined && String(row[endIdx]).trim()) ? String(row[endIdx]).trim() : '31 ตุลาคม 2026';

    const { giftValue, giftsList, warrantyDetails } = analyzePromoDetails(promoDetails);
    const specs = extractSpecs(productName);
    // ชื่อรุ่นยึดจาก Product Name ตรงตามคอลัมน์ Sub.Cat./Product Name / ช่องต้องกรอกสีแดง
    const modelName = productName.trim();

    results.push({
      id: `promo-${i}-${productCode || Math.random().toString(36).substring(2, 7)}`,
      no: (noIdx !== -1 && row[noIdx]) ? (parsePrice(row[noIdx]) || row[noIdx]) : i,
      category: category || (productName.toLowerCase().includes('tablet') || productName.toLowerCase().includes('pad') ? 'Tablet Smartphone' : 'Smartphone'),
      brand: brand || 'Other',
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

/**
 * Parse CSV or TSV string into list of PromotionItem
 */
export function parseCsvToPromotions(csvText: string): PromotionItem[] {
  const rows = parseCSVLines(csvText);
  return parseGridToPromotions(rows);
}

/**
 * Parse binary spreadsheet buffer (ODS, XLSX, XLS, CSV) into list of PromotionItem
 */
export function parseSpreadsheetBuffer(buffer: ArrayBuffer | Uint8Array): PromotionItem[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const stringRows: string[][] = rawRows.map(row =>
    Array.isArray(row)
      ? row.map(cell => (cell !== null && cell !== undefined ? String(cell).trim() : ''))
      : []
  );

  return parseGridToPromotions(stringRows);
}

/**
 * Read and parse File directly (ODS, XLSX, CSV)
 */
export function parseSpreadsheetFile(file: File): Promise<PromotionItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const items = parseSpreadsheetBuffer(buffer);
        resolve(items);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
