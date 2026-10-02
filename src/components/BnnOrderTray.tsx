import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Copy, Check, ExternalLink, ShoppingCart, FileText, ArrowRight, ShieldCheck, Gift } from 'lucide-react';
import { BnnOrderItem, PromotionItem } from '../types/promotion';

interface BnnOrderTrayProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: BnnOrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onToggleNoGift: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearOrder: () => void;
}

export const BnnOrderTray: React.FC<BnnOrderTrayProps> = ({
  isOpen,
  onClose,
  orderItems,
  onUpdateQuantity,
  onToggleNoGift,
  onRemoveItem,
  onClearOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [staffName, setStaffName] = useState('เจ้าหน้าที่ประจำสาขา (BNN 458)');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit0' | 'qr'>('credit0');
  const [installmentMonths, setInstallmentMonths] = useState('10');
  const [copiedQuote, setCopiedQuote] = useState(false);

  if (!isOpen) return null;

  // Calculate totals
  const totalRegular = orderItems.reduce((sum, item) => sum + (item.item.regularPrice * item.quantity), 0);
  const totalActual = orderItems.reduce((sum, item) => {
    const price = (item.useNoGiftPrice && item.item.noGiftPrice) ? item.item.noGiftPrice : item.item.promoPrice;
    return sum + (price * item.quantity);
  }, 0);
  const totalDiscount = totalRegular - totalActual;
  const totalGiftValue = orderItems.reduce((sum, item) => {
    if (item.useNoGiftPrice) return sum;
    return sum + ((item.item.giftValue || 0) * item.quantity);
  }, 0);
  const totalUnits = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const getPaymentLabel = () => {
    if (paymentMethod === 'cash') return 'เงินสด / โอนชำระ';
    if (paymentMethod === 'credit0') return `บัตรเครดิต ผ่อน 0% (${installmentMonths} เดือน)`;
    return 'QR พร้อมเพย์';
  };

  const handleCopyOrderSummary = () => {
    if (orderItems.length === 0) return;

    let text = `🛒 ใบสรุปรายการสั่งซื้อสินค้า - BaNANA สาขา 458
----------------------------------------
🏬 สาขา: BaNANA สาขา 458 (True Shop / Com7)
👤 เจ้าหน้าที่: ${staffName}
${customerName ? `🧑‍💼 ลูกค้า: ${customerName} (โทร: ${customerPhone || '-'})` : ''}
💳 วิธีชำระเงิน: ${getPaymentLabel()}
----------------------------------------
📋 รายการสินค้า (${totalUnits} เครื่อง):
`;

    orderItems.forEach((order, idx) => {
      const p = order.item;
      const unitPrice = (order.useNoGiftPrice && p.noGiftPrice) ? p.noGiftPrice : p.promoPrice;
      const subtotal = unitPrice * order.quantity;
      const optionText = (order.useNoGiftPrice && p.noGiftPrice) ? ' (ราคาพิเศษไม่รับของแถม)' : '';

      text += `\n${idx + 1}. [${p.brand}] ${p.productName}
   • รหัสบาร์โค้ด: ${p.productCode}
   • จำนวน: ${order.quantity} เครื่อง x ฿${unitPrice.toLocaleString()} = ฿${subtotal.toLocaleString()}${optionText}`;

      if (!order.useNoGiftPrice && p.giftsList && p.giftsList.length > 0) {
        text += `\n   • ของแถม: ${p.giftsList.join(', ')}`;
        if (p.giftValue) text += ` (มูลค่ารวม ฿${(p.giftValue * order.quantity).toLocaleString()})`;
      }

      if (p.warrantyDetails && p.warrantyDetails.length > 0) {
        text += `\n   • การรับประกัน: ${p.warrantyDetails.join(', ')}`;
      }
    });

    text += `\n----------------------------------------
💰 ยอดรวมปกติ: ฿${totalRegular.toLocaleString()}
🏷️ รวมส่วนลด: -฿${totalDiscount.toLocaleString()}
🔥 ยอดสุทธิชำระ: ฿${totalActual.toLocaleString()}
${totalGiftValue > 0 ? `🎁 มูลค่าของแถมรวม: ฿${totalGiftValue.toLocaleString()}` : ''}
${paymentMethod === 'credit0' ? `💳 ผ่อนเดือนละประมาณ: ฿${Math.round(totalActual / parseInt(installmentMonths, 10)).toLocaleString()} / เดือน` : ''}
----------------------------------------
📅 ออกใบสรุปวันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
🔗 ระบบสต็อก BaNANA 458: https://bnn458-stock-order.ai.studio/`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  const handleOpenBnn458 = () => {
    window.open('https://bnn458-stock-order.ai.studio/', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-amber-400/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center font-black text-slate-900 text-sm shadow-xs">
              458
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  ตะกร้าสั่งซื้อ BaNANA 458
                </h3>
                <span className="text-[11px] font-semibold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                  {totalUnits} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                เชื่อมต่อระบบ Stock & Order Manager ประจำสาขา 458
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {orderItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <p className="font-semibold text-slate-700 text-sm">ยังไม่มีรายการในตะกร้า</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                กดปุ่ม "เพิ่มลงออเดอร์ BNN 458" บนการ์ดสินค้าโปรโมชั่น เพื่อนำมารวมออเดอร์หรือเปิดบิล
              </p>
            </div>
          ) : (
            <>
              {/* Customer & Staff Info Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      ชื่อลูกค้า (ทางเลือก)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="เช่น คุณสมชาย"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      เบอร์โทรลูกค้า
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08x-xxx-xxxx"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      วิธีชำระเงิน
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
                    >
                      <option value="credit0">💳 ผ่อนบัตรเครดิต 0%</option>
                      <option value="cash">💵 เงินสด / โอนชำระ</option>
                      <option value="qr">📱 QR พร้อมเพย์</option>
                    </select>
                  </div>
                  {paymentMethod === 'credit0' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        จำนวนเดือนที่ผ่อน
                      </label>
                      <select
                        value={installmentMonths}
                        onChange={(e) => setInstallmentMonths(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
                      >
                        <option value="6">6 เดือน</option>
                        <option value="10">10 เดือน</option>
                        <option value="12">12 เดือน</option>
                        <option value="24">24 เดือน</option>
                        <option value="36">36 เดือน</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                  <span>รายการสินค้าที่เลือก ({orderItems.length})</span>
                  <button
                    onClick={onClearOrder}
                    className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้างทั้งหมด</span>
                  </button>
                </div>

                {orderItems.map((order) => {
                  const p = order.item;
                  const unitPrice = (order.useNoGiftPrice && p.noGiftPrice) ? p.noGiftPrice : p.promoPrice;
                  const itemTotal = unitPrice * order.quantity;

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs hover:border-amber-300 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              {p.brand}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {p.productCode}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                            {p.productName}
                          </h4>
                        </div>
                        <button
                          onClick={() => onRemoveItem(p.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price Options Toggle */}
                      {p.noGiftPrice && (
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-[11px]">
                          <button
                            type="button"
                            onClick={() => onToggleNoGift(p.id)}
                            className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                              !order.useNoGiftPrice
                                ? 'bg-amber-400 text-slate-900 font-bold shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            รับของแถม (฿{p.promoPrice.toLocaleString()})
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleNoGift(p.id)}
                            className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                              order.useNoGiftPrice
                                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            🏷️ ไม่รับของแถม (฿{p.noGiftPrice.toLocaleString()})
                          </button>
                        </div>
                      )}

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2 py-1 bg-slate-50">
                          <button
                            onClick={() => onUpdateQuantity(p.id, -1)}
                            className="p-0.5 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                            disabled={order.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs font-mono w-6 text-center text-slate-800">
                            {order.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(p.id, 1)}
                            className="p-0.5 text-slate-500 hover:text-slate-800"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900 tabular-nums">
                            ฿{itemTotal.toLocaleString()}
                          </div>
                          {p.regularPrice * order.quantity > itemTotal && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ฿{(p.regularPrice * order.quantity).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Actions */}
        {orderItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
            {/* Summary Numbers */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>ราคาปกติรวม</span>
                <span className="line-through tabular-nums">฿{totalRegular.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-rose-600 font-semibold">
                <span>ส่วนลดรวมทันที</span>
                <span className="tabular-nums">-฿{totalDiscount.toLocaleString()}</span>
              </div>
              {totalGiftValue > 0 && (
                <div className="flex items-center justify-between text-amber-700">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3 text-amber-600" />
                    <span>มูลค่าของแถมรวม</span>
                  </span>
                  <span className="tabular-nums font-semibold">฿{totalGiftValue.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between text-sm sm:text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>ยอดสุทธิ</span>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                    ฿{totalActual.toLocaleString()}
                  </span>
                  {paymentMethod === 'credit0' && (
                    <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                      ผ่อน 0% {installmentMonths} ด. ~ เดือนละ ฿{Math.round(totalActual / parseInt(installmentMonths, 10)).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCopyOrderSummary}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                {copiedQuote ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                <span>{copiedQuote ? 'คัดลอกสรุปออเดอร์แล้ว!' : 'คัดลอกใบสรุปออเดอร์ (ส่งลูกค้า / บันทึก)'}</span>
              </button>

              <button
                onClick={handleOpenBnn458}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>เปิดไปที่สต็อก & สั่งซื้อ BNN 458</span>
                <span className="text-slate-400 text-[10px] font-mono">bnn458-stock-order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
