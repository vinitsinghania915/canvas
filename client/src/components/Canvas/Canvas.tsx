import React, {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { fabric } from "fabric";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  setFabricCanvas,
  saveToHistory,
  setObjects,
  setSelectedObjectIds,
} from "../../store/slices/canvasSlice";
import { socketService } from "../../services/socket";
import { toast } from "react-hot-toast";

interface CanvasProps {
  designId?: string;
  onCanvasClick?: (position: { x: number; y: number }) => void;
}

export interface CanvasRef {
  addText: (text?: string, options?: any) => void;
  addRectangle: (options?: any) => void;
  addCircle: (options?: any) => void;
  addImage: (imageUrl: string) => void;
  exportAsPNG: () => void;
  deleteSelected: () => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(
  ({ designId, onCanvasClick }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const isUpdatingRef = useRef(false);
    const hasLoadedObjectsRef = useRef(false);
    const socketUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastObjectsRef = useRef<any[]>([]);

    const { objects, canvas, fabricCanvas } = useSelector(
      (state: RootState) => state.canvas
    );
    const { token } = useSelector((state: RootState) => state.auth);

    // Helper function to compare objects for meaningful changes
    const hasObjectChanged = useCallback((obj1: any, obj2: any) => {
      if (!obj1 || !obj2) return true;

      const keys = [
        "id",
        "type",
        "left",
        "top",
        "width",
        "height",
        "angle",
        "scaleX",
        "scaleY",
        "text",
        "fontSize",
        "fontFamily",
        "fill",
        "stroke",
        "strokeWidth",
        "radius",
      ];

      for (const key of keys) {
        if (obj1[key] !== obj2[key]) {
          return true;
        }
      }

      return false;
    }, []);

    // Helper function to check if objects array has meaningful changes
    const hasObjectsChanged = useCallback(
      (newObjects: any[], oldObjects: any[]) => {
        if (newObjects.length !== oldObjects.length) return true;

        for (let i = 0; i < newObjects.length; i++) {
          if (hasObjectChanged(newObjects[i], oldObjects[i])) {
            return true;
          }
        }

        return false;
      },
      [hasObjectChanged]
    );

    // Debounced socket update function
    const debouncedSocketUpdate = useCallback(
      (objects: any[]) => {
        // Only send socket update if objects have actually changed
        if (!hasObjectsChanged(objects, lastObjectsRef.current)) {
          return;
        }

        // Update the last objects reference
        lastObjectsRef.current = [...objects];

        if (socketUpdateTimeoutRef.current) {
          clearTimeout(socketUpdateTimeoutRef.current);
        }

        socketUpdateTimeoutRef.current = setTimeout(() => {
          if (designId && socketService.getSocket()) {
            socketService.emitCanvasUpdate(designId, objects, canvas);
          }
        }, 300); // 300ms debounce
      },
      [designId, hasObjectsChanged]
    );

    // Initialize Fabric.js canvas
    useEffect(() => {
      if (!canvasRef.current) return;

      const fabricCanvasInstance = new fabric.Canvas(canvasRef.current, {
        width: canvas.width,
        height: canvas.height,
        backgroundColor: canvas.backgroundColor,
        selection: true,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = fabricCanvasInstance;
      dispatch(setFabricCanvas(fabricCanvasInstance));

      return () => {
        fabricCanvasInstance.dispose();
      };
    }, [dispatch]);

    // Update canvas size and background
    useEffect(() => {
      if (!fabricCanvas || !fabricCanvas.lowerCanvasEl) return;

      fabricCanvas.setDimensions({
        width: canvas.width,
        height: canvas.height,
      });
      fabricCanvas.setBackgroundColor(
        canvas.backgroundColor,
        fabricCanvas.renderAll.bind(fabricCanvas)
      );
    }, [canvas, fabricCanvas]);

    // Load objects into Fabric.js canvas ONCE when design loads
    useEffect(() => {
      if (
        !fabricCanvas ||
        !fabricCanvas.lowerCanvasEl ||
        !objects.length ||
        hasLoadedObjectsRef.current
      )
        return;

      isUpdatingRef.current = true;
      hasLoadedObjectsRef.current = true;

      // Convert CanvasObjects back to Fabric.js objects
      const fabricObjects = objects
        .map((obj) => {
          const baseProps = {
            id: obj.id,
            left: obj.left,
            top: obj.top,
            angle: obj.angle,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            zIndex: obj.zIndex,
          };

          switch (obj.type) {
            case "text":
              return new fabric.IText(obj.text || "Text", {
                ...baseProps,
                fontSize: obj.fontSize || 24,
                fontFamily: obj.fontFamily || "Arial",
                fill: obj.fill || "#000000",
                editable: true,
              });

            case "image":
              // Images need to be loaded asynchronously with CORS
              if (obj.src) {
                const img = new Image();
                img.crossOrigin = "anonymous";

                img.onload = () => {
                  const fabricImg = new fabric.Image(img);
                  fabricImg.set(baseProps);
                  fabricCanvas.add(fabricImg);
                  fabricCanvas.renderAll();
                };

                img.onerror = () => {
                  console.warn("Failed to load image:", obj.src);
                };

                img.src = obj.src;
              }
              return null; // Return null since we're handling it asynchronously

            case "rectangle":
              return new fabric.Rect({
                ...baseProps,
                width: obj.width,
                height: obj.height,
                fill: obj.fill || "#ff0000",
                stroke: obj.stroke || "#000000",
                strokeWidth: obj.strokeWidth || 1,
                rx: obj.rx || 0,
                ry: obj.ry || 0,
              });

            case "circle":
              return new fabric.Circle({
                ...baseProps,
                radius: obj.radius || obj.width / 2 || 50, // Use saved radius or calculate from width
                fill: obj.fill || "#00ff00",
                stroke: obj.stroke || "#000000",
                strokeWidth: obj.strokeWidth || 1,
              });

            default:
              return null;
          }
        })
        .filter(Boolean);

      // Clear canvas and add objects
      fabricCanvas.clear();
      fabricObjects.forEach((obj) => {
        if (obj) {
          fabricCanvas.add(obj);
        }
      });

      if (fabricCanvas.lowerCanvasEl) {
        fabricCanvas.renderAll();
      }

      setTimeout(() => {
        isUpdatingRef.current = false;
        // Initialize lastObjectsRef with the loaded objects
        lastObjectsRef.current = [...objects];
      }, 100);
    }, [objects, fabricCanvas]);

    // Handle object selection
    useEffect(() => {
      if (!fabricCanvas) return;

      const handleSelection = () => {
        const activeObjects = fabricCanvas.getActiveObjects();
        const selectedIds = activeObjects.map((obj: any) => obj.id);
        dispatch(setSelectedObjectIds(selectedIds));
      };

      fabricCanvas.on("selection:created", handleSelection);
      fabricCanvas.on("selection:updated", handleSelection);
      fabricCanvas.on("selection:cleared", () => {
        dispatch(setSelectedObjectIds([]));
      });

      return () => {
        fabricCanvas.off("selection:created", handleSelection);
        fabricCanvas.off("selection:updated", handleSelection);
        fabricCanvas.off("selection:cleared");
      };
    }, [fabricCanvas, dispatch]);

    // Handle object modifications
    useEffect(() => {
      if (!fabricCanvas) return;

      const handleObjectModified = (event?: any) => {
        if (isUpdatingRef.current) return;

        const fabricObjects = fabricCanvas.getObjects();
        const objects = fabricObjects.map((obj: any) => {
          const baseObject = {
            id: obj.id || `obj_${Date.now()}`,
            type: (obj.type === "rect" ? "rectangle" : obj.type) as
              | "text"
              | "image"
              | "rectangle"
              | "circle",
            left: obj.left || 0,
            top: obj.top || 0,
            width: obj.width || 0,
            height: obj.height || 0,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            zIndex: obj.zIndex || 0,
          };

          // Add type-specific properties
          if (obj.type === "text" || obj.type === "i-text") {
            return {
              ...baseObject,
              type: "text",
              text: obj.text || "",
              fontSize: obj.fontSize || 24,
              fontFamily: obj.fontFamily || "Arial",
              fill: String(obj.fill || "#000000"),
            };
          }

          if (obj.type === "image") {
            return {
              ...baseObject,
              src: obj.getSrc ? obj.getSrc() : "",
            };
          }

          if (obj.type === "rect") {
            return {
              ...baseObject,
              type: "rectangle",
              fill: String(obj.fill || "#ff0000"),
              stroke: String(obj.stroke || "#000000"),
              strokeWidth: obj.strokeWidth || 1,
              rx: obj.rx || 0,
              ry: obj.ry || 0,
            };
          }

          if (obj.type === "circle") {
            return {
              ...baseObject,
              radius: obj.radius || 50,
              fill: String(obj.fill || "#00ff00"),
              stroke: String(obj.stroke || "#000000"),
              strokeWidth: obj.strokeWidth || 1,
            };
          }

          return baseObject;
        });

        dispatch(setObjects(objects));
        dispatch(saveToHistory());

        // Only send socket update for meaningful changes (added/removed/modified)
        debouncedSocketUpdate(objects);
      };

      // Separate handlers for different events
      const handleObjectAdded = () => {
        handleObjectModified();
      };

      const handleObjectRemoved = () => {
        handleObjectModified();
      };

      const handleObjectModifiedOnly = (event: any) => {
        // Only trigger for actual modifications, not just selections
        if (event && event.action && event.action !== "select") {
          handleObjectModified();
        }
      };

      fabricCanvas.on("object:added", handleObjectAdded);
      fabricCanvas.on("object:removed", handleObjectRemoved);
      fabricCanvas.on("object:modified", handleObjectModifiedOnly);

      return () => {
        fabricCanvas.off("object:added", handleObjectAdded);
        fabricCanvas.off("object:removed", handleObjectRemoved);
        fabricCanvas.off("object:modified", handleObjectModifiedOnly);
      };
    }, [fabricCanvas, dispatch, debouncedSocketUpdate]);

    // Handle canvas clicks for comments
    useEffect(() => {
      if (!fabricCanvas || !onCanvasClick) return;

      const handleCanvasClick = (event: any) => {
        // Only handle clicks when no object is selected
        const activeObjects = fabricCanvas.getActiveObjects();
        if (activeObjects.length === 0) {
          const pointer = fabricCanvas.getPointer(event.e);
          onCanvasClick({ x: pointer.x, y: pointer.y });
        }
      };

      fabricCanvas.on("mouse:down", handleCanvasClick);

      return () => {
        fabricCanvas.off("mouse:down", handleCanvasClick);
      };
    }, [fabricCanvas, onCanvasClick]);

    // Handle keyboard events (Delete key)
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Only handle delete if canvas is focused or if it's a global delete
        if (event.key === "Delete" || event.key === "Backspace") {
          if (!fabricCanvas) return;

          // Check if we're currently editing text
          const activeObject = fabricCanvas.getActiveObject();
          const isEditingText =
            activeObject &&
            activeObject.isEditing &&
            activeObject.type === "i-text";

          // If we're editing text, don't handle the delete key globally
          if (isEditingText) {
            return;
          }

          const activeObjects = fabricCanvas.getActiveObjects();
          if (activeObjects.length > 0) {
            event.preventDefault();

            // Remove selected objects from canvas
            activeObjects.forEach((obj: any) => {
              fabricCanvas.remove(obj);
            });

            // Clear selection
            fabricCanvas.discardActiveObject();
            fabricCanvas.renderAll();

            // Show success message
            toast.success(
              `Deleted ${activeObjects.length} object${
                activeObjects.length > 1 ? "s" : ""
              }`
            );
          }
        }
      };

      // Add event listener to document for global keyboard events
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [fabricCanvas]);

    // Socket.io event handlers
    useEffect(() => {
      if (!designId || !token) return;

      socketService.connect(token);
      socketService.joinDesign(designId);

      const handleCanvasUpdated = (data: any) => {
        if (data.userId !== socketService.getSocket()?.user?.userId) {
          dispatch(setObjects(data.objects));
        }
      };

      const handleSelectionChanged = (data: any) => {
        if (data.userId !== socketService.getSocket()?.user?.userId) {
          dispatch(setSelectedObjectIds(data.selectedObjectIds));
        }
      };

      const handleUserJoined = (data: any) => {
        toast.success(`${data.username} joined the design`);
      };

      const handleUserLeft = (data: any) => {
        toast(`${data.username} left the design`);
      };

      socketService.on("canvas-updated", handleCanvasUpdated);
      socketService.on("selection-changed", handleSelectionChanged);
      socketService.on("user-joined", handleUserJoined);
      socketService.on("user-left", handleUserLeft);

      return () => {
        // Clear any pending socket updates
        if (socketUpdateTimeoutRef.current) {
          clearTimeout(socketUpdateTimeoutRef.current);
        }

        socketService.leaveDesign(designId);
        socketService.off("canvas-updated", handleCanvasUpdated);
        socketService.off("selection-changed", handleSelectionChanged);
        socketService.off("user-joined", handleUserJoined);
        socketService.off("user-left", handleUserLeft);
      };
    }, [designId, token, dispatch]);

    // Add text object
    const addText = useCallback(
      (text: string = "Text", options: any = {}) => {
        if (!fabricCanvas) return;

        isUpdatingRef.current = true;
        const textContent = String(text || "Text");
        const textObject = new fabric.IText(textContent, {
          left: 100,
          top: 100,
          fontSize: options.fontSize || 24,
          fontFamily: options.fontFamily || "Arial",
          fill: options.fill || "#000000",
          editable: true,
        } as any);
        (textObject as any).id = `text_${Date.now()}`;

        fabricCanvas.add(textObject);
        fabricCanvas.setActiveObject(textObject);
        fabricCanvas.renderAll();

        setTimeout(() => {
          textObject.enterEditing();
          textObject.selectAll();
          fabricCanvas.renderAll();
          isUpdatingRef.current = false;
        }, 100);
      },
      [fabricCanvas]
    );

    // Add rectangle
    const addRectangle = useCallback(
      (options: any = {}) => {
        if (!fabricCanvas) return;

        isUpdatingRef.current = true;
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          width: 200,
          height: 100,
          fill: options.fill || "#ff0000",
          stroke: options.stroke || "#000000",
          strokeWidth: options.strokeWidth || 1,
          rx: options.rx || 0,
          ry: options.ry || 0,
        } as any);
        (rect as any).id = `rect_${Date.now()}`;

        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        fabricCanvas.renderAll();

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      },
      [fabricCanvas]
    );

