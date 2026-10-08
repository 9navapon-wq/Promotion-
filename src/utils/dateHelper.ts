/**
 * Parse Thai or ISO date string and calculate days remaining
 * e.g. "5 ตุลาคม 2026", "31 ตุลาคม 2026", "1 พฤศจิกายน 2026", "2026-10-06"
 */

const THAI_MONTHS: Record<string, number> = {
  'มกราคม': 0,
  'กุมภาพันธ์': 1,
  'มีนาคม': 2,
  'เมษายน': 3,
  'พฤษภาคม': 4,
  'มิถุนายน': 5,
  'กรกฎาคม': 6,
  'สิงหาคม': 7,
  'กันยายน': 8,
  'ตุลาคม': 9,
  'พฤศจิกายน': 10,
  'ธันวาคม': 11,
};

export function parseThaiDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Check if standard ISO format YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    return new Date(y, m, d);
  }

  // Check Thai format like "31 ตุลาคม 2026" or "5 พ.ย. 2569"
  const thaiMatch = clean.match(/(\d{1,2})\s+([^\s\d]+)\s+(\d{4})/);
  if (thaiMatch) {
    const day = parseInt(thaiMatch[1], 10);
    const monthName = thaiMatch[2];
    let year = parseInt(thaiMatch[3], 10);
    // If year is in Buddhist Era (> 2400) convert to CE
    if (year > 2400) {
      year -= 543;
    }

    // find month index
    let monthIdx = -1;
    for (const [name, idx] of Object.entries(THAI_MONTHS)) {
      if (name.startsWith(monthName) || monthName.startsWith(name.slice(0, 3))) {
        monthIdx = idx;
        break;
      }
    }

    if (monthIdx !== -1) {
      return new Date(year, monthIdx, day);
    }
  }

  // fallback to Date.parse
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export interface ExpiryStatus {
  isExpiringSoon: boolean;
  isExpired: boolean;
  daysRemaining: number;
  message: string;
}

export function checkPromotionExpiry(endDateStr: string, thresholdDays = 3): ExpiryStatus | null {
  if (!endDateStr) return null;
  const endDate = parseThaiDate(endDateStr);
  if (!endDate) return null;

  // Use current date (start of day)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isExpiringSoon: true,
      isExpired: true,
      daysRemaining: diffDays,
      message: `โปรโมชั่นหมดอายุแล้ว (${Math.abs(diffDays)} วันก่อน)`,
    };
  }

  if (diffDays <= thresholdDays) {
    return {
      isExpiringSoon: true,
      isExpired: false,
      daysRemaining: diffDays,
      message: diffDays === 0 ? 'โปรโมชั่นหมดอายุวันนี้!' : `ใกล้หมดอายุ! เหลืออีก ${diffDays} วัน`,
    };
  }

  return {
    isExpiringSoon: false,
    isExpired: false,
    daysRemaining: diffDays,
    message: `เหลืออีก ${diffDays} วัน`,
  };
}
