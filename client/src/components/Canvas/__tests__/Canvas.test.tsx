import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Canvas from "../Canvas";
import canvasSlice from "../../../store/slices/canvasSlice";
import authSlice from "../../../store/slices/authSlice";

// Mock Fabric.js
jest.mock("fabric", () => ({
  Canvas: jest.fn().mockImplementation(() => ({
    setDimensions: jest.fn(),
    setBackgroundColor: jest.fn(),
    renderAll: jest.fn(),
    loadFromJSON: jest.fn(),
    getActiveObjects: jest.fn(() => []),
    getObjects: jest.fn(() => []),
    add: jest.fn(),
    setActiveObject: jest.fn(),
    toDataURL: jest.fn(() => "data:image/png;base64,test"),
    on: jest.fn(),
    off: jest.fn(),
    dispose: jest.fn(),
  })),
  Text: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
  Rect: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
  Circle: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
  Image: {
    fromURL: jest.fn(),
  },
}));

// Mock socket service
jest.mock("../../../services/socket", () => ({
  socketService: {
    connect: jest.fn(),
    joinDesign: jest.fn(),
    leaveDesign: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getSocket: jest.fn(() => ({ user: { userId: "test-user" } })),
  },
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      canvas: canvasSlice,
      auth: authSlice,
    },
    preloadedState: {
      canvas: {
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
      },
      auth: {
        user: null,
        token: "test-token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    },
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe("Canvas Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders canvas container", () => {
    renderWithProvider(<Canvas designId="test-design-id" />);

    const canvasContainer = document.querySelector(".canvas-container");
    expect(canvasContainer).toBeInTheDocument();
  });

  it("renders canvas element", () => {
    renderWithProvider(<Canvas designId="test-design-id" />);

    const canvasElement = document.querySelector("canvas");
    expect(canvasElement).toBeInTheDocument();
  });

  it("initializes Fabric.js canvas on mount", () => {
    const { fabric } = require("fabric");

    renderWithProvider(<Canvas designId="test-design-id" />);

    expect(fabric.Canvas).toHaveBeenCalled();
  });

  it("connects to socket service when designId and token are provided", () => {
    const { socketService } = require("../../../services/socket");

    renderWithProvider(<Canvas designId="test-design-id" />);

    expect(socketService.connect).toHaveBeenCalledWith("test-token");
    expect(socketService.joinDesign).toHaveBeenCalledWith("test-design-id");
  });

  it("disconnects from socket service on unmount", () => {
    const { socketService } = require("../../../services/socket");

    const { unmount } = renderWithProvider(
      <Canvas designId="test-design-id" />
    );

    unmount();

    expect(socketService.leaveDesign).toHaveBeenCalledWith("test-design-id");
  });

  it("sets up socket event listeners", () => {
    const { socketService } = require("../../../services/socket");

    renderWithProvider(<Canvas designId="test-design-id" />);

    expect(socketService.on).toHaveBeenCalledWith(
      "canvas-updated",
      expect.any(Function)
    );
    expect(socketService.on).toHaveBeenCalledWith(
      "selection-changed",
      expect.any(Function)
    );
    expect(socketService.on).toHaveBeenCalledWith(
      "user-joined",
      expect.any(Function)
    );
    expect(socketService.on).toHaveBeenCalledWith(
      "user-left",
      expect.any(Function)
    );
  });
});
