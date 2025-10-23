import { io, Socket } from "socket.io-client";

interface CustomSocket extends Socket {
  user?: {
    userId: string;
    username: string;
    avatar: string;
  };
}

class SocketService {
  private socket: CustomSocket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;

    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.REACT_APP_API_URL || "http://localhost:5001", {
      auth: {
        token,
      },
      transports: ["websocket"],
    }) as CustomSocket;

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDesign(designId: string) {
    if (this.socket) {
      this.socket.emit("join-design", designId);
    }
  }

  leaveDesign(designId: string) {
    if (this.socket) {
      this.socket.emit("leave-design", designId);
    }
  }

  emitCanvasUpdate(designId: string, objects: any[], canvas: any) {
    if (this.socket) {
      this.socket.emit("canvas-update", {
        designId,
        objects,
        canvas,
      });
    }
  }

  emitSelectionChange(designId: string, selectedObjectIds: string[]) {
    if (this.socket) {
      this.socket.emit("selection-change", {
        designId,
        selectedObjectIds,
      });
    }
  }

  emitCursorMove(designId: string, position: { x: number; y: number }) {
    if (this.socket) {
      this.socket.emit("cursor-move", {
        designId,
        position,
      });
    }
  }

  emitCommentAdded(designId: string, comment: any) {
    if (this.socket) {
      this.socket.emit("comment-added", {
        designId,
        comment,
      });
    }
  }

  emitCommentUpdated(designId: string, comment: any) {
    if (this.socket) {
      this.socket.emit("comment-updated", {
        designId,
        comment,
      });
    }
  }

  emitCommentDeleted(designId: string, commentId: string) {
    if (this.socket) {
      this.socket.emit("comment-deleted", {
        designId,
        commentId,
      });
    }
  }

  emitUndoAction(designId: string) {
    if (this.socket) {
      this.socket.emit("undo-action", { designId });
    }
  }

  emitRedoAction(designId: string) {
    if (this.socket) {
      this.socket.emit("redo-action", { designId });
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
