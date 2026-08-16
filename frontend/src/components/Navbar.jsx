import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  const username = user?.username || "User";
  const role = user?.role || "EMPLOYEE";

  const initial =
    username.charAt(0).toUpperCase() || "U";

  const handleMenuClick = () => {
    setProfileOpen(false);

    if (typeof onMenuClick === "function") {
      onMenuClick();
    }
  };

  const handleProfileToggle = () => {
    setProfileOpen((previous) => !previous);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header className="top-navbar">

      {/* ==================================================
          LEFT SIDE
      ================================================== */}

      <div className="navbar-left">

        {/* Menu button
            Sidebar is CLOSED by default.
            Clicking this button tells Dashboard
            to open the sidebar.
        */}
        <button
          type="button"
          className="menu-button"
          onClick={handleMenuClick}
          aria-label="Open navigation menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Page identity */}
        <div className="navbar-title">

          <span className="navbar-title-small">
            EMPLOYEE MANAGEMENT
          </span>

          <strong>
            Management Portal
          </strong>

        </div>

      </div>

      {/* ==================================================
          RIGHT SIDE
      ================================================== */}

      <div className="navbar-actions">

        {/* System status */}

        <div
          className="navbar-status"
          aria-label="System status"
        >
          <span
            className="status-dot"
            aria-hidden="true"
          ></span>

          <span>
            System Online
          </span>
        </div>

        {/* ==================================================
            PROFILE
        ================================================== */}

        <div className="profile-wrapper">

          <button
            type="button"
            className="profile-button"
            onClick={handleProfileToggle}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >

            <div
              className="navbar-avatar"
              aria-hidden="true"
            >
              {initial}
            </div>

            <div className="navbar-user-info">

              <strong>
                {username}
              </strong>

              <span>
                {role}
              </span>

            </div>

            <span
              className={`profile-arrow ${
                profileOpen ? "open" : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>

          </button>

          {/* ==================================================
              PROFILE DROPDOWN
          ================================================== */}

          {profileOpen && (
            <div className="profile-dropdown">

              <div className="dropdown-user">

                <div
                  className="dropdown-avatar"
                  aria-hidden="true"
                >
                  {initial}
                </div>

                <div className="dropdown-user-info">

                  <strong>
                    {username}
                  </strong>

                  <span>
                    {role}
                  </span>

                </div>

              </div>

              <div className="dropdown-divider"></div>

              <button
                type="button"
                className="dropdown-logout"
                onClick={handleLogout}
              >
                <span aria-hidden="true">
                  ↪
                </span>

                <span>
                  Sign out
                </span>
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;