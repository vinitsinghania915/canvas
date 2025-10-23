# Canvas Design Editor

A comprehensive canvas-based design editor similar to Canva/Figma-lite with real-time collaboration, built with React, Node.js, and MongoDB.

## 🎨 Features

### Core Canvas Features

- **Fixed Canvas Size**: 1080×1080px default (customizable)
- **Element Types**: Text, Images, Shapes (Rectangle, Circle)
- **Transformations**: Move, Resize, Rotate with selection handles
- **Layer Management**: Z-index ordering, bring forward/backward, rename/delete layers
- **Undo/Redo**: Full history management for last 10+ actions
- **Export**: PNG export functionality

### Real-time Collaboration

- **Multi-user Editing**: Real-time canvas updates via Socket.io
- **User Presence**: See who's online and their cursors
- **Live Comments**: Position-based comments with @mentions
- **Synchronized Actions**: Undo/redo, selection changes, object modifications

### Design Management

- **CRUD Operations**: Create, read, update, delete designs
- **Design Listing**: View all your designs with metadata
- **Collaboration**: Add/remove collaborators with different roles
- **Persistence**: Save designs to MongoDB

### User Experience

- **Authentication**: JWT-based auth with registration/login
- **Responsive UI**: Modern, clean interface with panels
- **Error Handling**: User-friendly toasts and structured API responses
- **Keyboard Shortcuts**: Efficient workflow shortcuts

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express API    │◄──►│    MongoDB      │
│   (Port 3000)   │    │   (Port 5000)   │    │   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └─────────────►│   Socket.io     │
                        │  Real-time      │
                        │  Collaboration  │
                        └─────────────────┘
```

### Frontend Architecture (React + TypeScript)

**Core Technologies:**

- **React 18** with TypeScript for type safety and modern features
- **Redux Toolkit** for predictable state management with RTK Query
- **Fabric.js** for advanced canvas manipulation and object handling
- **Socket.io Client** for real-time collaboration features
- **React Router v6** for client-side routing
- **React Hot Toast** for user notifications

**State Management:**

```
Redux Store
├── authSlice (user authentication)
├── canvasSlice (canvas state, objects, history)
├── designSlice (design management)
├── commentSlice (comments and mentions)
└── collaborationSlice (real-time collaboration)
```

**Component Architecture:**

```
src/
├── components/
│   ├── Canvas/ (Fabric.js integration)
│   ├── Toolbar/ (design tools)
│   ├── LayersPanel/ (layer management)
│   ├── PropertiesPanel/ (object properties)
│   ├── CommentsPanel/ (comment system)
│   ├── ImageDialog/ (image URL input)
│   └── CommentDialog/ (comment creation)
├── pages/ (route components)
├── store/ (Redux configuration)
├── services/ (API & Socket services)
└── types/ (TypeScript definitions)
```

### Backend Architecture (Node.js + Express)

**Core Technologies:**

- **Express.js** REST API with comprehensive middleware
- **MongoDB** with Mongoose ODM for data persistence
- **Socket.io** for real-time bidirectional communication
- **JWT Authentication** with bcrypt for secure password hashing
- **Zod Validation** for runtime type checking and validation

**API Structure:**

```
server/
├── models/ (Mongoose schemas)
├── routes/ (REST API endpoints)
├── middleware/ (auth, error handling)
├── validation/ (Zod schemas)
├── socket/ (real-time event handlers)
└── config/ (database configuration)
```

### Database Schema Design

**User Model:**

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

**Design Model:**

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  createdBy: ObjectId (ref: User),
  canvas: {
    width: Number (default: 1080),
    height: Number (default: 1080),
    backgroundColor: String (default: "#ffffff")
  },
  objects: [CanvasObject],
  thumbnail: String (base64 or URL),
  collaborators: [ObjectId (ref: User)],
  createdAt: Date,
  updatedAt: Date
}
```

**Comment Model:**

