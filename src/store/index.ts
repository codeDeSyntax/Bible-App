import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import appSlice, { AppState } from "./slices/appSlice";
import bibleSlice, { loadBibleState } from "./slices/bibleSlice";

/**
 * Redux store configuration optimized for Bible functionality.
 */

export const store = configureStore({
  reducer: {
    bible: bibleSlice,
    app: appSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types to speed up dev performance
        ignoredActions: ["persist/PERSIST"],
        // Reduce warning threshold to catch only very slow operations
        warnAfter: 128,
      },
    }),
});

// Load persisted state
store.dispatch(loadBibleState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
