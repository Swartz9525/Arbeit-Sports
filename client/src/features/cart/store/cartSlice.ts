import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  product: string; // ID
  name: string;
  price: number;
  image: string;
  qty: number;
  size?: string;
  color?: string;
  stock: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CartState {
  items: CartItem[];
  shippingAddress: ShippingAddress | null;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

const getCartFromStorage = (): CartItem[] => {
  const data = localStorage.getItem('cartItems');
  return data ? JSON.parse(data) : [];
};

const getShippingFromStorage = (): ShippingAddress | null => {
  const data = localStorage.getItem('shippingAddress');
  return data ? JSON.parse(data) : null;
};

const calculatePrices = (items: CartItem[]) => {
  const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
  const taxPrice = parseFloat((0.15 * itemsPrice).toFixed(2));
  const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));
  
  return {
    itemsPrice: parseFloat(itemsPrice.toFixed(2)),
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

const savedItems = getCartFromStorage();
const prices = calculatePrices(savedItems);

const initialState: CartState = {
  items: savedItems,
  shippingAddress: getShippingFromStorage(),
  paymentMethod: 'Card',
  ...prices,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const item = action.payload;
      const existItem = state.items.find(
        (x) => x.product === item.product && x.size === item.size && x.color === item.color
      );

      if (existItem) {
        state.items = state.items.map((x) =>
          x.product === existItem.product && x.size === existItem.size && x.color === existItem.color
            ? item
            : x
        );
      } else {
        state.items.push(item);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      Object.assign(state, calculatePrices(state.items));
    },
    removeFromCart(state, action: PayloadAction<{ product: string; size?: string; color?: string }>) {
      const { product, size, color } = action.payload;
      state.items = state.items.filter(
        (x) => !(x.product === product && x.size === size && x.color === color)
      );

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      Object.assign(state, calculatePrices(state.items));
    },
    saveShippingAddress(state, action: PayloadAction<ShippingAddress>) {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethod = action.payload;
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem('cartItems');
      Object.assign(state, calculatePrices([]));
    },
  },
});

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
