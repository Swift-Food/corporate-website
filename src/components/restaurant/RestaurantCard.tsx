import { Restaurant } from "@/types/restaurant";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (restaurant: Restaurant) => void;
}

export default function RestaurantCard({
  restaurant,
  onClick,
}: RestaurantCardProps) {
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
        <div className="flex items-center gap-1">
          <span className="text-green-700 text-base">★</span>
          <span className="text-sm text-green-700">
            {restaurant.averageRating || "No rating"}
          </span>
        </div>
      </div>
    </div>
  );
}
