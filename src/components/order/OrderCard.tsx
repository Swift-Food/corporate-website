import { useRouter } from "next/navigation";
import { SubOrderResponse } from "@/types/order";

interface OrderCardProps {
  order: SubOrderResponse;
  onClick?: (orderId: string) => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(order.id);
    } else {
      router.push(`/order/${order.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    const statusColors: { [key: string]: string } = {
      pending: "badge-warning",
      pending_approval: "badge-warning",
      approved: "badge-info",
      preparing: "badge-info",
      ready: "badge-success",
      delivered: "badge-success",
      completed: "badge-success",
      rejected: "badge-error",
      cancelled: "badge-error",
    };
    return statusColors[lowerStatus] || "badge-primary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="card bg-base-100 rounded-xl mb-4 border border-base-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="card-body p-4">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold text-lg">
              Order #{order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-base-content/70">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`badge ${getStatusColor(
                order.status
              )} badge-lg px-4 py-2 capitalize`}
            >
              {order.status.replace(/_/g, " ")}
            </div>
            <p className="text-lg font-bold mt-1">
              £{Number(order.customerTotal).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Restaurant Orders */}
        <div className="space-y-3">
          {order.restaurants?.map((restaurant, idx) => (
            <div key={idx} className="bg-base-200 rounded-lg p-3">
              <p className="font-semibold mb-2">{restaurant.restaurantName}</p>
              <div className="space-y-1">
                {restaurant.menuItems.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between text-sm">
                    <span className="text-base-content/80">
                      {item.quantity}x {item.menuItemName}
                    </span>
                    <span className="font-semibold">
                      £{item.customerTotalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {restaurant.specialInstructions && (
                <p className="text-xs text-base-content/60 mt-2 italic">
                  Note: {restaurant.specialInstructions}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* View Details Indicator */}
        <div className="flex items-center justify-end mt-3 text-primary text-sm font-semibold">
          <span>View Details</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
