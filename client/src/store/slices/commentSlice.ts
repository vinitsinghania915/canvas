import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Comment, ApiError } from "../../types";
import { commentAPI } from "../../services/api";

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (designId: string, { rejectWithValue }) => {
    try {
      const response = await commentAPI.getByDesign(designId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (
    { designId, commentData }: { designId: string; commentData: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await commentAPI.create(designId, commentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async (
    { id, updates }: { id: string; updates: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await commentAPI.update(id, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (id: string, { rejectWithValue }) => {
    try {
      await commentAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addReply = createAsyncThunk(
  "comments/addReply",
  async (
    { id, content }: { id: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await commentAPI.addReply(id, content);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload);
    },
    updateCommentInState: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex(
        (comment) => comment._id === action.payload._id
      );
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(
        (comment) => comment._id !== action.payload
      );
    },
    clearComments: (state) => {
      state.comments = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload.data.comments || action.payload.data;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as ApiError)?.message || "Failed to fetch comments";
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle different response structures
        const newComment =
          action.payload.comment ||
          action.payload.data?.comment ||
          action.payload;
        if (newComment) {
          state.comments.unshift(newComment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as ApiError)?.message || "Failed to create comment";
      })
      // Update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(
          (comment) => comment._id === action.payload.comment._id
        );
        if (index !== -1) {
          state.comments[index] = action.payload.comment;
        }
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(
          (comment) => comment._id !== action.payload
        );
      })
      // Add reply
      .addCase(addReply.fulfilled, (state, action) => {
        // Handle different response structures for addReply
        const updatedComment =
          action.payload.comment ||
          action.payload.data?.comment ||
          action.payload;

        if (updatedComment && updatedComment._id) {
          const index = state.comments.findIndex(
            (comment) => comment._id === updatedComment._id
          );
          if (index !== -1) {
            state.comments[index] = updatedComment;
          }
        }
      });
  },
});

export const {
  setComments,
  addComment,
  updateCommentInState,
  removeComment,
  clearComments,
  clearError,
} = commentSlice.actions;

export default commentSlice.reducer;
