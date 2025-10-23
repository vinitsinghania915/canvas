import React, { useState } from "react";
import { X, Upload, Link, AlertCircle } from "lucide-react";

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (imageUrl: string) => void;
}

const ImageDialog: React.FC<ImageDialogProps> = ({
  isOpen,
  onClose,
  onAddImage,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Test if the image URL is valid
      const img = new Image();
      img.onload = () => {
        onAddImage(imageUrl);
        setImageUrl("");
        onClose();
        setIsLoading(false);
      };
      img.onerror = () => {
        setError("Invalid image URL. Please check the URL and try again.");
        setIsLoading(false);
      };
      img.src = imageUrl;
    } catch (err) {
      setError("Invalid image URL. Please check the URL and try again.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setImageUrl("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="image-dialog-overlay">
      <div className="image-dialog">
        <div className="image-dialog-header">
          <div className="image-dialog-title">
            <Upload size={20} />
            <h3>Add Image</h3>
          </div>
          <button onClick={handleClose} className="image-dialog-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="image-dialog-content">
          <div className="image-dialog-input-group">
            <label htmlFor="imageUrl" className="image-dialog-label">
              <Link size={16} />
              Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="image-dialog-input"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <div className="image-dialog-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="image-dialog-help">
            <p>Supported formats: JPG, PNG, GIF, WebP</p>
            <p>Make sure the image URL is publicly accessible</p>
          </div>
        </form>

        <div className="image-dialog-footer">
          <button
            type="button"
            onClick={handleClose}
            className="image-dialog-btn image-dialog-btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="image-dialog-btn image-dialog-btn-primary"
            disabled={!imageUrl.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="image-dialog-spinner" />
                Loading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Add Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageDialog;
