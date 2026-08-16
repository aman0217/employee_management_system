import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function HRManagement() {
  /* =====================================================
     AUTH
  ===================================================== */

  const { user } = useAuth();

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "ROLE_ADMIN";

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =====================================================
     DATA
  ===================================================== */

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =====================================================
     SEARCH / ALERTS
  ===================================================== */

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     MODALS
  ===================================================== */

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* =====================================================
     FORM
  ===================================================== */

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  /* =====================================================
     LOAD USERS
  ===================================================== */

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  /* =====================================================
     GET ALL USERS
     Current backend:
     GET /api/users
  ===================================================== */

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("User loading failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     ONLY HR USERS
  ===================================================== */

  const hrUsers = useMemo(() => {
    return users.filter(
      (item) =>
        item.role === "HR" ||
        item.role === "ROLE_HR"
    );
  }, [users]);

  /* =====================================================
     SEARCH HR
  ===================================================== */

  const filteredHRUsers = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return hrUsers;
    }

    return hrUsers.filter((hr) => {
      const fullName =
        `${hr.firstName || ""} ${
          hr.lastName || ""
        }`.toLowerCase();

      return (
        fullName.includes(keyword) ||
        (hr.username || "")
          .toLowerCase()
          .includes(keyword) ||
        (hr.email || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [hrUsers, search]);

  /* =====================================================
     FORM INPUT
  ===================================================== */

  const handleInput = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    });
  };

  /* =====================================================
     OPEN ADD HR MODAL
  ===================================================== */

  const openAddModal = () => {
    resetForm();

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  /* =====================================================
     CREATE HR
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* -----------------------------------------------
       VALIDATION
    ----------------------------------------------- */

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.password) {
      setError("Password is required.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setSaving(true);

      /* -----------------------------------------------
         CREATE HR PAYLOAD
      ----------------------------------------------- */

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "HR",
      };

      await api.post(
        "/users/create",
        payload
      );

      /* -----------------------------------------------
         REFRESH USERS
      ----------------------------------------------- */

      await loadUsers();

      /* -----------------------------------------------
         CLOSE MODAL
      ----------------------------------------------- */

      setShowModal(false);
      resetForm();

      setSuccess(
        "HR account created successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      console.error(
        "HR creation failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create HR account."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE HR
  ===================================================== */

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/users/${deleteId}`
      );

      setUsers((previous) =>
        previous.filter(
          (item) => item.id !== deleteId
        )
      );

      setDeleteId(null);

      setSuccess(
        "HR account deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      console.error(
        "HR deletion failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete HR account."
      );

      setDeleteId(null);
    }
  };

  /* =====================================================
     SIDEBAR CLOSE
  ===================================================== */

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  /* =====================================================
     NON-ADMIN ACCESS
  ===================================================== */

  if (!isAdmin) {
    return (
      <div className="app-layout">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
        />

        <div className="main-area">

          <Navbar
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <main className="departments-content">

            <section className="departments-panel">

              <div className="department-empty">

                <div className="department-empty-icon">
                  !
                </div>

                <h3>
                  Access Denied
                </h3>

                <p>
                  Only an administrator can
                  manage HR accounts.
                </p>

              </div>

            </section>

          </main>

        </div>

      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="app-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="main-area">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="departments-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="departments-header">

            <div>

              <span className="page-eyebrow">
                USER MANAGEMENT
              </span>

              <h1>
                HR Management
              </h1>

              <p>
                Manage HR accounts and access
                across your organization.
              </p>

            </div>

            {/* =============================================
                ADD HR BUTTON
            ============================================== */}

            <button
              type="button"
              className="primary-button"
              onClick={openAddModal}
            >
              <span>＋</span>
              Add HR
            </button>

          </section>

          {/* =================================================
              ERROR ALERT
          ================================================= */}

          {error && (
            <div className="page-alert error-alert">

              <span>
                !
              </span>

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>

            </div>
          )}

          {/* =================================================
              SUCCESS ALERT
          ================================================= */}

          {success && (
            <div className="page-alert success-alert">

              <span>
                ✓
              </span>

              <span>
                {success}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
              >
                ×
              </button>

            </div>
          )}

          {/* =================================================
              SEARCH TOOLBAR
          ================================================= */}

          <section className="department-toolbar">

            <div className="search-box department-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search HR..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <span className="department-count">

              {filteredHRUsers.length}{" "}

              {filteredHRUsers.length === 1
                ? "HR"
                : "HR users"}

            </span>

          </section>

          {/* =================================================
              CONTENT
          ================================================= */}

          {loading ? (

            <section className="departments-panel">

              <div className="table-loading">

                <div className="loading-spinner" />

                <span>
                  Loading HR users...
                </span>

              </div>

            </section>

          ) : filteredHRUsers.length === 0 ? (

            <section className="departments-panel">

              <div className="department-empty">

                <div className="department-empty-icon">
                  👥
                </div>

                <h3>
                  No HR users found
                </h3>

                <p>
                  Add an HR account to start
                  managing your HR team.
                </p>

                <button
                  type="button"
                  className="primary-button small"
                  onClick={openAddModal}
                >
                  ＋ Add HR
                </button>

              </div>

            </section>

          ) : (

            /* =================================================
               HR CARD GRID
               Existing Department CSS reuse
            ================================================= */

            <section className="department-grid">

              {filteredHRUsers.map(
                (hr, index) => {

                  const fullName =
                    `${hr.firstName || ""} ${
                      hr.lastName || ""
                    }`.trim() ||
                    "HR User";

                  const initial =
                    hr.firstName
                      ?.charAt(0)
                      .toUpperCase() ||
                    hr.username
                      ?.charAt(0)
                      .toUpperCase() ||
                    "H";

                  return (
                    <article
                      className="department-card"
                      key={hr.id}
                    >

                      {/* ==================================
                          CARD TOP
                      =================================== */}

                      <div className="department-card-top">

                        <div className="department-icon">
                          {initial}
                        </div>

                        <div className="department-actions">

                          <button
                            type="button"
                            className="delete-button"
                            title="Delete HR"
                            onClick={() =>
                              setDeleteId(
                                hr.id
                              )
                            }
                          >
                            ♲
                          </button>

                        </div>

                      </div>

                      {/* ==================================
                          CARD BODY
                      =================================== */}

                      <div className="department-card-body">

                        <h3>
                          {fullName}
                        </h3>

                        <p>
                          Human Resources
                        </p>

                      </div>

                      {/* ==================================
                          ACCOUNT DETAILS
                      =================================== */}

                      <div className="department-employees">

                        <div className="department-employees-header">

                          <div>

                            <span>
                              ACCOUNT DETAILS
                            </span>

                            <strong>
                              HR
                            </strong>

                          </div>

                        </div>

                        <div className="department-employee-list">

                          {/* USERNAME */}

                          <div className="department-employee">

                            <div className="department-employee-avatar">
                              @
                            </div>

                            <div className="department-employee-info">

                              <strong>
                                {hr.username}
                              </strong>

                              <span>
                                Username
                              </span>

                            </div>

                          </div>

                          {/* EMAIL */}

                          <div className="department-employee">

                            <div className="department-employee-avatar">
                              ✉
                            </div>

                            <div className="department-employee-info">

                              <strong>
                                {hr.email}
                              </strong>

                              <span>
                                Email
                              </span>

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* ==================================
                          CARD FOOTER
                      =================================== */}

                      <div className="department-card-footer">

                        <div>

                          <strong>
                            HR
                          </strong>

                          <span>
                            Role
                          </span>

                        </div>

                        <span className="department-number">

                          #
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </span>

                      </div>

                    </article>
                  );
                }
              )}

            </section>

          )}

        </main>

      </div>

      {/* =================================================
          ADD HR MODAL
      ================================================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >

          {/* IMPORTANT:
              department-modal = existing CSS
          */}

          <div
            className="department-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* =============================================
                MODAL HEADER
            ============================================== */}

            <div className="modal-header">

              <div>

                <span className="modal-eyebrow">
                  USER MANAGEMENT
                </span>

                <h2>
                  Add HR
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* =============================================
                FORM
            ============================================== */}

            <form
              className="department-form"
              onSubmit={handleSubmit}
            >

              {/* FIRST NAME */}

              <div className="field">

                <label>
                  First Name *
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInput}
                  placeholder="Enter first name"
                  required
                />

              </div>

              {/* LAST NAME */}

              <div className="field">

                <label>
                  Last Name *
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInput}
                  placeholder="Enter last name"
                  required
                />

              </div>

              {/* USERNAME */}

              <div className="field">

                <label>
                  Username *
                </label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInput}
                  placeholder="Enter username"
                  minLength="4"
                  maxLength="30"
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="field">

                <label>
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  placeholder="hr@example.com"
                  required
                />

              </div>

              {/* PASSWORD */}

              <div className="field">

                <label>
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInput}
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />

                <small>
                  Password must contain at least
                  6 characters.
                </small>

              </div>

              {/* ROLE */}

              <div className="field">

                <label>
                  Role
                </label>

                <input
                  type="text"
                  value="HR"
                  readOnly
                />

              </div>

              {/* =========================================
                  MODAL FOOTER
              ========================================== */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >

                  {saving
                    ? "Creating..."
                    : "Create HR"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

      {deleteId && (

        <div
          className="modal-overlay"
          onMouseDown={() =>
            setDeleteId(null)
          }
        >

          <div
            className="delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="delete-icon">
              !
            </div>

            <h2>
              Delete HR account?
            </h2>

            <p>
              This action will permanently
              remove this HR account.
            </p>

            <div className="delete-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={handleDelete}
              >
                Delete HR
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default HRManagement;