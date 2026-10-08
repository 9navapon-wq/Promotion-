import { PromotionItem } from '../types/promotion';
import initialItems from './promotionsData.json';
import { extractSpecs } from '../utils/csvParser';

export const defaultPromotions: PromotionItem[] = (initialItems as PromotionItem[]).map(item => {
  const extracted = extractSpecs(item.productName);
  return {
    ...item,
    modelName: item.productName, // ชื่อรุ่นยึดจาก Product Name
    specs: {
      ...extracted,
      ...item.specs,
      color: item.specs?.color || extracted.color,
    }
  };
});

