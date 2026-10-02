import React from 'react';
import { RefreshCw, Download, FileSpreadsheet, Layers, ExternalLink, ShoppingCart, Scan } from 'lucide-react';
import { SheetConfig } from '../types/promotion';

interface HeaderProps {
  sheetConfig: SheetConfig;
  totalItems: number;
  filteredCount: number;
  onOpenSyncModal: () => void;
  onExportCsv: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  compareCount: number;
  onOpenCompare: () => void;
  orderCount: number;
  onOpenOrderTray: () => void;
  onOpenScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sheetConfig,
  totalItems,
  filteredCount,
  onOpenSyncModal,
  onExportCsv,
  activeCategory,
  onSelectCategory,
  compareCount,
  onOpenCompare,
  orderCount,
  onOpenOrderTray,
  onOpenScanner,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Zone 1: BaNANA 458 Brand Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <div className="h-10 px-2.5 rounded-xl bg-[#FFE500] text-slate-950 flex items-center justify-center font-black tracking-tight shadow-xs border border-amber-300">
                <span className="text-base uppercase tracking-tighter">BaNANA</span>
                <span className="ml-1 text-[10px] bg-slate-950 text-[#FFE500] px-1 rounded font-bold">
                  458
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
                  โปรโมชั่นประจำเดือน
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  สาขา 458
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                เชื่อมต่อระบบ Stock & Order Manager · {sheetConfig.lastUpdated}
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({totalItems})
            </button>
            <button
              onClick={() => onSelectCategory('Smartphone')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeCategory === 'Smartphone'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สมาร์ทโฟน
            </button>
            <button
              onClick={() => onSelectCategory('Tablet Smartphone')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeCategory === 'Tablet Smartphone'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แท็บเล็ต
            </button>
          </nav>

          {/* Zone 3: Actions & BNN 458 Link */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Barcode Scanner Button */}
            <button
              onClick={onOpenScanner}
              title="สแกนบาร์โค้ดสินค้าหน้าร้าน"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
            >
              <Scan className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">สแกนบาร์โค้ด</span>
            </button>

            {/* BNN 458 Order Tray Button */}
            <button
              onClick={onOpenOrderTray}
              title="เปิดตะกร้าสั่งซื้อ BaNANA 458"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#FFE500] hover:bg-yellow-300 rounded-xl transition-colors shadow-2xs border border-amber-300 whitespace-nowrap"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออเดอร์ BNN 458</span>
              {orderCount > 0 && (
                <span className="px-1.5 py-0.2 bg-black text-[#FFE500] text-[10px] font-black rounded-full">
                  {orderCount}
                </span>
              )}
            </button>

            {/* Compare Drawer Button */}
            {compareCount > 0 && (
              <button
                onClick={onOpenCompare}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors whitespace-nowrap border border-indigo-200"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>เทียบ ({compareCount})</span>
              </button>
            )}

            {/* Sync Sheets Button */}
            <button
              onClick={onOpenSyncModal}
              title="ซิงค์ข้อมูลโปรโมชั่นจาก Google Sheets"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ซิงค์ชีต</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCsv}
              title="ส่งออกรายการ CSV"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {/* Direct Link to BNN 458 Stock App */}
            <a
              href="https://bnn458-stock-order.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              title="เปิดเว็บแอป สต็อก & สั่งซื้อ BaNANA 458"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
            >
              <span className="hidden sm:inline">เปิดแอป BNN 458</span>
              <span className="sm:hidden">BNN 458</span>
              <ExternalLink className="w-3 h-3 text-[#FFE500]" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
