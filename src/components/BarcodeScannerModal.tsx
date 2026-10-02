import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Scan, Search, Sparkles, Check } from 'lucide-react';
import { PromotionItem } from '../types/promotion';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBarcode: (code: string) => void;
  availableItems: PromotionItem[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectBarcode,
  availableItems
}) => {
  const [inputCode, setInputCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('ไม่สามารถเข้าถึงกล้องได้ กรุณาพิมพ์รหัสบาร์โค้ดแทน');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onSelectBarcode(inputCode.trim());
      onClose();
    }
  };

  const handlePickBarcode = (code: string) => {
    onSelectBarcode(code);
    onClose();
  };

  // Sample quick barcodes from popular items
  const popularSamples = availableItems.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-400/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                สแกนบาร์โค้ดสินค้าหน้าร้าน
              </h3>
              <p className="text-[11px] text-slate-500">
                BaNANA สาขา 458 · ตรวจสอบโปรโมชั่นทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera / Viewfinder Box */}
        <div className="p-5 space-y-4">
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center border border-slate-800">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {/* Aiming Reticle */}
                <div className="absolute inset-x-8 inset-y-6 border-2 border-amber-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-amber-400"></span>
                    <span className="w-3 h-3 border-t-2 border-r-2 border-amber-400"></span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-full">
                      จัดวางบาร์โค้ดในกรอบ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-amber-400"></span>
                    <span className="w-3 h-3 border-b-2 border-r-2 border-amber-400"></span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-2xs"
                >
                  เปิดกล้องสแกน
                </button>
                {cameraError && (
                  <p className="text-[11px] text-rose-400 mt-2">{cameraError}</p>
                )}
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              หรือระบุรหัสบาร์โค้ด / ตัวเลขสินค้า
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="เช่น 8806097462545"
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputCode.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
              >
                ค้นหา
              </button>
            </div>
          </form>

          {/* Quick Click Samples */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-2">
              บาร์โค้ดรุ่นยอดนิยม (กดเพื่อทดสอบ):
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {popularSamples.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePickBarcode(item.productCode)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-800 text-[11px] block truncate">
                      {item.productName}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {item.productCode}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs shrink-0 tabular-nums">
                    ฿{item.promoPrice.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
