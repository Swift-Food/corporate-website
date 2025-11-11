import { Restaurant } from "@/types/restaurant";
import { Address } from "@/types/address";
import { useEffect, useState } from "react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (restaurant: Restaurant) => void;
}

export default function RestaurantCard({
  restaurant,
  onClick,
}: RestaurantCardProps) {
  const [addressDetails, setAddressDetails] = useState<Address | null>(null);

  useEffect(() => {
    async function fetchAddressDetails() {
      if (!restaurant.addressId) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/address/${restaurant.addressId}`
        );
        console.log(res);
        if (res.ok) {
          const data = await res.json();
          setAddressDetails(data);
        }
      } catch {}
    }
    fetchAddressDetails();
  }, [restaurant.addressId]);

  return (
    <div
      onClick={() => onClick(restaurant)}
      className="rounded-md overflow-hidden transition-transform duration-300 border-2 border-gray-200 cursor-pointer"
    >
      <div className="relative w-full aspect-[16/12] overflow-hidden">
        <img
          src={restaurant.images?.[0] || "/placeholder.jpg"}
          alt={restaurant.restaurant_name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-4 pt-2 pb-1">
        <h4 className="font-bold text-md text-base-content line-clamp-1">
          {restaurant.restaurant_name}
        </h4>
        {/* <h2 className="font-light text-md text-gray-500 line-clamp-2">
          {restaurant.restaurant_description}
        </h2> */}
        <h2 className="font-light text-md text-gray-500 line-clamp-2">
          {addressDetails?.addressLine1}
        </h2>
        <div className="flex items-center gap-1">
          <span className="text-green-700 text-base">★</span>
          <span className="text-sm text-green-700">
            {restaurant.averageRating || "No rating"}
          </span>
        </div>
        {/* Example usage of addressDetails (optional) */}
        {/* addressDetails && (
          <div className="mt-2 text-xs text-gray-600">
            {addressDetails.addressLine1}, {addressDetails.city}
          </div>
        ) */}
      </div>
    </div>
  );
}
