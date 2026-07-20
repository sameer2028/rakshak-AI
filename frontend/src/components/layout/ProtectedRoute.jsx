import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../constants/routes';

/**
 * ProtectedRoute - Wraps routes that require authentication.
 * Optionally restricts by role.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}> ... </Route>
 *   <Route element={<ProtectedRoute allowedRoles={['police', 'admin']} />}> ... </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.REVIEWER} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/citizen-shield" replace />;
  }

  return <Outlet />;
}
