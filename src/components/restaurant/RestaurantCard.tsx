import { Restaurant } from "@/types/restaurant";
import { Address } from "@/types/address";
import { useEffect, useState } from "react";
// import { MapPin } from "lucide-react";

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
          console.log(data);
          setAddressDetails(data);
        }
      } catch {}
    }
    fetchAddressDetails();
  }, [restaurant.addressId]);

  return (
    <div
      onClick={() => onClick(restaurant)}
      className="rounded-xs overflow-hidden transition-transform duration-300 border-1 border-gray-200 cursor-pointer"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden">
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
        <div className="flex flex-row justify-start items-center">
          {/* <MapPin size={16} className="text-gray-400 mr-1" /> */}
          <h2 className="font-light text-sm text-gray-500 line-clamp-1">
            {addressDetails?.addressLine1
              ? addressDetails.addressLine1.replace(/, London.*$/i, "")
              : ""}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="text-base"
            style={{
              color: (() => {
                const ratingNum = Number(restaurant.averageRating);
                if (!isNaN(ratingNum)) {
                  if (ratingNum >= 4.5) return "var(--color-rating-4)";
                  if (ratingNum >= 4.0) return "var(--color-rating-3)";
                  if (ratingNum >= 3.0) return "var(--color-rating-2)";
                  if (ratingNum >= 2.0) return "var(--color-rating-1)";
                  if (ratingNum > 0) return "var(--color-rating-1)";
                }
                return undefined;
              })(),
            }}
          >
            ★
          </span>
          <span
            className="text-sm"
            style={{
              color: (() => {
                const ratingNum = Number(restaurant.averageRating);
                if (!isNaN(ratingNum)) {
                  if (ratingNum >= 4.5) return "var(--color-rating-4)";
                  if (ratingNum >= 4.0) return "var(--color-rating-3)";
                  if (ratingNum >= 3.0) return "var(--color-rating-2)";
                  if (ratingNum >= 2.0) return "var(--color-rating-1)";
                  if (ratingNum > 0) return "var(--color-rating-1)";
                }
                return undefined;
              })(),
            }}
          >
            {restaurant.averageRating || "No ratings yet"}
          </span>
          <span
            className="text-sm ml-1"
            style={{
              color: (() => {
                const ratingNum = Number(restaurant.averageRating);
                if (!isNaN(ratingNum)) {
                  if (ratingNum >= 4.5) return "var(--color-rating-4)";
                  if (ratingNum >= 4.0) return "var(--color-rating-3)";
                  if (ratingNum >= 3.0) return "var(--color-rating-2)";
                  if (ratingNum >= 2.0) return "var(--color-rating-1)";
                  if (ratingNum > 0) return "var(--color-rating-1)";
                }
                return undefined;
              })(),
            }}
          >
            {(() => {
              const ratingNum = Number(restaurant.averageRating);
              if (!isNaN(ratingNum)) {
                if (ratingNum >= 4.5) return "Excellent";
                if (ratingNum >= 4.0) return "Very Good";
                if (ratingNum >= 3.0) return "Good";
                if (ratingNum >= 2.0) return "Fair";
                if (ratingNum > 0) return "Poor";
              }
              return "";
            })()}
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
