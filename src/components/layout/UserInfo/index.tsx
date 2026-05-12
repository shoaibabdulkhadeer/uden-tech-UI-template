import { Avatar, Modal, Popover } from 'antd';
import { useEffect, useState } from 'react';
import { CiLogout } from 'react-icons/ci';
import { decodeToken } from 'react-jwt';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaFingerprint, FaRegSnowflake, FaUserCircle } from 'react-icons/fa';
import { logoutSession } from '../../../redux/features/auth/logoutSessionSlice';


const UserInfo = () => {
	const [userData, setUserdata] = useState<any>({});
	const dispatch = useDispatch(); // Initialize useDispatch hook
	const navigate = useNavigate(); // Initialize useNavigate hook
	const status = useSelector((state: any) => state.logout.logoutStatus);
	const { tokenDetails } = useSelector((state: any) => state?.tokenReducer);

	const confirm = Modal.confirm;

	useEffect(() => {
		const myDecodedToken: any = decodeToken(sessionStorage?.accessToken);
		setUserdata(myDecodedToken);
	}, []);

	

	useEffect(() => {
		if (status === 'success') {
			sessionStorage.clear();
			navigate('/');
		}
	}, [status, navigate]);

	const [visible, setVisible] = useState(false);

	const handleLogout = async () => {
		// setVisible(true);
		confirm({
			title: 'Are you sure you want to log out?',
			okText: 'Yes',
			okType: 'primary',
			cancelText: 'No',
			onOk() {
				// dispatch(logoutAction(sessionStorage.caAccessToken));
				dispatch(logoutSession())
				navigate('/sessionexpired');
				// setVisible(false);
			},
			onCancel() {}
		});
	};



	const userMenuOptions = (
		<ul className="gx-user-popover">
			<li style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px' }}>
				<FaUserCircle  size={18} />  {userData?.userName} 
			</li>
			<li 
				style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px' }}
				onClick={() => {
					navigate('/job-management');
					setVisible(false);
				}}
			>
				<FaFingerprint size={18} /> Job Management
			</li>
			<li
				style={{ backgroundColor: '#f1f5f9', color: 'red', display: 'flex', alignItems: 'center', gap: '2px', width: '100%' }}
				onClick={
					// navigate('/sessionexpired');
					handleLogout
				}
				
			>
				<CiLogout style={{ marginRight: '5px' }} /> Log out
			</li>
		</ul>
	);


	return (
		<div className="app-header-user-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
			<div className="app-header-token-strip" aria-label="Token balance">
				<span className="app-header-token-pill app-header-token-pill--available">
					<FaRegSnowflake size={12} aria-hidden />
					Available — {tokenDetails?.data?.availablePoints ?? 0}
				</span>
				<span className="app-header-token-pill app-header-token-pill--consumed">
					<FaFingerprint size={12} aria-hidden />
					Consumed — {tokenDetails?.data?.consumePoints ?? 0}
				</span>
			</div>

		<Popover
			overlayClassName="gx-popover-horizantal"
			placement="bottomRight"
			content={userMenuOptions}
			trigger="click"
			visible={visible}
			onVisibleChange={setVisible}
		>
			<Avatar src="/assets/images/userlogo.png" className="gx-avatar gx-pointer" alt="" style={{ width: '40px', height: '40px' }} />
		</Popover>
		</div>

	);
};

export default UserInfo;
