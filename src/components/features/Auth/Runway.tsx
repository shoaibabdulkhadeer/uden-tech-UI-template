import { LoadingOutlined } from '@ant-design/icons';
import { Button, Spin, Typography, message, notification } from 'antd';
import { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ext_api_call from '../../../config/axiosCall';
import { environment } from '../../../environments/environment';
import { AppTokenAction } from '../../../redux/features/auth/Authentication';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';
import { encryptInput } from '../../../shared/shared-functions';
import ErrorModel from '../../../shared/sharedComponents/ErrorModel';
import SuccessModel from '../../../shared/sharedComponents/SuccessModel';
import "./wave-loader.css"
import { getSessionLogin } from '../../../redux/features/auth/sessionLoginSlice';

const Runway = () => {
	const { Title } = Typography,
		location = useLocation(),
		navigate = useNavigate(),
		dispatch = useDispatch(),
		[ParseToken, setParseToken] = useState<string>(''),
		[msCodeSet, setMsCodeSet] = useState({ is: false, success: false, error: false, errMsg: '' }),
		{ appTokenLoading, appTokenData } = useSelector((state: any) => state.appToken);

		const { sessionData, status: sessionLoginLoader } = useSelector((state: any) => state?.sessionLoginReducer);



		const [hasFired, setHasFired] = useState(false); 

		useEffect(() => {
			sessionStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOiJtYW51YWwtNXktdG9rZW4iLCJ1c2VyaWQiOiI2ODRmYjViYjllNTNlMDNjMzViN2U3YjUiLCJ1c2VyTmFtZSI6IlNob2FpbCIsImV4cCI6MTkzNTc2NDM3NX0.hziSFsTrDmbSqyzYkdGFSkEOJ-aHM2NXjrbcsYcVqSo');
			sessionStorage.setItem('refreshToken', 'bypass-dev');
			navigate('/dashboard');
		}, [navigate]);
   
		useEffect(() => {
			if (sessionData?.statusCode === 200) {
			  const data = sessionData?.data;
		
			  sessionStorage.setItem('accessToken', data?.accessToken);
			  sessionStorage.setItem('refreshToken', data?.refreshTokenID);
		
			  navigate('/dashboard');
			}else if(sessionData?.statusCode === 400 || sessionData?.statusCode === 401 ){
				message.error(sessionData?.error)
				navigate('/401');
				}else if (sessionData?.statusCode === 500){
				message.error(sessionData?.error)
				navigate('/401');
			}
		  }, [sessionData, navigate]);
		  

	// useEffect(() => {
	// 	const msRefreshToken: string = new URLSearchParams(location.search)?.get('refreshToken') ?? '',
	// 		msCode: string = new URLSearchParams(location.search)?.get('code') ?? '',
	// 		urlError: string = new URLSearchParams(location.search)?.get('error') ?? '';
	// 	if (msCode.trim()) setMsCodeSet({ ...msCodeSet, is: true });
	// 	else if (urlError) setMsCodeSet({ ...msCodeSet, errMsg: decodeURIComponent(urlError), error: true });

	// 	const encRefreshToken = encryptInput(msRefreshToken),
	// 		loginConfig: AxiosRequestConfig = {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				accessToken: '',
	// 				refreshtoken: encRefreshToken,
	// 				'Ocp-Apim-Subscription-Key': ``
	// 			},

	// 			// url: `${environment.APP_API_URL}${API_ENDPOINTS.PARSE_TOKEN}`
	// 			url: ``
	// 		},
	// 		sid = Math.floor(Math.random() * 0xffffff * 1000000).toString(16),
	// 		verifyConfig: AxiosRequestConfig = {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/x-www-form-urlencoded'
	// 				//'Ocp-Apim-Subscription-Key': `${environment.OCP_APIM_SUBSCRIPTION_KEY}`
	// 			},

	// 			url: ``,
	// 			data: {
	// 				authType: 'MICROSOFT',
	// 				authKey: msCode,
	// 				state: JSON.stringify({
	// 					uniqueId: sid,
	// 					ondemandpage: '',
	// 					redirect_uri: ``
	// 				})
	// 			}
	// 		};

	// 	const axiosCall = async (config: AxiosRequestConfig) => {
	// 		config.headers = { ...config.headers, 'Ocp-Apim-Subscription-Key': `` };
	// 		const response = await ext_api_call(config);
	// 		if (response?.status === 200) {
	// 			if (msRefreshToken) {
	// 				setParseToken(response?.data?.data?.accessToken);
	// 				sessionStorage.setItem('caAccessToken', response?.data?.data?.accessToken);
	// 				sessionStorage.setItem('caRefreshToken', response?.data?.data?.refreshToken);
	// 			} else if (msCode) {
	// 				setMsCodeSet({ ...msCodeSet, success: true });
	// 			}
	// 		} else if ((response?.status >= 400 && response?.status < 500) || (response?.status >= 500 && response?.status < 600)) {
	// 			if (msRefreshToken) {
	// 				navigate('/');
	// 				notification['error']({
	// 					message: response?.data?.data?.data?.errorDescription || response?.data?.message
	// 				});
	// 			} else if (msCode)
	// 				setMsCodeSet({ ...msCodeSet, error: true, errMsg: response?.data?.data?.data?.errorDescription || response?.data?.message });
	// 		}
	// 	};

	// 	if (msRefreshToken) axiosCall(loginConfig);
	// 	else if (msCode) axiosCall(verifyConfig);
	// }, [location.search]);

	// useEffect(() => {
	// 	if (ParseToken) {
	// 		const body: any = {
	// 			isSwitchRole: false
	// 		};

	// 		const headers: any = {
	// 			'Content-Type': 'application/json',
	// 			accesstoken: ParseToken,
	// 			authtype: 'access_token',
	// 			'Ocp-Apim-Subscription-Key': ``
	// 		};

	// 		dispatch(AppTokenAction({ body, headers }));
	// 	}
	// }, [ParseToken]);

	// useEffect(() => {
	// 	if (appTokenData?.code === 200) {
	// 		sessionStorage.setItem('accessToken', appTokenData?.data?.accessToken);
	// 		sessionStorage.setItem('refreshToken', appTokenData?.data?.refreshToken);
	// 		const roles = JSON.stringify(appTokenData?.data?.Roles);
	// 		sessionStorage.setItem('Roles', roles);
	// 		sessionStorage.setItem('defaultRoles', appTokenData?.data?.DefaultRoleId);
	// 		sessionStorage.setItem('activeRole', appTokenData?.data?.roleId);
	// 		navigate('/learn');
	// 	}
	// }, [appTokenLoading, appTokenData]);





 const Navigate = useNavigate();

	return (
		<>
			  <div className="wave-loader-overlay phase2-wave-loader">

			  {/* <Button className='gx-mt-3 gx-link gx-fs-xs' type='primary' size='small' style={{position:"absolute",right:"10px",top:"10px"}}  onClick={() => Navigate('/dashboard')}>Go</Button> */}

      <div className="wave-loader-container">
        <div className="wave-loader-bars">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
        <p className="wave-loader-text">Processing...</p>
        <div className="wave-loader-dots">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="wave-dot" style={{ animationDelay: `${i * 0.3}s` }}></div>
          ))}
        </div>

      </div>
    </div>
			<SuccessModel
				message={`Congratulations! Your consent for the NOC application has been successfully granted.\n 
				You have been registered in the application now.\n
				Please click 'OK' to access it.`}
				onOk={() => {
					navigate('/');
					setMsCodeSet({ ...msCodeSet, success: true, is: false });
				}}
				title="Verification Success!"
				visible={msCodeSet.success}
			/>

			<ErrorModel
				title={'Error occurred.'}
				message={msCodeSet?.errMsg}
				visible={msCodeSet.error}
				onOk={() => {
					navigate('/');
					setMsCodeSet({ ...msCodeSet, error: false, is: false });
				}}
			/>
		</>
	);
};

export default Runway;
