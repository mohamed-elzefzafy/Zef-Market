/* eslint-disable @typescript-eslint/no-explicit-any */
// import { createSlice } from "@reduxjs/toolkit";

// const getCartItemsLength = (): number => {
//   const persistedState = localStorage.getItem("persist:root");
//   let cartItemLength;
//   if (persistedState) {
//     const parsedState = JSON.parse(persistedState);

//     const cartState = JSON.parse(parsedState.cart);

//     cartItemLength = cartState.cartItemLength;

//     console.log("cartItemLength:", cartItemLength);
//   }

//   return cartItemLength;
// };

// const initialState = { cartItemLength: getCartItemsLength(), cartItems: [] };
// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     setCartItemLength: (state, action) => {
//       state.cartItemLength = action.payload;
//     },
//   },
// });

// export const { setCartItemLength } = cartSlice.actions;
// export default cartSlice.reducer;






// // cartSlice.ts
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// type CartState = {
//   cartItemLength: number;
//   cartItems: any[]; // adjust type
// };

// const initialState: CartState = {
//   cartItemLength: 0,
//   cartItems: [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     setCartItemLength: (state, action: PayloadAction<number>) => {
//       state.cartItemLength = action.payload;
//     },
//     setCartItems: (state, action: PayloadAction<any[]>) => {
//       state.cartItems = action.payload;
//       state.cartItemLength = action.payload.length;
//     },
//   },
// });

// export const { setCartItemLength, setCartItems } = cartSlice.actions;
// export default cartSlice.reducer;









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
