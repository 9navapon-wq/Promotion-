import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroStats } from './components/HeroStats';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductTable } from './components/ProductTable';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CompareDrawer } from './components/CompareDrawer';
import { SheetSyncModal } from './components/SheetSyncModal';
import { BnnOrderTray } from './components/BnnOrderTray';
import { PrintPriceTagModal } from './components/PrintPriceTagModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ModelDirectoryModal } from './components/ModelDirectoryModal';
import { ModelPromotionMenu } from './components/ModelPromotionMenu';
import { defaultPromotions } from './data/defaultData';
import { parseCsvToPromotions } from './utils/csvParser';
import { PromotionItem, PromotionFilter, SheetConfig, BnnOrderItem } from './types/promotion';
import { SearchX, Sparkles, Filter, Layers, Download, RefreshCw, ShoppingCart, Scan, ExternalLink } from 'lucide-react';

const STORAGE_KEY_PROMOTIONS = 'promotions_app_data_v2';
const STORAGE_KEY_CONFIG = 'promotions_app_config_v2';
const STORAGE_KEY_ORDERS = 'bnn458_orders_v1';

export default function App() {
  // 1. Promotions Data State
  const [promotions, setPromotions] = useState<PromotionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMOTIONS) || localStorage.getItem('promotions_app_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map(item => {
            const defaultMatch = defaultPromotions.find(d => d.productCode === item.productCode || String(d.no) === String(item.no));
            const validName = (item.productName && !/^\d{8,15}$/.test(String(item.productName).trim()) && item.productName !== item.productCode)
              ? item.productName
              : (defaultMatch ? defaultMatch.productName : item.productName);

            return {
              ...item,
              productName: validName,
              modelName: validName, // ชื่อรุ่นยึดจาก Product Name ตรงตามคอลัมน์ Sub.Cat./Product Name / ช่องต้องกรอกสีแดง
            };
          });
          localStorage.setItem(STORAGE_KEY_PROMOTIONS, JSON.stringify(sanitized));
          return sanitized;
        }
      }
    } catch (e) {
      console.error('Failed to load local promotions:', e);
    }
    return defaultPromotions;
  });

  // 2. Sheet Source Config State
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local config:', e);
    }
    return {
      sourceType: 'default',
      lastUpdated: 'ตุลาคม 2026',
      totalRecords: defaultPromotions.length
    };
  });

  // 3. Filter & Sort State
  const [filter, setFilter] = useState<PromotionFilter>({
    search: '',
    brand: 'all',
    category: 'all',
    minPrice: 0,
    maxPrice: 100000,
    onlyWithDiscount: false,
    onlyWithNoGiftPrice: false,
    giftKeyword: '',
    quickFilter: 'all',
    sortBy: 'no'
  });

  // 4. View Mode: Grid (Cards) vs Table (Spreadsheet) vs Models (Promotions by Model)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'models'>('grid');

  // 5. Selected Product for Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<PromotionItem | null>(null);

  // 6. Comparison Tray State (max 4)
  const [comparedProducts, setComparedProducts] = useState<PromotionItem[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // 7. Sync Modal State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // 8. BaNANA 458 Order Tray State
  const [orderItems, setOrderItems] = useState<BnnOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load local orders:', e);
    }
    return [];
  });
  const [isOrderTrayOpen, setIsOrderTrayOpen] = useState(false);

  // 9. In-Store Barcode Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // 10. Model Directory Modal State (แสดงชื่อรุ่น)
  const [isModelDirectoryOpen, setIsModelDirectoryOpen] = useState(false);

  // 11. In-Store POP Shelf Price Tag Modal State
  const [printItem, setPrintItem] = useState<PromotionItem | null>(null);

  // Sync state to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROMOTIONS, JSON.stringify(promotions));
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(sheetConfig));
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orderItems));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [promotions, sheetConfig, orderItems]);

  // Order Handlers for BaNANA 458
  const handleAddToOrder = (item: PromotionItem) => {
    setOrderItems(prev => {
      const idx = prev.findIndex(o => o.item.id === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + 1
        };
        return updated;
      }
      return [...prev, { item, quantity: 1, useNoGiftPrice: false }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setOrderItems(prev =>
      prev
        .map(o => {
          if (o.item.id === id) {
            const nextQty = o.quantity + delta;
            return nextQty > 0 ? { ...o, quantity: nextQty } : null;
          }
          return o;
        })
        .filter((o): o is BnnOrderItem => o !== null)
    );
  };

  const handleToggleNoGift = (id: string) => {
    setOrderItems(prev =>
      prev.map(o => (o.item.id === id ? { ...o, useNoGiftPrice: !o.useNoGiftPrice } : o))
    );
  };

  const handleRemoveOrderItem = (id: string) => {
    setOrderItems(prev => prev.filter(o => o.item.id !== id));
  };

  const handleClearOrder = () => {
    setOrderItems([]);
  };

  const handleSelectBarcode = (code: string) => {
    setFilter(prev => ({ ...prev, search: code }));
    const found = promotions.find(p => p.productCode === code);
    if (found) {
      setSelectedProduct(found);
    }
  };

  // Handle Filter Change
  const handleFilterChange = (newValues: Partial<PromotionFilter>) => {
    setFilter(prev => ({ ...prev, ...newValues }));
  };

  const handleResetFilter = () => {
    setFilter({
      search: '',
      brand: 'all',
      category: 'all',
      minPrice: 0,
      maxPrice: 100000,
      onlyWithDiscount: false,
      onlyWithNoGiftPrice: false,
      giftKeyword: '',
      quickFilter: 'all',
      sortBy: 'no'
    });
  };

  // Compare toggling
  const handleToggleCompare = (item: PromotionItem) => {
    setComparedProducts(prev => {
      const exists = prev.some(p => p.id === item.id);
      if (exists) {
        return prev.filter(p => p.id !== item.id);
      } else {
        if (prev.length >= 4) {
          alert('สามารถเปรียบเทียบได้สูงสุด 4 รายการพร้อมกัน');
          return prev;
        }
        setIsCompareOpen(true);
        return [...prev, item];
      }
    });
  };

  const handleRemoveCompare = (id: string) => {
    setComparedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearCompare = () => {
    setComparedProducts([]);
    setIsCompareOpen(false);
  };

  // Sync from URL
  const handleSyncFromUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const csvText = await response.text();
      const parsedItems = parseCsvToPromotions(csvText);

      if (parsedItems.length > 0) {
        setPromotions(parsedItems);
        setSheetConfig({
          sourceType: 'google-sheet-url',
          sheetUrl: url,
          lastUpdated: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          totalRecords: parsedItems.length
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error fetching sheet CSV:', err);
      return false;
    }
  };

  // Import raw CSV text
  const handleImportRawCsv = (csvText: string): boolean => {
    try {
      const parsedItems = parseCsvToPromotions(csvText);
      if (parsedItems.length > 0) {
        setPromotions(parsedItems);
        setSheetConfig({
          sourceType: 'custom-csv',
          lastUpdated: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          totalRecords: parsedItems.length
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error parsing raw CSV:', e);
      return false;
    }
  };

  // Import parsed promotions directly
  const handleImportPromotions = (items: PromotionItem[], appendMode?: boolean, filename?: string): boolean => {
    if (!items || items.length === 0) return false;
    setPromotions(prev => appendMode ? [...prev, ...items] : items);
    setSheetConfig({
      sourceType: 'custom-csv',
      lastUpdated: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      totalRecords: appendMode ? promotions.length + items.length : items.length
    });
    return true;
  };

  // Reset to default promotions
  const handleResetToDefault = () => {
    setPromotions(defaultPromotions);
    setSheetConfig({
      sourceType: 'default',
      lastUpdated: 'ตุลาคม 2026',
      totalRecords: defaultPromotions.length
    });
    localStorage.removeItem(STORAGE_KEY_PROMOTIONS);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    setIsSyncModalOpen(false);
  };

  // Calculate unique brands with counts
  const brandList = useMemo(() => {
    const brandMap: Record<string, number> = {};
    for (const p of promotions) {
      const b = p.brand ? p.brand.trim() : 'Other';
      brandMap[b] = (brandMap[b] || 0) + 1;
    }
    return Object.entries(brandMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [promotions]);

  // Filtered & Sorted Promotions
  const filteredPromotions = useMemo(() => {
    const query = filter.search.toLowerCase().trim();

    return promotions
      .filter((item) => {
        // Search filter
        if (query) {
          const matchModel = item.modelName ? item.modelName.toLowerCase().includes(query) : false;
          const matchName = item.productName.toLowerCase().includes(query);
          const matchCode = item.productCode.toLowerCase().includes(query);
          const matchBrand = item.brand.toLowerCase().includes(query);
          const matchPromo = item.promoDetails.toLowerCase().includes(query);
          if (!matchModel && !matchName && !matchCode && !matchBrand && !matchPromo) {
            return false;
          }
        }

        // Brand filter
        if (filter.brand !== 'all') {
          if (item.brand.toLowerCase() !== filter.brand.toLowerCase()) {
            return false;
          }
        }

        // Category filter
        if (filter.category !== 'all') {
          if (item.category.toLowerCase() !== filter.category.toLowerCase()) {
            return false;
          }
        }

        // Quick Filters
        if (filter.quickFilter === 'high-discount') {
          if (item.discount < 5000) return false;
        } else if (filter.quickFilter === 'high-gifts') {
          if (!item.giftValue || item.giftValue < 5000) return false;
        } else if (filter.quickFilter === 'tablets') {
          if (!item.category.toLowerCase().includes('tablet')) return false;
        } else if (filter.quickFilter === 'no-gift-price') {
          if (!item.noGiftPrice) return false;
        } else if (filter.quickFilter === 'samsung-fold-flip') {
          const lowerName = item.productName.toLowerCase();
          if (!lowerName.includes('fold') && !lowerName.includes('flip')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'discount-desc') {
          return b.discount - a.discount;
        }
        if (filter.sortBy === 'price-asc') {
          return a.promoPrice - b.promoPrice;
        }
        if (filter.sortBy === 'price-desc') {
          return b.promoPrice - a.promoPrice;
        }
        if (filter.sortBy === 'gift-desc') {
          return (b.giftValue || 0) - (a.giftValue || 0);
        }
        if (filter.sortBy === 'name-asc') {
          const nameA = a.modelName || a.productName;
          const nameB = b.modelName || b.productName;
          return nameA.localeCompare(nameB, 'th');
        }
        // default: sort by row 'no'
        const noA = typeof a.no === 'number' ? a.no : parseInt(String(a.no)) || 99999;
        const noB = typeof b.no === 'number' ? b.no : parseInt(String(b.no)) || 99999;
        return noA - noB;
      });
  }, [promotions, filter]);

  // Export current filtered list as CSV
  const handleExportCsv = () => {
    const headers = [
      'ลำดับ',
      'หมวดหมู่',
      'แบรนด์',
      'ชื่อรุ่น (Model)',
      'รหัสสินค้า/บาร์โค้ด',
      'ชื่อรุ่นและสเปกเต็ม',
      'ราคาปกติ',
      'ส่วนลด',
      'ราคาโปรโมชั่น',
      'ราคาไม่รับของแถม',
      'รายละเอียดโปรโมชั่นและของแถม',
      'เริ่มต้น',
      'สิ้นสุด'
    ];

    const rows = filteredPromotions.map((p, idx) => [
      p.no || idx + 1,
      `"${p.category.replace(/"/g, '""')}"`,
      `"${p.brand.replace(/"/g, '""')}"`,
      `"${(p.modelName || p.productName).replace(/"/g, '""')}"`,
      `"${p.productCode}"`,
      `"${p.productName.replace(/"/g, '""')}"`,
      p.regularPrice,
      p.discount,
      p.promoPrice,
      p.noGiftPrice || '',
      `"${p.promoDetails.replace(/"/g, '""')}"`,
      `"${p.startDate}"`,
      `"${p.endDate}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `promotions_october_2026_${filteredPromotions.length}_items.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const comparedIds = useMemo(() => new Set(comparedProducts.map(p => p.id)), [comparedProducts]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        sheetConfig={sheetConfig}
        totalItems={promotions.length}
        filteredCount={filteredPromotions.length}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onExportCsv={handleExportCsv}
        activeCategory={filter.category}
        onSelectCategory={(cat) => handleFilterChange({ category: cat })}
        compareCount={comparedProducts.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        orderCount={orderItems.reduce((sum, o) => sum + o.quantity, 0)}
        onOpenOrderTray={() => setIsOrderTrayOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenModelDirectory={() => setIsModelDirectoryOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 2. Hero Section with Key Metrics & Highlights (Hidden in Model Hub for sleek mobile experience) */}
      {viewMode !== 'models' && (
        <HeroStats
          items={promotions}
          filteredCount={filteredPromotions.length}
          onQuickFilter={(qf) => handleFilterChange({ quickFilter: qf })}
          activeQuickFilter={filter.quickFilter}
        />
      )}

      {/* 3. Sticky Filter & Search Bar */}
      {viewMode !== 'models' && (
        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          brands={brandList}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilter={handleResetFilter}
          onOpenModelDirectory={() => setIsModelDirectoryOpen(true)}
        />
      )}

      {/* 4. Main Catalog Content */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-8 pb-24 md:pb-8 overflow-x-hidden">
        {/* Results Header (for grid/table) */}
        {viewMode !== 'models' && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                {filter.brand !== 'all' ? `แบรนด์ ${filter.brand}` : 'รายการโปรโมชั่นทั้งหมด'}
              </h3>
              <span className="text-xs text-slate-500 font-medium tabular-nums">
                ({filteredPromotions.length} รายการ)
              </span>
            </div>

            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
              <span>BaNANA 458: กด "+ สั่งซื้อ BNN" เพื่อรวมออเดอร์ หรือกด "สต็อก 458" เพื่อเช็คจำนวนคงเหลือ</span>
            </div>
          </div>
        )}

        {/* Catalog Grid or Table or Models */}
        {viewMode === 'models' ? (
          <ModelPromotionMenu
            items={promotions}
            onSelectProduct={setSelectedProduct}
            onAddToOrder={handleAddToOrder}
            onPrintPriceTag={(p) => setPrintItem(p)}
            onBackToGrid={() => setViewMode('grid')}
          />
        ) : filteredPromotions.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredPromotions.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onSelect={setSelectedProduct}
                  isCompared={comparedIds.has(item.id)}
                  onToggleCompare={handleToggleCompare}
                  onAddToOrder={handleAddToOrder}
                  onPrintPriceTag={(p) => setPrintItem(p)}
                />
              ))}
            </div>
          ) : (
            <ProductTable
              items={filteredPromotions}
              onSelect={setSelectedProduct}
              comparedIds={comparedIds}
              onToggleCompare={handleToggleCompare}
              onAddToOrder={handleAddToOrder}
            />
          )
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <SearchX className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              ไม่พบรายการที่ตรงกับเงื่อนไข
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              ลองค้นหาด้วยคำอื่น หรือกดปุ่มด้านล่างเพื่อล้างตัวกรองและดูรายการทั้งหมด
            </p>
            <button
              onClick={handleResetFilter}
              className="px-5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              ล้างตัวกรองและแสดงทั้งหมด
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Toolbar for Mobile */}
      <div className="fixed bottom-3 inset-x-3 max-w-[calc(100vw-24px)] mx-auto z-30 md:hidden flex items-center justify-between gap-1.5 p-1.5 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl">
        <button
          onClick={() => setViewMode(viewMode === 'models' ? 'grid' : 'models')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-bold transition-colors ${
            viewMode === 'models'
              ? 'bg-[#FFE500] text-slate-950 shadow-xs'
              : 'bg-slate-800 text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{viewMode === 'models' ? 'ดูการ์ดปกติ' : 'รวมตามรุ่น'}</span>
        </button>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-slate-800 text-white rounded-xl text-[11px] font-semibold"
        >
          <Scan className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>สแกน</span>
        </button>

        <button
          onClick={() => setIsOrderTrayOpen(true)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-amber-400 text-slate-950 rounded-xl text-[11px] font-black shadow-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>ตะกร้า ({orderItems.reduce((sum, o) => sum + o.quantity, 0)})</span>
        </button>

        <a
          href="https://bnn458-stock-order.ai.studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-slate-800 text-white rounded-xl shrink-0"
          title="เปิดสต็อก BNN 458"
        >
          <ExternalLink className="w-4 h-4 text-[#FFE500]" />
        </a>
      </div>

      {/* 5. Product Detail Modal */}
      <ProductDetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isCompared={selectedProduct ? comparedIds.has(selectedProduct.id) : false}
        onToggleCompare={handleToggleCompare}
        onAddToOrder={handleAddToOrder}
        onPrintPriceTag={(p) => setPrintItem(p)}
      />

      {/* 6. Compare Drawer */}
      <CompareDrawer
        items={comparedProducts}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRemoveItem={handleRemoveCompare}
        onClearAll={handleClearCompare}
        onSelectProduct={setSelectedProduct}
      />

      {/* 7. BaNANA 458 Order Slip Tray */}
      <BnnOrderTray
        isOpen={isOrderTrayOpen}
        onClose={() => setIsOrderTrayOpen(false)}
        orderItems={orderItems}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleNoGift={handleToggleNoGift}
        onRemoveItem={handleRemoveOrderItem}
        onClearOrder={handleClearOrder}
      />

      {/* 8. POP Shelf Price Tag Modal */}
      <PrintPriceTagModal
        item={printItem}
        onClose={() => setPrintItem(null)}
      />

      {/* 9. In-Store Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectBarcode={handleSelectBarcode}
        availableItems={promotions}
      />

      {/* 10. Model Directory Modal (ทำเนียบชื่อรุ่น) */}
      <ModelDirectoryModal
        isOpen={isModelDirectoryOpen}
        onClose={() => setIsModelDirectoryOpen(false)}
        items={promotions}
        onSelectProduct={(item) => setSelectedProduct(item)}
      />

      {/* 11. Sheet Synchronization Modal */}
      <SheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        config={sheetConfig}
        onSyncFromUrl={handleSyncFromUrl}
        onImportRawCsv={handleImportRawCsv}
        onImportPromotions={handleImportPromotions}
        onResetToDefault={handleResetToDefault}
        totalLoaded={promotions.length}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ระบบโปรโมชั่นสมาร์ทโฟนและแท็บเล็ต · เชื่อมโยงระบบจัดการสต็อกและออเดอร์ BaNANA 458 (True BaNANA Store / Com7)
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://bnn458-stock-order.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 font-bold transition-colors flex items-center gap-1"
            >
              <span>ไปที่ bnn458-stock-order</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <button
              onClick={handleExportCsv}
              className="hover:text-slate-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด CSV ({filteredPromotions.length})</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="hover:text-slate-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ซิงค์ชีต</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
