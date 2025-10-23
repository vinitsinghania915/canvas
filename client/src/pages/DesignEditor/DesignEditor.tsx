import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchDesign, updateDesign } from "../../store/slices/designSlice";
import { setObjects, setCanvas } from "../../store/slices/canvasSlice";
import {
  fetchComments,
  createComment,
  addComment,
  updateCommentInState,
  removeComment,
} from "../../store/slices/commentSlice";
import { socketService } from "../../services/socket";
import Canvas, { CanvasRef } from "../../components/Canvas/Canvas";
import Toolbar from "../../components/Toolbar/Toolbar";
import LayersPanel from "../../components/LayersPanel/LayersPanel";
import PropertiesPanel from "../../components/PropertiesPanel/PropertiesPanel";
import CommentsPanel from "../../components/CommentsPanel/CommentsPanel";
import CommentOverlay from "../../components/CommentOverlay/CommentOverlay";
import CommentDialog from "../../components/CommentDialog/CommentDialog";
import toast from "react-hot-toast";

const DesignEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const canvasRef = useRef<CanvasRef>(null);

  const { currentDesign, isLoading, error } = useSelector(
    (state: RootState) => state.designs
  );
  const { token } = useSelector((state: RootState) => state.auth);
  const { objects, canvas } = useSelector((state: RootState) => state.canvas);

  const [activePanel, setActivePanel] = useState<
    "layers" | "properties" | "comments"
  >("layers");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (id && token) {
      dispatch(fetchDesign(id));
      dispatch(fetchComments(id));

      // Connect to socket for real-time collaboration
      socketService.connect(token);
      socketService.joinDesign(id);
    }

    return () => {
      if (id) {
        socketService.leaveDesign(id);
      }
    };
  }, [id, token, dispatch]);

  // Socket.io event handlers for real-time updates
  useEffect(() => {
    if (!id || !token) return;

    const handleCommentAdded = (data: any) => {
      if (data.userId !== socketService.getSocket()?.user?.userId) {
        // Add the new comment to Redux state
        dispatch(addComment(data.comment));
      }
    };

    const handleCommentUpdated = (data: any) => {
      if (data.userId !== socketService.getSocket()?.user?.userId) {
        // Update the comment in Redux state
        dispatch(updateCommentInState(data.comment));
      }
    };

    const handleCommentDeleted = (data: any) => {
      if (data.userId !== socketService.getSocket()?.user?.userId) {
        // Remove the comment from Redux state
        dispatch(removeComment(data.commentId));
      }
    };

    socketService.on("comment-added", handleCommentAdded);
    socketService.on("comment-updated", handleCommentUpdated);
    socketService.on("comment-deleted", handleCommentDeleted);

    return () => {
      socketService.off("comment-added", handleCommentAdded);
      socketService.off("comment-updated", handleCommentUpdated);
      socketService.off("comment-deleted", handleCommentDeleted);
    };
  }, [id, token, dispatch]);

  // Load design data into canvas
  useEffect(() => {
    if (currentDesign) {
      dispatch(setObjects(currentDesign.objects));
      dispatch(setCanvas(currentDesign.canvas));
    }
  }, [currentDesign, dispatch]);

  // Auto-save functionality (silent - no toasts)
  useEffect(() => {
    if (!hasUnsavedChanges || !currentDesign) return;

    const autoSaveTimer = setTimeout(() => {
      handleSilentSave();
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [objects, hasUnsavedChanges]);

  // Track changes for auto-save (only when objects actually change, not on initial load)
  useEffect(() => {
    if (
      currentDesign &&
      objects.length > 0 &&
      currentDesign.objects.length > 0
    ) {
      // Only mark as changed if the objects are different from the current design
      const currentObjectsString = JSON.stringify(currentDesign.objects);
      const newObjectsString = JSON.stringify(objects);

      if (currentObjectsString !== newObjectsString) {
        setHasUnsavedChanges(true);
      }
    }
  }, [objects, currentDesign]);

  const handleSave = async () => {
    if (!currentDesign || !id) return;

    setIsSaving(true);
    try {
      await dispatch(
        updateDesign({
          id,
          updates: {
            objects,
            canvas,
          },
        })
      ).unwrap();

      setHasUnsavedChanges(false);
      toast.success("Design saved");
    } catch (error) {
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSilentSave = async () => {
    if (!currentDesign || !id) return;

    try {
      await dispatch(
        updateDesign({
          id,
          updates: {
            objects,
            canvas,
          },
        })
      ).unwrap();

      setHasUnsavedChanges(false);
      // No toast for silent save
    } catch (error) {
      console.error("Silent save error:", error);
      // No toast for silent save errors either
    }
  };

  const handleAddText = () => {
    if (canvasRef.current) {
      canvasRef.current.addText("New Text", {
        fontSize: 24,
        fontFamily: "Arial",
        fill: "#000000",
      });
    }
  };

  const handleAddRectangle = () => {
    if (canvasRef.current) {
      canvasRef.current.addRectangle({
        fill: "#ff0000",
        stroke: "#000000",
        strokeWidth: 1,
      });
    }
  };

  const handleAddCircle = () => {
    if (canvasRef.current) {
      canvasRef.current.addCircle({
        fill: "#00ff00",
        stroke: "#000000",
        strokeWidth: 1,
      });
    }
  };

  const handleAddImage = (imageUrl: string) => {
    if (canvasRef.current) {
      canvasRef.current.addImage(imageUrl);
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      canvasRef.current.exportAsPNG();
    }
  };

  const handleBackToDesigns = () => {
    navigate("/designs");
  };

  const handleCommentClick = (
    commentId: string,
    position: { x: number; y: number }
  ) => {
    setSelectedComment(commentId);
    setActivePanel("comments");
  };

  const handleCanvasClick = (position: { x: number; y: number }) => {
    setCommentPosition(position);
    setShowCommentDialog(true);
  };

  const handleAddComment = async (commentData: {
    content: string;
    position: { x: number; y: number };
    mentions: string[];
  }) => {
    try {
      await dispatch(
        createComment({
          designId: id!,
          commentData,
        })
      ).unwrap();

      toast.success("Comment added");
      setShowCommentDialog(false);
    } catch (error) {
      toast.error("Failed to add comment");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="design-editor loading">
        <div className="loading-spinner">Loading design...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="design-editor error">
        <div className="error-message">
          <h2>Error loading design</h2>
          <p>{error}</p>
          <button onClick={handleBackToDesigns} className="btn-primary">
            Back to Designs
          </button>
        </div>
      </div>
    );
  }

  if (!currentDesign) {
    return (
      <div className="design-editor not-found">
        <div className="not-found-message">
          <h2>Design not found</h2>
          <p>
            The design you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <button onClick={handleBackToDesigns} className="btn-primary">
            Back to Designs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="design-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <button onClick={handleBackToDesigns} className="back-btn">
            ← Back to Designs
          </button>
          <h1>{currentDesign.name}</h1>
          {isSaving && <span className="saving-indicator">Saving...</span>}
          {hasUnsavedChanges && !isSaving && (
            <span className="unsaved-indicator">Unsaved changes</span>
          )}
        </div>
        <div className="header-right">
          <button onClick={handleSave} className="save-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        onAddText={handleAddText}
        onAddRectangle={handleAddRectangle}
        onAddCircle={handleAddCircle}
        onAddImage={handleAddImage}
        onExport={handleExport}
        onDelete={() => canvasRef.current?.deleteSelected()}
      />

      {/* Main Content */}
      <div className="editor-content">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="panel-tabs">
            <button
              className={`panel-tab ${
                activePanel === "layers" ? "active" : ""
              }`}
              onClick={() => setActivePanel("layers")}
            >
              Layers
            </button>
            <button
              className={`panel-tab ${
                activePanel === "properties" ? "active" : ""
              }`}
              onClick={() => setActivePanel("properties")}
            >
              Properties
            </button>
            <button
              className={`panel-tab ${
                activePanel === "comments" ? "active" : ""
              }`}
              onClick={() => setActivePanel("comments")}
            >
              Comments
            </button>
          </div>

          <div className="panel-content">
            {activePanel === "layers" && <LayersPanel />}
            {activePanel === "properties" && (
              <PropertiesPanel canvasRef={canvasRef} />
            )}
            {activePanel === "comments" && <CommentsPanel designId={id!} />}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="canvas-area">
          <div className="canvas-container">
            <Canvas
              ref={canvasRef}
              designId={id}
              onCanvasClick={handleCanvasClick}
            />
            {id && (
              <CommentOverlay
                designId={id}
                onCommentClick={handleCommentClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Comment Dialog */}
      <CommentDialog
        isOpen={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onAddComment={handleAddComment}
        position={commentPosition}
        users={[]} // TODO: Pass actual users from props or state
      />
    </div>
  );
};

export default DesignEditor;
