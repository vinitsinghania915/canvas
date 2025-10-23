export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface CanvasObject {
  id: string;
  type: "text" | "image" | "rectangle" | "circle";
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
  name?: string; // Custom name for the layer
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  // Image properties
  src?: string;
  // Shape properties
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
  radius?: number; // For circles
}

export interface Canvas {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface Design {
  _id: string;
  name: string;
  description?: string;
  canvas: Canvas;
  objects: CanvasObject[];
  thumbnail: string;
  owner: User;
  collaborators: Array<{
    user: User;
    role: "viewer" | "editor";
  }>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  design: string;
  author: User;
  content: string;
  position: {
    x: number;
    y: number;
  };
  mentions: User[];
  replies: Array<{
    author: User;
    content: string;
    createdAt: string;
  }>;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
  designs: Design[];
  design: Design;
  comment: Comment;
  user: User;
  token: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  details: string;
}

export interface CanvasState {
  objects: CanvasObject[];
  selectedObjectIds: string[];
  canvas: Canvas;
  history: CanvasObject[][];
  historyIndex: number;
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DesignState {
  designs: Design[];
  currentDesign: Design | null;
  isLoading: boolean;
  error: string | null;
}

export interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export interface CollaborationState {
  connectedUsers: Array<{
    userId: string;
    username: string;
    avatar: string;
    cursor?: { x: number; y: number };
  }>;
  isConnected: boolean;
}

export interface RootState {
  auth: UserState;
  canvas: CanvasState;
  designs: DesignState;
  comments: CommentState;
  collaboration: CollaborationState;
}
