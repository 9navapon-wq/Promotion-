import React from 'react';
import { X, Printer, ShieldCheck, Gift, Tag } from 'lucide-react';
import { PromotionItem } from '../types/promotion';

interface PrintPriceTagModalProps {
  item: PromotionItem | null;
  onClose: () => void;
}

export const PrintPriceTagModal: React.FC<PrintPriceTagModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  const discountPercent = item.regularPrice > 0 && item.discount > 0
    ? Math.round((item.discount / item.regularPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-xs font-bold text-slate-800">
              พิมพ์ป้ายราคา POP หน้าร้าน · BaNANA 458
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ป้าย (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable POP Card Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-100/50 print:p-0 print:bg-white">
          <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-900 overflow-hidden shadow-md print:shadow-none print:border-2 print:border-black">
            {/* Top BaNANA Header */}
            <div className="bg-[#FFE500] px-4 py-2.5 border-b-2 border-slate-900 flex items-center justify-between text-slate-950 font-black">
              <div className="flex items-center gap-2">
                <span className="text-lg tracking-tighter uppercase font-black">BaNANA</span>
                <span className="text-[10px] font-bold bg-black text-[#FFE500] px-1.5 py-0.5 rounded">
                  สาขา 458
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                {item.category}
              </span>
            </div>

            {/* Model & Specs */}
            <div className="p-4 space-y-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {item.brand}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  #{item.no}
                </span>
              </div>

              <h2 className="text-sm font-black text-slate-950 leading-snug">
                {item.productName}
              </h2>

              {item.specs && (item.specs.ram || item.specs.rom || item.specs.is5G) && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                  {item.specs.ram && item.specs.rom && (
                    <span>{item.specs.ram} / {item.specs.rom}</span>
                  )}
                  {item.specs.is5G && <span className="text-indigo-600">· 5G</span>}
                  {item.specs.color && <span className="text-slate-500">· {item.specs.color}</span>}
                </div>
              )}
            </div>

            {/* Big Price Block */}
            <div className="bg-amber-50/70 p-4 border-b border-slate-200">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-bold text-slate-600 uppercase">ราคาโปรโมชั่นพิเศษ</span>
                {item.discount > 0 && (
                  <span className="text-xs font-black text-rose-600 bg-white border border-rose-300 px-2 py-0.5 rounded-md shadow-2xs">
                    ประหยัด ฿{item.discount.toLocaleString()} ({discountPercent}%)
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-950 tabular-nums tracking-tight">
                  ฿{item.promoPrice.toLocaleString()}
                </span>
                {item.regularPrice > item.promoPrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through tabular-nums">
                    ฿{item.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {item.noGiftPrice && (
                <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded border border-emerald-300 flex items-center justify-between">
                  <span>🏷️ ราคาไม่รับของแถม:</span>
                  <span className="font-mono font-black">฿{item.noGiftPrice.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Promotion Details & Freebies */}
            <div className="p-3.5 space-y-2 text-xs border-b border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                  <span>ของแถม & สิทธิพิเศษ:</span>
                </span>
                {item.giftValue ? (
                  <span className="text-rose-600">มูลค่ารวม ฿{item.giftValue.toLocaleString()}</span>
                ) : null}
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-4">
                {item.promoDetails}
              </p>

              {/* Warranty / Cyber Care */}
              {item.warrantyDetails && item.warrantyDetails.length > 0 && (
                <div className="space-y-1 pt-1">
                  {item.warrantyDetails.map((w, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="p-3 bg-white text-center">
              {/* Simulated barcode bars */}
              <div className="flex items-center justify-center gap-[2px] h-9 mb-1">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-black h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <div className="font-mono text-xs font-bold text-slate-800 tracking-widest">
                {item.productCode}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5 font-medium">
                ระยะเวลาโปรโมชั่น: {item.startDate} - {item.endDate} · BaNANA สาขา 458
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
