import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  cartItems: CartItem[];
  cartItemsLength: number;
};

const initialState: CartState = {
  cartItems: [],
  cartItemsLength : 0, 
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItemsLength: (state, action ) => {
      state.cartItemsLength = action.payload ;
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      state.cartItems.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const { setCartItemsLength, addItem, removeItem, clearCart } =
  cartSlice.actions;

// ✅ Selector يحسب الطول دايمًا من cartItems
export const selectCartItemLength = (state: { cart: CartState }) =>
  state.cart.cartItems.length;

// ✅ Selector تاني يجيب كل عناصر الكارت
export const selectCartItems = (state: { cart: CartState }) =>
  state.cart.cartItems;

export default cartSlice.reducer;
