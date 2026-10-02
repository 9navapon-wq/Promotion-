export interface PromotionItem {
  id: string;
  no: number | string;
  category: string;
  brand: string;
  modelName: string;
  productCode: string;
  productName: string;
  promoDetails: string;
  regularPrice: number;
  discount: number;
  promoPrice: number;
  noGiftPrice?: number | null;
  startDate: string;
  endDate: string;
  giftValue?: number;
  giftsList: string[];
  warrantyDetails?: string[];
  specs?: {
    ram?: string;
    rom?: string;
    color?: string;
    is5G?: boolean;
  };
}

export interface PromotionFilter {
  search: string;
  brand: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  onlyWithDiscount: boolean;
  onlyWithNoGiftPrice: boolean;
  giftKeyword: string;
  quickFilter: 'all' | 'high-discount' | 'high-gifts' | 'tablets' | 'no-gift-price' | 'samsung-fold-flip';
  sortBy: 'no' | 'price-asc' | 'price-desc' | 'discount-desc' | 'name-asc' | 'gift-desc';
}

export interface SheetConfig {
  sourceType: 'default' | 'custom-csv' | 'google-sheet-url';
  sheetUrl?: string;
  lastUpdated: string;
  totalRecords: number;
}

export interface BnnOrderItem {
  item: PromotionItem;
  quantity: number;
  useNoGiftPrice: boolean;
  selectedWarranty?: string;
  notes?: string;
}
