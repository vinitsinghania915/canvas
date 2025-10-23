import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { MessageCircle, X, Check } from "lucide-react";

interface CommentOverlayProps {
  designId: string;
  onCommentClick: (
    commentId: string,
    position: { x: number; y: number }
  ) => void;
}

const CommentOverlay: React.FC<CommentOverlayProps> = ({
  designId,
  onCommentClick,
}) => {
  const { comments } = useSelector((state: RootState) => state.comments);
  const [hoveredComment, setHoveredComment] = useState<string | null>(null);

  // Filter comments for this design
  const designComments = comments.filter(
    (comment) => comment && comment.design === designId && !comment.isResolved
  );

  const handleCommentClick = (comment: any) => {
    console.log("comment", comment);
    onCommentClick(comment._id, comment.position);
  };

  const handleCommentHover = (commentId: string) => {
    setHoveredComment(commentId);
  };

  const handleCommentLeave = () => {
    setHoveredComment(null);
  };

  return (
    <div className="comment-overlay">
      {designComments.map((comment, index) => {
        if (!comment) return null;

        return (
          <div
            key={`${comment._id}-${index}`}
            className={`comment-marker ${
              hoveredComment === comment._id ? "hovered" : ""
            } ${comment.isResolved ? "resolved" : ""}`}
            style={{
              left: comment.position?.x || 0,
              top: comment.position?.y || 0,
            }}
            onClick={() => handleCommentClick(comment)}
            onMouseEnter={() => handleCommentHover(comment._id)}
            onMouseLeave={handleCommentLeave}
          >
            <div className="comment-marker-icon">
              <MessageCircle size={16} />
            </div>

            {hoveredComment === comment._id && (
              <div className="comment-tooltip">
                <div className="comment-tooltip-header">
                  <div className="comment-author">
                    <div className="author-avatar">
                      {comment.author?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="author-name">
                      {comment.author?.username || "Unknown User"}
                    </span>
                  </div>
                  <div className="comment-time">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleDateString()
                      : "Unknown Date"}
                  </div>
                </div>
                <div className="comment-tooltip-content">
                  {comment.content || "No content"}
                </div>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-tooltip-replies">
                    {comment.replies.length} reply
                    {comment.replies.length !== 1 ? "ies" : ""}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommentOverlay;
