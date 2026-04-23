"use client";

import { useState, useCallback } from "react";

export type CameraStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

interface UseCameraReturn {
  status: CameraStatus;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  captureImage: () => Promise<string | null>;
}

export function useCamera(): UseCameraReturn {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setStatus("unavailable");
      setError("Camera không khả dụng trên thiết bị này.");
      return false;
    }

    setStatus("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach((track) => track.stop());
      setStatus("granted");
      return true;
    } catch (err) {
      const message = err instanceof DOMException && err.name === "NotAllowedError"
        ? "Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép trong cài đặt trình duyệt."
        : "Không thể truy cập camera. Vui lòng kiểm tra thiết bị.";
      setStatus("denied");
      setError(message);
      return false;
    }
  }, []);

  const captureImage = useCallback(async (): Promise<string | null> => {
    if (status !== "granted") {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach((track) => track.stop());

      return canvas.toDataURL("image/jpeg", 0.8);
    } catch {
      setError("Không thể chụp ảnh. Vui lòng thử lại.");
      return null;
    }
  }, [status, requestPermission]);

  return { status, error, requestPermission, captureImage };
}
