import { Modal } from 'antd';
import axios from 'axios';
import { differenceInSeconds } from 'date-fns';
import { decodeToken } from 'react-jwt';
import { environment } from '../environments/environment';
import { API_ENDPOINTS } from '../shared/api-endpoints';
import { encryptInput } from '../shared/shared-functions';
const API = axios.create({
	baseURL: environment.APP_API_URL
});
let refreshTokenPromise: Promise<string> | null = null;

const refreshToken = async (): Promise<string> => {
	if (refreshTokenPromise === null) {
		refreshTokenPromise = (async (): Promise<string> => {
			const sessionId: any = sessionStorage.getItem('refreshToken'); 

			try {
				const result = await axios.post(
					`${environment?.APP_API_URL}${API_ENDPOINTS?.APP_REFRESH_TOKEN}?sid=${sessionId}`,
					null, 
					{
						headers: {
							'Accept': 'application/json',
						}
					}
				);

				if (result.status === 200) {
					const newAccessToken = result?.data?.data?.accessToken;
					const newtokenId = result?.data?.data?.refreshTokenID
					sessionStorage.setItem('accessToken', newAccessToken);
					sessionStorage.setItem('refreshToken', newtokenId);
					return newAccessToken;
				} else {
					sessionStorage.clear();
					throw new Error('Token refresh failed');
				}

			} catch (error: any) {
				if (error.response?.status === 401) {
					sessionStorage.clear();
					Modal.warning({
						title: 'Your session has timed out!',
						content: 'Please login again if necessary.',
						onOk() {
							setTimeout(() => {
								window.location.href = '/';
							}, 100);
						}
					});
				}
				throw error;
			} finally {
				refreshTokenPromise = null;
			}
		})();
	}
	return refreshTokenPromise;
};


const getBearerToken = async () => {
	try {
		// Cross-tab token bridge: if sessionStorage is empty (new tab opened via window.open),
		// promote the one-time localStorage tokens to sessionStorage then clear them.
		if (!sessionStorage.getItem('accessToken')) {
			const crossAccess  = localStorage.getItem('_crossTabToken');
			const crossRefresh = localStorage.getItem('_crossTabRefresh');
			if (crossAccess) {
				sessionStorage.setItem('accessToken', crossAccess);
				localStorage.removeItem('_crossTabToken');
			}
			if (crossRefresh) {
				sessionStorage.setItem('refreshToken', crossRefresh);
				localStorage.removeItem('_crossTabRefresh');
			}
		}

		const token = sessionStorage.getItem('accessToken');
		if (!token) return await refreshToken();

		const decodedToken: any = decodeToken(token);
		const expiryInSeconds = differenceInSeconds(new Date(decodedToken.exp * 1000), new Date());

		if (!decodedToken?.exp || expiryInSeconds < 30) {
			return await refreshToken();
		} else {
			return token;
		}
	} catch (error) {
		return await refreshToken(); 
	}
};


API.interceptors.request.use(
	async (config: any) => {
		try {
			const token = await getBearerToken();
			if (token) {
				config.headers = {
					...config.headers,
					Authorization: `Bearer ${token}`,
					'Ocp-Apim-Subscription-Key': ``,
				};
			}
			return config;
		} catch (err) {
			// optional: log this
			return config; // or throw err if needed
		}
	},
	(error) => Promise.reject(error)
);


API.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		if (error?.response?.status === 401) {
			window.location.href = '/401';
		} else if (error?.response?.status === 403) {
			window.location.href = '/403';
		}
		return Promise.reject(error);
	}
);

export default API;
