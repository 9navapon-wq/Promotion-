import React, { useState } from 'react';
import { Copy, Check, Eye, Layers, ShoppingCart, ExternalLink } from 'lucide-react';
import { PromotionItem } from '../types/promotion';

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
  onAddToOrder
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedOrderIds, setAddedOrderIds] = useState<Set<string>>(new Set());

  const handleCopyCode = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      <div className="overflow-x-auto max-h-[750px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-3 w-12 text-center">No.</th>
              <th className="py-3 px-3 w-24">แบรนด์</th>
              <th className="py-3 px-3 w-36">รหัสสินค้า / บาร์โค้ด</th>
              <th className="py-3 px-4 min-w-[260px]">ชื่อรุ่น (Model) / สเปก</th>
              <th className="py-3 px-3 text-right">ราคาปกติ</th>
              <th className="py-3 px-3 text-right">ส่วนลด</th>
              <th className="py-3 px-3 text-right text-indigo-700">ราคาโปร</th>
              <th className="py-3 px-3 text-right text-emerald-700">ไม่รับของแถม</th>
              <th className="py-3 px-4 min-w-[260px]">รายละเอียดโปรโมชั่น & ของแถม</th>
              <th className="py-3 px-3 min-w-[140px]">ระยะเวลา</th>
              <th className="py-3 px-3 text-center w-20">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isCompared = comparedIds.has(item.id);
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                >
                  {/* No. */}
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {item.no}
                  </td>

                  {/* Brand */}
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {item.brand}
                  </td>

                  {/* Code */}
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[110px]">{item.productCode}</span>
                      <button
                        onClick={(e) => handleCopyCode(e, item.productCode, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity"
                        title="คัดลอกรหัส"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Name */}
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    <div className="line-clamp-2 leading-relaxed">
                      {item.productName}
                    </div>
                  </td>

                  {/* Regular Price */}
                  <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                    {item.regularPrice > 0 ? `฿${item.regularPrice.toLocaleString()}` : '-'}
                  </td>

                  {/* Discount */}
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-rose-600">
                    {item.discount > 0 ? `-฿${item.discount.toLocaleString()}` : '-'}
                  </td>

                  {/* Promo Price */}
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900 bg-slate-50/50">
                    ฿{item.promoPrice.toLocaleString()}
                  </td>

                  {/* No Gift Price */}
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-emerald-600">
                    {item.noGiftPrice ? `฿${item.noGiftPrice.toLocaleString()}` : '-'}
                  </td>

                  {/* Promotion details */}
                  <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                    <div className="line-clamp-2 leading-normal" title={item.promoDetails}>
                      {item.promoDetails}
                    </div>
                    {item.giftValue && (
                      <span className="inline-block mt-0.5 text-[10px] font-medium text-rose-600 bg-rose-50 px-1 rounded">
                        ของแถม ฿{item.giftValue.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Dates */}
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {item.startDate} - {item.endDate}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-2.5 px-3 text-center whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => handleAddOrder(e, item)}
                        title="เพิ่มลงตะกร้าสั่งซื้อ BaNANA 458"
                        className={`p-1.5 rounded-lg border transition-colors ${
                          addedOrderIds.has(item.id)
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                            : 'bg-amber-100 hover:bg-amber-200 text-slate-900 border-amber-300'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleCheckStock(e, item.productCode)}
                        title="เปิดเช็คสต็อกที่ระบบ BaNANA 458"
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
                      </button>

                      <button
                        onClick={() => onToggleCompare(item)}
                        title={isCompared ? 'นำออกจากการเปรียบเทียบ' : 'เพิ่มเพื่อเปรียบเทียบ'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isCompared
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelect(item)}
                        title="ดูรายละเอียดสินค้า"
                        className="p-1.5 bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
