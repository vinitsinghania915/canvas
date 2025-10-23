import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { updateObject } from "../../store/slices/canvasSlice";
import ColorPicker from "../ColorPicker/ColorPicker";

const PropertiesPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { objects, selectedObjectIds } = useSelector(
    (state: RootState) => state.canvas
  );

  const selectedObject =
    selectedObjectIds.length === 1
      ? objects.find((obj) => obj.id === selectedObjectIds[0])
      : null;

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerProperty, setColorPickerProperty] = useState<string>("");

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedObject) return;

    dispatch(
      updateObject({
        id: selectedObject.id,
        updates: { [property]: value },
      })
    );
  };

  const openColorPicker = (property: string) => {
    setColorPickerProperty(property);
    setShowColorPicker(true);
  };

  const handleColorChange = (color: string) => {
    handlePropertyChange(colorPickerProperty, color);
    setShowColorPicker(false);
  };

  const getFontFamilies = () => [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
    "Palatino",
  ];

  if (!selectedObject) {
    return (
      <div className="properties-panel">
        <div className="panel-header">
          <h3>Properties</h3>
        </div>
        <div className="no-selection">
          <p>Select an object to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <h3>Properties</h3>
        <span className="object-type">{selectedObject.type}</span>
      </div>

      <div className="properties-content">
        {/* Position */}
        <div className="property-group">
          <h4>Position</h4>
          <div className="property-row">
            <label>X</label>
            <input
              type="number"
              value={selectedObject.left}
              onChange={(e) =>
                handlePropertyChange("left", parseFloat(e.target.value) || 0)
              }
              className="property-input"
            />
          </div>
          <div className="property-row">
            <label>Y</label>
            <input
              type="number"
              value={selectedObject.top}
              onChange={(e) =>
                handlePropertyChange("top", parseFloat(e.target.value) || 0)
              }
              className="property-input"
            />
          </div>
        </div>

        {/* Size */}
        <div className="property-group">
          <h4>Size</h4>
          <div className="property-row">
            <label>Width</label>
            <input
              type="number"
              value={selectedObject.width}
              onChange={(e) =>
                handlePropertyChange("width", parseFloat(e.target.value) || 0)
              }
              className="property-input"
            />
          </div>
          <div className="property-row">
            <label>Height</label>
            <input
              type="number"
              value={selectedObject.height}
              onChange={(e) =>
                handlePropertyChange("height", parseFloat(e.target.value) || 0)
              }
              className="property-input"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="property-group">
          <h4>Rotation</h4>
          <div className="property-row">
            <label>Angle</label>
            <input
              type="number"
              value={selectedObject.angle}
              onChange={(e) =>
                handlePropertyChange("angle", parseFloat(e.target.value) || 0)
              }
              className="property-input"
              min="0"
              max="360"
            />
          </div>
        </div>

        {/* Text Properties */}
        {selectedObject.type === "text" && (
          <div className="property-group">
            <h4>Text</h4>
            <div className="property-row">
              <label>Content</label>
              <textarea
                value={selectedObject.text || ""}
                onChange={(e) => handlePropertyChange("text", e.target.value)}
                className="property-textarea"
                rows={3}
              />
            </div>
            <div className="property-row">
              <label>Font Size</label>
              <input
                type="number"
                value={selectedObject.fontSize || 24}
                onChange={(e) =>
                  handlePropertyChange(
                    "fontSize",
                    parseFloat(e.target.value) || 24
                  )
                }
                className="property-input"
                min="8"
                max="200"
              />
            </div>
            <div className="property-row">
              <label>Font Family</label>
              <select
                value={selectedObject.fontFamily || "Arial"}
                onChange={(e) =>
                  handlePropertyChange("fontFamily", e.target.value)
                }
                className="property-select"
              >
                {getFontFamilies().map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div className="property-row">
              <label>Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={selectedObject.fill || "#000000"}
                  onChange={(e) => handlePropertyChange("fill", e.target.value)}
                  className="color-input"
                />
                <button
                  onClick={() => openColorPicker("fill")}
                  className="color-picker-btn"
                >
                  Color Picker
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shape Properties */}
        {(selectedObject.type === "rectangle" ||
          selectedObject.type === "circle") && (
          <div className="property-group">
            <h4>Appearance</h4>
            <div className="property-row">
              <label>Fill Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={selectedObject.fill || "#ff0000"}
                  onChange={(e) => handlePropertyChange("fill", e.target.value)}
                  className="color-input"
                />
                <button
                  onClick={() => openColorPicker("fill")}
                  className="color-picker-btn"
                >
                  Color Picker
                </button>
              </div>
            </div>
            <div className="property-row">
              <label>Stroke Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={selectedObject.stroke || "#000000"}
                  onChange={(e) =>
                    handlePropertyChange("stroke", e.target.value)
                  }
                  className="color-input"
                />
                <button
                  onClick={() => openColorPicker("stroke")}
                  className="color-picker-btn"
                >
                  Color Picker
                </button>
              </div>
            </div>
            <div className="property-row">
              <label>Stroke Width</label>
              <input
                type="number"
                value={selectedObject.strokeWidth || 1}
                onChange={(e) =>
                  handlePropertyChange(
                    "strokeWidth",
                    parseFloat(e.target.value) || 1
                  )
                }
                className="property-input"
                min="0"
                max="20"
              />
            </div>
            {selectedObject.type === "rectangle" && (
              <>
                <div className="property-row">
                  <label>Corner Radius X</label>
                  <input
                    type="number"
                    value={selectedObject.rx || 0}
                    onChange={(e) =>
                      handlePropertyChange(
                        "rx",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="property-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="property-row">
                  <label>Corner Radius Y</label>
                  <input
                    type="number"
                    value={selectedObject.ry || 0}
                    onChange={(e) =>
                      handlePropertyChange(
                        "ry",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="property-input"
                    min="0"
                    max="100"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Image Properties */}
        {selectedObject.type === "image" && (
          <div className="property-group">
            <h4>Image</h4>
            <div className="property-row">
              <label>Source URL</label>
              <input
                type="url"
                value={selectedObject.src || ""}
                onChange={(e) => handlePropertyChange("src", e.target.value)}
                className="property-input"
                placeholder="Enter image URL"
              />
            </div>
          </div>
        )}
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="modal-overlay">
          <div className="modal">
            <ColorPicker
              color={
                (selectedObject[
                  colorPickerProperty as keyof typeof selectedObject
                ] as string) || "#000000"
              }
              onChange={handleColorChange}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
