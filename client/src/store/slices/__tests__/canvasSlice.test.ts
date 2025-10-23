import canvasReducer, {
  setFabricCanvas,
  setCanvas,
  setObjects,
  addObject,
  updateObject,
  removeObject,
  setSelectedObjectIds,
  clearSelection,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
  saveToHistory,
  undo,
  redo,
  resetCanvas,
} from "../canvasSlice";

describe("canvasSlice", () => {
  const initialState = {
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

  it("should return the initial state", () => {
    expect(canvasReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setCanvas", () => {
    const newCanvas = {
      width: 1920,
      height: 1080,
      backgroundColor: "#000000",
    };

    const actual = canvasReducer(initialState, setCanvas(newCanvas));
    expect(actual.canvas).toEqual(newCanvas);
  });

  it("should handle setObjects", () => {
    const objects = [
      {
        id: "1",
        type: "text" as const,
        left: 100,
        top: 100,
        width: 200,
        height: 50,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        zIndex: 0,
        text: "Hello",
        fontSize: 24,
        fontFamily: "Arial",
        fill: "#000000",
      },
    ];

    const actual = canvasReducer(initialState, setObjects(objects));
    expect(actual.objects).toEqual(objects);
  });

  it("should handle addObject", () => {
    const newObject = {
      id: "2",
      type: "rectangle" as const,
      left: 200,
      top: 200,
      width: 100,
      height: 100,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: 0,
      fill: "#ff0000",
      stroke: "#000000",
      strokeWidth: 1,
    };

    const actual = canvasReducer(initialState, addObject(newObject));
    expect(actual.objects).toHaveLength(1);
    expect(actual.objects[0]).toEqual(newObject);
  });

  it("should handle updateObject", () => {
    const stateWithObjects = {
      ...initialState,
      objects: [
        {
          id: "1",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 0,
          text: "Hello",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
      ],
    };

    const actual = canvasReducer(
      stateWithObjects,
      updateObject({
        id: "1",
        updates: { text: "Updated", fontSize: 32 },
      })
    );

    expect(actual.objects[0].text).toBe("Updated");
    expect(actual.objects[0].fontSize).toBe(32);
    expect(actual.objects[0].fontFamily).toBe("Arial"); // Should remain unchanged
  });

  it("should handle removeObject", () => {
    const stateWithObjects = {
      ...initialState,
      objects: [
        {
          id: "1",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 0,
          text: "Hello",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
        {
          id: "2",
          type: "rectangle" as const,
          left: 200,
          top: 200,
          width: 100,
          height: 100,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 0,
          fill: "#ff0000",
          stroke: "#000000",
          strokeWidth: 1,
        },
      ],
      selectedObjectIds: ["1"],
    };

    const actual = canvasReducer(stateWithObjects, removeObject("1"));

    expect(actual.objects).toHaveLength(1);
    expect(actual.objects[0].id).toBe("2");
    expect(actual.selectedObjectIds).toEqual([]);
  });

  it("should handle setSelectedObjectIds", () => {
    const actual = canvasReducer(
      initialState,
      setSelectedObjectIds(["1", "2"])
    );

    expect(actual.selectedObjectIds).toEqual(["1", "2"]);
  });

  it("should handle clearSelection", () => {
    const stateWithSelection = {
      ...initialState,
      selectedObjectIds: ["1", "2"],
    };

    const actual = canvasReducer(stateWithSelection, clearSelection());
    expect(actual.selectedObjectIds).toEqual([]);
  });

  it("should handle bringToFront", () => {
    const stateWithObjects = {
      ...initialState,
      objects: [
        {
          id: "1",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 1,
          text: "Hello",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
        {
          id: "2",
          type: "rectangle" as const,
          left: 200,
          top: 200,
          width: 100,
          height: 100,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 2,
          fill: "#ff0000",
          stroke: "#000000",
          strokeWidth: 1,
        },
      ],
    };

    const actual = canvasReducer(stateWithObjects, bringToFront("1"));

    expect(actual.objects[0].zIndex).toBe(3); // Max z-index + 1
  });

  it("should handle sendToBack", () => {
    const stateWithObjects = {
      ...initialState,
      objects: [
        {
          id: "1",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 1,
          text: "Hello",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
        {
          id: "2",
          type: "rectangle" as const,
          left: 200,
          top: 200,
          width: 100,
          height: 100,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 2,
          fill: "#ff0000",
          stroke: "#000000",
          strokeWidth: 1,
        },
      ],
    };

    const actual = canvasReducer(stateWithObjects, sendToBack("2"));

    expect(actual.objects[1].zIndex).toBe(0); // Min z-index - 1
  });

  it("should handle saveToHistory", () => {
    const stateWithObjects = {
      ...initialState,
      objects: [
        {
          id: "1",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 0,
          text: "Hello",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
      ],
    };

    const actual = canvasReducer(stateWithObjects, saveToHistory());

    expect(actual.history).toHaveLength(1);
    expect(actual.history[0]).toEqual(stateWithObjects.objects);
    expect(actual.historyIndex).toBe(0);
  });

  it("should limit history to 10 items", () => {
    let state = initialState;

    // Add 12 history items
    for (let i = 0; i < 12; i++) {
      state = {
        ...state,
        objects: [
          {
            id: `${i}`,
            type: "text" as const,
            left: 100,
            top: 100,
            width: 200,
            height: 50,
            angle: 0,
            scaleX: 1,
            scaleY: 1,
            zIndex: 0,
            text: `Text ${i}`,
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#000000",
          },
        ],
      };
      state = canvasReducer(state, saveToHistory());
    }

    expect(state.history).toHaveLength(10);
    expect(state.historyIndex).toBe(9);
  });

  it("should handle undo", () => {
    const stateWithHistory = {
      ...initialState,
      objects: [
        {
          id: "2",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 0,
          text: "Current",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
      ],
      history: [
        [
          {
            id: "1",
            type: "text" as const,
            left: 100,
            top: 100,
            width: 200,
            height: 50,
            angle: 0,
            scaleX: 1,
            scaleY: 1,
            zIndex: 0,
            text: "Previous",
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#000000",
          },
        ],
      ],
      historyIndex: 0,
    };

    const actual = canvasReducer(stateWithHistory, undo());

    expect(actual.objects).toEqual(stateWithHistory.history[0]);
    expect(actual.historyIndex).toBe(-1);
  });

  it("should handle redo", () => {
    const stateWithHistory = {
      ...initialState,
      objects: [
        {
          id: "1",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 0,
          text: "Current",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
      ],
      history: [
        [
          {
            id: "1",
            type: "text" as const,
            left: 100,
            top: 100,
            width: 200,
            height: 50,
            angle: 0,
            scaleX: 1,
            scaleY: 1,
            zIndex: 0,
            text: "Previous",
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#000000",
          },
        ],
        [
          {
            id: "2",
            type: "text" as const,
            left: 100,
            top: 100,
            width: 200,
            height: 50,
            angle: 0,
            scaleX: 1,
            scaleY: 1,
            zIndex: 0,
            text: "Next",
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#000000",
          },
        ],
      ],
      historyIndex: 0,
    };

    const actual = canvasReducer(stateWithHistory, redo());

    expect(actual.objects).toEqual(stateWithHistory.history[1]);
    expect(actual.historyIndex).toBe(1);
  });

  it("should handle resetCanvas", () => {
    const stateWithData = {
      ...initialState,
      objects: [
        {
          id: "1",
          type: "text" as const,
          left: 100,
          top: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          zIndex: 0,
          text: "Hello",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
        },
      ],
      selectedObjectIds: ["1"],
      history: [[], []],
      historyIndex: 1,
      canvas: {
        width: 1920,
        height: 1080,
        backgroundColor: "#000000",
      },
    };

    const actual = canvasReducer(stateWithData, resetCanvas());

    expect(actual).toEqual(initialState);
  });
});
