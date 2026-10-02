import React, { useState } from 'react';
import { X, Copy, Check, Gift, ShieldCheck, Tag, Calendar, Calculator, Share2, Smartphone, Tablet, ShoppingCart, ExternalLink, Printer } from 'lucide-react';
import { PromotionItem } from '../types/promotion';

interface ProductDetailModalProps {
  item: PromotionItem | null;
  onClose: () => void;
  isCompared: boolean;
  onToggleCompare: (item: PromotionItem) => void;
  onAddToOrder?: (item: PromotionItem) => void;
  onPrintPriceTag?: (item: PromotionItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  isCompared,
  onToggleCompare,
  onAddToOrder,
  onPrintPriceTag,
}) => {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState<number>(10);
  const [addedToOrderAnim, setAddedToOrderAnim] = useState(false);

  if (!item) return null;

  const isTablet = item.category.toLowerCase().includes('tablet');
  const discountPercent = item.regularPrice > 0 && item.discount > 0
    ? Math.round((item.discount / item.regularPrice) * 100)
    : 0;

  const monthlyPayment = Math.round(item.promoPrice / installmentMonths);

  const handleCopyQuote = () => {
    const discountText = item.discount > 0 ? `\n🏷️ ส่วนลดเงินสด: ฿${item.discount.toLocaleString()}` : '';
    const noGiftText = item.noGiftPrice ? `\n🏷️ ราคาพิเศษไม่รับของแถม: ฿${item.noGiftPrice.toLocaleString()}` : '';
    const giftsText = item.giftsList.length > 0 ? `\n🎁 รายการของแถม:\n- ${item.giftsList.join('\n- ')}` : '';
    const giftValText = item.giftValue ? `\n(มูลค่าของแถมรวม ฿${item.giftValue.toLocaleString()})` : '';
    const warrantyText = item.warrantyDetails && item.warrantyDetails.length > 0
      ? `\n🛡️ การรับประกัน:\n- ${item.warrantyDetails.join('\n- ')}`
      : '';

    const text = `📱 โปรโมชั่นประจำเดือน: ${item.productName}
แบรนด์: ${item.brand} | รหัสสินค้า: ${item.productCode}
----------------------------------------
💰 ราคาโปรโมชั่น: ฿${item.promoPrice.toLocaleString()} (ราคาปกติ ฿${item.regularPrice.toLocaleString()})${discountText}${noGiftText}
💳 ผ่อน 0% ${installmentMonths} เดือน: เพียงเดือนละ ฿${monthlyPayment.toLocaleString()}${giftsText}${giftValText}${warrantyText}
----------------------------------------
📅 ระยะเวลาโปรโมชั่น: ${item.startDate} - ${item.endDate}`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(item.productCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {item.brand}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              {isTablet ? <Tablet className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              {item.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(item)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                isCompared
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isCompared ? 'กำลังเปรียบเทียบ' : '+ เปรียบเทียบ'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Title & Product Code */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                ชื่อรุ่น (Model)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                #{item.no}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {item.productName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-400">รหัสบาร์โค้ด:</span>
                <span className="font-mono text-slate-700 font-semibold">{item.productCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  title="คัดลอกรหัสสินค้า"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span aria-hidden="true" className="text-slate-300">·</span>

              <div className="flex items-center gap-1 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.startDate} - {item.endDate}</span>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">ราคาปกติ</span>
                <span className="text-lg font-bold text-slate-400 line-through tabular-nums">
                  ฿{item.regularPrice.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-xs text-rose-600 font-semibold block">ส่วนลดทันที</span>
                <span className="text-lg font-bold text-rose-600 tabular-nums">
                  {item.discount > 0 ? `-฿${item.discount.toLocaleString()}` : 'ตามโปรของแถม'}
                </span>
                {discountPercent > 0 && (
                  <span className="text-[11px] text-rose-500 block">(-{discountPercent}%)</span>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-indigo-700 font-semibold block">ราคาโปรโมชั่นสุทธิ</span>
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  ฿{item.promoPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Special No-Gift Price if available */}
            {item.noGiftPrice && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">ราคาพิเศษ (ไม่รับของแถม):</span>
                </div>
                <span className="text-lg font-bold text-emerald-700 tabular-nums">
                  ฿{item.noGiftPrice.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Installment Plan Calculator */}
          <div className="bg-indigo-50/50 rounded-2xl p-4 sm:p-5 border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>จำลองการผ่อนชำระ 0%</span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-indigo-200 text-xs">
                {[6, 10, 24, 36].map((months) => (
                  <button
                    key={months}
                    onClick={() => setInstallmentMonths(months)}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      installmentMonths === months
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {months} ด.
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-600">ผ่อนชำระ 0% นาน {installmentMonths} เดือน</span>
              <div className="text-right">
                <span className="text-xl font-bold text-indigo-900 tabular-nums">
                  ฿{monthlyPayment.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ เดือน</span>
              </div>
            </div>
          </div>

          {/* Freebies Breakdown */}
          {item.giftsList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-500" />
                  <span>ของแถมและสิทธิประโยชน์พรีเมียม</span>
                </h4>
                {item.giftValue && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    มูลค่าของแถมรวม ฿{item.giftValue.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {item.giftsList.map((gift, idx) => (
                  <div key={idx} className="p-3 text-xs flex items-center gap-2 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      ✓
                    </span>
                    <span className="font-medium">{gift}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty & Care */}
          {item.warrantyDetails && item.warrantyDetails.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>การคุ้มครองและการรับประกัน</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.warrantyDetails.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Promo Description */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-700 block mb-1">ข้อความโปรโมชั่นฉบับเต็มจากชีต:</span>
            <p className="leading-relaxed">{item.promoDetails}</p>
          </div>

          {/* BaNANA 458 Integration Hub */}
          <div className="p-4 bg-amber-400/10 rounded-2xl border border-amber-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FFE500] text-slate-950 text-xs font-black rounded-md">
                  BaNANA 458
                </span>
                <span className="text-xs font-bold text-slate-800">
                  ระบบเชื่อมโยงสต็อกและออเดอร์สาขา
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                bnn458-stock-order
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onAddToOrder) {
                    onAddToOrder(item);
                    setAddedToOrderAnim(true);
                    setTimeout(() => setAddedToOrderAnim(false), 1500);
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FFE500] hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-colors border border-amber-300"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{addedToOrderAnim ? 'เพิ่มลงตะกร้าแล้ว!' : '+ สั่งซื้อ BNN 458'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(item.productCode);
                  window.open('https://bnn458-stock-order.ai.studio/', '_blank');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>เปิดสต็อก BNN 458</span>
              </button>

              {onPrintPriceTag && (
                <button
                  type="button"
                  onClick={() => onPrintPriceTag(item)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>พิมพ์ป้าย POP</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>

          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors"
          >
            {copiedQuote ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedQuote ? 'คัดลอกข้อความสรุปแล้ว' : 'คัดลอกสรุปโปรโมชั่นส่งลูกค้า'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
