import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context";
import { AdminLayout } from "../layouts";
import {
  LoginPage,
  DashboardPage,
  UsersPage,
  RefereesPage,
  MatchesPage,
  CompetitionsPage,
  TeamsPage,
  VenuesPage,
  SettingsPage,
} from "../pages";

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
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
    return <Navigate to='/admin/dashboard' replace />;
  }

  return children;
};

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

        {/* Admin routes */}
        <Route
          path='/admin'
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to='/admin/dashboard' replace />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='users' element={<UsersPage />} />
          <Route path='referees' element={<RefereesPage />} />
          <Route path='matches' element={<MatchesPage />} />
          <Route path='competitions' element={<CompetitionsPage />} />
          <Route path='teams' element={<TeamsPage />} />
          <Route path='venues' element={<VenuesPage />} />
          <Route path='settings' element={<SettingsPage />} />
        </Route>

        {/* Default redirects */}
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route
          path='/dashboard'
          element={<Navigate to='/admin/dashboard' replace />}
        />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
