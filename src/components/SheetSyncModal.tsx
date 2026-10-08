import React, { useState, useRef } from 'react';
import { X, RefreshCw, Link as LinkIcon, FileText, CheckCircle2, AlertCircle, Upload, FileSpreadsheet, RotateCcw, ArrowRight, ExternalLink } from 'lucide-react';
import { SheetConfig, PromotionItem } from '../types/promotion';
import { parseSpreadsheetFile, parseCsvToPromotions } from '../utils/csvParser';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetConfig;
  onSyncFromUrl: (url: string) => Promise<boolean>;
  onImportRawCsv: (csvContent: string, appendMode?: boolean) => boolean;
  onImportPromotions?: (items: PromotionItem[], appendMode?: boolean, filename?: string) => boolean;
  onResetToDefault: () => void;
  totalLoaded: number;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSyncFromUrl,
  onImportRawCsv,
  onImportPromotions,
  onResetToDefault,
  totalLoaded
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url' | 'paste'>('file');
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl || '');
  const [rawText, setRawText] = useState('');
  const [appendMode, setAppendMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string; details?: string } | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPreviewItems, setParsedPreviewItems] = useState<PromotionItem[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setMessage(null);

    try {
      const items = await parseSpreadsheetFile(file);
      if (items.length > 0) {
        setParsedPreviewItems(items);
        setMessage({
          type: 'success',
          text: `อ่านไฟล์ "${file.name}" สำเร็จ! ตรวจพบโปรโมชั่น ${items.length} รายการ พร้อมนำเข้าสู่ระบบ`
        });
      } else {
        setMessage({
          type: 'error',
          text: `ไม่พบข้อมูลโปรโมชั่นที่ถูกต้องในไฟล์ "${file.name}" กรุณาตรวจสอบหัวตาราง`
        });
        setParsedPreviewItems(null);
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setMessage({
        type: 'error',
        text: `ไม่สามารถอ่านไฟล์ได้ (${err.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}) รองรับไฟล์ .ods, .xlsx, .csv`
      });
      setParsedPreviewItems(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmFileImport = () => {
    if (!parsedPreviewItems || parsedPreviewItems.length === 0) return;

    const success = onImportPromotions(parsedPreviewItems, appendMode, selectedFile?.name);
    if (success) {
      setMessage({
        type: 'success',
        text: `นำเข้าโปรโมชั่นเรียบร้อยแล้ว (${parsedPreviewItems.length} รายการ)`
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleSyncUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอก URL ลิงก์ที่ต้องการซิงค์' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    let cleanUrl = sheetUrl.trim();

    // Check if it's an ODF Viewer link or Google Drive link
    const isOdfViewer = cleanUrl.includes('odfviewer.nsspot.net');
    let driveFileId: string | null = null;

    if (isOdfViewer) {
      const match = cleanUrl.match(/(?:%22ids%22|ids)[^a-zA-Z0-9]*([a-zA-Z0-9_-]{20,})/);
      if (match && match[1]) {
        driveFileId = match[1];
      }
    } else if (cleanUrl.includes('drive.google.com')) {
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        driveFileId = match[1];
      }
    } else if (cleanUrl.includes('docs.google.com/spreadsheets')) {
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }
    }

    if (driveFileId) {
      cleanUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
    }

    const success = await onSyncFromUrl(cleanUrl);
    setIsLoading(false);

    if (success) {
      setMessage({ type: 'success', text: 'ดึงและซิงค์ข้อมูลโปรโมชั่นสำเร็จเรียบร้อยแล้ว!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      if (driveFileId || isOdfViewer) {
        setMessage({
          type: 'warning',
          text: 'ไฟล์ Google Drive นี้ตั้งค่าสิทธิ์เป็น "ส่วนตัว" (ต้องล็อกอินบัญชีเจ้าของไฟล์)',
          details: 'วิธีนำเข้าที่รวดเร็วที่สุด: ในหน้า ODF Viewer หรือ Google Drive ให้กด "ดาวน์โหลดไฟล์ (.ods หรือ .xlsx)" แล้วนำมาลากวางลงในแท็บ "อัปโหลดไฟล์ (.ods, .xlsx)" ด้านบนได้ทันทีครับ หรือเปลี่ยนสิทธิ์ใน Google Drive เป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู"'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'ไม่สามารถดึงข้อมูลจาก URL นี้ได้ กรุณาตรวจสอบว่าลิงก์เปิดเป็นสาธารณะ (Anyone with link can view) หรือใช้แท็บอัปโหลดไฟล์'
        });
      }
    }
  };

  const handleImportPaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setMessage({ type: 'error', text: 'กรุณาวางเนื้อหาข้อมูลก่อนกดนำเข้า' });
      return;
    }

    const success = onImportRawCsv(rawText.trim(), appendMode);
    if (success) {
      setMessage({ type: 'success', text: 'นำเข้าข้อมูลโปรโมชั่นสำเร็จแล้ว!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage({ type: 'error', text: 'รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบหัวตาราง' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-amber-400/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFE500] text-slate-950 flex items-center justify-center font-black text-xs border border-amber-300 shadow-2xs">
              ODF
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                นำเข้าและซิงค์ข้อมูลโปรโมชั่น
              </h3>
              <p className="text-[11px] text-slate-500">
                รองรับไฟล์ ODF (.ods), Excel (.xlsx), CSV และ Google Sheets
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
        <div className="px-5 pt-3.5">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setActiveTab('file'); setMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'file'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              <span>อัปโหลดไฟล์ (.ods/.xlsx)</span>
            </button>
            <button
              onClick={() => { setActiveTab('url'); setMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>ดึงผ่านลิงก์</span>
            </button>
            <button
              onClick={() => { setActiveTab('paste'); setMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'paste'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>วางตาราง (Ctrl+V)</span>
            </button>
          </div>
        </div>

        {/* Append or Replace Mode Switch */}
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">รูปแบบการนำเข้า:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAppendMode(false)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  !appendMode ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                แทนที่ข้อมูลเดิม
              </button>
              <button
                type="button"
                onClick={() => setAppendMode(true)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  appendMode ? 'bg-[#FFE500] text-slate-950 border border-amber-300 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                + เพิ่มต่อท้ายเดิม
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="px-5 pt-3">
            <div
              className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : message.type === 'warning'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-bold">{message.text}</div>
                {message.details && (
                  <div className="text-[11px] text-slate-700 leading-relaxed font-normal bg-white/70 p-2 rounded-xl border border-amber-200">
                    {message.details}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: File Upload (Supports .ods, .xlsx, .csv) */}
        {activeTab === 'file' && (
          <div className="p-5 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".ods,.xlsx,.xls,.csv,.tsv"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/30 hover:bg-amber-50/60 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFE500] text-slate-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  รองรับไฟล์ <strong>.ods</strong> (OpenDocument), <strong>.xlsx</strong> (Excel), และ <strong>.csv</strong>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    ช่องต้องกรอก (สีแดง): <strong>Product Name</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                    <span>✓ ดึงข้อมูลตรงจาก: <strong>Sub.Cat./Product Name</strong></span>
                  </span>
                </div>
              </div>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg shadow-2xs group-hover:border-amber-400">
                เลือกไฟล์จากเครื่อง
              </span>
            </div>

            {selectedFile && parsedPreviewItems && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{selectedFile.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span>จำนวนโปรโมชั่นที่อ่านได้:</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {parsedPreviewItems.length} รายการ
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmFileImport}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FFE500] hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors border border-amber-300"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    ยืนยันนำเข้า {parsedPreviewItems.length} รายการ ({appendMode ? 'เพิ่มต่อท้าย' : 'แทนที่ทั้งหมด'})
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: URL Link Sync */}
        {activeTab === 'url' && (
          <form onSubmit={handleSyncUrl} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                URL ของ Google Sheets หรือลิงก์ไฟล์
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="วางลิงก์ เช่น https://docs.google.com/spreadsheets/d/... หรือ ODF Viewer"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400 font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
              <span className="font-bold text-slate-800 block">💡 คำแนะนำสำหรับการดึงข้อมูลจากลิงก์:</span>
              <p>
                • หากเป็น Google Sheets ให้ตั้งค่าสิทธิ์เป็น <strong>"ทุกคนที่มีลิงก์มีสิทธิ์ดู (Anyone with the link)"</strong>
              </p>
              <p>
                • หากเป็นลิงก์ ODF Viewer ที่ไฟล์อยู่ใน Google Drive ส่วนบุคคล ระบบจะแนะนำให้ดาวน์โหลดไฟล์ .ods หรือ .xlsx แล้วมาอัปโหลดในแท็บแรกแทนครับ
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !sheetUrl.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังเชื่อมต่อและดึงข้อมูล...' : 'ดึงและซิงค์ข้อมูลโปรโมชั่น'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: Paste CSV/TSV table directly */}
        {activeTab === 'paste' && (
          <form onSubmit={handleImportPaste} className="p-5 space-y-3.5">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  วางข้อความตารางสเปรดชีต (คัดลอกจาก ODF Viewer / Excel / Google Sheets)
                </label>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    🔴 ต้องกรอกสีแดง → Product Name
                  </span>
                  <span className="text-[10px] text-amber-900 font-bold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    Sub.Cat./Product Name
                  </span>
                </div>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                placeholder="คัดลอกเซลล์ใน ODF Viewer หรือสเปรดชีต (Ctrl+C) แล้วกด Ctrl+V วางที่นี่... (ระบบดึงช่องต้องกรอกสีแดง / Sub.Cat./Product Name เป็น Product Name ให้อัตโนมัติ)"
                className="w-full p-2.5 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400 leading-normal"
              />
            </div>

            <button
              type="submit"
              disabled={!rawText.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FFE500] hover:bg-yellow-300 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors border border-amber-300"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>นำเข้าข้อมูลจากที่วาง ({appendMode ? 'เพิ่มต่อท้าย' : 'แทนที่ทั้งหมด'})</span>
            </button>
          </form>
        )}

        {/* Footer info & Reset */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onResetToDefault}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>รีเซ็ตกลับเป็นข้อมูลโปรโมชั่นเริ่มต้น ({totalLoaded} รายการ)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg font-semibold"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
