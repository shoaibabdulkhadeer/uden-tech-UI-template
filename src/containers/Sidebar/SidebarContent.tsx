import { Modal, Tooltip } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { CiLogout } from 'react-icons/ci';
import {
	MdSpaceDashboard,
	MdAutoGraph,
	MdRocketLaunch,
	MdAdminPanelSettings,
	MdManageAccounts,
} from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSession } from '../../redux/features/auth/logoutSessionSlice';
import { AppDispatch } from '../../redux/store';
import { toggleCollapsedSideNav } from '../../appRedux/actions';
import {
	NAV_STYLE_DRAWER,
	TAB_SIZE,
	THEME_TYPE_LITE,
} from '../../constants/ThemeSetting';
import CustomScrollbars from '../../util/CustomScrollbars';
import DashboardShellNetwork from '../../components/features/Dashboard/DashboardShellNetwork';
import SidebarLogo from './SidebarLogo';
import '../../styles/dashboard-nextgen.css';
import './SidebarContent.css';

const NAV_ITEMS = [
	{
		id: 'dashboard',       url: '/dashboard',       Icon: MdSpaceDashboard,
		color: 'indigo',  label: 'Dashboard',
		sub: 'Analytics, activity & live stats',
		tag: 'Live',
	},
	{
		id: 'generate',        url: '/learn',           Icon: MdAutoGraph,
		color: 'cyan',    label: 'Learning Path',
		sub: 'AI-generated skill roadmaps',
		tag: 'AI',
	},
	{
		id: 'job-search',      url: '/job-search',      Icon: MdRocketLaunch,
		color: 'violet',  label: 'Career Acceleration',
		sub: 'AI-matched jobs & applications',
		tag: 'AI',
	},
	{
		id: 'job-management',  url: '/job-management',  Icon: MdAdminPanelSettings,
		color: 'amber',   label: 'Admin Nexus',
		sub: 'Post, review & manage roles',
		tag: 'Admin',
	},
	{
		id: 'user-management', url: '/user-management', Icon: MdManageAccounts,
		color: 'emerald', label: 'User Management',
		sub: 'Roles, access & team accounts',
		tag: 'Team',
	},
] as const;

const SidebarContent = ({
	sidebarCollapsed,
	setSidebarCollapsed,
}: {
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (v: boolean) => void;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const width = useSelector(({ common }: any) => common.width);
	const { navStyle, themeType } = useSelector(({ settings }: any) => settings);

	const closeOverlayDrawer = useCallback(() => {
		if (navStyle === NAV_STYLE_DRAWER || width < TAB_SIZE) {
			dispatch(toggleCollapsedSideNav(false));
		}
	}, [dispatch, navStyle, width]);

	const location = useLocation();

	// Derived directly from pathname — no extra render cycle from useEffect+setState
	const selectedKey = useMemo(() => {
		const p = location.pathname;
		if      (p === '/dashboard')       return 'dashboard';
		else if (p === '/learn')           return 'generate';
		else if (p === '/job-search')      return 'job-search';
		else if (p === '/job-management')  return 'job-management';
		else if (p === '/user-management') return 'user-management';
		else                               return '';
	}, [location.pathname]);

	// Only recomputes when theme changes
	const shellThemeClass = useMemo(() =>
		themeType === THEME_TYPE_LITE
			? 'gx-sidebar-learn-shell--light'
			: 'gx-sidebar-learn-shell--dark',
	[themeType]);

	const handleSidebarLogout = useCallback(() => {
		Modal.confirm({
			title: 'Are you sure you want to log out?',
			okText: 'Yes',
			okType: 'primary',
			cancelText: 'No',
			onOk() {
				dispatch(logoutSession());
				navigate('/sessionexpired');
			},
			onCancel() {},
		});
	}, [dispatch, navigate]);

	// Only re-renders nav list when active route or collapsed state changes
	const navList = useMemo(() =>
		NAV_ITEMS.map(({ id, url, Icon, color, label, sub, tag }) => {
			const isActive = selectedKey === id;
			return (
				<Tooltip key={id} title={sidebarCollapsed ? label : ''} placement="right">
					<Link
						to={url}
						className={`sidebar-nav-item sidebar-nav-item--${color}${isActive ? ' sidebar-nav-item--active' : ''}`}
						onClick={closeOverlayDrawer}
					>
						<span className="sidebar-nav-icon">
							<Icon size={18} />
						</span>
						{!sidebarCollapsed && (
							<span className="sidebar-nav-text">
								<span className="sidebar-nav-label-row">
									<span className="sidebar-nav-label">{label}</span>
									<span className={`sidebar-nav-tag sidebar-nav-tag--${color}`}>{tag}</span>
								</span>
								<span className="sidebar-nav-sub">{sub}</span>
							</span>
						)}
					</Link>
				</Tooltip>
			);
		}),
	[selectedKey, sidebarCollapsed, closeOverlayDrawer]);

	return (
		<div className={`gx-sidebar-learn-shell ${shellThemeClass}`}>
			<div className="gx-sidebar-learn-nodes" aria-hidden>
				<DashboardShellNetwork className="gx-sidebar-shell-network" suspendLoop={sidebarCollapsed} />
			</div>
			<div className="gx-sidebar-learn-front">
				<SidebarLogo
					sidebarCollapsed={sidebarCollapsed}
					setSidebarCollapsed={setSidebarCollapsed}
				/>

				<div className="gx-sidebar-content gx-sidebar-learn-scroll">
					<CustomScrollbars
						className="gx-layout-sider-scrollbar"
						style={{ minHeight: '500px' }}
					>
						<nav className="sidebar-nav">
							{!sidebarCollapsed && (
								<span className="sidebar-nav-section">Navigation</span>
							)}
							{navList}
						</nav>
					</CustomScrollbars>
				</div>

				<div className="gx-sidebar-learn-foot">
					<button
						type="button"
						className="gx-sidebar-learn-logout"
						onClick={handleSidebarLogout}
					>
						<span className="gx-sidebar-learn-logout-icon" aria-hidden>
							<CiLogout size={20} />
						</span>
						{!sidebarCollapsed && (
							<span className="gx-sidebar-learn-logout-text">
								<span className="gx-sidebar-learn-logout-title">Log out</span>
								<span className="gx-sidebar-learn-logout-sub">End this session</span>
							</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default React.memo(SidebarContent);
