import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Employees from "./pages/Employees";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Salary from "./pages/Salary";
import HRManagement from "./pages/HRManagement";

import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==========================================
            LOGIN
        ========================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==========================================
            DASHBOARD
        ========================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            EMPLOYEES
        ========================================== */}

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            DEPARTMENTS
        ========================================== */}

        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <Departments />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            ATTENDANCE
        ========================================== */}

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            SALARY
        ========================================== */}

        <Route
          path="/salary"
          element={
            <ProtectedRoute>
              <Salary />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            HR MANAGEMENT
        ========================================== */}

        <Route
          path="/hr-management"
          element={
            <ProtectedRoute>
              <HRManagement />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            DEFAULT ROUTE
        ========================================== */}

       <Route
         path="/"
         element={
           <Navigate
             to="/login"
             replace
           />
         }
       />

      </Routes>
    </BrowserRouter>
  );
}

export default App;