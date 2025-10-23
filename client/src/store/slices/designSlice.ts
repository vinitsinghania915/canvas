import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Design, ApiError } from "../../types";
import { designAPI } from "../../services/api";

interface DesignState {
  designs: Design[];
  currentDesign: Design | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DesignState = {
  designs: [],
  currentDesign: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDesigns = createAsyncThunk(
  "designs/fetchDesigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await designAPI.getAll();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDesign = createAsyncThunk(
  "designs/createDesign",
  async (
    designData: { name: string; description?: string; canvas?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await designAPI.create(designData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDesign = createAsyncThunk(
  "designs/fetchDesign",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await designAPI.getById(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDesign = createAsyncThunk(
  "designs/updateDesign",
  async (
    { id, updates }: { id: string; updates: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await designAPI.update(id, updates);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDesign = createAsyncThunk(
  "designs/deleteDesign",
  async (id: string, { rejectWithValue }) => {
    try {
      await designAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addCollaborator = createAsyncThunk(
  "designs/addCollaborator",
  async (
    { id, userId, role }: { id: string; userId: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await designAPI.addCollaborator(id, userId, role);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeCollaborator = createAsyncThunk(
  "designs/removeCollaborator",
  async (
    { id, userId }: { id: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await designAPI.removeCollaborator(id, userId);
      return { designId: id, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const designSlice = createSlice({
  name: "designs",
  initialState,
  reducers: {
    setCurrentDesign: (state, action: PayloadAction<Design | null>) => {
      state.currentDesign = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch designs
      .addCase(fetchDesigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designs = action.payload.designs;
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as ApiError)?.message || "Failed to fetch designs";
      })
      // Create design
      .addCase(createDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designs.unshift(action.payload.design);
        state.currentDesign = action.payload.design;
      })
      .addCase(createDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as ApiError)?.message || "Failed to create design";
      })
      // Fetch design
      .addCase(fetchDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDesign = action.payload.design;
      })
      .addCase(fetchDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as ApiError)?.message || "Failed to fetch design";
      })
      // Update design
      .addCase(updateDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDesign = action.payload.design;
        const index = state.designs.findIndex(
          (design) => design._id === action.payload.design._id
        );
        if (index !== -1) {
          state.designs[index] = action.payload.design;
        }
      })
      .addCase(updateDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as ApiError)?.message || "Failed to update design";
      })
      // Delete design
      .addCase(deleteDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designs = state.designs.filter(
          (design) => design._id !== action.payload
        );
        if (state.currentDesign?._id === action.payload) {
          state.currentDesign = null;
        }
      })
      .addCase(deleteDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as ApiError)?.message || "Failed to delete design";
      })
      // Add collaborator
      .addCase(addCollaborator.fulfilled, (state, action) => {
        state.currentDesign = action.payload.data.design;
        const index = state.designs.findIndex(
          (design) => design._id === action.payload.data.design._id
        );
        if (index !== -1) {
          state.designs[index] = action.payload.data.design;
        }
      })
      // Remove collaborator
      .addCase(removeCollaborator.fulfilled, (state, action) => {
        if (state.currentDesign?._id === action.payload?.designId) {
          state.currentDesign.collaborators =
            state.currentDesign.collaborators.filter(
              (collab) => collab.user.id !== action.payload.userId
            );
        }
      });
  },
});

export const { setCurrentDesign, clearError } = designSlice.actions;
export default designSlice.reducer;
