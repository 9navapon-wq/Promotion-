import React, { useState, useMemo } from 'react';
import { X, Search, Copy, Check, Smartphone, Tablet, Filter, Layers, ArrowUpDown, Sparkles } from 'lucide-react';
import { PromotionItem } from '../types/promotion';
import { extractModelName } from '../utils/csvParser';

interface ModelDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PromotionItem[];
  onSelectProduct?: (item: PromotionItem) => void;
}

interface GroupedModel {
  brand: string;
  modelName: string;
  category: string;
  variants: PromotionItem[];
  capacities: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
}

export const ModelDirectoryModal: React.FC<ModelDirectoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectProduct
}) => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [showExtractor, setShowExtractor] = useState(false);

  // Group items by Brand + ModelName
  const groupedModels = useMemo(() => {
    const map = new Map<string, GroupedModel>();

    for (const item of items) {
      const modelTitle = item.productName || item.modelName;
      const key = `${item.brand}:::${modelTitle}`;

      if (!map.has(key)) {
        map.set(key, {
          brand: item.brand,
          modelName: modelTitle,
          category: item.category,
          variants: [],
          capacities: [],
          colors: [],
          minPrice: item.promoPrice || item.regularPrice,
          maxPrice: item.promoPrice || item.regularPrice
        });
      }

      const group = map.get(key)!;
      group.variants.push(item);

      const price = item.promoPrice || item.regularPrice;
      if (price > 0) {
        if (group.minPrice === 0 || price < group.minPrice) group.minPrice = price;
        if (price > group.maxPrice) group.maxPrice = price;
      }

      if (item.specs?.ram && item.specs?.rom) {
        const cap = `${item.specs.ram}+${item.specs.rom}`;
        if (!group.capacities.includes(cap)) group.capacities.push(cap);
      }

      if (item.specs?.color && !group.colors.includes(item.specs.color)) {
        group.colors.push(item.specs.color);
      }
    }

    return Array.from(map.values());
  }, [items]);

  // Brand list for tabs
  const brands = useMemo(() => {
    const set = new Set<string>();
    groupedModels.forEach(m => set.add(m.brand));
    return ['all', ...Array.from(set).sort()];
  }, [groupedModels]);

  // Filtered grouped models
  const filteredModels = useMemo(() => {
    return groupedModels.filter(m => {
      if (selectedBrand !== 'all' && m.brand !== selectedBrand) return false;
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = m.modelName.toLowerCase().includes(q);
        const matchBrand = m.brand.toLowerCase().includes(q);
        const matchBarcode = m.variants.some(v => v.productCode.includes(q));
        const matchColor = m.colors.some(c => c.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchBarcode && !matchColor) return false;
      }
      return true;
    });
  }, [groupedModels, selectedBrand, selectedCategory, search]);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllModels = () => {
    const list = filteredModels
      .map(m => `${m.brand} ${m.modelName} (${m.capacities.join(', ') || 'N/A'})`)
      .join('\n');
    handleCopyText(list, 'all-models');
  };

  const handleCopyAllFullNames = () => {
    const list = filteredModels
      .flatMap(m => m.variants.map(v => v.productName))
      .filter((v, i, a) => a.indexOf(v) === i)
      .join('\n');
    handleCopyText(list, 'all-full-names');
  };

  // Custom text extractor
  const parsedCustomModels = useMemo(() => {
    if (!customText.trim()) return [];
    return customText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, idx) => {
        const parts = line.split(/[\t,]+/);
        let barcode = '';
        let fullText = line;
        if (parts.length >= 2 && /^\d{8,16}$/.test(parts[0].trim())) {
          barcode = parts[0].trim();
          fullText = parts.slice(1).join(' ').trim();
        }
        const clean = extractModelName(fullText);
        return { id: idx, barcode, fullText, cleanModel: clean };
      });
  }, [customText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  ทำเนียบชื่อรุ่น (Model Directory)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  {filteredModels.length} รุ่น
                </span>
              </div>
              <p className="text-xs text-slate-500">
                แสดงชื่อรุ่นเฉพาะ แยกยี่ห้อ สเปกความจุ และสี ชัดเจนไม่ต้องอ่านชื่อเต็ม
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllFullNames}
              title="คัดลอกชื่อสินค้าเต็มทุกรุ่น (เช่น Samsung Smartphone Galaxy Z Fold7 (12+512GB) Black (5G))"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-[#FFE500] hover:bg-yellow-400 border border-amber-300 rounded-lg transition-colors shadow-2xs"
            >
              {copiedKey === 'all-full-names' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-800" />
                  <span>คัดลอกชื่อสินค้าแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-800" />
                  <span>คัดลอกชื่อสินค้าเต็ม</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyAllModels}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copiedKey === 'all-models' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>คัดลอกรายชื่อแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>คัดลอกเฉพาะซีรีส์</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อรุ่น (เช่น Fold7, S25, X300, Hot50), บาร์โค้ด หรือสี..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setShowExtractor(!showExtractor)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                showExtractor
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เครื่องมือแยกชื่อรุ่น</span>
            </button>
          </div>
        </div>

        {/* Brand Tabs */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3 h-3" /> แบรนด์:
          </span>
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedBrand === b
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {b === 'all' ? 'ทุกแบรนด์' : b}
            </button>
          ))}
        </div>

        {/* Custom Text Extractor Drawer (Optional) */}
        {showExtractor && (
          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                วางข้อความหรือรายการบาร์โค้ดเพื่อดึง "ชื่อรุ่น" ทันที:
              </span>
              <button
                onClick={() => setCustomText('')}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                ล้างข้อมูล
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="วางรายการเช่น: 8806097462590	Samsung Smartphone Galaxy Z Fold7 (16+1TB) Black (5G)"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
            {parsedCustomModels.length > 0 && (
              <div className="bg-white border border-indigo-100 rounded-xl p-3 max-h-40 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-500 mb-2">
                  ผลการดึงชื่อรุ่น ({parsedCustomModels.length} รายการ):
                </div>
                <div className="space-y-1.5 text-xs">
                  {parsedCustomModels.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-2 truncate">
                        {p.barcode && <span className="font-mono text-slate-400 text-[11px]">{p.barcode}</span>}
                        <span className="font-bold text-indigo-900">{p.cleanModel}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(p.cleanModel, `custom-${p.id}`)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                      >
                        {copiedKey === `custom-${p.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>คัดลอกชื่อรุ่น</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Model Cards Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100/60">
          {filteredModels.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">ไม่พบชื่อรุ่นที่ตรงกับเงื่อนไข</p>
              <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกแบรนด์อื่น</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredModels.map(m => {
                const isCopied = copiedKey === `${m.brand}-${m.modelName}`;
                return (
                  <div
                    key={`${m.brand}-${m.modelName}`}
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top: Brand badge & Category */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {m.brand}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          {m.category.toLowerCase().includes('tablet') ? (
                            <Tablet className="w-3 h-3" />
                          ) : (
                            <Smartphone className="w-3 h-3" />
                          )}
                          {m.category.toLowerCase().includes('tablet') ? 'แท็บเล็ต' : 'สมาร์ทโฟน'}
                        </span>
                      </div>

                      {/* Main Clean Model Name */}
                      <div className="mb-2">
                        <div className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                          ชื่อรุ่น
                        </div>
                        <h3 className="text-base font-black text-slate-900 leading-snug">
                          {m.modelName}
                        </h3>
                      </div>

                      {/* Capacities */}
                      {m.capacities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {m.capacities.map(c => (
                            <span
                              key={c}
                              className="text-[11px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Colors */}
                      {m.colors.length > 0 && (
                        <div className="text-[11px] text-slate-500 mb-2 flex items-center gap-1 flex-wrap">
                          <span className="text-slate-400 font-medium">สี:</span>
                          <span>{m.colors.join(', ')}</span>
                        </div>
                      )}

                      {/* Variants list with exact Barcode & Product Name */}
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          รหัสบาร์โค้ด & ชื่อสินค้า ({m.variants.length}):
                        </div>
                        {m.variants.slice(0, 3).map(v => (
                          <div key={v.productCode} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 border border-slate-100 gap-1.5">
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-slate-500 font-bold text-[10px] block">{v.productCode}</span>
                              <span className="font-bold text-slate-800 line-clamp-1 text-[11px]" title={v.productName}>{v.productName}</span>
                            </div>
                            <button
                              onClick={() => handleCopyText(v.productName, v.productCode)}
                              title="คัดลอกชื่อสินค้าตรงตามบาร์โค้ด"
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded shrink-0"
                            >
                              {copiedKey === v.productCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                        {m.variants.length > 3 && (
                          <div className="text-[10px] text-slate-400 text-center pt-0.5">
                            +อีก {m.variants.length - 3} รายการตามบาร์โค้ด
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Price range & Quick Copy Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-slate-400 block text-[10px]">ราคาโปรโมชั่น</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {m.minPrice > 0 ? (
                            m.minPrice === m.maxPrice ? (
                              `฿${m.minPrice.toLocaleString()}`
                            ) : (
                              `฿${m.minPrice.toLocaleString()} - ฿${m.maxPrice.toLocaleString()}`
                            )
                          ) : (
                            '-'
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(`${m.brand} ${m.modelName}`, `${m.brand}-${m.modelName}`)}
                          title="คัดลอกชื่อรุ่น"
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>คัดลอกชื่อรุ่น</span>
                            </>
                          )}
                        </button>

                        {onSelectProduct && m.variants.length > 0 && (
                          <button
                            onClick={() => {
                              onSelectProduct(m.variants[0]);
                              onClose();
                            }}
                            title="ดูโปรโมชั่นของรุ่นนี้"
                            className="px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          >
                            ดูโปร
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            แสดงทั้งหมด {filteredModels.length} รายการชื่อรุ่น (จากสินค้า {items.length} รายการ)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
