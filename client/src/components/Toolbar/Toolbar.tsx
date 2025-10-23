import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  undo,
  redo,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
} from "../../store/slices/canvasSlice";
import {
  Undo,
  Redo,
  Download,
  Type,
  Square,
  Circle,
  Image,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import ImageDialog from "../ImageDialog/ImageDialog";

interface ToolbarProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddImage: (imageUrl: string) => void;
  onExport: () => void;
  onDelete?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddImage,
  onExport,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const { selectedObjectIds, history, historyIndex } = useSelector(
    (state: RootState) => state.canvas
  );
  const { currentDesign } = useSelector((state: RootState) => state.designs);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      dispatch(undo());
      toast.success("Undo");
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      dispatch(redo());
      toast.success("Redo");
    }
  };

  const handleBringToFront = () => {
    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach((id) => dispatch(bringToFront(id)));
      toast.success("Brought to front");
    }
  };

  const handleSendToBack = () => {
    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach((id) => dispatch(sendToBack(id)));
      toast.success("Sent to back");
    }
  };

  const handleBringForward = () => {
    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach((id) => dispatch(bringForward(id)));
      toast.success("Brought forward");
    }
  };

  const handleSendBackward = () => {
    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach((id) => dispatch(sendBackward(id)));
      toast.success("Sent backward");
    }
  };

  const handleAddImage = (imageUrl: string) => {
    onAddImage(imageUrl);
    setShowImageDialog(false);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3 className="design-name">
          {currentDesign?.name || "Untitled Design"}
        </h3>
      </div>

      <div className="toolbar-section">
        <div className="tool-group">
          <button className="tool-button" onClick={onAddText} title="Add Text">
            <Type size={20} />
            <span>Text</span>
          </button>

          <button
            className="tool-button"
            onClick={onAddRectangle}
            title="Add Rectangle"
          >
            <Square size={20} />
            <span>Rectangle</span>
          </button>

          <button
            className="tool-button"
            onClick={onAddCircle}
            title="Add Circle"
          >
            <Circle size={20} />
            <span>Circle</span>
          </button>

          <button
            className="tool-button"
            onClick={() => setShowImageDialog(true)}
            title="Add Image"
          >
            <Image size={20} />
            <span>Image</span>
          </button>

          {onDelete && (
            <button
              className="tool-button delete-button"
              onClick={onDelete}
              title="Delete Selected (Del)"
            >
              <Trash2 size={20} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="toolbar-section">
        <div className="tool-group">
          <button
            className="tool-button"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo size={20} />
            <span>Undo</span>
          </button>

          <button
            className="tool-button"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo size={20} />
            <span>Redo</span>
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="tool-group">
          <button
            className="tool-button"
            onClick={handleBringToFront}
            disabled={selectedObjectIds.length === 0}
            title="Bring to Front"
          >
            <ArrowUp size={20} />
          </button>

          <button
            className="tool-button"
            onClick={handleBringForward}
            disabled={selectedObjectIds.length === 0}
            title="Bring Forward"
          >
            <ArrowUp size={16} />
            <span style={{ fontSize: "10px" }}>1</span>
          </button>

          <button
            className="tool-button"
            onClick={handleSendBackward}
            disabled={selectedObjectIds.length === 0}
            title="Send Backward"
          >
            <ArrowDown size={16} />
            <span style={{ fontSize: "10px" }}>1</span>
          </button>

          <button
            className="tool-button"
            onClick={handleSendToBack}
            disabled={selectedObjectIds.length === 0}
            title="Send to Back"
          >
            <ArrowDown size={20} />
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="tool-group">
          <button
            className="tool-button"
            onClick={onExport}
            title="Export as PNG"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Image Dialog */}
      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onAddImage={handleAddImage}
      />
    </div>
  );
};

export default Toolbar;
