import React, { useRef, useState, useEffect } from 'react';
import { UserProfile } from '../../types/index';
import { X, PenTool, Type, Upload, Check } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  title?: string;
  confirmLabel?: string;
  onConfirm: (signatureDataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  user,
  title = 'Confirm E-Signature',
  confirmLabel = 'Confirm & Apply Signature',
  onConfirm,
}) => {
  const [tab, setTab] = useState<'style' | 'draw' | 'upload'>('style');
  const [styledName, setStyledName] = useState(user.signatureStyleText || user.name);
  const [drawnDataUrl, setDrawnDataUrl] = useState<string | null>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setStyledName(user.signatureStyleText || user.name);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setDrawnDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnDataUrl(null);
  };

  // Convert styled text to data URL via offscreen canvas
  const generateStyleDataUrl = (text: string): string => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 400;
    offCanvas.height = 120;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
      ctx.font = "italic 44px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1e3a8a';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 24, 60);
    }
    return offCanvas.toDataURL('image/png');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndConfirm = () => {
    let finalDataUrl = '';
    if (tab === 'draw' && drawnDataUrl) {
      finalDataUrl = drawnDataUrl;
    } else if (tab === 'upload' && uploadedDataUrl) {
      finalDataUrl = uploadedDataUrl;
    } else {
      finalDataUrl = generateStyleDataUrl(styledName);
    }
    onConfirm(finalDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">
              Applying e-signature for <span className="font-semibold text-slate-800">{user.name}</span> ({user.role})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-white">
          <button
            onClick={() => setTab('style')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'style'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Type className="w-4 h-4" />
            Handwritten Font
          </button>
          <button
            onClick={() => setTab('draw')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'draw'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Draw Signature
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'upload'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {tab === 'style' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-700">
                Type name as it should appear in handwritten script:
              </label>
              <input
                type="text"
                value={styledName}
                onChange={(e) => setStyledName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                placeholder="e.g. Afzal Kazi"
              />
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center min-h-[90px]">
                <div
                  className="text-blue-900 text-3xl font-bold tracking-wider italic select-none"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  {styledName || user.name}
                </div>
              </div>
            </div>
          )}

          {tab === 'draw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Draw your signature below:</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Clear Canvas
                </button>
              </div>
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[130px] cursor-crosshair bg-white"
                />
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="sig-file-upload"
                />
                <label htmlFor="sig-file-upload" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 mx-auto text-slate-400" />
                  <span className="text-xs font-semibold text-purple-600 hover:text-purple-700 block">
                    Choose PNG or JPEG image
                  </span>
                  <span className="text-[11px] text-slate-400 block">Maximum file size 2MB</span>
                </label>
              </div>
              {uploadedDataUrl && (
                <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-center max-h-[80px]">
                  <img src={uploadedDataUrl} alt="Uploaded" className="max-h-[60px] object-contain" />
                </div>
              )}
            </div>
          )}

          {/* Prototype Disclosure */}
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 leading-snug">
            <strong>Demonstration Notice:</strong> Prototype e-signatures are stored locally for workflow validation and browser printing. They do not constitute PKI hardware-backed cryptographic certificates.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
