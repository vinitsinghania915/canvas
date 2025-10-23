import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import canvasSlice from "./slices/canvasSlice";
import designSlice from "./slices/designSlice";
import commentSlice from "./slices/commentSlice";
import collaborationSlice from "./slices/collaborationSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    canvas: canvasSlice,
    designs: designSlice,
    comments: commentSlice,
    collaboration: collaborationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["canvas/setFabricCanvas"],
        ignoredPaths: ["canvas.fabricCanvas"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
