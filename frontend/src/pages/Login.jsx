import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      {/* ==================================================
          LEFT / BRAND SECTION
      ================================================== */}

      <section className="login-brand-panel">

        <div className="login-brand-content">

          <div className="login-brand-logo">
            EM
          </div>

          <span className="login-eyebrow">
            EMPLOYEE MANAGEMENT SYSTEM
          </span>

          <h1>
            Manage your
            <span> workforce smarter.</span>
          </h1>

          <p>
            A centralized management portal for employees,
            departments, attendance and payroll.
          </p>

          {/* ----------------------------------------------
              LOGIN ROLES
          ---------------------------------------------- */}

          <div className="login-access">

            <div className="login-access-heading">
              <span>ACCESS PORTAL</span>
              <strong>Who can sign in?</strong>
            </div>

            <div className="login-role-list">

              <div className="login-role">
                <div className="login-role-icon">
                  A
                </div>

                <div>
                  <strong>ADMIN</strong>
                  <span>
                    Full system management access
                  </span>
                </div>
              </div>

              <div className="login-role">
                <div className="login-role-icon">
                  H
                </div>

                <div>
                  <strong>HR</strong>
                  <span>
                    Manage employees and HR operations
                  </span>
                </div>
              </div>

              <div className="login-role">
                <div className="login-role-icon">
                  E
                </div>

                <div>
                  <strong>EMPLOYEE</strong>
                  <span>
                    Access your employee portal
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          LOGIN FORM
      ================================================== */}

      <section className="login-form-panel">

        <div className="login-card">

          <div className="login-card-header">

            <div className="mobile-login-logo">
              EM
            </div>

            <span className="login-form-eyebrow">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your credentials to continue
              to the management portal.
            </p>

          </div>


          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              <span className="login-error-icon">
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          )}


          {/* ==================================================
              FORM
          ================================================== */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* USERNAME */}

            <div className="login-form-group">

              <label htmlFor="username">
                Username
              </label>

              <div className="login-input-wrapper">

                <span
                  className="login-input-icon"
                  aria-hidden="true"
                >
                  ◉
                </span>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <span
                  className="login-input-icon"
                  aria-hidden="true"
                >
                  ●
                </span>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <span className="login-button-arrow">
                    →
                  </span>
                </>
              )}
            </button>

          </form>


          {/* ==================================================
              SECURITY NOTE
          ================================================== */}

          <div className="login-security">

            <span className="security-icon">
              ✓
            </span>

            <div>
              <strong>
                Secure authentication
              </strong>

              <span>
                Your session is protected using
                JWT authentication.
              </span>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;