import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  addReply,
} from "../../store/slices/commentSlice";
import {
  MessageCircle,
  Plus,
  Send,
  Reply,
  Trash2,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import CommentDialog from "../CommentDialog/CommentDialog";

interface CommentsPanelProps {
  designId: string;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ designId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, isLoading } = useSelector(
    (state: RootState) => state.comments
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (designId) {
      dispatch(fetchComments(designId));
    }
  }, [designId, dispatch]);

  const handleAddComment = async (commentData: {
    content: string;
    position: { x: number; y: number };
    mentions: string[];
  }) => {
    try {
      await dispatch(
        createComment({
          designId,
          commentData,
        })
      ).unwrap();

      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
      throw error; // Re-throw to let dialog handle the error
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    try {
      await dispatch(
        addReply({
          id: commentId,
          content: replyText,
        })
      ).unwrap();

      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply added");
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await dispatch(deleteComment(commentId)).unwrap();
        toast.success("Comment deleted");
      } catch (error) {
        toast.error("Failed to delete comment");
      }
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await dispatch(
        updateComment({
          id: commentId,
          updates: { isResolved: true },
        })
      ).unwrap();
      toast.success("Comment resolved");
    } catch (error) {
      toast.error("Failed to resolve comment");
    }
  };

  const formatCommentText = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    return text.replace(mentionRegex, '<span class="mention">@$1</span>');
  };

  if (isLoading) {
    return (
      <div className="comments-panel">
        <div className="panel-header">
          <h3>Comments</h3>
        </div>
        <div className="loading">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="comments-panel">
      <div className="panel-header">
        <h3>Comments</h3>
        <button
          onClick={() => setShowCommentDialog(true)}
          className="add-comment-btn"
          title="Add Comment"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to add a comment</p>
          </div>
        ) : (
          comments.map((comment) => {
            if (!comment) return null;

            return (
              <div
                key={comment._id}
                className={`comment ${comment.isResolved ? "resolved" : ""}`}
              >
                <div className="comment-header">
                  <div className="comment-author">
                    <div className="author-avatar">
                      {comment.author?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="author-info">
                      <span className="author-name">
                        {comment.author?.username || "Unknown User"}
                      </span>
                      <span className="comment-time">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString()
                          : "Unknown Date"}
                      </span>
                    </div>
                  </div>
                  <div className="comment-actions">
                    {!comment.isResolved && comment.author?.id === user?.id && (
                      <button
                        onClick={() => handleResolveComment(comment._id)}
                        className="action-btn resolve"
                        title="Mark as resolved"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {comment.author?.id === user?.id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="action-btn delete"
                        title="Delete comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="comment-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatCommentText(comment.content || ""),
                    }}
                  />
                  <div className="comment-position">
                    Position: ({comment.position?.x || 0},{" "}
                    {comment.position?.y || 0})
                  </div>
                </div>

                <div className="comment-replies">
                  {comment.replies?.map((reply, index) => {
                    if (!reply) return null;

                    return (
                      <div key={index} className="reply">
                        <div className="reply-author">
                          <div className="author-avatar small">
                            {reply.author?.username?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <span className="author-name">
                            {reply.author?.username || "Unknown User"}
                          </span>
                          <span className="reply-time">
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleDateString()
                              : "Unknown Date"}
                          </span>
                        </div>
                        <div className="reply-content">
                          {reply.content || ""}
                        </div>
                      </div>
                    );
                  })}

                  {replyingTo === comment._id ? (
                    <div className="reply-form">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="reply-textarea"
                        rows={2}
                      />
                      <div className="reply-actions">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddReply(comment._id)}
                          disabled={!replyText.trim()}
                          className="btn-primary"
                        >
                          <Send size={16} />
                          Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(comment._id)}
                      className="reply-btn"
                    >
                      <Reply size={16} />
                      Reply
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comment Dialog */}
      <CommentDialog
        isOpen={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onAddComment={handleAddComment}
        position={{ x: 0, y: 0 }}
        users={[]} // TODO: Pass actual users from props or state
      />
    </div>
  );
};

export default CommentsPanel;
