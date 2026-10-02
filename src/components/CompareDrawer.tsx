import React from 'react';
import { X, Layers, Trash2, Check, ArrowRight } from 'lucide-react';
import { PromotionItem } from '../types/promotion';

interface CompareDrawerProps {
  items: PromotionItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onSelectProduct: (item: PromotionItem) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  items,
  isOpen,
  onClose,
  onRemoveItem,
  onClearAll,
  onSelectProduct
}) => {
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t-2 border-indigo-600 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              เปรียบเทียบโปรโมชั่น ({items.length}/4 รุ่น)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างทั้งหมด</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compare Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 relative flex flex-col justify-between"
            >
              <button
                onClick={() => onRemoveItem(item.id)}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                title="ลบออกจากการเปรียบเทียบ"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200 inline-block">
                    {item.brand}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                    ชื่อรุ่น
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 pr-4 leading-tight" title={item.modelName || item.productName}>
                  {item.modelName || item.productName}
                </h4>

                {/* Price */}
                <div className="mt-2.5 pt-2 border-t border-slate-200">
                  <div className="text-base font-extrabold text-slate-900 tabular-nums">
                    ฿{item.promoPrice.toLocaleString()}
                  </div>
                  {item.regularPrice > item.promoPrice && (
                    <div className="text-[11px] text-slate-400 line-through tabular-nums">
                      ปกติ ฿{item.regularPrice.toLocaleString()}
                    </div>
                  )}
                  {item.discount > 0 && (
                    <div className="text-[11px] font-semibold text-rose-600">
                      ลด ฿{item.discount.toLocaleString()}
                    </div>
                  )}
                  {item.noGiftPrice && (
                    <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                      ไม่เอาของแถม: ฿{item.noGiftPrice.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Gift Summary */}
                <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                  {item.giftValue && (
                    <div className="font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded inline-block">
                      ของแถมรวม ฿{item.giftValue.toLocaleString()}
                    </div>
                  )}
                  <div className="line-clamp-2 text-[10px] text-slate-500">
                    {item.giftsList.join(', ') || 'ไม่มีของแถมพิเศษ'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectProduct(item)}
                className="mt-3 w-full py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>ดูรายละเอียด</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Empty slot placeholder if < 4 */}
          {items.length < 4 && (
            <div className="hidden md:flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 text-center text-xs text-slate-400">
              <Layers className="w-6 h-6 text-slate-300 mb-1" />
              <span>เลือกสินค้าเพิ่มเพื่อเปรียบเทียบ (สูงสุด 4 รุ่น)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
