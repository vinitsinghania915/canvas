import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasObject, Canvas } from "../../types";
import { fabric } from "fabric";

interface CanvasState {
  objects: CanvasObject[];
  selectedObjectIds: string[];
  canvas: Canvas;
  history: CanvasObject[][];
  historyIndex: number;
  fabricCanvas: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: CanvasState = {
  objects: [],
  selectedObjectIds: [],
  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: "#ffffff",
  },
  history: [],
  historyIndex: -1,
  fabricCanvas: null,
  isLoading: false,
  error: null,
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setFabricCanvas: (state, action: PayloadAction<any>) => {
      state.fabricCanvas = action.payload;
    },
    setCanvas: (state, action: PayloadAction<Canvas>) => {
      state.canvas = action.payload;
    },
    setObjects: (state, action: PayloadAction<CanvasObject[]>) => {
      state.objects = action.payload;
    },
    addObject: (state, action: PayloadAction<CanvasObject>) => {
      state.objects.push(action.payload);
    },
    updateObject: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<CanvasObject> }>
    ) => {
      const index = state.objects.findIndex(
        (obj) => obj.id === action.payload.id
      );
      if (index !== -1) {
        state.objects[index] = {
          ...state.objects[index],
          ...action.payload.updates,
        };
      }
    },
    removeObject: (state, action: PayloadAction<string>) => {
      state.objects = state.objects.filter((obj) => obj.id !== action.payload);
      state.selectedObjectIds = state.selectedObjectIds.filter(
        (id) => id !== action.payload
      );
    },
    setSelectedObjectIds: (state, action: PayloadAction<string[]>) => {
      state.selectedObjectIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedObjectIds = [];
    },
    bringForward: (state, action: PayloadAction<string>) => {
      const object = state.objects.find((obj) => obj.id === action.payload);
      if (object) {
        const maxZIndex = Math.max(...state.objects.map((obj) => obj.zIndex));
        object.zIndex = maxZIndex + 1;
      }
    },
    sendBackward: (state, action: PayloadAction<string>) => {
      const object = state.objects.find((obj) => obj.id === action.payload);
      if (object) {
        const minZIndex = Math.min(...state.objects.map((obj) => obj.zIndex));
        object.zIndex = minZIndex - 1;
      }
    },
    bringToFront: (state, action: PayloadAction<string>) => {
      const object = state.objects.find((obj) => obj.id === action.payload);
      if (object) {
        const maxZIndex = Math.max(...state.objects.map((obj) => obj.zIndex));
        object.zIndex = maxZIndex + 1;
      }
    },
    sendToBack: (state, action: PayloadAction<string>) => {
      const object = state.objects.find((obj) => obj.id === action.payload);
      if (object) {
        const minZIndex = Math.min(...state.objects.map((obj) => obj.zIndex));
        object.zIndex = minZIndex - 1;
      }
    },
    saveToHistory: (state) => {
      // Remove any history after current index
      state.history = state.history.slice(0, state.historyIndex + 1);

      // Add current state to history
      state.history.push([...state.objects]);

      // Limit history to 10 items
      if (state.history.length > 10) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.objects = [...state.history[state.historyIndex]];
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.objects = [...state.history[state.historyIndex]];
      }
    },
    clearHistory: (state) => {
      state.history = [];
      state.historyIndex = -1;
    },
    resetCanvas: (state) => {
      state.objects = [];
      state.selectedObjectIds = [];
      state.history = [];
      state.historyIndex = -1;
      state.canvas = {
        width: 1080,
        height: 1080,
        backgroundColor: "#ffffff",
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setFabricCanvas,
  setCanvas,
  setObjects,
  addObject,
  updateObject,
  removeObject,
  setSelectedObjectIds,
  clearSelection,
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
  saveToHistory,
  undo,
  redo,
  clearHistory,
  resetCanvas,
  setLoading,
  setError,
  clearError,
} = canvasSlice.actions;

export default canvasSlice.reducer;
