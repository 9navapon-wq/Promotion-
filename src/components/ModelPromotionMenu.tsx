import React, { useState, useMemo } from 'react';
import { 
  Search, X, Gift, ShieldCheck, Tag, ShoppingCart, 
  ChevronDown, ChevronUp, Copy, Check, Sparkles, Filter, 
  Layers, ArrowUpDown, Tablet, Smartphone, Calendar, AlertTriangle, ExternalLink
} from 'lucide-react';
import { PromotionItem } from '../types/promotion';
import { checkPromotionExpiry } from '../utils/dateHelper';

interface ModelPromotionMenuProps {
  items: PromotionItem[];
  onSelectProduct: (item: PromotionItem) => void;
  onAddToOrder?: (item: PromotionItem) => void;
  onPrintPriceTag?: (item: PromotionItem) => void;
  onBackToGrid?: () => void;
}

export interface ModelGroupData {
  brand: string;
  modelName: string;
  category: string;
  variants: PromotionItem[];
  minPromoPrice: number;
  maxPromoPrice: number;
  minRegularPrice: number;
  maxRegularPrice: number;
  maxDiscount: number;
  maxGiftValue: number;
  allGifts: string[];
  allWarranties: string[];
  capacities: string[];
  colors: string[];
  startDate: string;
  endDate: string;
  hasNoGiftPrice: boolean;
  minNoGiftPrice: number | null;
}

