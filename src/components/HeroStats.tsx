import React from 'react';
import { Tag, Gift, Percent, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';
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
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE500]/15 border border-[#FFE500]/30 text-[#FFE500] text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse"></span>
              <span>BaNANA 458 · สาขา True BaNANA Store (Com7)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>โปรโมชั่นสมาร์ทโฟน & แท็บเล็ต</span>
              <span className="text-xs bg-[#FFE500] text-slate-950 font-black px-2 py-0.5 rounded-md uppercase">
                BNN 458
              </span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              ตรวจสอบส่วนลด ของแถมพรีเมียม ประกัน BaNANA Sure / Cyber Care+ และราคาไม่รับของแถม เพื่อเปิดออเดอร์และเช็คสต็อกสาขาได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 bg-slate-800/80 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-700">
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-semibold">แสดงผล</span>
              <span className="text-lg font-bold text-white tabular-nums">{filteredCount}</span>
              <span className="text-slate-400 ml-1">/ {items.length} รายการ</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-semibold">รอบเวลาหลัก</span>
              <span className="text-sm font-semibold text-amber-400">1 ต.ค. - 31 ต.ค.</span>
            </div>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Card 1: Max Discount */}
          <button
            onClick={() => onQuickFilter('high-discount')}
            className={`text-left p-3.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'high-discount'
                ? 'bg-indigo-900/40 border-indigo-400 ring-2 ring-indigo-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-indigo-400 mb-2">
              <span className="text-xs font-medium text-slate-400">ส่วนลดสูงสุด</span>
              <Tag className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              ฿{maxDiscountItem?.discount ? maxDiscountItem.discount.toLocaleString() : '26,000'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {maxDiscountItem?.productName || 'Huawei Mate X6'}
            </p>
          </button>

          {/* Card 2: Highest Gift Value */}
          <button
            onClick={() => onQuickFilter('high-gifts')}
            className={`text-left p-3.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'high-gifts'
                ? 'bg-rose-900/40 border-rose-400 ring-2 ring-rose-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-rose-400 mb-2">
              <span className="text-xs font-medium text-slate-400">ของแถมมูลค่าสูงสุด</span>
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              ฿{maxGiftValueItem?.giftValue ? maxGiftValueItem.giftValue.toLocaleString() : '20,375'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {maxGiftValueItem?.productName || 'Vivo X300'}
            </p>
          </button>

          {/* Card 3: No-Gift Price Option */}
          <button
            onClick={() => onQuickFilter('no-gift-price')}
            className={`text-left p-3.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'no-gift-price'
                ? 'bg-emerald-900/40 border-emerald-400 ring-2 ring-emerald-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-medium text-slate-400">ราคาไม่รับของแถม</span>
              <Percent className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {countWithNoGiftPrice} รุ่น
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              มีราคาเน็ตลดพิเศษเมื่อไม่รับของ
            </p>
          </button>

          {/* Card 4: Tablets */}
          <button
            onClick={() => onQuickFilter('tablets')}
            className={`text-left p-3.5 sm:p-4 rounded-xl transition-all border ${
              activeQuickFilter === 'tablets'
                ? 'bg-amber-900/40 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-medium text-slate-400">แท็บเล็ตและอุปกรณ์</span>
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {countTablets} รุ่น
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Samsung, Huawei, Xiaomi, Pad
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
