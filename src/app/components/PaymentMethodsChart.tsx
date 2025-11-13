// components/PaymentMethodsChart.tsx
"use client";

interface PaymentMethodsChartProps {
  walletAmount: number;
  stripeAmount: number;
}

export function PaymentMethodsChart({
  walletAmount,
  stripeAmount,
}: PaymentMethodsChartProps) {
  const total = walletAmount + stripeAmount;

  // Handle case where total is 0
  if (total === 0) {
    return (
      <div className="flex flex-col items-center py-8">
        <p className="text-sm text-slate-500">No payment data available</p>
      </div>
    );
  }

  const walletPercentage = (walletAmount / total) * 100;
  const stripePercentage = (stripeAmount / total) * 100;

  // SVG circle properties
  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash arrays for donut segments
  const walletDash = (walletPercentage / 100) * circumference;
  const stripeDash = (stripePercentage / 100) * circumference;

  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      {/* Donut Chart */}
      <div className="relative mb-6">
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Wallet segment (swift-pink) - only render if > 0 */}
          {walletPercentage > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#ffb3cc"
              strokeWidth={strokeWidth}
              strokeDasharray={`${walletDash} ${circumference - walletDash}`}
              strokeDashoffset={0}
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                animation: "growWallet 1s ease-out forwards",
              }}
            />
          )}

          {/* Stripe segment (swift-yellow) - only render if > 0 */}
          {stripePercentage > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#ffdd83"
              strokeWidth={strokeWidth}
              strokeDasharray={`0 ${circumference}`}
              strokeDashoffset={0}
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                animation: "growStripe 1s ease-out 0.3s forwards",
              }}
            />
          )}
        </svg>
      </div>

      <style jsx>{`
        @keyframes growWallet {
          from {
            stroke-dasharray: 0 ${circumference};
          }
          to {
            stroke-dasharray: ${walletDash} ${circumference - walletDash};
          }
        }

        @keyframes growStripe {
          from {
            stroke-dasharray: 0 ${circumference};
            stroke-dashoffset: 0;
          }
          to {
            stroke-dasharray: ${stripeDash} ${circumference - stripeDash};
            stroke-dashoffset: ${-walletDash};
          }
        }
      `}</style>

      {/* Legend */}
      <div className="space-y-3 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#ffb3cc" }}
            ></div>
            <span className="text-sm font-medium text-slate-700">Wallet</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-900">
              £{walletAmount.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              ({walletPercentage.toFixed(0)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#ffdd83" }}
            ></div>
            <span className="text-sm font-medium text-slate-700">
              Direct Payment
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-900">
              £{stripeAmount.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              ({stripePercentage.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