```javascript
{
  _id: ObjectId,
  design: ObjectId (ref: Design),
  author: ObjectId (ref: User),
  content: String (required, max: 1000),
  position: {
    x: Number (required),
    y: Number (required)
  },
  mentions: [ObjectId (ref: User)],
  replies: [{
    author: ObjectId (ref: User),
    content: String,
    createdAt: Date
  }],
  isResolved: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**CanvasObject Type:**

```typescript
interface CanvasObject {
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
  name?: string;
  // Type-specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  src?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
  radius?: number;
}
```

### Real-time Collaboration Architecture

**Socket.io Events:**

- `join-design` - User joins a design session
- `leave-design` - User leaves a design session
- `canvas-updated` - Canvas objects changed
- `selection-changed` - User selection changed
- `comment-added` - New comment added
- `user-joined` - User joined the session
- `user-left` - User left the session

**Collaboration Flow:**

1. User joins design → Socket emits `join-design`
2. Canvas changes → Debounced `canvas-updated` events
3. Comments added → Real-time `comment-added` events
4. User presence → `user-joined`/`user-left` events

### Testing Architecture

**Unit Tests:**

- **Backend**: Jest + Supertest for API endpoints
- **Frontend**: React Testing Library for components
- **Coverage**: >80% for critical paths

**E2E Tests:**

- **Playwright** for complete user workflows
- **Multi-browser** testing (Chrome, Firefox, Safari)
- **Real-time collaboration** scenarios

**Test Structure:**

```
tests/
├── unit/
│   ├── backend/ (API tests)
│   └── frontend/ (component tests)
├── integration/ (API integration)
└── e2e/ (end-to-end scenarios)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and setup**:

   ```bash
   git clone <repository-url>
   cd canvas
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Create environment file**:
   Create `server/.env` with:

   ```env
   MONGODB_URI=mongodb://localhost:27017/canvas-editor
   JWT_SECRET=supersecretjwtkeyforcanvaseditor2024
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

3. **Start MongoDB**:

   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Atlas connection string in .env
   ```

4. **Start the application**:

   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
canvas/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── services/      # API and socket services
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── validation/       # Zod schemas
│   └── socket/           # Socket.io handlers
├── e2e/                  # Playwright E2E tests
└── setup.sh             # Setup script
```

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# E2E tests
cd e2e && npm test
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Design Endpoints

#### Get User's Designs

