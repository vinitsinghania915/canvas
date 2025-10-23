import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { getCurrentUser } from "./store/slices/authSlice";
import { Toaster } from "react-hot-toast";

// Styles
import "./components/ImageDialog/ImageDialog.css";
import "./components/CommentDialog/CommentDialog.css";
import "./components/CommentOverlay/CommentOverlay.css";

// Components
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Layout from "./components/Layout/Layout";

// Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import DesignsList from "./pages/DesignsList/DesignsList";
import DesignEditor from "./pages/DesignEditor/DesignEditor";

// Styles
import "./App.css";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Check if user is authenticated on app load
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/designs" replace /> : <Login />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/designs" replace />
              ) : (
                <Register />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/designs"
            element={
              <ProtectedRoute>
                <Layout>
                  <DesignsList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DesignEditor />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/designs" : "/login"} replace />
            }
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/">Go back home</a>
              </div>
            }
          />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;
