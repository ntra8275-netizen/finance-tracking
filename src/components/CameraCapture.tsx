"use client";

import { useState } from "react";
import { useCamera } from "@/hooks/useCamera";

interface CameraCaptureProps {
  imageData: string | null;
  onCapture: (dataUrl: string) => void;
  onRemove: () => void;
}

export default function CameraCapture({ imageData, onCapture, onRemove }: CameraCaptureProps) {
  const { status, error, captureImage } = useCamera();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    setIsCapturing(true);
    const data = await captureImage();
    if (data) {
      onCapture(data);
    }
    setIsCapturing(false);
  };

  if (imageData) {
    return (
      <div className="relative group">
        <div className="w-full h-40 rounded-2xl overflow-hidden bg-surface-lowest border border-outline-variant relative">
          <img
            src={imageData}
            alt="Receipt"
            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
          />
          {/* Viewfinder UI overlay on preview */}
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <div className="w-full h-full border border-white/5 rounded-xl relative">
              <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-primary/60 rounded-tl-lg"></div>
              <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t border-r border-primary/60 rounded-tr-lg"></div>
              <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b border-l border-primary/60 rounded-bl-lg"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-primary/60 rounded-br-lg"></div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-red-400 transition-colors z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <label className="font-headline text-[10px] font-extrabold uppercase tracking-[0.3em] text-surface-variant">
          Receipt Capture
        </label>
      </div>

      <button
        type="button"
        onClick={handleCapture}
        disabled={isCapturing}
        className={`
          relative flex items-center justify-center w-full h-32 rounded-3xl
          bg-surface-lowest border border-outline-variant group
          transition-all duration-500 active:scale-[0.98]
          ${isCapturing ? "opacity-50 cursor-wait" : "hover:border-primary/40"}
        `}
      >
        {/* Viewfinder corners */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-surface-variant/30 group-hover:border-primary/40 rounded-tl-lg transition-colors"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-surface-variant/30 group-hover:border-primary/40 rounded-tr-lg transition-colors"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-surface-variant/30 group-hover:border-primary/40 rounded-bl-lg transition-colors"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-surface-variant/30 group-hover:border-primary/40 rounded-br-lg transition-colors"></div>

        <div className="flex flex-col items-center gap-2">
          {isCapturing ? (
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-surface-low border border-outline-variant flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-surface-variant group-hover:text-foreground transition-colors">
                Open Viewfinder
              </span>
            </>
          )}
        </div>
      </button>

      {error && (
        <p className="text-[10px] text-red-400 px-1 font-medium tracking-wide uppercase">{error}</p>
      )}
    </div>
  );
}
