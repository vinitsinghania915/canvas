import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchDesigns,
  createDesign,
  deleteDesign,
} from "../../store/slices/designSlice";
import { Plus, Trash2, Edit2, Users } from "lucide-react";
import toast from "react-hot-toast";

const DesignsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { designs, isLoading, error } = useSelector(
    (state: RootState) => state.designs
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDesignName, setNewDesignName] = useState("");
  const [newDesignDescription, setNewDesignDescription] = useState("");

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  const handleCreateDesign = async () => {
    if (!newDesignName.trim()) {
      toast.error("Please enter a design name");
      return;
    }

    try {
      const result = await dispatch(
        createDesign({
          name: newDesignName.trim(),
          description: newDesignDescription.trim() || undefined,
        })
      ).unwrap();

      setNewDesignName("");
      setNewDesignDescription("");
      setShowCreateModal(false);

      navigate(`/editor/${result.design._id}`);
      toast.success("Design created successfully");
    } catch (error) {
      toast.error("Failed to create design");
    }
  };

  const handleDeleteDesign = async (designId: string, designName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${designName}"? This action cannot be undone.`
      )
    ) {
      try {
        await dispatch(deleteDesign(designId)).unwrap();
        toast.success("Design deleted successfully");
      } catch (error) {
        toast.error("Failed to delete design");
      }
    }
  };

  const handleEditDesign = (designId: string) => {
    navigate(`/editor/${designId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCollaboratorCount = (design: any) => {
    return design.collaborators?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="designs-list loading">
        <div className="loading-spinner">Loading designs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="designs-list error">
        <div className="error-message">
          <h2>Error loading designs</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="designs-list">
      <div className="designs-header">
        <h1>My Designs</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="create-design-btn"
        >
          <Plus size={20} />
          Create New Design
        </button>
      </div>

      {designs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Edit2 size={64} />
          </div>
          <h2>No designs yet</h2>
          <p>Create your first design to get started</p>
        </div>
      ) : (
        <div
          className="designs-grid"
          style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
        >
          {designs &&
            designs.length > 0 &&
            designs.map((design) => (
              <div key={design._id} className="design-card">
                <div className="design-thumbnail">
                  {design.thumbnail ? (
                    <img src={design.thumbnail} alt={design.name} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <Edit2 size={32} />
                    </div>
                  )}
                  <div className="design-overlay">
                    <button
                      onClick={() => handleEditDesign(design._id)}
                      className="action-btn edit"
                      title="Edit Design"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteDesign(design._id, design.name)
                      }
                      className="action-btn delete"
                      title="Delete Design"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="design-info">
                  <h3 className="design-name">{design.name}</h3>
                  {design.description && (
                    <p className="design-description">{design.description}</p>
                  )}

                  <div className="design-meta">
                    <div className="meta-item">
                      <span className="meta-label">Canvas:</span>
                      <span className="meta-value">
                        {design.canvas.width} × {design.canvas.height}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Objects:</span>
                      <span className="meta-value">
                        {design.objects.length}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Updated:</span>
                      <span className="meta-value">
                        {formatDate(design.updatedAt)}
                      </span>
                    </div>

                    {getCollaboratorCount(design) > 0 && (
                      <div className="meta-item">
                        <Users size={16} />
                        <span className="meta-value">
                          {getCollaboratorCount(design)} collaborator
                          {getCollaboratorCount(design) > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="design-actions">
                    <button
                      onClick={() => handleEditDesign(design._id)}
                      className="btn-primary"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create Design Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal create-design-modal">
            <div className="modal-header">
              <h2>Create New Design</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="designName">Design Name *</label>
                <input
                  id="designName"
                  type="text"
                  value={newDesignName}
                  onChange={(e) => setNewDesignName(e.target.value)}
                  placeholder="Enter design name"
                  className="form-input"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="designDescription">Description</label>
                <textarea
                  id="designDescription"
                  value={newDesignDescription}
                  onChange={(e) => setNewDesignDescription(e.target.value)}
                  placeholder="Enter design description (optional)"
                  className="form-textarea"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label>Canvas Size</label>
                <div className="canvas-size-info">
                  <p>Default: 1080 × 1080 pixels</p>
                  <p className="text-sm text-gray-500">
                    You can change this later in the editor
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDesign}
                disabled={!newDesignName.trim()}
                className="btn-primary"
              >
                <Plus size={16} />
                Create Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignsList;
