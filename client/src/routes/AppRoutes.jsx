import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context";
import { LoginPage } from "../pages";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
};

// Placeholder Dashboard component
const Dashboard = () => (
  <div
    style={{
      padding: "40px",
      color: "white",
      textAlign: "center",
      minHeight: "100vh",
      background: "#0a0a0b",
    }}
  >
    <h1>Dashboard</h1>
    <p>Dobrodošli! Ova stranica će biti implementirana uskoro.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path='/login'
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
