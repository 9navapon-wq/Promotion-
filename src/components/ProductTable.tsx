import React, { useState } from 'react';
import { PromotionItem } from '../types/promotion';
import { Copy, Check, ShoppingCart, ExternalLink, Tablet, Smartphone, FileSpreadsheet } from 'lucide-react';
import { defaultPromotions } from '../data/defaultData';

interface ProductTableProps {
  items: PromotionItem[];
  onSelect: (item: PromotionItem) => void;
  comparedIds: Set<string>;
  onToggleCompare: (item: PromotionItem) => void;
  onAddToOrder?: (item: PromotionItem) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  items,
  onSelect,
  comparedIds,
  onToggleCompare,
  onAddToOrder,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [addedOrderIds, setAddedOrderIds] = useState<Set<string>>(new Set());

  const getDisplayProductName = (item: PromotionItem) => {
    const raw = (item.productName || item.modelName || '').trim();
    if (!raw || /^\d{8,15}$/.test(raw) || raw === item.productCode) {
      const match = defaultPromotions.find(d => d.productCode === item.productCode || String(d.no) === String(item.no));
      if (match && match.productName && !/^\d+$/.test(match.productName)) {
        return match.productName;
      }
    }
    return raw || item.productCode;
  };

  const handleCopyCode = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyRowTsv = (e: React.MouseEvent, item: PromotionItem) => {
    e.stopPropagation();
    const tsv = `${item.category}\t${item.brand}\t${item.productCode}\t${item.productName}\t${item.promoDetails}\t${item.regularPrice ? item.regularPrice.toLocaleString() : '-'}\t${item.discount ? item.discount.toLocaleString() : '-'}\t${item.promoPrice ? item.promoPrice.toLocaleString() : '-'}\t${item.noGiftPrice ? item.noGiftPrice.toLocaleString() : ''}\t${item.startDate}\t${item.endDate}`;
    navigator.clipboard.writeText(tsv);
    setCopiedRowId(item.id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  const handleAddOrder = (e: React.MouseEvent, item: PromotionItem) => {
    e.stopPropagation();
    if (onAddToOrder) {
      onAddToOrder(item);
      setAddedOrderIds(prev => new Set(prev).add(item.id));
      setTimeout(() => {
        setAddedOrderIds(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 1500);
    }
  };

  const handleCheckStock = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    window.open('https://bnn458-stock-order.ai.studio/', '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Sub-header notice */}
      <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 text-slate-800 font-medium">
          <FileSpreadsheet className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            ตารางแสดงผลเรียงตามคอลัมน์มาตรฐาน: <strong>Cat.</strong> → <strong>Brand</strong> → <strong>Cat./Product Code</strong> → <strong>Sub.Cat./Product Name (ต้องกรอกสีแดง)</strong> → <strong>รายละเอียด Promotion</strong> → <strong>ราคาปกติ</strong> → <strong>ส่วนลด</strong> → <strong>ราคาโปรโมชั่น</strong> → <strong>ราคาไม่รับของแถม</strong> → <strong>เริ่มต้น</strong> → <strong>สิ้นสุด</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono shrink-0">
          แสดง {items.length} รายการ
        </span>
      </div>

      <div className="overflow-x-auto max-h-[750px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100/90 border-b border-slate-200 sticky top-0 z-10 text-slate-700 font-bold whitespace-nowrap">
            <tr>
              <th className="py-3 px-2.5 w-10 text-center">No.</th>
              <th className="py-3 px-3">Cat.</th>
              <th className="py-3 px-3">Brand</th>
              <th className="py-3 px-3">Cat./Product Code</th>
              <th className="py-3 px-4 min-w-[280px]">
                <div className="flex items-center gap-1.5">
                  <span>Sub.Cat./Product Name</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md font-sans">
                    ต้องกรอกสีแดง → Product Name
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 min-w-[280px]">รายละเอียด Promotion</th>
              <th className="py-3 px-3 text-right">ราคาปกติ</th>
              <th className="py-3 px-3 text-right">ส่วนลด</th>
              <th className="py-3 px-3 text-right font-black text-slate-900 bg-slate-50/70">ราคาโปรโมชั่น</th>
              <th className="py-3 px-3 text-right text-emerald-700">ราคาไม่รับของแถม</th>
              <th className="py-3 px-3">เริ่มต้น</th>
              <th className="py-3 px-3">สิ้นสุด</th>
              <th className="py-3 px-3 text-center w-24">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isCompared = comparedIds.has(item.id);
              const isTablet = item.category.toLowerCase().includes('tablet');

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                >
                  {/* No. */}
                  <td className="py-2.5 px-2.5 text-center text-slate-400 font-mono text-[11px]">
                    {item.no}
                  </td>

                  {/* 1. Cat. */}
                  <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {isTablet ? <Tablet className="w-3 h-3 text-slate-400" /> : <Smartphone className="w-3 h-3 text-slate-400" />}
                      <span>{item.category}</span>
                    </span>
                  </td>

                  {/* 2. Brand */}
                  <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {item.brand}
                  </td>

                  {/* 3. Cat./Product Code */}
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{item.productCode}</span>
                      <button
                        onClick={(e) => handleCopyCode(e, item.productCode, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity"
                        title="คัดลอกรหัสบาร์โค้ด"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* 4. Sub.Cat./Product Name */}
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors line-clamp-1" title={item.productName}>
                        {item.productName}
                      </span>
                      {item.specs?.is5G && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1 rounded shrink-0">
                          5G
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      {item.specs?.ram && item.specs?.rom && (
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                          {item.specs.ram}+{item.specs.rom}
                        </span>
                      )}
                      {item.specs?.color && (
                        <span className="text-slate-600">สี {item.specs.color}</span>
                      )}
                    </div>
                  </td>

                  {/* 5. รายละเอียด Promotion */}
                  <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                    <div className="line-clamp-2 leading-normal" title={item.promoDetails}>
                      {item.promoDetails}
                    </div>
                    {item.giftValue && (
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        มูลค่าของแถม ฿{item.giftValue.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* 6. ราคาปกติ */}
                  <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums whitespace-nowrap">
                    {item.regularPrice > 0 ? `฿${item.regularPrice.toLocaleString()}` : '-'}
                  </td>

                  {/* 7. ส่วนลด */}
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-rose-600 whitespace-nowrap">
                    {item.discount > 0 ? `-฿${item.discount.toLocaleString()}` : '-'}
                  </td>

                  {/* 8. ราคาโปรโมชั่น */}
                  <td className="py-2.5 px-3 text-right tabular-nums font-black text-slate-900 bg-slate-50/70 whitespace-nowrap text-sm">
                    ฿{item.promoPrice.toLocaleString()}
                  </td>

                  {/* 9. ราคาไม่รับของแถม */}
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-600 whitespace-nowrap">
                    {item.noGiftPrice ? `฿${item.noGiftPrice.toLocaleString()}` : '-'}
                  </td>

                  {/* 10. เริ่มต้น */}
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                    {item.startDate || '-'}
                  </td>

                  {/* 11. สิ้นสุด */}
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                    {item.endDate || '-'}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-2.5 px-3 text-center whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {/* Copy row as TSV matching exact format */}
                      <button
                        onClick={(e) => handleCopyRowTsv(e, item)}
                        title="คัดลอกแถวนี้ (รูปแบบตามสเปรดชีต TSV)"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {copiedRowId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => handleAddOrder(e, item)}
                        title="เพิ่มลงตะกร้าสั่งซื้อ BaNANA 458"
                        className={`p-1.5 rounded-lg border transition-colors ${
                          addedOrderIds.has(item.id)
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                            : 'bg-[#FFE500] hover:bg-yellow-400 text-slate-950 border-amber-300 shadow-2xs'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleCheckStock(e, item.productCode)}
                        title="เช็คสต็อก BaNANA 458"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 transition-colors"
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
  );
};
