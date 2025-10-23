import React, { useState, useEffect, useRef } from "react";
import { X, MessageSquare, AtSign, MapPin, Send } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (commentData: {
    content: string;
    position: { x: number; y: number };
    mentions: string[];
  }) => void;
  position: { x: number; y: number };
  users?: User[];
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  isOpen,
  onClose,
  onAddComment,
  position,
  users = [],
}) => {
  const [content, setContent] = useState("");
  const [commentPosition, setCommentPosition] = useState(position);

  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number>(0);

  useEffect(() => {
    setCommentPosition(position);
  }, [position]);
  // Filter users based on mention query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Handle text change and mention detection
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setError("");

    // Check for @ mentions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        cursorPositionRef.current = cursorPos;
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (username: string) => {
    const cursorPos = cursorPositionRef.current;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    const newContent =
      textBeforeCursor.substring(0, lastAtIndex) +
      `@${username} ` +
      textAfterCursor;

    setContent(newContent);
    setMentions([...mentions, username]);
    setShowMentions(false);
    setMentionQuery("");

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = lastAtIndex + username.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter a comment");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onAddComment({
        content: content.trim(),
        position: commentPosition,
        mentions,
      });

      // Reset form
      setContent("");
      setMentions([]);
      onClose();
    } catch (err) {
      setError("Failed to add comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setContent("");
    setMentions([]);
    setError("");
    setShowMentions(false);
    onClose();
  };

  // Auto-focus textarea when dialog opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="comment-dialog-overlay">
      <div className="comment-dialog">
        <div className="comment-dialog-header">
          <div className="comment-dialog-title">
            <MessageSquare size={20} />
            <h3>Add Comment</h3>
          </div>
          <button onClick={handleClose} className="comment-dialog-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="comment-dialog-content">
          {/* Position Display */}
          <div className="comment-dialog-input-group">
            <label className="comment-dialog-label">
              <MapPin size={16} />
              Comment Position
            </label>
            <div className="comment-dialog-position-display">
              <span>
                X: {commentPosition.x.toFixed(0)}, Y:{" "}
                {commentPosition.y.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Comment Content */}
          <div className="comment-dialog-input-group">
            <label className="comment-dialog-label">
              <MessageSquare size={16} />
              Comment
            </label>
            <div className="comment-dialog-textarea-container">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Type your comment here... Use @ to mention users"
                className="comment-dialog-textarea"
                rows={4}
                disabled={isLoading}
              />

              {/* Mention suggestions */}
              {showMentions && filteredUsers.length > 0 && (
                <div className="comment-dialog-mentions">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleMentionSelect(user.username)}
                      className="comment-dialog-mention-item"
                    >
                      <div className="comment-dialog-mention-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} />
                        ) : (
                          <span>{user.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="comment-dialog-mention-info">
                        <div className="comment-dialog-mention-username">
                          @{user.username}
                        </div>
                        <div className="comment-dialog-mention-email">
                          {user.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="comment-dialog-error">
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="comment-dialog-help">
            <p>💡 Use @username to mention team members</p>
            <p>
              📍 Position is automatically set where you clicked on the canvas
            </p>
          </div>
        </form>

        <div className="comment-dialog-footer">
          <button
            type="button"
            onClick={handleClose}
            className="comment-dialog-btn comment-dialog-btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="comment-dialog-btn comment-dialog-btn-primary"
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="comment-dialog-spinner" />
                Adding...
              </>
            ) : (
              <>
                <Send size={16} />
                Add Comment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentDialog;
