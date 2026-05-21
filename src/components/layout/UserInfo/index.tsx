import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { CiLogout } from 'react-icons/ci';
import { decodeToken } from 'react-jwt';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaFingerprint, FaRegSnowflake } from 'react-icons/fa';
import {
	MdVerified, MdSpaceDashboard,
	MdAutoGraph, MdRocketLaunch, MdBolt, MdAutoAwesome,
	MdTrendingUp, MdWorkspacePremium,
} from 'react-icons/md';
import { logoutSession } from '../../../redux/features/auth/logoutSessionSlice';

const UserInfo = () => {
	const [userData, setUserdata] = useState<any>({});
	const dispatch   = useDispatch();
	const navigate   = useNavigate();
	const status     = useSelector((state: any) => state.logout.logoutStatus);
	const { tokenDetails } = useSelector((state: any) => state?.tokenReducer);
	const [visible, setVisible]   = useState(false);
	const [closing, setClosing]   = useState(false);

	useEffect(() => {
		const myDecodedToken: any = decodeToken(sessionStorage?.accessToken);
		setUserdata(myDecodedToken);
	}, []);

	useEffect(() => {
		if (status === 'success') { sessionStorage.clear(); navigate('/'); }
	}, [status, navigate]);

	const closePanel = useCallback(() => {
		setClosing(true);
		setTimeout(() => {
			setVisible(false);
			setClosing(false);
		}, 300); // matches up-panel-out duration
	}, []);

	const handleLogout = () => {
		setVisible(false); // immediate close — navigating away anyway
		Modal.confirm({
			title: 'Are you sure you want to log out?',
			okText: 'Yes', okType: 'primary', cancelText: 'No',
			onOk() { dispatch(logoutSession()); navigate('/sessionexpired'); },
			onCancel() {},
		});
	};

	const displayName = userData?.userName || userData?.name || 'Learner';
	const initial     = displayName.charAt(0).toUpperCase();
	const email       = userData?.email || userData?.Email || '';
	const role        = userData?.RoleName || userData?.role || 'Learner';

	const available = tokenDetails?.data?.availablePoints ?? 0;
	const consumed  = tokenDetails?.data?.consumePoints  ?? 0;
	const total     = available + consumed;
	const usedPct   = total > 0 ? Math.round((consumed / total) * 100) : 0;

	return (
		<>
			{/* ── Portal panel ── */}
			{visible && ReactDOM.createPortal(
				<>
					{/* Backdrop */}
					<div
						className={`up-backdrop${closing ? ' up-backdrop--out' : ''}`}
						onClick={closePanel}
					/>

					{/* PS5 close button — left of the panel */}
					<button
						type="button"
						className={`up-close-btn${closing ? ' up-close-btn--out' : ''}`}
						onClick={closePanel}
						aria-label="Close profile panel"
					>
						<span className="up-close-orb" aria-hidden>
							<span className="up-close-ring up-close-ring--3" />
							<span className="up-close-ring up-close-ring--2" />
							<span className="up-close-ring up-close-ring--1" />
							<span className="up-close-face">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
									<line x1="4" y1="4" x2="16" y2="16" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
									<line x1="16" y1="4" x2="4"  y2="16" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
								</svg>
							</span>
						</span>
						<span className="up-close-btn-label" aria-hidden>CLOSE</span>
					</button>

					{/* Panel — slides in from the right */}
					<div
						className={`up-panel${closing ? ' up-panel--out' : ''}`}
						onClick={(e) => e.stopPropagation()}
					>
						{/* ── Sticky: banner + avatar only ── */}
						<div className="up-panel-header">
							<div className="up-banner" aria-hidden>
								<div className="up-banner-orb up-banner-orb--1" />
								<div className="up-banner-orb up-banner-orb--2" />
								<div className="up-banner-badge">
									<MdWorkspacePremium size={11} />
									<span>Uden Tech</span>
								</div>
							</div>
							<div className="up-avatar-wrap">
								<div className="up-avatar">{initial}</div>
								<span className="up-online-dot" aria-label="Online" />
							</div>
						</div>

						{/* ── Scrollable body ── */}
						<div className="up-panel-body">

							{/* Identity */}
							<div className="up-identity">
								<div className="up-name-row">
									<span className="up-name">{displayName}</span>
									<MdVerified className="up-verified" />
								</div>
								{email && <p className="up-email">{email}</p>}
								<p className="up-bio">
									Building AI-powered skills on Uden Tech — focused on career growth, React, and system design.
								</p>
								<div className="up-pills">
									<span className="up-pill up-pill--indigo"><MdBolt size={10} />{role}</span>
									<span className="up-pill up-pill--cyan"><MdAutoAwesome size={10} />AI Learner</span>
									<span className="up-pill up-pill--emerald"><MdTrendingUp size={10} />Active</span>
								</div>
							</div>

							{/* Token stats */}
							<div className="up-token-block">
								<div className="up-token-row">
									<div className="up-token-stat">
										<FaRegSnowflake className="up-stat-icon up-stat-icon--blue" />
										<span className="up-stat-num">{available}</span>
										<span className="up-stat-label">Available</span>
									</div>
									<div className="up-token-bar-wrap">
										<div className="up-token-bar-track">
											<div className="up-token-bar-fill" style={{ width: `${usedPct}%` }} />
										</div>
										<span className="up-token-bar-pct">{usedPct}% used</span>
									</div>
									<div className="up-token-stat">
										<FaFingerprint className="up-stat-icon up-stat-icon--violet" />
										<span className="up-stat-num">{consumed}</span>
										<span className="up-stat-label">Consumed</span>
									</div>
								</div>
							</div>

							{/* Quick nav */}
							<div className="up-quicknav">
								<span className="up-quicknav-label">Quick access</span>
								<div className="up-quicknav-grid">
									<button type="button" className="up-quicknav-item" onClick={() => { navigate('/dashboard'); closePanel(); }}>
										<span className="up-quicknav-icon up-quicknav-icon--indigo"><MdSpaceDashboard size={14} /></span>
										<span>Dashboard</span>
									</button>
									<button type="button" className="up-quicknav-item" onClick={() => { navigate('/learn'); closePanel(); }}>
										<span className="up-quicknav-icon up-quicknav-icon--cyan"><MdAutoGraph size={14} /></span>
										<span>Learning Path</span>
									</button>
									<button type="button" className="up-quicknav-item" onClick={() => { navigate('/job-search'); closePanel(); }}>
										<span className="up-quicknav-icon up-quicknav-icon--violet"><MdRocketLaunch size={14} /></span>
										<span>Career</span>
									</button>
								</div>
							</div>

							{/* Actions */}
							<div className="up-actions">
								<button type="button" className="up-action-item up-action-item--logout" onClick={handleLogout}>
									<CiLogout className="up-action-icon" />
									<div className="up-action-text">
										<span className="up-action-title">Log out</span>
										<span className="up-action-sub">End this session</span>
									</div>
								</button>
							</div>

						</div>{/* end up-panel-body */}
					</div>{/* end up-panel */}
				</>,
				document.body
			)}

			{/* ── Topbar slot ── */}
			<div className="app-header-user-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
				<div className="app-header-token-strip" aria-label="Token balance">
					<span className="app-header-token-pill app-header-token-pill--available">
						<FaRegSnowflake size={12} aria-hidden />
						Available — {available}
					</span>
					<span className="app-header-token-pill app-header-token-pill--consumed">
						<FaFingerprint size={12} aria-hidden />
						Consumed — {consumed}
					</span>
				</div>

				<button
					type="button"
					className="up-trigger"
					onClick={() => setVisible(true)}
					aria-label="Open profile"
				>
					<span className="up-trigger-initial">{initial}</span>
					<span className="up-trigger-dot" aria-hidden />
				</button>
			</div>
		</>
	);
};

export default UserInfo;
