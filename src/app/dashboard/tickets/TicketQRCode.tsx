"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface TicketQRCodeProps {
  qrHash: string;
  ticketId: string;
  eventName: string;
  tierName: string;
}

export default function TicketQRCode({
  qrHash,
  ticketId,
  eventName,
  tierName,
}: TicketQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition"
      >
        View QR Code
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{eventName}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                {tierName}
              </span>
              <p className="text-xs text-gray-400">ID: {ticketId.substring(0, 8)}...</p>
            </div>

            <div className="flex justify-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <QRCodeSVG
                value={qrHash}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>

            <p className="text-xs text-gray-500">
              Present this QR code at the venue entrance for scanning.
            </p>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}