import { decodeToken } from 'react-jwt';
import { Navigate } from 'react-router-dom';
import { BYPASS_AUTH } from '../environments/environment';

const PrivateRoutes = ({ children }: { children: JSX.Element; }) => {
	if (BYPASS_AUTH) {
		return children;
	}
    
    const authenticationToken = sessionStorage.getItem('accessToken');
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