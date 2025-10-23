import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { LogOut, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="logo">
              <span className="logo-icon">🎨</span>
              Canvas Editor
            </h1>
          </div>

          <div className="header-right">
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user?.username}</span>
              </div>

              <div className="user-actions">
                <button className="header-btn" title="Settings">
                  <Settings size={20} />
                </button>
                <button
                  onClick={handleLogout}
                  className="header-btn logout-btn"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="layout-main">{children}</main>
    </div>
  );
};

export default Layout;
