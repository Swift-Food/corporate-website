import {
  CorporateMenuItem,
  Addon as TransformedAddon,
  ApiMenuItem,
} from "@/types/menuItem";

// API types where prices are strings
interface ApiAddon {
  name: string;
  price: string;
  allergens: string;
  groupTitle: string;
  isRequired: boolean;
  selectionType: "single" | "multiple";
}

const parseNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const transformData = (apiData: ApiMenuItem[]): CorporateMenuItem[] => {
  const transformedData = (apiData || []).map((item: ApiMenuItem) => {
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      restaurant: item.restaurant,

      name: item.name,
      description: item.description,
      groupTitle: item.groupTitle,
      image: item.image,

      price: parseNumber(item.price),
      discountPrice: item.discountPrice
        ? parseNumber(item.discountPrice)
        : null,
      isDiscount: item.isDiscount,

      allergens: item.allergens,

      addons: item.addons,

      style: item.style,

      itemDisplayOrder: parseNumber(item.itemDisplayOrder),
      prepTime: parseNumber(item.prepTime),
      averageRating: parseNumber(item.averageRating),
      popular: item.popular,
      isAvailable: item.isAvailable,
      status: item.status,

      cateringQuantityUnit: parseNumber(item.cateringQuantityUnit),
      feedsPerUnit: parseNumber(item.feedsPerUnit),

      maxPortionsPerSession: item.maxPortionsPerSession
        ? parseNumber(item.maxPortionsPerSession)
        : null,

      limitedIngredientsContained: item.limitedIngredientsContained,
      limitedIngredientsRemaining: item.limitedIngredientsRemaining,

      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    } as CorporateMenuItem;
  });

  return transformedData;
};