```http
GET /api/designs
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "designs": [
      {
        "_id": "design_id",
        "name": "My Design",
        "description": "Design description",
        "createdBy": "user_id",
        "canvas": {
          "width": 1080,
          "height": 1080,
          "backgroundColor": "#ffffff"
        },
        "objects": [],
        "thumbnail": "base64_string",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Create New Design

```http
POST /api/designs
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Design",
  "description": "Design description",
  "canvas": {
    "width": 1080,
    "height": 1080,
    "backgroundColor": "#ffffff"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "design": {
      "_id": "design_id",
      "name": "New Design",
      "description": "Design description",
      "createdBy": "user_id",
      "canvas": {
        "width": 1080,
        "height": 1080,
        "backgroundColor": "#ffffff"
      },
      "objects": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get Specific Design

```http
GET /api/designs/:id
Authorization: Bearer <jwt_token>
```

#### Update Design

```http
PUT /api/designs/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Design",
  "objects": [
    {
      "id": "obj_1",
      "type": "text",
      "left": 100,
      "top": 100,
      "width": 200,
      "height": 50,
      "text": "Hello World",
      "fontSize": 24,
      "fill": "#000000"
    }
  ]
}
```

#### Delete Design

```http
DELETE /api/designs/:id
Authorization: Bearer <jwt_token>
```

### Comment Endpoints

#### Get Design Comments

```http
GET /api/comments/design/:designId
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "comment_id",
        "design": "design_id",
        "author": {
          "_id": "user_id",
          "username": "john_doe"
        },
        "content": "This looks great!",
        "position": {
          "x": 100,
          "y": 200
        },
        "mentions": [],
        "replies": [],
        "isResolved": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Add Comment

```http
POST /api/comments/design/:designId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "This looks great!",
  "position": {
    "x": 100,
    "y": 200
  },
  "mentions": ["user_id_1", "user_id_2"]
}
```

#### Update Comment

```http
PUT /api/comments/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

#### Delete Comment

```http
DELETE /api/comments/:id
Authorization: Bearer <jwt_token>
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

**Common Error Codes:**

- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run test` - Run all tests
- `npm run test:e2e` - Run E2E tests
- `npm run install:all` - Install all dependencies

### Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking
- **Jest** for unit testing

## 🚀 Deployment

### Environment Variables

Set the following environment variables in production:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port
- `NODE_ENV` - Environment (production)
- `CLIENT_URL` - Frontend URL

### Build Commands

```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🚫 What Was Cut and Why

### Features Intentionally Excluded

#### **Advanced Canvas Features**

- **Vector Graphics**: SVG support was cut to focus on core functionality

  - _Why_: Added complexity without significant user value for MVP
  - _Future_: Can be added as extension

- **Advanced Shapes**: Polygon, star, custom shapes

  - _Why_: Rectangle and circle cover 80% of use cases
  - _Future_: Easy to add more shape types

- **Image Filters/Effects**: Blur, brightness, contrast
  - _Why_: Complex to implement properly
  - _Future_: Can integrate with image processing libraries

#### **Collaboration Features**

- **User Roles**: Admin, editor, viewer permissions

  - _Why_: Added complexity for MVP, basic collaboration sufficient
  - _Future_: Can be added with role-based access control

- **Version History**: Design versioning and branching

  - _Why_: Complex to implement with real-time collaboration
  - _Future_: Can add with snapshot-based versioning

- **Live Cursors**: Real-time cursor positions
  - _Why_: Performance overhead, not essential for MVP
  - _Future_: Can add with cursor tracking

#### **Authentication & Security**

- **OAuth Integration**: Google, GitHub login

  - _Why_: Email/password sufficient for MVP
  - _Future_: Can add with Passport.js strategies

- **Two-Factor Authentication**: 2FA support
  - _Why_: Not essential for design tool MVP
  - _Future_: Can add with TOTP libraries

#### **Advanced Comment System**

- **Comment Threading**: Nested comment replies

  - _Why_: Flat replies sufficient for most use cases
  - _Future_: Can add with recursive comment structure

- **Comment Reactions**: Like, emoji reactions
  - _Why_: Not essential for design feedback
  - _Future_: Can add with reaction system

#### **Database Features**

- **Full-Text Search**: Search designs by content

  - _Why_: Not essential for MVP, basic filtering sufficient
  - _Future_: Can add with MongoDB text indexes

- **Design Templates**: Pre-built design templates
  - _Why_: Focus on core editing functionality
  - _Future_: Can add template system

#### **Real-time Features**

- **Voice Chat**: Audio collaboration

  - _Why_: Complex to implement, not essential
  - _Future_: Can integrate with WebRTC

- **Screen Sharing**: Share screen during collaboration
  - _Why_: Beyond scope of design tool
  - _Future_: Can add with screen capture APIs

### Technical Decisions

#### **Why These Cuts Were Made:**

1. **MVP Focus**: Prioritized core functionality over nice-to-haves
2. **Development Speed**: Faster time to market with essential features
3. **User Validation**: Test core concept before adding complexity
4. **Maintainability**: Simpler codebase easier to maintain and debug
5. **Performance**: Fewer features = better performance and reliability


#### **Extension Points:**

The architecture is designed to easily add these features later:

- **Modular Components**: Easy to add new canvas tools
- **Plugin System**: Can add new shape types and filters
- **API Extensibility**: RESTful API supports new endpoints
- **Real-time Architecture**: Socket.io supports new event types

## 🙏 Acknowledgments

- Built with React, Node.js, and MongoDB
- Uses Fabric.js for canvas functionality
- Socket.io for real-time collaboration
- Redux Toolkit for state management
- **AI/Codegen Assistance**: This project was built with AI assistance for rapid development and best practices
# canvas
