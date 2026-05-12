import { Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import UnAuthorized from '../components/errors/401';
import Forbidden from '../components/errors/403';
import NotFound from '../components/errors/404';
import Login from '../components/features/Auth/Login';
import Runway from '../components/features/Auth/Runway';
import MainApp from '../containers/App/MainApp';
import PrivateRoutes from './PrivateRoutes';
import { RoleGroup } from './Roles';
import Learn from '../components/features/LearningPath/Learn';
import Dashboard from '../components/features/Dashboard/Dashboard';
import JobSearch from '../components/features/JobSearch/JobSearch';
import JobManagement from '../components/features/JobManagement/JobManagement';
import UserManagement from '../components/features/UserManagement/UserManagement';
import LogoutPage from '../components/errors/LogoutPage';

const AppRoutes = () => {
	const loginRoutes: RouteObject = {
		path: '/',
		children: [
			{
				path: '/',
				element: <Runway />
			},
			// {
			// 	path: '/',
			// 	element: <Login />
			// }
		]
	};

	const userRoutes: RouteObject = {
		path: '/',
		element: <MainApp />,
		children: [
			{
				path: '/learn',
				element: (
					<PrivateRoutes>
					<Learn />
					 </PrivateRoutes>
				)
			},
			{
				path: '/dashboard',
				element: (
					// <PrivateRoutes>				
							<Dashboard />
					// </PrivateRoutes>
				)
			},
			{
				path: '/job-search',
				element: (
					<PrivateRoutes>
						<JobSearch />
					</PrivateRoutes>
				)
			},
			{
				path: '/job-management',
				element: (
					<PrivateRoutes>
						<JobManagement />
					</PrivateRoutes>
				)
			},
			{
				path: '/user-management',
				element: (
					<PrivateRoutes>
						<UserManagement />
					</PrivateRoutes>
				)
			}
			
		]
	};

	const errorRoutes:any = {
		path: '/',
		children: [
			{
				path: '/401',
				element: <UnAuthorized />
			},
			{
				path: '/403',
				element: <Forbidden />
			},
			{
				path: '/sessionexpired',
				element: <LogoutPage />
			},
			{
				path: '*',
				element: <NotFound />
			},
			
		]
	};

	// const router = useRoutes([userRoutes, errorRoutes]);
	const router = useRoutes([loginRoutes,userRoutes, errorRoutes]);
	return <Suspense>{router}</Suspense>;
};

export default AppRoutes;
