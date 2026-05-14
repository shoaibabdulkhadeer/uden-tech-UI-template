import { Button, Checkbox, Form, Input, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './loginPage.css';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import { useDispatch, useSelector } from 'react-redux';
import { FacebookOutlined, GithubOutlined, GoogleOutlined, TwitterOutlined, LinkedinOutlined } from '@ant-design/icons';
import { easeInOut, motion } from 'framer-motion';

const LoginPage = () => {
	const dispatch = useDispatch();
	const Navigate = useNavigate();

	const onFinish = (values: any) => {
		// Microsoft OAuth redirect — wired up when credentials are configured
	};

	return (
		<div className='loginMaindiv'>
			<img src="/assets/images/todo3d.png" className="pieimgmotion" alt="" />
			<motion.div initial={{ x: 300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, ease: easeInOut }}>
				<div>
					<div className="gx-app-login-container">
						<div className="gx-app-login-main-content boxshaodowLogin">
							<div className="gx-app-logo-content mainLeftCard">
								<div className="gx-app-logo-content-bg"></div>
								<div className="gx-app-logo-wid">
									<div className='gx-d-flex gx-align-items-center'>
										<p className='gx-p-0 gx-m-0 gx-fs-lg'>Digiverve - Uden Tech</p>
									</div>
									<hr className='gx-font-weight-bold gx-mb-2 gx-mt-1' />
									<div className='gx-d-flex'>
										<p className="gx-fs-xs">An app where AI creates learning paths and quizzes for you</p>
									</div>
								</div>
								<div className="gx-app-logo">
									<img src="/assets/images/scene-preview.png" alt="Uden Tech" style={{ width: '100%', height: '280px', objectFit: 'contain', opacity: 0.85 }} />
								</div>
							</div>

							<div className="gx-app-login-content" style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
								<img alt="" src="/assets/images/download.png" className="loginlogo" style={{ width: '100px' }} />
								<p className="loginheading gx-p-0 gx-m-0">Login with Microsoft Account</p>

								<Form className="loginform" name="basic" initialValues={{ remember: true }} onFinish={onFinish} autoComplete="off">
									<Form.Item
										name="email"
										validateTrigger="onChange"
										rules={[
											{ required: true, message: 'Please enter your email address' },
											{ type: 'email', message: 'Please enter a valid email address!' }
										]}
									>
										<Input className="logininps" maxLength={150} placeholder="Enter email address" style={{ marginTop: '7px', borderRadius: '4px' }} autoFocus />
									</Form.Item>
									<button type="submit" className="loginbtn" style={{ borderRadius: '4px' }}>
										<img style={{ margin: '0px 5px' }} src="/assets/images/microimg.png" alt="" width={15} />
										LOGIN
									</button>
								</Form>

								<div className="gx-flex-row gx-justify-content-between gx-mt-2">
									<ul className="gx-social-link gx-p-0 gx-m-0">
										<li style={{ border: 'none' }}><LinkedinOutlined className="gx-p-0 gx-m-0" /></li>
										<li><FacebookOutlined /></li>
										<li><GithubOutlined /></li>
										<li><TwitterOutlined /></li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default LoginPage;
