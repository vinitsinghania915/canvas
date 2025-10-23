import React, { useState } from "react";
import { X } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState(color);

  const predefinedColors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#000080",
    "#808080",
    "#C0C0C0",
    "#FFC0CB",
    "#A52A2A",
    "#808000",
    "#800000",
  ];

  const handleColorSelect = (newColor: string) => {
    setSelectedColor(newColor);
    onChange(newColor);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="color-picker">
      <div className="color-picker-header">
        <h3>Choose Color</h3>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="color-picker-content">
        {/* Custom Color Input */}
        <div className="custom-color-section">
          <label>Custom Color:</label>
          <div className="custom-color-input">
            <input
              type="color"
              value={selectedColor}
              onChange={handleCustomColorChange}
              className="color-input"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder="#000000"
              className="color-text-input"
            />
          </div>
        </div>

        {/* Predefined Colors */}
        <div className="predefined-colors-section">
          <label>Predefined Colors:</label>
          <div className="color-grid">
            {predefinedColors.map((predefinedColor) => (
              <button
                key={predefinedColor}
                className={`color-option ${
                  selectedColor === predefinedColor ? "selected" : ""
                }`}
                style={{ backgroundColor: predefinedColor }}
                onClick={() => handleColorSelect(predefinedColor)}
                title={predefinedColor}
              />
            ))}
          </div>
        </div>

        {/* Current Selection */}
        <div className="current-color-section">
          <label>Current Color:</label>
          <div className="current-color-display">
            <div
              className="current-color-preview"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="current-color-text">{selectedColor}</span>
          </div>
        </div>
      </div>

      <div className="color-picker-footer">
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
