import React, { useState } from 'react';
import { Copy, Check, Gift, ShieldCheck, Tag, Calendar, Layers, Eye, Smartphone, Tablet, ShoppingCart, ExternalLink, Printer } from 'lucide-react';
import { PromotionItem } from '../types/promotion';

interface ProductCardProps {
  item: PromotionItem;
  onSelect: (item: PromotionItem) => void;
  isCompared: boolean;
  onToggleCompare: (item: PromotionItem) => void;
  onAddToOrder?: (item: PromotionItem) => void;
  onPrintPriceTag?: (item: PromotionItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onSelect,
  isCompared,
  onToggleCompare,
  onAddToOrder,
  onPrintPriceTag
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [stockCheckOpened, setStockCheckOpened] = useState(false);
  const [addedToOrderAnim, setAddedToOrderAnim] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.productCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyName = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.productName);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
  };

  const handleCheckStockBnn458 = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.productCode);
    setStockCheckOpened(true);
    setTimeout(() => setStockCheckOpened(false), 2500);
    window.open('https://bnn458-stock-order.ai.studio/', '_blank');
  };

  const handleAddOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToOrder) {
      onAddToOrder(item);
      setAddedToOrderAnim(true);
      setTimeout(() => setAddedToOrderAnim(false), 1500);
    }
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPrintPriceTag) {
      onPrintPriceTag(item);
    }
  };

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const discountText = item.discount > 0 ? `ลดทันที: ฿${item.discount.toLocaleString()}` : '';
    const noGiftText = item.noGiftPrice ? `\n🏷️ ราคาพิเศษไม่รับของแถม: ฿${item.noGiftPrice.toLocaleString()}` : '';
    const giftsText = item.giftsList.length > 0 ? `\n🎁 ของแถม: ${item.giftsList.join(', ')}` : '';
    const giftValText = item.giftValue ? ` (มูลค่ารวม ฿${item.giftValue.toLocaleString()})` : '';

    const text = `📱 โปรโมชั่น: ${item.productName}
💰 ราคาโปรโมชั่น: ฿${item.promoPrice.toLocaleString()} (ปกติ ฿${item.regularPrice.toLocaleString()})
${discountText}${noGiftText}${giftsText}${giftValText}
📅 ระยะเวลา: ${item.startDate} - ${item.endDate}
🔍 รหัสสินค้า: ${item.productCode}`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // Determine brand visual theme color
  const getBrandBadge = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes('samsung')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (b.includes('vivo') || b.includes('iqoo')) return 'text-sky-700 bg-sky-50 border-sky-200';
    if (b.includes('xiaomi')) return 'text-orange-700 bg-orange-50 border-orange-200';
    if (b.includes('oppo')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (b.includes('realme')) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (b.includes('huawei')) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (b.includes('honor')) return 'text-cyan-700 bg-cyan-50 border-cyan-200';
    return 'text-slate-700 bg-slate-100 border-slate-200';
  };

  const isTablet = item.category.toLowerCase().includes('tablet');
  const discountPercent = item.regularPrice > 0 && item.discount > 0
    ? Math.round((item.discount / item.regularPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Banner & Category */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Item No & Brand */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              #{item.no}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getBrandBadge(item.brand)}`}>
              {item.brand}
            </span>
          </div>

          {/* Barcode / Code with Copy */}
          <button
            onClick={handleCopyCode}
            title="คัดลอกรหัสสินค้า / บาร์โค้ด"
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
          >
            <span>{item.productCode}</span>
            {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Category sub-line */}
        <div className="flex items-center gap-1 text-[12px] text-slate-500 mb-2">
          {isTablet ? <Tablet className="w-3.5 h-3.5 text-slate-400" /> : <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
          <span>{item.category || (isTablet ? 'Tablet' : 'Smartphone')}</span>
        </div>

        {/* Product Model Badge & Name */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
              ชื่อรุ่น
            </span>
            <button
              onClick={handleCopyName}
              title="คัดลอกชื่อรุ่น"
              className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              {copiedName ? (
                <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> คัดลอกรุ่นแล้ว
                </span>
              ) : (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <Copy className="w-3 h-3" /> คัดลอกชื่อรุ่น
                </span>
              )}
            </button>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {item.productName}
          </h3>
        </div>

        {/* Storage / Specs indicators */}
        {item.specs && (item.specs.ram || item.specs.rom || item.specs.is5G) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
            {item.specs.ram && item.specs.rom && (
              <span>
                {item.specs.ram} + {item.specs.rom}
              </span>
            )}
            {item.specs.is5G && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-indigo-600 font-semibold">5G</span>
              </>
            )}
            {item.specs.color && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-500 truncate max-w-[120px]">{item.specs.color}</span>
              </>
            )}
          </div>
        )}

        {/* Pricing Box */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-xs text-slate-500 font-medium">ราคาโปรโมชั่น</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                  ฿{item.promoPrice.toLocaleString()}
                </span>
                {item.regularPrice > item.promoPrice && (
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    ฿{item.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Discount box matching screenshot */}
            {item.discount > 0 && (
              <div className="text-right px-2.5 py-1 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-700">
                <div className="text-xs font-bold leading-tight">
                  ลด ฿{item.discount.toLocaleString()}
                </div>
                {discountPercent > 0 && (
                  <div className="text-[11px] font-semibold text-rose-600 leading-tight">
                    (-{discountPercent}%)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* No gift price if exists */}
          {item.noGiftPrice && (
            <div className="mt-2 flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg text-emerald-900">
              <span className="font-medium">🏷️ ราคาไม่รับของแถม:</span>
              <span className="font-bold tabular-nums">฿{item.noGiftPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Promotion Details Box - Yellow/Amber themed like screenshot */}
        <div className="mt-3.5 space-y-2">
          {item.promoDetails && (
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  <span>รายละเอียด Promotion:</span>
                </span>
                {item.giftValue ? (
                  <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    ของแถมรวม ฿{item.giftValue.toLocaleString()}
                  </span>
                ) : null}
              </div>
              <p className="text-slate-700 text-xs leading-relaxed line-clamp-4">
                {item.promoDetails}
              </p>
            </div>
          )}

          {/* Cyber Care+ / Warranty Banner */}
          {(item.warrantyDetails && item.warrantyDetails.length > 0) ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {item.warrantyDetails.map((w, idx) => (
                <div
                  key={idx}
                  className="w-full inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-300 px-2.5 py-1 rounded-lg font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{w.includes('คุ้มครอง') ? w : `${w} คุ้มครองความปลอดภัยไซเบอร์`}</span>
                </div>
              ))}
            </div>
          ) : (
            item.promoDetails && item.promoDetails.includes('Cyber Care') && (
              <div className="w-full inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-300 px-2.5 py-1 rounded-lg font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Cyber Care+ คุ้มครองความปลอดภัยไซเบอร์</span>
              </div>
            )
          )}
        </div>
        {/* BNN 458 Action Toolbar */}
        <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleAddOrderClick}
            title="เพิ่มรายการนี้ลงตะกร้าสั่งซื้อ BaNANA 458"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#FFE500] hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-colors border border-amber-300"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{addedToOrderAnim ? 'เพิ่มแล้ว!' : '+ สั่งซื้อ BNN'}</span>
          </button>

          <button
            onClick={handleCheckStockBnn458}
            title="คัดลอกรหัสและเปิดเช็คสต็อกที่ระบบ BaNANA 458"
            className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3 h-3 text-[#FFE500]" />
            <span>{stockCheckOpened ? 'เปิดสต็อก...' : 'สต็อก 458'}</span>
          </button>

          {onPrintPriceTag && (
            <button
              onClick={handlePrintClick}
              title="พิมพ์ป้ายราคา POP หน้าร้าน BaNANA 458"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Footer: Period + Actions */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.startDate} - {item.endDate}</span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleCompare(item)}
            title={isCompared ? 'นำออกจากการเปรียบเทียบ' : 'เพิ่มเพื่อเปรียบเทียบ'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isCompared
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyQuote}
            title="คัดลอกสรุปโปรโมชั่นสำหรับส่งให้ลูกค้า"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors"
          >
            {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedQuote ? 'คัดลอกแล้ว' : 'ส่งลูกค้า'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
