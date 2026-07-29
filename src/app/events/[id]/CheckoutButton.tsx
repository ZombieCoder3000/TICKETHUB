"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { AlertTriangle, Ticket, X } from "lucide-react";

interface CheckoutButtonProps {
  tier: {
    id: string;
    name: string;
    price: number;
  };
  remaining: number;
}

export default function CheckoutButton({ tier, remaining }: CheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleQuantityChange = (val: number) => {
    if (val > remaining) {
      setErrorModal(`Only ${remaining} ticket${remaining > 1 ? "s" : ""} remaining for ${tier.name}.`);
      setQuantity(remaining);
      return;
    }
    if (val < 1) {
      setQuantity(1);
      return;
    }
    setQuantity(val);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (quantity > remaining) {
      e.preventDefault();
      setErrorModal(`Sorry, only ${remaining} ticket${remaining > 1 ? "s" : ""} left to buy!`);
      return;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-sm"
      >
        Select Ticket
      </button>

      {/* Checkout Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative space-y-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{tier.name}</h3>
                <p className="text-xs text-slate-500">
                  ₦{tier.price.toLocaleString()} per ticket • {remaining} left
                </p>
              </div>
            </div>

            <form action={createCheckoutSession} onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="tierId" value={tier.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Quantity
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 border border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value || "1", 10))}
                    className="w-16 text-center border border-slate-300 rounded-lg py-2 font-bold text-slate-900"
                    min="1"
                    max={remaining}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 border border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                  placeholder="john@example.com"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-indigo-600">
                  ₦{(tier.price * quantity).toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition"
              >
                Proceed to Paystack
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Warning Popup Dialog */}
      {errorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-amber-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Ticket Limit Reached</h4>
              <p className="text-sm text-slate-600">{errorModal}</p>
            </div>

            <button
              onClick={() => setErrorModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition"
            >
              Understand & Adjust Quantity
            </button>
          </div>
        </div>
      )}
    </>
  );
}