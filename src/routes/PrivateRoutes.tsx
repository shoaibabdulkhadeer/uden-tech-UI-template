import { decodeToken } from 'react-jwt';
import { Navigate } from 'react-router-dom';
import { BYPASS_AUTH } from '../environments/environment';

const PrivateRoutes = ({ children }: { children: JSX.Element; }) => {
	if (BYPASS_AUTH) {
		return children;
	}

    // Check sessionStorage first; if missing (e.g. new tab), accept a one-time
    // cross-tab token written to localStorage before window.open('_blank').
    let authenticationToken = sessionStorage.getItem('accessToken');
    if (!authenticationToken) {
        const crossTabToken = localStorage.getItem('_crossTabToken');
        if (crossTabToken) {
            // Promote to sessionStorage for this tab and clear the bridge key
            sessionStorage.setItem('accessToken', crossTabToken);
            localStorage.removeItem('_crossTabToken');
            authenticationToken = crossTabToken;
        }
    }
    if (!authenticationToken) {
        return <Navigate to="/401" />;
    }
    const userData: any = decodeToken(authenticationToken);
    if (!userData?.userid) {
        return <Navigate to="/" />;
    }
 
    // if (userData?.exp < Date.now() / 1000) {
    //     return <Navigate to="/401" />;
    // }
    // const userHasRequiredRole = roles.includes(userData?.RoleName);
    // if (!userHasRequiredRole) {
    //  return <Navigate to="/403" />;
    // }
 
    return children;
};
 
export default PrivateRoutes;