"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted-bg" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Spendly
          </h1>
          <p className="text-sm text-muted">Đang tải...</p>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3 w-full max-w-xs px-6">
        <div className="w-full h-2 bg-muted-bg rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
