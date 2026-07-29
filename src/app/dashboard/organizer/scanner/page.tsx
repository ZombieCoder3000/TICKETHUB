"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyAndCheckInTicket } from "@/app/actions/scanner";

interface ScanResult {
  success: boolean;
  message: string;
  ticket?: {
    holder_name: string;
    holder_email: string;
    tier: {
      name: string;
      event: {
        title: string;
      };
    };
  };
}

export default function TicketScannerPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualHash, setManualHash] = useState("");
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    async function onScanSuccess(decodedText: string) {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setLoading(true);

      try {
        const result = await verifyAndCheckInTicket(decodedText);
        setScanResult(result as ScanResult);
      } catch (error) {
        setScanResult({
          success: false,
          message: "An error occurred while verifying the ticket.",
        });
      } finally {
        setLoading(false);
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 3000);
      }
    }

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
    };
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHash.trim()) return;

    setLoading(true);
    setScanResult(null);

    try {
      const result = await verifyAndCheckInTicket(manualHash.trim());
      setScanResult(result as ScanResult);
    } catch (error) {
      setScanResult({
        success: false,
        message: "Failed to process manual entry.",
      });
    } finally {
      setLoading(false);
      setManualHash("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ticket Verification</h1>
        <p className="text-sm text-gray-500">
          Point your device camera at an attendee's QR code to verify check-in.
        </p>
      </div>

      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4">
        <div id="reader" className="w-full rounded-lg overflow-hidden border"></div>

        {loading && (
          <div className="text-center py-2 text-sm text-gray-600 font-medium">
            Verifying ticket...
          </div>
        )}

        {scanResult && (
          <div
            className={`p-4 rounded-lg border text-sm space-y-2 ${
              scanResult.success
                ? "bg-green-50 border-green-200 text-green-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base">
                {scanResult.success ? "✅ VALID TICKET" : "❌ INVALID / ALREADY USED"}
              </span>
              <button
                onClick={() => setScanResult(null)}
                className="text-xs font-semibold underline"
              >
                Dismiss
              </button>
            </div>
            <p>{scanResult.message}</p>

            {scanResult.ticket && (
              <div className="pt-2 border-t border-current/20 space-y-1 text-xs">
                <p>
                  <strong>Attendee:</strong> {scanResult.ticket.holder_name} (
                  {scanResult.ticket.holder_email})
                </p>
                <p>
                  <strong>Tier:</strong> {scanResult.ticket.tier.name}
                </p>
                <p>
                  <strong>Event:</strong> {scanResult.ticket.tier.event.title}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Manual Entry Fallback</h2>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualHash}
            onChange={(e) => setManualHash(e.target.value)}
            placeholder="Paste QR Code Hash..."
            className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          >
            Check In
          </button>
        </form>
      </div>
    </div>
  );
}