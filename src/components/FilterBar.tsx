import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, LayoutGrid, Table, Check, Gift, Layers } from 'lucide-react';
import { PromotionFilter } from '../types/promotion';

interface FilterBarProps {
  filter: PromotionFilter;
  onFilterChange: (newFilter: Partial<PromotionFilter>) => void;
  brands: { name: string; count: number }[];
  viewMode: 'grid' | 'table' | 'models';
  onViewModeChange: (mode: 'grid' | 'table' | 'models') => void;
  onResetFilter: () => void;
  onOpenModelDirectory?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  brands,
  viewMode,
  onViewModeChange,
  onResetFilter,
  onOpenModelDirectory,
}) => {
  const quickFilterButtons = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'high-discount', label: '🔥 ลดเกิน 5,000.-' },
    { id: 'high-gifts', label: '🎁 ของแถม 5,000.- ขึ้นไป' },
    { id: 'tablets', label: '📱 แท็บเล็ต' },
    { id: 'no-gift-price', label: '⚡ มีราคาไม่รับของแถม' },
    { id: 'samsung-fold-flip', label: '👑 Z Fold & Flip' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-20 shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 space-y-2.5">
        {/* Row 1: Search + View Mode + Sorter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 max-w-lg min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="ค้นหาชื่อรุ่น, บาร์โค้ด, แบรนด์, หรือของแถม (เช่น S25, Fold7, ลำโพง)..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl transition-all outline-none"
            />
            {filter.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right controls: Sort + View Mode */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Sorter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filter.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="no">เรียงตามลำดับชีต</option>
                <option value="discount-desc">ส่วนลด: มากไปน้อย</option>
                <option value="price-asc">ราคา: น้อยไปมาก</option>
                <option value="price-desc">ราคา: มากไปน้อย</option>
                <option value="gift-desc">มูลค่าของแถม: มากไปน้อย</option>
                <option value="name-asc">ชื่อรุ่น: A - Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => onViewModeChange('grid')}
                title="มุมมองการ์ด"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                title="มุมมองตารางสเปรดชีต"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('models')}
                title="เมนูรวมโปรโมชั่นตามรุ่น"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  viewMode === 'models'
                    ? 'bg-[#FFE500] text-slate-950 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-bold px-1">ตามรุ่น</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Brand Horizontal Pill Selector */}
        <div className="flex items-center gap-1.5 touch-scroll-x pb-1 pt-0.5 no-scrollbar scroll-smooth">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            แบรนด์:
          </span>
          <button
            onClick={() => onFilterChange({ brand: 'all' })}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
              filter.brand === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทุกแบรนด์
          </button>
          {brands.map((b) => (
            <button
              key={b.name}
              onClick={() => onFilterChange({ brand: b.name })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                filter.brand.toLowerCase() === b.name.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{b.name}</span>
              <span
                className={`text-[10px] px-1 rounded-sm ${
                  filter.brand.toLowerCase() === b.name.toLowerCase()
                    ? 'bg-indigo-700 text-indigo-100'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {b.count}
              </span>
            </button>
          ))}
        </div>

        {/* Row 3: Quick Filter segmented buttons + price filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {onOpenModelDirectory && (
              <button
                onClick={onOpenModelDirectory}
                className="px-2.5 py-1 text-xs rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 transition-colors shadow-2xs"
              >
                <span>📱 แสดงชื่อรุ่น</span>
              </button>
            )}
            {quickFilterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() =>
                  onFilterChange({
                    quickFilter: btn.id as any,
                  })
                }
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter.quickFilter === btn.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Active filter count / Reset */}
          {(filter.search || filter.brand !== 'all' || filter.quickFilter !== 'all') && (
            <button
              onClick={onResetFilter}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
