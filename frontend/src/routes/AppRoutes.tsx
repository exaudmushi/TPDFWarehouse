import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import AuthGuard from '@/auth/AuthGuard';
import RouteErrorBoundary from '@/components/error-boundaries/RouteErrorBoundary';

const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));
const ErrorLayout = lazy(() => import('@/layouts/ErrorLayout'));

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const Error404Page = lazy(() => import('@/pages/error/Error404Page'));
const Error500Page = lazy(() => import('@/pages/error/Error500Pge'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const WeeklyReportPage = lazy(() => import('@/pages/reports/WeeklyReportPage'));
const MonthlyReportPage = lazy(() => import('@/pages/reports/MonthlyReportPage'));
const ConcodanceReportPage = lazy(() => import('@/pages/reports/ConcodanceReportPage'));
const TPDFwarehousePage = lazy(() => import('@/pages/datapipelines/tpdfwarehousePage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

const AppRoutes = () => {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={baseUrl}>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <RouteErrorBoundary routeName="Dashboard">
                  <DashboardPage />
                </RouteErrorBoundary>
              }
            />
            
            <Route path="reports/weeklyreport" element={<WeeklyReportPage />} />
            <Route path="reports/monthlyreport" element={<MonthlyReportPage />} />
            <Route path="reports/concodancereport" element={<ConcodanceReportPage />} />
            <Route path="datapipelines/tpdfwarehouse" element={<TPDFwarehousePage />
} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route element={<ErrorLayout />}>
          <Route path="error/404" element={<Error404Page />} />
          <Route path="error/500" element={<Error500Page />} />
        </Route>
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
