"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function RestaurantCatalogue() {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/restaurant`
      );
      const data = await response.json();
      console.log("Fetched restaurants: ", data);
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <div className="flex-1">
        <h3 className="text-base md:text-lg font-semibold mb-3 text-base-content">
          Select Restaurant
        </h3>
        {restaurantsLoading ? (
          <div className="text-center py-4 text-base-content/60 text-sm md:text-base">
            Loading restaurants...
          </div>
        ) : (
          <div className="flex flex-wrap sm:grid sm:grid-cols-3 gap-3 md:gap-4 pb-4">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => {
                  setSelectedRestaurantId(
                    selectedRestaurantId === restaurant.id
                      ? null
                      : restaurant.id
                  );
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex-shrink-0 w-full rounded-xl overflow-hidden border-2 transition-all ${
                  selectedRestaurantId === restaurant.id
                    ? "border-primary"
                    : "border-base-300 hover:border-primary/50"
                }`}
              >
                <img
                  src={restaurant.images[0] || "/placeholder.jpg"}
                  alt={restaurant.restaurant_name}
                  className="w-full aspect-[16/9]  object-cover"
                />
                <div className="p-2 md:p-3 bg-base-100">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-md md:text-sm text-base-content truncate">
                      {restaurant.restaurant_name}
                    </h4>
                    {(restaurant.contactEmail ||
                      restaurant.contactNumber ||
                      restaurant.cateringOperatingHours) && (
                      <div className="group relative flex-shrink-0">
                        <button
                          type="button"
                          className="text-base-content/60 hover:text-base-content cursor-pointer touch-manipulation active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.currentTarget.nextElementSibling?.classList.toggle(
                              "hidden"
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 md:w-4 md:h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                            />
                          </svg>
                        </button>
                        <div className="absolute bottom-full right-0 mb-2 hidden md:group-hover:block z-10 w-48">
                          <div className="bg-base-content text-base-100 text-xs rounded-lg p-3">
                            <p className="font-semibold mb-2">Contact Info:</p>
                            {restaurant.contactEmail && (
                              <p className="mb-1 break-words">
                                <span className="opacity-70">Email:</span>
                                <br />
                                <a
                                  href={`mailto:${restaurant.contactEmail}`}
                                  className="underline"
                                >
                                  {restaurant.contactEmail}
                                </a>
                              </p>
                            )}
                            {restaurant.contactNumber && (
                              <p className="break-words">
                                <span className="opacity-70">Phone:</span>
                                <br />
                                <a
                                  href={`tel:${restaurant.contactNumber}`}
                                  className="underline"
                                >
                                  {restaurant.contactNumber}
                                </a>
                              </p>
                            )}
                            <div className="mb-2">
                              <p className="opacity-70 pt-2">
                                Event Ordering Hours:
                              </p>
                              <div className="whitespace-pre-line text-xs mt-1">
                                {formatCateringHours(
                                  restaurant.cateringOperatingHours ?? null
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-sm md:text-sm">
                      ★
                    </span>
                    <span className="text-sm md:text-sm text-base-content/70">
                      {restaurant.averageRating}
                    </span>
                  </div>


                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
