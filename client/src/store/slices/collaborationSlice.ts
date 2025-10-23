import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConnectedUser {
  userId: string;
  username: string;
  avatar: string;
  cursor?: {
    x: number;
    y: number;
  };
}

interface CollaborationState {
  connectedUsers: ConnectedUser[];
  isConnected: boolean;
}

const initialState: CollaborationState = {
  connectedUsers: [],
  isConnected: false,
};

const collaborationSlice = createSlice({
  name: "collaboration",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    addUser: (state, action: PayloadAction<ConnectedUser>) => {
      const existingUserIndex = state.connectedUsers.findIndex(
        (user) => user.userId === action.payload.userId
      );
      if (existingUserIndex === -1) {
        state.connectedUsers.push(action.payload);
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.connectedUsers = state.connectedUsers.filter(
        (user) => user.userId !== action.payload
      );
    },
    updateUserCursor: (
      state,
      action: PayloadAction<{
        userId: string;
        cursor: { x: number; y: number };
      }>
    ) => {
      const user = state.connectedUsers.find(
        (user) => user.userId === action.payload.userId
      );
      if (user) {
        user.cursor = action.payload.cursor;
      }
    },
    clearUsers: (state) => {
      state.connectedUsers = [];
    },
  },
});

export const {
  setConnected,
  addUser,
  removeUser,
  updateUserCursor,
  clearUsers,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
