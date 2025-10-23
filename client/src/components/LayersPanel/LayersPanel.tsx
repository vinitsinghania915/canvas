import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  setSelectedObjectIds,
  removeObject,
  updateObject,
  bringToFront,
  sendToBack,
} from "../../store/slices/canvasSlice";
import { Trash2, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const LayersPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { objects, selectedObjectIds } = useSelector(
    (state: RootState) => state.canvas
  );
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Sort objects by z-index (highest first)
  const sortedObjects = [...objects].sort((a, b) => b.zIndex - a.zIndex);

  const handleLayerSelect = (objectId: string) => {
    dispatch(setSelectedObjectIds([objectId]));
  };

  const handleLayerDelete = (objectId: string) => {
    dispatch(removeObject(objectId));
    toast.success("Layer deleted");
  };

  const handleLayerRename = (objectId: string, currentName: string) => {
    setEditingLayerId(objectId);
    setEditingName(currentName);
  };

  const handleRenameSubmit = () => {
    if (editingLayerId && editingName.trim()) {
      dispatch(
        updateObject({
          id: editingLayerId,
          updates: { name: editingName.trim() },
        })
      );
      setEditingLayerId(null);
      setEditingName("");
      toast.success("Layer renamed");
    }
  };

  const handleRenameCancel = () => {
    setEditingLayerId(null);
    setEditingName("");
  };

  const handleLayerReorder = (objectId: string, direction: "up" | "down") => {
    if (direction === "up") {
      dispatch(bringToFront(objectId));
    } else {
      dispatch(sendToBack(objectId));
    }
  };

  const getLayerName = (obj: any) => {
    if (obj.name) return obj.name;

    switch (obj.type) {
      case "text":
        return obj.text || "Text";
      case "image":
        return "Image";
      case "rectangle":
        return "Rectangle";
      case "circle":
        return "Circle";
      default:
        return "Layer";
    }
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "text":
        return "T";
      case "image":
        return "📷";
      case "rectangle":
        return "⬜";
      case "circle":
        return "⭕";
      default:
        return "?";
    }
  };

  return (
    <div className="layers-panel">
      <div className="panel-header">
        <h3>Layers</h3>
        <span className="layer-count">{objects.length}</span>
      </div>

      <div className="layers-list">
        {sortedObjects.length === 0 ? (
          <div className="empty-state">
            <p>No layers yet</p>
            <p className="text-sm text-gray-500">
              Add elements to see them here
            </p>
          </div>
        ) : (
          sortedObjects.map((obj) => (
            <div
              key={obj.id}
              className={`layer-item ${
                selectedObjectIds.includes(obj.id) ? "selected" : ""
              }`}
              onClick={() => handleLayerSelect(obj.id)}
            >
              <div className="layer-info">
                <span className="layer-icon">{getLayerIcon(obj.type)}</span>

                {editingLayerId === obj.id ? (
                  <div className="layer-rename">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit();
                        if (e.key === "Escape") handleRenameCancel();
                      }}
                      autoFocus
                      className="rename-input"
                    />
                    <div className="rename-buttons">
                      <button
                        onClick={handleRenameSubmit}
                        className="rename-btn confirm"
                        title="Confirm"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleRenameCancel}
                        className="rename-btn cancel"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="layer-name">
                    <span>{getLayerName(obj)}</span>
                    <div className="layer-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayerRename(obj.id, getLayerName(obj));
                        }}
                        className="action-btn"
                        title="Rename"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayerDelete(obj.id);
                        }}
                        className="action-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="layer-controls">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLayerReorder(obj.id, "up");
                  }}
                  className="control-btn"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLayerReorder(obj.id, "down");
                  }}
                  className="control-btn"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
