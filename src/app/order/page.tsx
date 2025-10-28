export default function OrderPage() {
  return (
    <div>
      <h1>Order Food</h1>
      <div>
        <h2>Restaurants</h2>
        <div>
          <h3>Restaurant 1</h3>
          <p>Description of restaurant</p>
          <div>
            <h4>Menu Items</h4>
            <div>
              <p>Item 1 - Price</p>
              <button>Add to Cart</button>
            </div>
            <div>
              <p>Item 2 - Price</p>
              <button>Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2>Cart</h2>
        <p>Your cart is empty</p>
        <button>Checkout</button>
      </div>
    </div>
  );
}
