"use client";

interface CartItemProps {
  item: any;
  quantity: number;
  selectedAddons?: any[];
  index: number;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  showBorder?: boolean;
  compact?: boolean;
}

export default function CartItem({
  item,
  quantity,
  selectedAddons,
  index,
  onUpdateQuantity,
  onEdit,
  onRemove,
  showBorder = true,
  compact = false,
}: CartItemProps) {
  const price = parseFloat(item.price?.toString() || "0");
  const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
  const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

  // Calculate addon price
  const addonPrice = (selectedAddons || []).reduce((sum, addon) => {
    return sum + (addon.price || 0);
  }, 0);

  const subtotal = (itemPrice + addonPrice) * quantity;

  const imageSize = compact ? "w-14 h-14" : "w-16 h-16";
  const fontSize = compact ? "text-sm" : "text-sm";
  const priceSize = compact ? "text-lg" : "text-xl";

  return (
    <div
      className={`flex gap-3 pb-4${
        showBorder ? " border-b border-base-300" : ""
      }`}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className={`${imageSize} object-cover rounded-lg flex-shrink-0`}
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold ${fontSize} text-base-content mb-1`}>
          {item.name}
        </h4>
        {selectedAddons && selectedAddons.length > 0 && (
          <div className="text-xs text-base-content/60 mb-1">
            {selectedAddons.map((addon, addonIndex) => (
              <div key={addonIndex}>
                + {addon.optionName}
                {addon.price > 0 && ` (£${addon.price.toFixed(2)})`}
              </div>
            ))}
          </div>
        )}
        <p className={`${priceSize} font-bold text-primary mb-2`}>
          £{subtotal.toFixed(2)}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(index, quantity - 1)}
              className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
            >
              −
            </button>
            <span className="text-sm font-medium text-base-content">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(index, quantity + 1)}
              className="w-6 h-6 bg-base-200 rounded flex items-center justify-center hover:bg-base-300"
            >
              +
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onEdit(index)}
              className="text-primary hover:opacity-80 text-xs"
            >
              Edit
            </button>
            <button
              onClick={() => onRemove(index)}
              className="text-error hover:opacity-80 text-xs"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
