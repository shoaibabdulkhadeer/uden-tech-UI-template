import { Modal, Popover } from 'antd';
import { useEffect, useState } from 'react';
import { CiLogout } from 'react-icons/ci';
import { decodeToken } from 'react-jwt';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaFingerprint, FaRegSnowflake } from 'react-icons/fa';
import { MdAdminPanelSettings, MdVerified } from 'react-icons/md';
import { logoutSession } from '../../../redux/features/auth/logoutSessionSlice';

const UserInfo = () => {
	const [userData, setUserdata] = useState<any>({});
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const status = useSelector((state: any) => state.logout.logoutStatus);
	const { tokenDetails } = useSelector((state: any) => state?.tokenReducer);
	const [visible, setVisible] = useState(false);

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

	const handleLogout = () => {
		Modal.confirm({
			title: 'Are you sure you want to log out?',
			okText: 'Yes',
			okType: 'primary',
			cancelText: 'No',
			onOk() {
				dispatch(logoutSession());
				navigate('/sessionexpired');
			},
			onCancel() {}
		});
	};

	const displayName = userData?.userName || userData?.name || 'Learner';
	const initial = displayName.charAt(0).toUpperCase();
	const email = userData?.email || userData?.Email || '';
	const role = userData?.RoleName || userData?.role || 'Learner';

	const profileCard = (
		<div className="up-card">
			{/* Gradient banner with shimmer */}
			<div className="up-banner" aria-hidden>
				<div className="up-banner-orb up-banner-orb--1" />
				<div className="up-banner-orb up-banner-orb--2" />
			</div>

			{/* Avatar */}
			<div className="up-avatar-wrap">
				<div className="up-avatar">{initial}</div>
				<span className="up-online-dot" aria-label="Online" />
			</div>

			{/* Identity */}
			<div className="up-identity">
				<div className="up-name-row">
					<span className="up-name">{displayName}</span>
					<MdVerified className="up-verified" />
				</div>
				{email && <p className="up-email">{email}</p>}
				<span className="up-role-badge">{role}</span>
			</div>

			{/* Token stats */}
			<div className="up-stats">
				<div className="up-stat">
					<FaRegSnowflake className="up-stat-icon up-stat-icon--blue" />
					<span className="up-stat-num">{tokenDetails?.data?.availablePoints ?? 0}</span>
					<span className="up-stat-label">Available</span>
				</div>
				<div className="up-stat-divider" />
				<div className="up-stat">
					<FaFingerprint className="up-stat-icon up-stat-icon--violet" />
					<span className="up-stat-num">{tokenDetails?.data?.consumePoints ?? 0}</span>
					<span className="up-stat-label">Consumed</span>
				</div>
			</div>

			{/* Actions */}
			<div className="up-actions">
				<button
					type="button"
					className="up-action-item"
					onClick={() => { navigate('/job-management'); setVisible(false); }}
				>
					<MdAdminPanelSettings className="up-action-icon" />
					<span>Job Management</span>
				</button>
				<button
					type="button"
					className="up-action-item up-action-item--logout"
					onClick={handleLogout}
				>
					<CiLogout className="up-action-icon" />
					<span>Log out</span>
				</button>
			</div>
		</div>
	);

	return (
		<div className="app-header-user-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
			{/* Token pills */}
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

			{/* Profile trigger */}
			<Popover
				overlayClassName="up-popover"
				placement="bottomRight"
				content={profileCard}
				trigger="click"
				visible={visible}
				onVisibleChange={setVisible}
			>
				<button type="button" className="up-trigger" aria-label="Open profile">
					<span className="up-trigger-initial">{initial}</span>
					<span className="up-trigger-dot" aria-hidden />
				</button>
			</Popover>
		</div>
	);
};

export default UserInfo;
