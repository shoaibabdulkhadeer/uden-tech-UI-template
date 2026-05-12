import { Button, Checkbox, Form, Input, message } from 'antd';
import React, { Suspense, useEffect, useRef, useState } from 'react';
// import '../features/authentication/Landing/Landing.css';
import './loginPage.css';
import { useNavigate } from 'react-router-dom';

// import { Leva } from 'leva';
import { Typewriter } from 'react-simple-typewriter';
import * as THREE from 'three'; // Import THREE for LoopRepeat
// import { resetUserLoginApi, UserLoginApi } from '../../redux/features/auth/UserLogin';
import { useDispatch, useSelector } from 'react-redux';
// import { validatePassword } from '../../common/commonfunctions';
import { FacebookOutlined, GithubOutlined, GoogleOutlined, TwitterOutlined,LinkedinOutlined } from '@ant-design/icons';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { easeInOut, motion } from 'framer-motion';

const LoginPage = () => {
	const containerRef = useRef(null);
	// const { userLoginApiRes, userLoginApiLoad } = useSelector((state: any) => state?.userLoginApi);

	const dispatch = useDispatch();

	const Navigate = useNavigate();

	// useEffect(() => {
	// 	switch (userLoginApiRes?.code) {
	// 		case 200:
	// 			sessionStorage.setItem('accessToken', userLoginApiRes?.data?.accessToken);
	// 			// sessionStorage.setItem('refreshToken', userLoginApiRes?.data?.refreshToken);

	// 			Navigate('/home');
	// 			// dispatch(resetUserLoginApi());
	// 			break;
	// 		case 400:
	// 			message.warning(userLoginApiRes.message);
	// 			// dispatch(resetUserLoginApi());
	// 			break;
	// 		case 500:
	// 			message.error(userLoginApiRes.message);
	// 			// dispatch(resetUserLoginApi());
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// }, [userLoginApiRes, userLoginApiLoad]);

	// const onFinish = (values: any) => {
	// 	const { email, password } = values;
       
	// 	try {
	// 		if (email || password) {
	// 			const userLoginMdl: any = {
	// 				email: email,
	// 				password: password
	// 			};


	// 			// dispatch(UserLoginApi(userLoginMdl));
	// 		} else {
	// 			message.error('Failed to login user.');
	// 			return;
	// 		} 
	// 	} catch (error: any) {
	// 		message.error(error.message);
	// 		return;
	// 	}
	// };

	const onFinish = (values: any) => {
		// window.location.replace(
		// 	`https://login.microsoftonline.com/${OAuth.TENANT_ID}/oauth2/v2.0/authorize?client_id=${OAuth.CLIENT_ID}&prompt=select_account&response_type=code&redirect_uri=${OAuth.REDIRECT_URL}&response_mode=query&scope=${OAuth.NEXT_PUBLIC_SCOPE}&state=state&login_hint=${values.email}`
		// );
	};


	const [canvasWidth, setCanvasWidth] = useState(100);

	function Model({ modelPath }: any) {
		const modelRef: any = useRef();
		const { scene, animations }: any = useGLTF(modelPath); // Load the model
		const { actions }: any = useAnimations(animations, scene);

		useEffect(() => {
			if (actions && Object.keys(actions).length > 0) {
				const action = actions[Object.keys(actions)[0]];
				action.setLoop(THREE.LoopRepeat);
				action.play();
			}
		}, [actions]);

		useFrame(() => {
			if (modelRef.current) {
				modelRef.current.rotation.y += 0.01;
				// modelRef.current.rotation.x += 0.01;
			}
		});
        
		// eslint-disable-next-line react/no-unknown-property
		return <primitive object={scene} ref={modelRef} scale={70.5} position={[0, -57, 5]} castShadow />;
	}

	function LoadingScreen() {
		const { progress } = useProgress();

		return (
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '80%',
					transform: 'translate(-50%, -50%)',
					color: 'black',
					fontSize: '12px',
					fontWeight: 'bold'
				}}
			>
				<div>Loading: {Math?.round(progress)}%</div>
			</div>
		);
	}

	return (
		<div className='loginMaindiv'>
			<img src="/assets/images/todo3d.png" className="pieimgmotion " alt="" />
{/* 
<img src="/assets/images/3dpie.png" className="todo3d " alt="" /> */}
<motion.div  initial={{ x: 300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, ease: easeInOut }}>
		<div 
		// className="gx-app-login-wrap"
		>
			<div className="gx-app-login-container ">
				<div className="gx-app-login-main-content boxshaodowLogin">
					<div className="gx-app-logo-content mainLeftCard" >
						<div className="gx-app-logo-content-bg"></div>
						<div className="gx-app-logo-wid">
							{/* <img src="/assets/images/logowhite.png" className="errorimg gx-mb-2" alt="" width={70} /> */}

							<div className='gx-d-flex gx-align-items-center '>

							{/* <img src="/assets/images/todo3d.png" className=" " alt="" width={50} /> */}
							<p className='gx-p-0 gx-m-0 gx-fs-lg '>Digiverve - Uden Tech</p>
							</div>

							<hr className='gx-font-weight-bold gx-mb-2 gx-mt-1' />
							{/* <p className='gx-p-0 gx-fs-lg gx-m-0 gx-mb-2'>Sign In</p> */}
							<div className='gx-d-flex'>
								{/* <img src="/assets/images/todo3d.png" className=" " alt="" width={50} /> */}
							<p className="gx-fs-xs">
								An app where AI creates learning paths and quizzes for you</p>
							</div>
							{/* <p>Get an account !!!</p> */}
						</div>
						<div className="gx-app-logo">
							<Suspense fallback={<LoadingScreen />}>
								<Canvas
									// camera={{ position: [-2,5,5], fov: 50 }}
									camera={{ position: [-2, 0, 5], fov: 45 }}
									// shadowIntensity={shadowIntensity}
									// camera={{ position: [cameraX, cameraY, cameraZ], fov: 50 }}

									// style={{ width: `${canvasWidth}px`,height:"100px" }}
									style={{ height: '280px' }}
									shadows
									// className="w-[150px] sm:w-[150px]"
								>    
									<ambientLight 
								    // eslint-disable-next-line react/no-unknown-property 
									intensity={0.5} />

									<directionalLight
									// eslint-disable-next-line react/no-unknown-property
										position={[5, 20, 5]}
                                     // eslint-disable-next-line react/no-unknown-property
										intensity={5}
										// eslint-disable-next-line react/no-unknown-property
										castShadow
										// eslint-disable-next-line react/no-unknown-property
										shadow-mapSize-width={2024}
										// eslint-disable-next-line react/no-unknown-property
										shadow-mapSize-height={1024}
										// eslint-disable-next-line react/no-unknown-property
										shadow-camera-left={150}
										// eslint-disable-next-line react/no-unknown-property
										shadow-camera-right={50}
										// eslint-disable-next-line react/no-unknown-property
										shadow-camera-top={50}
										// eslint-disable-next-line react/no-unknown-property
										shadow-camera-bottom={-50}
										// eslint-disable-next-line react/no-unknown-property
										shadow-camera-near={1}
										// eslint-disable-next-line react/no-unknown-property
										shadow-camera-far={100}
										// eslint-disable-next-line react/no-unknown-property
										shadow-bias={-0.0005}
									/>
									<Model modelPath="/assets/images/scene.glb" />

									<OrbitControls
										makeDefault
										enableZoom={true}
										maxDistance={240}
										minDistance={185}
										// maxDistance={440}
										// minDistance={473}
										target={[3, 0, 0.01]}
										enableDamping={true} // Smooth movement
									/>
								</Canvas>
							</Suspense>
						</div>
					</div>

					<div className="gx-app-login-content " style={{display: 'flex', alignItems: 'center',flexDirection:"column"}}>
					

<img alt="" src="/assets/images/download.png" className="loginlogo" style={{ width: '100px' }} />

{/* <p className='gx-p-0 gx-m-0 gx-fs-md  loginlogo'>Digiverve - Uden Tech</p> */}
	<p className="loginheading gx-p-0 gx-m-0">Login with Microsoft Account</p>

<Form className="loginform" name="basic" initialValues={{ remember: true }} onFinish={onFinish} autoComplete="off">
						<Form.Item
							name="email"
							validateTrigger="onChange"
							rules={[
								{
									required: true,
									message: 'Please enter your email address'
								},
								{
									type: 'email',
									message: 'Please enter a valid email address!'
								}
							]}
						>
							<Input className="logininps" maxLength={150} placeholder="Enter email address" style={{ marginTop: '7px',borderRadius:"4px" }} autoFocus />
						</Form.Item>

						<button type="submit" className="loginbtn" style={{borderRadius:"4px"}}>
							<img style={{ margin: '0px 5px' }} src="/assets/images/microimg.png" alt="" width={15} />
							LOGIN
						</button>
					</Form>

					<div className="gx-flex-row gx-justify-content-between gx-mt-2">
								{/* <span>Visit us On</span> */}
								<ul className="gx-social-link gx-p-0 gx-m-0">
									<li className="" style={{ border: 'none' }}>
										<LinkedinOutlined  className="gx-p-0 gx-m-0" />
									</li>
									<li>
										<FacebookOutlined />
									</li>
									<li>
										<GithubOutlined />
									</li>
									<li>
										<TwitterOutlined />
									</li>
								</ul>
							</div>
					</div>
				</div>
			</div>
		</div>
</motion.div>

		</div>

		//  </div>
	);
};

export default LoginPage;
