import React, { useState } from "react";
import { X, Palette, Check } from "lucide-react";
import "./ColorPicker.css";

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
    // Primary colors
    { color: "#000000", name: "Black" },
    { color: "#FFFFFF", name: "White" },
    { color: "#FF0000", name: "Red" },
    { color: "#00FF00", name: "Green" },
    { color: "#0000FF", name: "Blue" },
    { color: "#FFFF00", name: "Yellow" },

    // Secondary colors
    { color: "#FF00FF", name: "Magenta" },
    { color: "#00FFFF", name: "Cyan" },
    { color: "#FFA500", name: "Orange" },
    { color: "#800080", name: "Purple" },
    { color: "#008000", name: "Dark Green" },
    { color: "#000080", name: "Navy" },

    // Neutral colors
    { color: "#808080", name: "Gray" },
    { color: "#C0C0C0", name: "Silver" },
    { color: "#FFC0CB", name: "Pink" },
    { color: "#A52A2A", name: "Brown" },
    { color: "#808000", name: "Olive" },
    { color: "#800000", name: "Maroon" },

    // Additional modern colors
    { color: "#FF6B6B", name: "Coral" },
    { color: "#4ECDC4", name: "Teal" },
    { color: "#45B7D1", name: "Sky Blue" },
    { color: "#96CEB4", name: "Mint" },
    { color: "#FFEAA7", name: "Light Yellow" },
    { color: "#DDA0DD", name: "Plum" },
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

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow typing without validation for better UX
    setSelectedColor(value);
    // Only update if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleHexInputBlur = () => {
    // Validate and fix hex color on blur
    if (!/^#[0-9A-Fa-f]{6}$/.test(selectedColor)) {
      const fixedColor = color; // Revert to previous valid color
      setSelectedColor(fixedColor);
    } else {
      onChange(selectedColor);
    }
  };

  return (
    <div className="modern-color-picker">
      <div className="color-picker-header">
        <div className="header-content">
          <Palette size={20} className="header-icon" />
          <h3>Choose Color</h3>
        </div>
        <button onClick={onClose} className="close-btn">
          <X size={18} />
        </button>
      </div>

      <div className="color-picker-content">
        {/* Current Color Display */}
        <div className="current-color-section">
          <label className="section-label">Selected Color</label>
          <div className="current-color-display">
            <div className="color-preview-large">
              <div
                className="color-preview-circle"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="color-info">
                <span className="color-hex">{selectedColor}</span>
                <span className="color-label">Active Color</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Color Input */}
        <div className="custom-color-section">
          <label className="section-label">Custom Color</label>
          <div className="custom-color-input">
            <div className="color-input-group">
              <input
                type="color"
                value={selectedColor}
                onChange={handleCustomColorChange}
                className="color-picker-input"
                title="Choose custom color"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                placeholder="#000000"
                className="hex-input"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Predefined Colors */}
        <div className="predefined-colors-section">
          <label className="section-label">Color Palette</label>
          <div className="color-grid">
            {predefinedColors.map((colorOption) => (
              <button
                key={colorOption.color}
                className={`color-option ${
                  selectedColor === colorOption.color ? "selected" : ""
                }`}
                style={{ backgroundColor: colorOption.color }}
                onClick={() => handleColorSelect(colorOption.color)}
                title={colorOption.name}
              >
                {selectedColor === colorOption.color && (
                  <Check size={12} className="check-icon" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="color-picker-footer">
        <button onClick={onClose} className="close-button">
          Done
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
