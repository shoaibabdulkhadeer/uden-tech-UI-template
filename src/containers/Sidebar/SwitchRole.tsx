import { LoadingOutlined, StarFilled, StarOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Modal, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SetDefaultRoleAction, SwitchRoleAction } from '../../redux/features/auth/Authentication';
import { encryptInput } from '../../shared/shared-functions';
// import { UI_ROUTES } from '../../shared/ui-routes';
import { environment } from '../../environments/environment';

const SwitchRole = () => {
	const { appTokenData } = useSelector((state: any) => state.appToken);

	const { switchRoleData, switchRoleLoading } = useSelector((state: any) => state.switchRole);

	const { setDefaultRoleData, defaultRoleLoading } = useSelector((state: any) => state.setDefaultRole);

	const [roleid, setRoleId] = useState();

	useEffect(() => {
		if (setDefaultRoleData?.code === 200) {
			setDefaultRole(roleid);
		}
	}, [setDefaultRoleData?.code, roleid, defaultRoleLoading]);

	// const token: any = sessionStorage.getItem('accessToken');
	// const { RoleName, RoleId }: any = token && decodeToken(token);
	const navigate = useNavigate();

	const dispatch = useDispatch();
	const confirm = Modal.confirm;

	//Code for switchRole
	const fnSwitchRole = (roleName: any) => {
		// confirm({
		// 	title: `Are you sure you want to switch the role to ${roleName}?`,
		// 	okText: 'Yes',
		// 	okType: 'primary',
		// 	cancelText: 'No',
		// 	onOk() {
		// 		const body: any = {
		// 			isSwitchRole: true,
		// 			roleName: roleName
		// 		};
		// 		const headers: any = {
		// 			refreshtoken: encryptInput(sessionStorage?.refreshToken),
		// 			authtype: 'refresh_token'
		// 		};
		// 		dispatch(SwitchRoleAction({ body, headers }));
		// 	},
		// 	onCancel() {}
		// });
	};

	//Code for set default role
	const fnSetDefaultRole = (roleid: any) => {
		// confirm({
		// 	title: 'Are you sure to set this as the default role?',
		// 	okText: 'Yes',
		// 	okType: 'primary',
		// 	cancelText: 'No',
		// 	onOk() {
		// 		dispatch(SetDefaultRoleAction({ body, headers }));
		// 		sessionStorage.setItem('defaultRoles', roleid);
		// 		setDefaultRole(roleid);
		// 	},
		// 	onCancel() {}
		// });
		// const body: any = {
		// 	roleId: roleid
		// };
		// const headers: any = {
		// 	'Content-Type': 'application/json',
		// 	caaccesstoken: sessionStorage?.caAccessToken,
		// 	Authorization: sessionStorage?.accessToken,
		// 	'Ocp-Apim-Subscription-Key': `${environment.OCP_APIM_SUBSCRIPTION_KEY}`
		// };
	};

	const [rolesList, setRolesList] = useState<any>([]);
	const [defaultRole, setDefaultRole] = useState<any>(0);
	const [activeRole, setActiveRole] = useState<any>(0);

	// useEffect(() => {
	// 	if (appTokenData.code === 200) {
	// 		setDefaultRole(appTokenData?.data?.DefaultRoleId);
	// 		setActiveRole(appTokenData?.data?.roleId);
	// 		const roles = JSON.stringify(appTokenData?.data?.Roles);
	// 		sessionStorage.setItem('Roles', roles);
	// 		sessionStorage.setItem('defaultRoles', appTokenData?.data?.DefaultRoleId);
	// 		sessionStorage.setItem('activeRole', appTokenData?.data?.roleId);
	// 	}

	// 	if (switchRoleData.code === 200) {
	// 		sessionStorage.setItem('accessToken', switchRoleData?.data?.accessToken);
	// 		sessionStorage.setItem('refreshToken', switchRoleData?.data?.refreshToken);
	// 		const newRoles = JSON.stringify(switchRoleData?.data?.Roles);
	// 		sessionStorage.setItem('defaultRoles', switchRoleData?.data?.DefaultRoleId);
	// 		sessionStorage.setItem('Roles', newRoles);
	// 		sessionStorage.setItem('activeRole', switchRoleData?.data?.roleId);
	// 		window.location.reload();
	// 	}
	// 	// if (sessionStorage.activeRole == 1) {
	// 	// 	navigate(UI_ROUTES.Admin_Landing_Page);
	// 	// } else if (sessionStorage.activeRole === 2) {
	// 	// 	navigate(UI_ROUTES.Cusomter_Landing_Page);
	// 	// }
	// 	if ((switchRoleData.code === 200 || appTokenData.code === 200) && sessionStorage.activeRole == 1) {
	// 		navigate(UI_ROUTES.Admin_Landing_Page);
	// 	} else if ((switchRoleData.code === 200 || appTokenData.code === 200) && sessionStorage.activeRole === 2) {
	// 		navigate(UI_ROUTES.Cusomter_Landing_Page);
	// 	}
	// 	const roles = JSON.parse(sessionStorage.getItem('Roles') || '');
	// 	setActiveRole(sessionStorage.getItem('activeRole'));
	// 	setDefaultRole(sessionStorage.getItem('defaultRoles'));
	// 	setRolesList(roles);
	// }, [appTokenData.code, switchRoleData.code, switchRoleLoading]);

	const roles: any = rolesList?.map((role: any, index: number) => (
		<Menu.Item
			key={index}
			style={{
				position: 'relative',
				paddingRight: '15px'
			}}
		>
			<div key={1}>
				<span
					style={{
						fontSize: '13px'
					}}
				>
					{/* {activeRole == role?.RoleId ? (
						<span className="ant-menu-item-selected" style={{ cursor: 'not-allowed', paddingRight: '75px' }}>
							{/* {role?.RoleName} */}

					{/* </span>  */}
					{/* ) : ( */}
					<span style={{ paddingRight: '75px' }}>{'dummy admin'}</span>
					{/* )} */}
				</span>
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					width: '140px',
					padding: '0px',
					cursor: 'pointer'
				}}
				key={2}
			>
				{defaultRole == role.RoleId ? (
					<StarFilled
						title={`This is your default role.`}
						className="ant-menu-item-selected"
						style={{
							position: 'absolute',
							right: 8,
							top: '50%',
							transform: 'translateY(-50%)',
							fontSize: '15px',
							cursor: 'not-allowed'
						}}
					/>
				) : (
					<StarOutlined
						title={`Set this as default role.`}
						className="staricon"
						style={{
							position: 'absolute',
							right: 8,
							top: '50%',
							transform: 'translateY(-50%)',
							fontSize: '15px'
						}}
						onClick={() => fnSetDefaultRole(role.RoleId)}
					/>
				)}
			</div>
		</Menu.Item>
	));

	const menu: any = (
		<Menu style={{ position: 'relative' }} className="switchMenu">
			{roles}
		</Menu>
	);

	return (
		<div style={{ position: 'relative', padding: '0px' }}>
			{rolesList?.length > 1 ? (
				<Dropdown overlay={menu}>
					<Button
						className="dropbtn"
						style={{
							marginTop: '20px',
							border: 'none',
							padding: '4px',
							marginRight: '10px',
							display: 'flex',
							alignItems: 'center',
							backgroundColor: '#FEFEFE'
						}}
					>
						<span className="gx-pointer gx-status-pos gx-d-block">
							<UserSwitchOutlined style={{ fontSize: '20px', color: 'black' }} />
						</span>

						{switchRoleLoading ? (
							<div className="gx-loader-view">
								<Spin indicator={<LoadingOutlined style={{ fontSize: 17, marginLeft: '4px' }} spin />} />
							</div>
						) : (
							<></>
						)}
					</Button>
				</Dropdown>
			) : (
				<></>
			)}
		</div>
	);
};

export default SwitchRole;
