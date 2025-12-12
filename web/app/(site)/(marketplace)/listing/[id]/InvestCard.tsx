"use client";

import { useState } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

type InvestCardProps = {
  listingId: number;
  targetAmount: string;
  totalInvested: string;
  percentFunded: string;
  minInvestment: string | null;
  status: string;
};

export function InvestCard({
  listingId,
  targetAmount,
  totalInvested,
  percentFunded,
  minInvestment,
  status,
}: InvestCardProps) {
  const [amount, setAmount] = useState("");
  const [investLoading, setInvestLoading] = useState(false);
  const [investError, setInvestError] = useState<string | null>(null);
  const [investSuccess, setInvestSuccess] = useState<string | null>(null);

  const [currentTotal, setCurrentTotal] = useState(
    Number(totalInvested || "0"),
  );
  const [currentPercent, setCurrentPercent] = useState(
    Number(percentFunded || "0"),
  );

  const target = Number(targetAmount || "0");
  const remaining = Math.max(0, target - currentTotal);
  const min = minInvestment ? Number(minInvestment) : 0;

  const fullyFunded = remaining <= 0 || status !== "live";

  async function handleInvest() {
    setInvestError(null);
    setInvestSuccess(null);

    const amt = Number(amount);

    if (!amount || amt <= 0) {
      setInvestError("Enter an amount greater than zero.");
      return;
    }

    if (min && amt < min) {
      setInvestError(`Minimum investment is $${min.toFixed(2)}.`);
      return;
    }

    if (amt > remaining) {
      setInvestError(
        `Only $${remaining.toFixed(2)} remaining in this offering.`,
      );
      return;
    }

    try {
      setInvestLoading(true);

      // Get CSRF cookie
      await fetch(`${apiBase}/auth/csrf/`, { credentials: "include" });
      const csrftoken = getCookie("csrftoken") || "";

      const res = await fetch(`${apiBase}/investments/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
          listing: listingId,
          amount,
        }),
      });

      if (!res.ok) {
        let msg = `Failed to invest (status ${res.status}).`;
        try {
          const data = await res.json();
          if (data?.detail) {
            msg = data.detail;
          } else if (typeof data === "object") {
            // grab first error string if DRF returns field-errors
            const firstKey = Object.keys(data)[0];
            const firstVal = (data as any)[firstKey];
            if (typeof firstVal === "string") msg = firstVal;
            if (Array.isArray(firstVal) && firstVal[0]) msg = firstVal[0];
          }
        } catch {
          // ignore JSON parse errors
        }
        setInvestError(msg);
        return;
      }

      // Locally update totals so UI feels instant
      const newTotal = currentTotal + amt;
      setCurrentTotal(newTotal);
      if (target > 0) {
        setCurrentPercent(Math.min(100, (newTotal / target) * 100));
      }

      setAmount("");
      setInvestSuccess("Investment recorded!");
    } catch (e) {
      console.error("Error creating investment:", e);
      setInvestError("Network error while creating investment.");
    } finally {
      setInvestLoading(false);
    }
  }

  return (
    <div className="md:w-72 rounded-xl border border-foreground/10 p-4 text-sm">
      <p className="font-medium mb-2">Invest in this listing</p>
      <p className="text-xs text-foreground/60 mb-3">
        This offering is currently {currentPercent.toFixed(2)}% funded.
      </p>

      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-foreground/60 mb-1">
          <span>Raised</span>
          <span>
            ${currentTotal.toFixed(2)} / ${target.toFixed(2)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full bg-emerald-400/80"
            style={{
              width: `${Math.min(100, currentPercent)}%`,
            }}
          />
        </div>
      </div>

      {investError && (
        <div className="mb-2 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px]">
          {investError}
        </div>
      )}
      {investSuccess && (
        <div className="mb-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px]">
          {investSuccess}
        </div>
      )}

      <input
        type="number"
        min={min || 0}
        step="0.01"
        className="w-full mb-2 rounded-md border border-foreground/20 px-2 py-1 text-sm"
        placeholder={
          min ? `Min ${min.toFixed(2)}` : "Amount (USD)"
        }
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={fullyFunded || investLoading}
      />

      <p className="mb-2 text-[11px] text-foreground/60">
        Remaining capacity: ${remaining.toFixed(2)}
      </p>

      <button
        className="w-full rounded-lg bg-sage/20 border border-sage px-3 py-2 text-sm font-medium disabled:opacity-60"
        disabled={fullyFunded || investLoading}
        onClick={handleInvest}
      >
        {fullyFunded
          ? "Offering closed"
          : investLoading
          ? "Submitting…"
          : "Invest"}
      </button>
    </div>
  );
}
