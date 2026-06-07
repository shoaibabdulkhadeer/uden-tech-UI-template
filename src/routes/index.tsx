import { lazy, Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';

const UnAuthorized  = lazy(() => import('../components/errors/401'));
const Forbidden     = lazy(() => import('../components/errors/403'));
const NotFound      = lazy(() => import('../components/errors/404'));
const LogoutPage    = lazy(() => import('../components/errors/LogoutPage'));
const Runway        = lazy(() => import('../components/features/Auth/Runway'));
const MainApp       = lazy(() => import('../containers/App/MainApp'));
const Learn         = lazy(() => import('../components/features/LearningPath/Learn'));
const Dashboard     = lazy(() => import('../components/features/Dashboard/Dashboard'));
const JobSearch     = lazy(() => import('../components/features/JobSearch/JobSearch'));
const JobManagement = lazy(() => import('../components/features/JobManagement/JobManagement'));
const UserManagement       = lazy(() => import('../components/features/UserManagement/UserManagement'));
const ApplicationTracker   = lazy(() => import('../components/features/ApplicationTracker/ApplicationTracker'));

/* Fallback only for shell-less pages (login, error pages).
   Pages inside MainApp use the Suspense in MainApp.tsx so sidebar+topbar stay visible. */
const ShellLoader = () => (
	<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0f2f5' }}>
		<div style={{ width: 36, height: 36, border: '3px solid #e0e0e0', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
		<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
	</div>
);

const AppRoutes = () => {
	const loginRoutes: RouteObject = {
		path: '/',
		children: [
			{ path: '/', element: <Runway /> },
		]
	};

	const userRoutes: RouteObject = {
		path: '/',
		element: <MainApp />,
		children: [
			{
				path: '/learn',
				element: <PrivateRoutes><Learn /></PrivateRoutes>
			},
			{
				path: '/dashboard',
				element: <Dashboard />
			},
			{
				path: '/job-search',
				element: <PrivateRoutes><JobSearch /></PrivateRoutes>
			},
			{
				path: '/job-management',
				element: <PrivateRoutes><JobManagement /></PrivateRoutes>
			},
			{
				path: '/user-management',
				element: <PrivateRoutes><UserManagement /></PrivateRoutes>
			},
			{
				path: '/application-tracker',
				element: <PrivateRoutes><ApplicationTracker /></PrivateRoutes>
			}
		]
	};

	const errorRoutes: any = {
		path: '/',
		children: [
			{ path: '/401',            element: <UnAuthorized /> },
			{ path: '/403',            element: <Forbidden /> },
			{ path: '/sessionexpired', element: <LogoutPage /> },
			{ path: '*',               element: <NotFound /> },
		]
	};

	const router = useRoutes([loginRoutes, userRoutes, errorRoutes]);
	return <Suspense fallback={<ShellLoader />}>{router}</Suspense>;
};

export default AppRoutes;