    // Add circle
    const addCircle = useCallback(
      (options: any = {}) => {
        if (!fabricCanvas) return;

        isUpdatingRef.current = true;
        const circle = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: options.fill || "#00ff00",
          stroke: options.stroke || "#000000",
          strokeWidth: options.strokeWidth || 1,
        } as any);
        (circle as any).id = `circle_${Date.now()}`;

        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
        fabricCanvas.renderAll();

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      },
      [fabricCanvas]
    );

    // Add image from URL
    const addImage = useCallback(
      (imageUrl: string) => {
        if (!fabricCanvas) return;

        isUpdatingRef.current = true;

        // Load image with CORS enabled
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          const fabricImg = new fabric.Image(img, {
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          (fabricImg as any).id = `image_${Date.now()}`;
          fabricCanvas.add(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();

          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        };

        img.onerror = () => {
          toast.error(
            "Failed to load image. Please check the URL and try again."
          );
          isUpdatingRef.current = false;
        };

        img.src = imageUrl;
      },
      [fabricCanvas]
    );

    // Export canvas as PNG
    const exportAsPNG = useCallback(() => {
      if (!fabricCanvas) return;

      try {
        const dataURL = fabricCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });

        const link = document.createElement("a");
        link.download = `design_${Date.now()}.png`;
        link.href = dataURL;
        link.click();

        toast.success("Design exported successfully!");
      } catch (error) {
        console.error("Export error:", error);
        toast.error(
          "Failed to export design. This may be due to cross-origin images. Please try removing external images and try again."
        );
      }
    }, [fabricCanvas]);

    // Delete selected objects
    const deleteSelected = useCallback(() => {
      if (!fabricCanvas) return;

      // Check if we're currently editing text
      const activeObject = fabricCanvas.getActiveObject();
      const isEditingText =
        activeObject &&
        activeObject.isEditing &&
        activeObject.type === "i-text";

      // If we're editing text, don't delete the object
      if (isEditingText) {
        // toast.info("Finish editing text before deleting");
        return;
      }

      const activeObjects = fabricCanvas.getActiveObjects();
      if (activeObjects.length > 0) {
        // Remove selected objects from canvas
        activeObjects.forEach((obj: any) => {
          fabricCanvas.remove(obj);
        });

        // Clear selection
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();

        // Show success message
        toast.success(
          `Deleted ${activeObjects.length} object${
            activeObjects.length > 1 ? "s" : ""
          }`
        );
      } else {
        // toast.info("No objects selected to delete");
      }
    }, [fabricCanvas]);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        addText,
        addRectangle,
        addCircle,
        addImage,
        exportAsPNG,
        deleteSelected,
      }),
      [addText, addRectangle, addCircle, addImage, exportAsPNG, deleteSelected]
    );

    return (
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
    );
  }
);

Canvas.displayName = "Canvas";

export default Canvas;
