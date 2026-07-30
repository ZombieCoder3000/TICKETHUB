"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { validateTicketCode } from "@/app/actions/scanner";
import { Camera, CheckCircle2, XCircle, RefreshCw, ShieldCheck } from "lucide-react";

export default function MobileScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setScanResult(null);
    setScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await html5QrCode.stop();
          setScanning(false);
          handleTicketScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera access error:", err);
      setScanning(false);
    }
  };

  const handleTicketScan = async (ticketId: string) => {
    setLoading(true);
    const res = await validateTicketCode(ticketId);
    setScanResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 max-w-md mx-auto flex flex-col justify-between">
      <div className="space-y-1 text-center py-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Tickethub Gate Scanner
        </div>
        <h1 className="text-xl font-bold tracking-tight">Venue Check-In</h1>
        <p className="text-xs text-slate-400">Scan attendee QR codes to validate entry.</p>
      </div>

      <div className="my-auto space-y-6">
        <div className="relative bg-slate-800 border-2 border-dashed border-slate-700 rounded-3xl overflow-hidden min-h-[300px] flex items-center justify-center">
          <div id="reader" className="w-full h-full"></div>

          {!scanning && !loading && !scanResult && (
            <div className="text-center p-6 space-y-3">
              <Camera className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">Camera is idle. Tap below to begin scanning.</p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-center p-6 space-y-2">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">Verifying Ticket Code...</p>
            </div>
          )}
        </div>

        {scanResult && (
          <div
            className={`p-5 rounded-2xl border text-center space-y-2 ${
              scanResult.success
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                : "bg-red-950/80 border-red-500/50 text-red-200"
            }`}
          >
            {scanResult.success ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            )}
            <h3 className="text-lg font-bold">{scanResult.success ? "ENTRY GRANTED" : "INVALID / USED TICKET"}</h3>
            <p className="text-xs leading-relaxed opacity-90">{scanResult.message}</p>

            {scanResult.ticket && (
              <div className="pt-2 border-t border-white/10 text-left text-xs space-y-1 mt-3">
                <div><strong>Event:</strong> {scanResult.ticket.tier?.event?.title || "N/A"}</div>
                <div><strong>Tier:</strong> {scanResult.ticket.tier?.name || "N/A"}</div>
                <div><strong>Attendee Email:</strong> {scanResult.ticket.order?.user_email || "N/A"}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pb-6 space-y-3">
        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> Start Scanner Camera
          </button>
        ) : (
          <button
            onClick={() => {
              if (scannerRef.current) scannerRef.current.stop();
              setScanning(false);
            }}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl transition"
          >
            Cancel Scanner
          </button>
        )}
      </div>
    </div>
  );
}