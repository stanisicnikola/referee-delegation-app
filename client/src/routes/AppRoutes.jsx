import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context";
import { AdminLayout, DelegateLayout } from "../layouts";
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
import {
  DashboardPage as DelegateDashboard,
  MatchesPage as DelegateMatches,
  DelegationPage,
  RefereesPage as DelegateReferees,
  CompetitionsPage as DelegateCompetitions,
  TeamsPage as DelegateTeams,
} from "../pages/delegate";

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
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === "admin") {
      return <Navigate to='/admin/dashboard' replace />;
    } else if (user?.role === "delegate") {
      return <Navigate to='/delegate/dashboard' replace />;
    }
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

        {/* Delegate routes */}
        <Route
          path='/delegate'
          element={
            <ProtectedRoute allowedRoles={["delegate", "admin"]}>
              <DelegateLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to='/delegate/dashboard' replace />}
          />
          <Route path='dashboard' element={<DelegateDashboard />} />
          <Route path='matches' element={<DelegateMatches />} />
          <Route path='delegation/:matchId' element={<DelegationPage />} />
          <Route path='referees' element={<DelegateReferees />} />
          <Route path='competitions' element={<DelegateCompetitions />} />
          <Route path='teams' element={<DelegateTeams />} />
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
