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
      className="rounded-lg overflow-hidden transition-transform duration-300 border-2 border-gray-200 cursor-pointer"
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <img
          src={restaurant.images?.[0] || "/placeholder.jpg"}
          alt={restaurant.restaurant_name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-4 py-2">
        <h4 className="font-bold text-md text-base-content mb-1 line-clamp-1">
          {restaurant.restaurant_name}
        </h4>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-base">★</span>
          <span className="text-sm text-base-content/70">
            {restaurant.averageRating || "No rating"}
          </span>
        </div>
      </div>
    </div>
  );
}
