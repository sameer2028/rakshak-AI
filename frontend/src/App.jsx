import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ROUTES } from './constants/routes';
import ToastContainer from './components/common/ToastContainer';
import useAuthStore from './store/authStore';

// We'll import pages as they are built
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ReviewerPage from './features/reviewer/ReviewerPage';
import CitizenShieldPage from './features/citizen-shield/CitizenShieldPage';
import ScamDetectionPage from './features/scam-detection/ScamDetectionPage';
import FraudNetworkPage from './features/fraud-network/FraudNetworkPage';
import CrimeHeatmapPage from './features/crime-heatmap/CrimeHeatmapPage';
import CounterfeitPage from './features/counterfeit/CounterfeitPage';
import DashboardPage from './features/dashboard/DashboardPage';
import AlertsPage from './features/dashboard/AlertsPage';

// Placeholder components for Phase 3
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <h2 className="text-2xl font-semibold text-gray-400">{title} Module - Coming Soon (Phase 3)</h2>
  </div>
);

const RootRedirect = () => {
  const { user } = useAuthStore();
  if (['police', 'admin'].includes(user?.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <Navigate to={ROUTES.CITIZEN_SHIELD} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.REVIEWER} element={<ReviewerPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected Routes inside AppShell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            
            {/* Dashboard - Police & Admin */}
            <Route element={<ProtectedRoute allowedRoles={['police', 'admin']} />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.ALERTS} element={<AlertsPage />} />
            </Route>

            {/* Citizen Shield - All Roles */}
            <Route path={ROUTES.CITIZEN_SHIELD} element={<CitizenShieldPage />} />

            {/* Scam Detection - Citizen, Police, Admin */}
            <Route element={<ProtectedRoute allowedRoles={['citizen', 'police', 'admin']} />}>
              <Route path={ROUTES.SCAM_DETECTION} element={<ScamDetectionPage />} />
            </Route>

            {/* Fraud Network - Police, Bank, Admin */}
            <Route element={<ProtectedRoute allowedRoles={['police', 'bank', 'admin']} />}>
              <Route path={ROUTES.FRAUD_NETWORK} element={<FraudNetworkPage />} />
            </Route>

            {/* Crime Heatmap - All Roles */}
            <Route path={ROUTES.CRIME_HEATMAP} element={<CrimeHeatmapPage />} />

            {/* Counterfeit Detection - Police, Bank, Admin */}
            <Route element={<ProtectedRoute allowedRoles={['police', 'bank', 'admin']} />}>
              <Route path={ROUTES.COUNTERFEIT} element={<CounterfeitPage />} />
            </Route>

            <Route path={ROUTES.PROFILE} element={<Placeholder title="User Profile" />} />
            
            {/* Default fallback inside app */}
            <Route path="/" element={<RootRedirect />} />
          </Route>
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.REVIEWER} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