export const ModelPromotionMenu: React.FC<ModelPromotionMenuProps> = ({
  items,
  onSelectProduct,
  onAddToOrder,
  onPrintPriceTag,
  onBackToGrid
}) => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Smartphone' | 'Tablet Smartphone'>('all');
  const [sortBy, setSortBy] = useState<'discount-desc' | 'price-asc' | 'price-desc' | 'gift-desc' | 'name-asc'>('discount-desc');
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [addedItemAnim, setAddedItemAnim] = useState<string | null>(null);

  // Group items by Brand + Model Name
  const modelGroups = useMemo(() => {
    const map = new Map<string, ModelGroupData>();

    for (const item of items) {
      const cleanModel = item.modelName || item.productName;
      const key = `${item.brand}:::${cleanModel}`;

      if (!map.has(key)) {
        map.set(key, {
          brand: item.brand,
          modelName: cleanModel,
          category: item.category,
          variants: [],
          minPromoPrice: item.promoPrice || item.regularPrice,
          maxPromoPrice: item.promoPrice || item.regularPrice,
          minRegularPrice: item.regularPrice,
          maxRegularPrice: item.regularPrice,
          maxDiscount: item.discount,
          maxGiftValue: item.giftValue || 0,
          allGifts: [],
          allWarranties: [],
          capacities: [],
          colors: [],
          startDate: item.startDate,
          endDate: item.endDate,
          hasNoGiftPrice: false,
          minNoGiftPrice: null
        });
      }

      const group = map.get(key)!;
      group.variants.push(item);

      // Price tracking
      if (item.promoPrice > 0) {
        if (group.minPromoPrice === 0 || item.promoPrice < group.minPromoPrice) group.minPromoPrice = item.promoPrice;
        if (item.promoPrice > group.maxPromoPrice) group.maxPromoPrice = item.promoPrice;
      }
      if (item.regularPrice > 0) {
        if (group.minRegularPrice === 0 || item.regularPrice < group.minRegularPrice) group.minRegularPrice = item.regularPrice;
        if (item.regularPrice > group.maxRegularPrice) group.maxRegularPrice = item.regularPrice;
      }
      if (item.discount > group.maxDiscount) {
        group.maxDiscount = item.discount;
      }
      if (item.giftValue && item.giftValue > group.maxGiftValue) {
        group.maxGiftValue = item.giftValue;
      }

      // No gift price
      if (item.noGiftPrice) {
        group.hasNoGiftPrice = true;
        if (group.minNoGiftPrice === null || item.noGiftPrice < group.minNoGiftPrice) {
          group.minNoGiftPrice = item.noGiftPrice;
        }
      }

      // Unique gifts
      if (item.giftsList) {
        for (const g of item.giftsList) {
          if (!group.allGifts.includes(g)) group.allGifts.push(g);
        }
      }

      // Warranties
      if (item.warrantyDetails) {
        for (const w of item.warrantyDetails) {
          if (!group.allWarranties.includes(w)) group.allWarranties.push(w);
        }
      }

      // Capacities
      if (item.specs?.ram && item.specs?.rom) {
        const cap = `${item.specs.ram}+${item.specs.rom}`;
        if (!group.capacities.includes(cap)) group.capacities.push(cap);
      }

      // Colors
      if (item.specs?.color && !group.colors.includes(item.specs.color)) {
        group.colors.push(item.specs.color);
      }
    }

    return Array.from(map.values());
  }, [items]);

  // Brand list
  const brands = useMemo(() => {
    const set = new Set<string>();
    modelGroups.forEach(m => set.add(m.brand));
    return ['all', ...Array.from(set).sort()];
  }, [modelGroups]);

  // Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let result = modelGroups.filter(m => {
      if (selectedBrand !== 'all' && m.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (selectedCategory !== 'all') {
        const isTablet = m.category.toLowerCase().includes('tablet');
        if (selectedCategory === 'Tablet Smartphone' && !isTablet) return false;
        if (selectedCategory === 'Smartphone' && isTablet) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = m.modelName.toLowerCase().includes(q);
        const matchBrand = m.brand.toLowerCase().includes(q);
        const matchGifts = m.allGifts.some(g => g.toLowerCase().includes(q));
        const matchBarcodes = m.variants.some(v => v.productCode.includes(q));
        if (!matchName && !matchBrand && !matchGifts && !matchBarcodes) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'discount-desc') return b.maxDiscount - a.maxDiscount;
      if (sortBy === 'price-asc') return a.minPromoPrice - b.minPromoPrice;
      if (sortBy === 'price-desc') return b.minPromoPrice - a.minPromoPrice;
      if (sortBy === 'gift-desc') return b.maxGiftValue - a.maxGiftValue;
      if (sortBy === 'name-asc') return a.modelName.localeCompare(b.modelName);
      return 0;
    });

    return result;
  }, [modelGroups, selectedBrand, selectedCategory, search, sortBy]);

  const toggleExpand = (key: string) => {
    setExpandedModels(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const allKeys = new Set(filteredAndSorted.map(m => `${m.brand}:::${m.modelName}`));
    setExpandedModels(allKeys);
  };

  const collapseAll = () => {
    setExpandedModels(new Set());
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAdd = (item: PromotionItem) => {
    if (onAddToOrder) {
      onAddToOrder(item);
      setAddedItemAnim(item.id);
      setTimeout(() => setAddedItemAnim(null), 1500);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fadeIn">
      {/* Compact Top Banner */}
      <div className="bg-linear-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-2xl p-3 sm:p-4 text-slate-950 shadow-xs border border-amber-300">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 text-[#FFE500] text-[10px] font-black uppercase">
                <Sparkles className="w-2.5 h-2.5" />
                BNN 458
              </span>
              <span className="text-[11px] font-bold text-slate-900 truncate">
                รวมโปรโมชั่นในแต่ล่ะรุ่น
              </span>
            </div>
            <p className="text-[11px] text-slate-800 line-clamp-1">
              รวมทุกสเปก ส่วนลด ของแถม และราคาพิเศษไม่รับของแถม
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onBackToGrid && (
              <button
                onClick={onBackToGrid}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-950 text-[#FFE500] hover:bg-slate-900 transition-colors shadow-2xs"
              >
                ← ดูแบบการ์ด
              </button>
            )}
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/90 hover:bg-white text-slate-900 shadow-2xs transition-colors"
            >
              ขยายทุกรุ่น
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-600/20 text-slate-950 hover:bg-amber-600/30 transition-colors"
            >
              ย่อทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* Compact Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-2xs space-y-2">
        {/* Row 1: Search + Category + Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อรุ่น เช่น Fold7, S25, Reno16, X300..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-400 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5">
            {/* Category Segmented Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  selectedCategory === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setSelectedCategory('Smartphone')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  selectedCategory === 'Smartphone' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                มือถือ
              </button>
              <button
                onClick={() => setSelectedCategory('Tablet Smartphone')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  selectedCategory === 'Tablet Smartphone' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                แท็บเล็ต
              </button>
            </div>

            {/* Sorter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none cursor-pointer font-bold text-slate-800 text-[11px]"
              >
                <option value="discount-desc">ลดสูงสุด</option>
                <option value="gift-desc">ของแถมสูงสุด</option>
                <option value="price-asc">ราคา: น้อย→มาก</option>
                <option value="price-desc">ราคา: มาก→น้อย</option>
                <option value="name-asc">ชื่อรุ่น ก-ฮ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Brand Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-slate-950 text-[#FFE500]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b === 'all' ? 'ทุกแบรนด์' : b}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>
          พบทั้งหมด <strong className="text-slate-900">{filteredAndSorted.length}</strong> รุ่น ({filteredAndSorted.reduce((sum, m) => sum + m.variants.length, 0)} ตัวเลือก)
        </span>
        <span className="text-slate-400">แตะเพื่อดูสเปกและราคา</span>
      </div>

      {/* Model Cards List */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredAndSorted.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">ไม่พบโปรโมชั่นสำหรับรุ่นที่ค้นหา</p>
            <p className="text-xs text-slate-400 mt-0.5">ลองเปลี่ยนคำค้นหาหรือเลือกแบรนด์อื่น</p>
          </div>
        ) : (
          filteredAndSorted.map(model => {
            const key = `${model.brand}:::${model.modelName}`;
            const isExpanded = expandedModels.has(key);
            const isTablet = model.category.toLowerCase().includes('tablet');
            const expiry = checkPromotionExpiry(model.endDate, 3);

            return (
              <div
                key={key}
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-2xs overflow-hidden"
              >
                {/* Header Bar of Model Card (Compact & Mobile-Optimized) */}
                <div
                  onClick={() => toggleExpand(key)}
                  className="p-3 sm:p-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Brand + Name + Specs */}
                    <div className="flex-1 min-w-0">
                      {/* Top Badges */}
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#FFE500] text-slate-950 border border-amber-300">
                          {model.brand}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          {isTablet ? <Tablet className="w-2.5 h-2.5" /> : <Smartphone className="w-2.5 h-2.5" />}
                          {isTablet ? 'แท็บเล็ต' : 'มือถือ'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                          {model.variants.length} ตัวเลือก
                        </span>

                        {expiry?.isExpiringSoon && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{expiry.message}</span>
                          </span>
                        )}
                      </div>

                      {/* Clean Model Name */}
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug line-clamp-1">
                        {model.modelName}
                      </h3>

                      {/* Capacities Pill */}
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {model.capacities.map(c => (
                          <span
                            key={c}
                            className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100"
                          >
                            {c}
                          </span>
                        ))}
                        {model.colors.length > 0 && (
                          <span className="text-slate-400 text-[10px] truncate max-w-[150px] sm:max-w-none">
                            · {model.colors.slice(0, 3).join(', ')}{model.colors.length > 3 ? ` +${model.colors.length - 3}` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Pricing & Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        {model.maxDiscount > 0 && (
                          <span className="inline-block text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mb-0.5">
                            ลดสูงสุด -฿{model.maxDiscount.toLocaleString()}
                          </span>
                        )}
                        <div className="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
                          {model.minPromoPrice === model.maxPromoPrice ? (
                            `฿${model.minPromoPrice.toLocaleString()}`
                          ) : (
                            `฿${model.minPromoPrice.toLocaleString()} - ฿${model.maxPromoPrice.toLocaleString()}`
                          )}
                        </div>
                        {model.maxRegularPrice > model.minPromoPrice && (
                          <span className="text-[10px] text-slate-400 line-through tabular-nums block">
                            ปกติ ฿{model.maxRegularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-2.5 sm:p-4 space-y-3">
                    {/* Compact Gifts & Warranties Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Gifts */}
                      {model.allGifts.length > 0 && (
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between text-amber-900 font-bold mb-1">
                            <span className="flex items-center gap-1 text-[11px] text-amber-800">
                              <Gift className="w-3.5 h-3.5 text-amber-600" />
                              ของแถมประจำรุ่น
                            </span>
                            {model.maxGiftValue > 0 && (
                              <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                รวม ฿{model.maxGiftValue.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {model.allGifts.join(' · ')}
                          </p>
                        </div>
                      )}

                      {/* Warranties */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-indigo-900 flex items-center gap-1 mb-1 text-[11px] text-indigo-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            การรับประกัน & สิทธิพิเศษ
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {model.allWarranties.length > 0 ? model.allWarranties.join(' · ') : 'ประกันศูนย์แท้ 1 ปีเต็ม'}
                          </p>
                        </div>
                        <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>สิ้นสุด: {model.endDate}</span>
                          {model.hasNoGiftPrice && (
                            <span className="font-bold text-emerald-600">
                              มีราคาไม่รับของแถม (เริ่ม ฿{model.minNoGiftPrice?.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mobile-Friendly Sub-Variants List (For Phones) */}
                    <div className="block sm:hidden space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 px-0.5">
                        เลือกรุ่นย่อย ({model.variants.length} รายการ):
                      </div>

                      {model.variants.map(v => {
                        const isAdded = addedItemAnim === v.id;
                        const isCopied = copiedCode === v.productCode;

                        return (
                          <div
                            key={v.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-900 line-clamp-1 mb-0.5" title={v.productName}>
                                  {v.productName}
                                </div>
                                <div className="flex items-center gap-1 mb-0.5">
                                  {v.specs?.ram && v.specs?.rom && (
                                    <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                                      {v.specs.ram}+{v.specs.rom}
                                    </span>
                                  )}
                                  {v.specs?.color && (
                                    <span className="text-[11px] font-semibold text-slate-700">
                                      {v.specs.color}
                                    </span>
                                  )}
                                  {v.specs?.is5G && (
                                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">5G</span>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                  <span>{v.productCode}</span>
                                  <button
                                    onClick={() => handleCopyCode(v.productCode)}
                                    className="p-0.5 text-slate-400 hover:text-slate-700"
                                  >
                                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-black text-slate-900 tabular-nums">
                                  ฿{v.promoPrice.toLocaleString()}
                                </div>
                                {v.regularPrice > v.promoPrice && (
                                  <span className="text-[10px] text-slate-400 line-through tabular-nums block">
                                    ฿{v.regularPrice.toLocaleString()}
                                  </span>
                                )}
                                {v.noGiftPrice && (
                                  <span className="text-[10px] font-bold text-emerald-600 block">
                                    ไม่แถม ฿{v.noGiftPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Mobile Quick Action Buttons */}
                            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                              {onAddToOrder && (
                                <button
                                  onClick={() => handleAdd(v)}
                                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#FFE500] hover:bg-yellow-400 text-slate-950 shadow-2xs'
                                  }`}
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  <span>{isAdded ? 'ใส่แล้ว!' : '+ สั่งซื้อ BNN'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => onSelectProduct(v)}
                                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>ดูโปร</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop & Tablet Table (Hidden on Mobile) */}
                    <div className="hidden sm:block">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                            <tr>
                              <th className="py-2 px-2.5">บาร์โค้ด</th>
                              <th className="py-2 px-2.5">สเปก / สี</th>
                              <th className="py-2 px-2.5 text-right">ราคาปกติ</th>
                              <th className="py-2 px-2.5 text-right">ส่วนลด</th>
                              <th className="py-2 px-2.5 text-right font-black text-slate-900">ราคาโปร</th>
                              <th className="py-2 px-2.5 text-right text-emerald-700">ไม่รับของแถม</th>
                              <th className="py-2 px-2.5 text-center w-28">สั่งซื้อ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {model.variants.map(v => {
                              const isAdded = addedItemAnim === v.id;
                              const isCopied = copiedCode === v.productCode;

                              return (
                                <tr key={v.id} className="hover:bg-amber-50/30 transition-colors">
                                  <td className="py-2 px-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <span>{v.productCode}</span>
                                      <button
                                        onClick={() => handleCopyCode(v.productCode)}
                                        className="p-0.5 text-slate-400 hover:text-slate-700"
                                      >
                                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-2 px-2.5">
                                    <div className="font-bold text-slate-900 text-xs" title={v.productName}>
                                      {v.productName}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      {v.specs?.ram && v.specs?.rom ? `(${v.specs.ram}+${v.specs.rom}) ` : ''}{v.specs?.color ? `· สี ${v.specs.color}` : ''}
                                    </div>
                                  </td>
                                  <td className="py-2 px-2.5 text-right text-slate-400 tabular-nums">
                                    ฿{v.regularPrice.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-2.5 text-right font-bold text-rose-600 tabular-nums">
                                    {v.discount > 0 ? `-฿${v.discount.toLocaleString()}` : '-'}
                                  </td>
                                  <td className="py-2 px-2.5 text-right font-black text-slate-900 tabular-nums bg-slate-50/50">
                                    ฿{v.promoPrice.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-2.5 text-right font-bold text-emerald-600 tabular-nums">
                                    {v.noGiftPrice ? `฿${v.noGiftPrice.toLocaleString()}` : '-'}
                                  </td>
                                  <td className="py-2 px-2.5 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1">
                                      {onAddToOrder && (
                                        <button
                                          onClick={() => handleAdd(v)}
                                          className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                                            isAdded
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-[#FFE500] hover:bg-yellow-400 text-slate-950 shadow-2xs'
                                          }`}
                                        >
                                          <ShoppingCart className="w-3 h-3" />
                                          <span>{isAdded ? 'ใส่แล้ว' : '+ สั่งซื้อ'}</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={() => onSelectProduct(v)}
                                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                        title="ดูรายละเอียดโปรโมชั่น"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
