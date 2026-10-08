import React from 'react';
import { Tag, Gift, Percent, Smartphone } from 'lucide-react';
import { PromotionItem } from '../types/promotion';

interface HeroStatsProps {
  items: PromotionItem[];
  filteredCount: number;
  onQuickFilter: (filter: any) => void;
  activeQuickFilter: string;
}

export const HeroStats: React.FC<HeroStatsProps> = ({
  items,
  filteredCount,
  onQuickFilter,
  activeQuickFilter
}) => {
  // Compute analytics
  const maxDiscountItem: PromotionItem | undefined = items.length > 0
    ? items.reduce((max, item) => (item.discount > max.discount ? item : max), items[0])
    : undefined;
  const maxGiftValueItem: PromotionItem | undefined = items.length > 0
    ? items.reduce((max, item) => ((item.giftValue || 0) > (max.giftValue || 0) ? item : max), items[0])
    : undefined;
  const countWithNoGiftPrice = items.filter(i => !!i.noGiftPrice).length;
  const countTablets = items.filter(i => i.category.toLowerCase().includes('tablet')).length;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-4 pb-5 sm:pt-8 sm:pb-10 px-3 sm:px-6 lg:px-8 shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFE500]/15 border border-[#FFE500]/30 text-[#FFE500] text-[11px] font-bold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500] animate-pulse"></span>
              <span>BaNANA 458 · สาขา True BaNANA Store (Com7)</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>โปรโมชั่นสมาร์ทโฟน & แท็บเล็ต</span>
              <span className="text-[10px] sm:text-xs bg-[#FFE500] text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                BNN 458
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl line-clamp-2 sm:line-clamp-none">
              ตรวจสอบส่วนลด ของแถมพรีเมียม ประกัน BaNANA Sure / Cyber Care+ และราคาไม่รับของแถม เพื่อเปิดออเดอร์และเช็คสต็อกสาขาได้ทันที
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 text-xs text-slate-300 bg-slate-800/80 backdrop-blur px-3 py-2 rounded-xl border border-slate-700">
            <div>
              <span className="block text-slate-400 text-[9px] uppercase font-semibold">แสดงผล</span>
              <span className="text-base sm:text-lg font-bold text-white tabular-nums">{filteredCount}</span>
              <span className="text-slate-400 ml-1 text-[11px]">/ {items.length} รายการ</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="block text-slate-400 text-[9px] uppercase font-semibold">รอบเวลา</span>
              <span className="text-xs sm:text-sm font-semibold text-amber-400">1 ต.ค. - 31 ต.ค.</span>
            </div>
          </div>
        </div>

        {/* 4 Key Stat Cards - Compact on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-6">
          {/* Card 1: Max Discount */}
          <button
            onClick={() => onQuickFilter('high-discount')}
            className={`text-left p-2.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'high-discount'
                ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-amber-400 mb-1 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-300">ส่วนลดสูงสุด</span>
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div className="text-base sm:text-2xl font-black text-white tabular-nums">
              ฿{maxDiscountItem?.discount ? maxDiscountItem.discount.toLocaleString() : '26,000'}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {maxDiscountItem?.productName || 'Huawei Mate X6'}
            </p>
          </button>

          {/* Card 2: Highest Gift Value */}
          <button
            onClick={() => onQuickFilter('high-gifts')}
            className={`text-left p-2.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'high-gifts'
                ? 'bg-rose-900/40 border-rose-400 ring-2 ring-rose-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-rose-400 mb-1 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-300">ของแถมสูงสุด</span>
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div className="text-base sm:text-2xl font-black text-white tabular-nums">
              ฿{maxGiftValueItem?.giftValue ? maxGiftValueItem.giftValue.toLocaleString() : '20,375'}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {maxGiftValueItem?.productName || 'Vivo X300'}
            </p>
          </button>

          {/* Card 3: No-Gift Price Option */}
          <button
            onClick={() => onQuickFilter('no-gift-price')}
            className={`text-left p-2.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'no-gift-price'
                ? 'bg-emerald-900/40 border-emerald-400 ring-2 ring-emerald-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400 mb-1 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-300">ราคาไม่รับของ</span>
              <Percent className="w-3.5 h-3.5" />
            </div>
            <div className="text-base sm:text-2xl font-black text-white tabular-nums">
              {countWithNoGiftPrice} รุ่น
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              มีราคาเน็ตลดพิเศษ
            </p>
          </button>

          {/* Card 4: Tablets */}
          <button
            onClick={() => onQuickFilter('tablets')}
            className={`text-left p-2.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'tablets'
                ? 'bg-amber-900/40 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-amber-400 mb-1 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-300">แท็บเล็ต / iPad</span>
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <div className="text-base sm:text-2xl font-black text-white tabular-nums">
              {countTablets} รุ่น
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              Samsung, Huawei, Pad
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
