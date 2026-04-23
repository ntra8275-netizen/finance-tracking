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
        <div className="w-full h-32 rounded-xl overflow-hidden border border-surface-border">
          <img
            src={imageData}
            alt="Ảnh chi tiêu"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-expense transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleCapture}
        disabled={isCapturing}
        className={`
          flex items-center justify-center gap-2 w-full py-3 rounded-xl
          border-2 border-dashed border-surface-border
          text-sm font-medium text-muted
          transition-all duration-200 active:scale-[0.98]
          ${isCapturing ? "opacity-50 cursor-wait" : "hover:border-primary hover:text-primary hover:bg-primary/5"}
        `}
      >
        {isCapturing ? (
          <>
            <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
            Đang mở camera...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Chụp ảnh hóa đơn
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-expense px-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
