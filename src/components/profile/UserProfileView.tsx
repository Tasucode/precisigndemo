import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types/index';
import { PenTool, Type, Upload, Check, RotateCcw } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateUserSignature, users, setCurrentUserId } = useApp();

  const [activeTab, setActiveTab] = useState<'style' | 'draw' | 'upload'>('style');
  const [signatureText, setSignatureText] = useState(
    currentUser.signatureStyleText || currentUser.name
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generateDataUrl = (text: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "italic 44px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1e3a8a';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 20, 60);
    }
    return canvas.toDataURL('image/png');
  };

  const handleSaveSignature = () => {
    let finalUrl = '';
    if (activeTab === 'draw' && canvasRef.current) {
      finalUrl = canvasRef.current.toDataURL('image/png');
    } else {
      finalUrl = generateDataUrl(signatureText);
    }

    updateUserSignature(currentUser.id, finalUrl, signatureText);
    setFeedback(`Signature profile updated successfully for ${currentUser.name}!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateUserSignature(currentUser.id, dataUrl, currentUser.name);
      setFeedback(`Image signature registered for ${currentUser.name}!`);
      setTimeout(() => setFeedback(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          User Profile &amp; E-Signature Registration
        </h1>
        <p className="text-xs text-slate-500">
          Register or customize your authorized handwritten-style electronic signature for document approval.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* User profile card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold text-white shadow-md ring-4 ring-purple-100"
            style={{ backgroundColor: currentUser.avatarColor }}
          >
            {currentUser.initials}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <div className="text-xs font-semibold text-purple-700">{currentUser.role}</div>
            <div className="text-xs text-slate-500">
              {currentUser.department} · {currentUser.email}
            </div>
          </div>
        </div>

        {/* Persona quick switch */}
        <div className="text-right">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Testing Persona:
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* E-Signature studio */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Electronic Signature Setup</h3>
            <p className="text-xs text-slate-500">
              Used when signing official documents in Create Request and Review &amp; Sign.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'style'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Handwritten Style</span>
          </button>

          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'draw'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Draw with Mouse / Pen</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name to render in handwritten cursive script:
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center min-h-[120px]">
              <div
                className="text-blue-900 text-4xl font-bold tracking-wider italic select-none"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {signatureText || currentUser.name}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'draw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Use your mouse or stylus to sign:</span>
              <button
                onClick={clearCanvas}
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Canvas</span>
              </button>
            </div>
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-[150px] cursor-crosshair"
              />
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              id="profile-sig-upload"
              className="hidden"
            />
            <label htmlFor="profile-sig-upload" className="cursor-pointer space-y-2 block">
              <Upload className="w-10 h-10 mx-auto text-slate-400" />
              <div className="text-xs font-bold text-purple-700">Click to upload signature image</div>
              <div className="text-[11px] text-slate-400">PNG or JPEG transparent recommended</div>
            </label>
          </div>
        )}

        {/* Current Registered Signature Preview */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Registered: <span className="font-semibold text-slate-800">{currentUser.name}</span>
          </div>

          <button
            onClick={handleSaveSignature}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save E-Signature Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
