"use client";

interface CartTotalProps {
  total: number;
  compact?: boolean;
}

export default function CartTotal({ total, compact = false }: CartTotalProps) {
  const fontSize = compact ? "text-base" : "text-lg";

  return (
    <div className="space-y-2 border-t border-base-300 pt-4 mb-6 flex-shrink-0">
      <div className={`flex justify-between ${fontSize} font-bold text-base-content`}>
        <span>Total:</span>
        <span>£{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
