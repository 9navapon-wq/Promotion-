import React, { useState } from 'react';
import { X, RefreshCw, Link as LinkIcon, FileText, CheckCircle2, AlertCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { SheetConfig } from '../types/promotion';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetConfig;
  onSyncFromUrl: (url: string) => Promise<boolean>;
  onImportRawCsv: (csvContent: string) => boolean;
  onResetToDefault: () => void;
  totalLoaded: number;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSyncFromUrl,
  onImportRawCsv,
  onResetToDefault,
  totalLoaded
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste'>('url');
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl || '');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSyncUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอก URL ของ Google Sheets หรือลิงก์ CSV' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    let cleanUrl = sheetUrl.trim();
    // Helper: If user pastes regular Google Sheets link, convert it to CSV export link automatically!
    if (cleanUrl.includes('docs.google.com/spreadsheets') && !cleanUrl.includes('export?format=csv') && !cleanUrl.includes('output=csv') && !cleanUrl.includes('tqx=out:csv')) {
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }
    }

    const success = await onSyncFromUrl(cleanUrl);
    setIsLoading(false);

    if (success) {
      setMessage({ type: 'success', text: 'ดึงข้อมูลจากชีตสำเร็จเรียบร้อยแล้ว!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setMessage({
        type: 'error',
        text: 'ไม่สามารถดึงข้อมูลจาก URL นี้ได้ กรุณาตรวจสอบว่าชีตเปิดเป็นสาธารณะ (Anyone with link can view) หรือเลือกแท็บ "วางข้อมูล CSV โดยตรง"'
      });
    }
  };

  const handleImportPaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setMessage({ type: 'error', text: 'กรุณาวางเนื้อหาข้อมูล CSV ก่อนกดนำเข้า' });
      return;
    }

    const success = onImportRawCsv(rawText.trim());
    if (success) {
      setMessage({ type: 'success', text: 'นำเข้าข้อมูล CSV สำเร็จแล้ว!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: 'รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบหัวตาราง' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              📊
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ซิงค์และดึงข้อมูลจาก Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                กำลังใช้งาน: {config.sourceType === 'default' ? 'ข้อมูลชีตมาตรฐาน' : 'ข้อมูลที่กำหนดเอง'} ({totalLoaded} รายการ)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('url'); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>ลิงก์ Google Sheets (CSV)</span>
            </button>
            <button
              onClick={() => { setActiveTab('paste'); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>วางข้อมูล CSV โดยตรง</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium mb-4 flex items-start gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'url' ? (
            <form onSubmit={handleSyncUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL ของ Google Sheets หรือ ลิงก์ CSV
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              {/* Instructions Callout */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>วิธีเตรียมชีต Google Sheets:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>เปิดไฟล์ Google Sheet ที่มีข้อมูลโปรโมชั่น</li>
                  <li>ไปที่เมนู <strong>File (ไฟล์) &gt; Share (แชร์) &gt; Publish to web (เผยแพร่ไปยังเว็บ)</strong></li>
                  <li>เลือกแผ่นงานที่ต้องการ และเลือกรูปแบบเป็น <strong>Comma-separated values (.csv)</strong></li>
                  <li>คัดลอกลิงก์ที่ได้มาวางในช่องด้านบน แล้วกดซิงค์ข้อมูล</li>
                </ol>

                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">
                    การจับคู่หัวคอลัมน์จากชีต:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200">
                    <div><span className="font-semibold text-slate-800">No.</span> → ลำดับ</div>
                    <div><span className="font-semibold text-slate-800">Brand</span> → แบรนด์</div>
                    <div><span className="font-semibold text-slate-800">Cat./Product Code</span> → บาร์โค้ด</div>
                    <div className="col-span-2 text-indigo-700 bg-indigo-50/60 p-1 rounded font-semibold border border-indigo-100">
                      ★ <span className="underline">Sub.Cat./Product Name</span> → ชื่อรุ่น (ดึงตรงจากคอลัมน์นี้)
                    </div>
                    <div><span className="font-semibold text-slate-800">ราคาปกติ / ส่วนลด</span> → ราคา & ส่วนลด</div>
                    <div><span className="font-semibold text-slate-800">รายละเอียด Promotion</span> → ของแถม & ประกัน</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onResetToDefault}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตเป็นข้อมูลเริ่มต้น</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'กำลังดึงข้อมูลชีต...' : 'ดึงข้อมูลทันที'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleImportPaste} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  วางข้อความ CSV / TSV จากชีต
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="No., Cat., Brand, Cat./Product Code, Sub.Cat./Product Name, รายละเอียด Promotion, ราคาปกติ, ส่วนลด, ราคาโปรโมชั่น..."
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onResetToDefault}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตเป็นข้อมูลเริ่มต้น</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ประมวลผลและนำเข้า</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
