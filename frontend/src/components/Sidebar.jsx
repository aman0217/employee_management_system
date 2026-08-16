import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  /* =====================================================
     USER ROLE
  ===================================================== */

  const role = user?.role || "EMPLOYEE";

  const isAdmin =
    role === "ADMIN" ||
    role === "ROLE_ADMIN";

  const isManagementUser =
    isAdmin ||
    role === "HR" ||
    role === "ROLE_HR";

  /* =====================================================
     USER INFORMATION
  ===================================================== */

  const username =
    user?.username || "User";

  const initial =
    username.charAt(0).toUpperCase() || "U";

  /* =====================================================
     ACTIONS
  ===================================================== */

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleNavigation = () => {
    onClose();
  };

  /* =====================================================
     NAVIGATION LINK CLASS
  ===================================================== */

  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? "nav-link active"
      : "nav-link";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`sidebar ${
          isOpen ? "open" : ""
        }`}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >

        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="sidebar-brand">

          <div
            className="brand-logo"
            aria-hidden="true"
          >
            EM
          </div>

          <div className="brand-text">

            <strong>
              EmployeeMS
            </strong>

            <span>
              Management Portal
            </span>

          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            ×
          </button>

        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            MAIN MENU
          </span>

          <nav
            className="sidebar-nav"
            aria-label="Main menu"
          >

            {/* =================================================
                DASHBOARD
            ================================================= */}

            <NavLink
              to="/dashboard"
              onClick={handleNavigation}
              className={getNavLinkClass}
            >
              <span
                className="nav-icon"
                aria-hidden="true"
              >
                ⌂
              </span>

              <span>
                Dashboard
              </span>
            </NavLink>

            {/* =================================================
                MANAGEMENT MENU
            ================================================= */}

            {isManagementUser && (
              <>

                {/* =================================================
                    EMPLOYEES
                ================================================= */}

                <NavLink
                  to="/employees"
                  onClick={handleNavigation}
                  className={getNavLinkClass}
                >
                  <span
                    className="nav-icon"
                    aria-hidden="true"
                  >
                    ♙
                  </span>

                  <span>
                    Employees
                  </span>
                </NavLink>

                {/* =================================================
                    DEPARTMENTS
                ================================================= */}

                <NavLink
                  to="/departments"
                  onClick={handleNavigation}
                  className={getNavLinkClass}
                >
                  <span
                    className="nav-icon"
                    aria-hidden="true"
                  >
                    ▦
                  </span>

                  <span>
                    Departments
                  </span>
                </NavLink>

                {/* =================================================
                    ATTENDANCE
                ================================================= */}

                <NavLink
                  to="/attendance"
                  onClick={handleNavigation}
                  className={getNavLinkClass}
                >
                  <span
                    className="nav-icon"
                    aria-hidden="true"
                  >
                    ◷
                  </span>

                  <span>
                    Attendance
                  </span>
                </NavLink>

                {/* =================================================
                    SALARY
                ================================================= */}

                <NavLink
                  to="/salary"
                  onClick={handleNavigation}
                  className={getNavLinkClass}
                >
                  <span
                    className="nav-icon"
                    aria-hidden="true"
                  >
                    ₹
                  </span>

                  <span>
                    Salary
                  </span>
                </NavLink>

                {/* =================================================
                    HR MANAGEMENT
                    ONLY ADMIN
                ================================================= */}

                {isAdmin && (
                  <NavLink
                    to="/hr-management"
                    onClick={handleNavigation}
                    className={getNavLinkClass}
                  >
                    <span
                      className="nav-icon"
                      aria-hidden="true"
                    >
                      ♙
                    </span>

                    <span>
                      HR Management
                    </span>
                  </NavLink>
                )}

              </>
            )}

          </nav>

        </div>

        {/* ==================================================
            BOTTOM USER AREA
        ================================================== */}

        <div className="sidebar-bottom">

          {/* USER INFORMATION */}

          <div className="sidebar-user">

            <div
              className="sidebar-avatar"
              aria-hidden="true"
            >
              {initial}
            </div>

            <div className="sidebar-user-details">

              <strong>
                {username}
              </strong>

              <span>
                {role}
              </span>

            </div>

          </div>

          {/* LOGOUT */}

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span aria-hidden="true">
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;