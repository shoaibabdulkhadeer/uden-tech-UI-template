import { Link, useLocation } from 'react-router-dom';
import {
	MdSpaceDashboard,
	MdAutoGraph,
	MdRocketLaunch,
	MdAdminPanelSettings,
	MdManageAccounts,
} from 'react-icons/md';

const ROUTE_META: Record<string, { title: string; subtitle: string; Icon: React.ElementType; color: string }> = {
	'/dashboard':       { title: 'Dashboard',            subtitle: 'Analytics, activity & live stats',       Icon: MdSpaceDashboard,    color: '#6366f1' },
	'/learn':           { title: 'Learning Path',         subtitle: 'AI-generated skill roadmaps',            Icon: MdAutoGraph,          color: '#0ea5e9' },
	'/job-search':      { title: 'Career Acceleration',   subtitle: 'AI-matched jobs & applications',         Icon: MdRocketLaunch,       color: '#7c3aed' },
	'/job-management':  { title: 'Admin Nexus',           subtitle: 'Post, review & manage roles',            Icon: MdAdminPanelSettings, color: '#d97706' },
	'/user-management': { title: 'User Management',       subtitle: 'Roles, access & team accounts',          Icon: MdManageAccounts,     color: '#059669' },
};

const AppHeaderLead = () => {
	const { pathname } = useLocation();
	const meta = ROUTE_META[pathname] ?? { title: 'Workspace', subtitle: 'Uden Tech learning platform', Icon: MdSpaceDashboard, color: '#6366f1' };
	const { title, subtitle, Icon, color } = meta;

	return (
		<div className="app-header-lead">
			<Link to="/dashboard" className="app-header-lead__mark" aria-label="Home">
				<img src="/assets/images/download.png" alt="" className="app-header-lead__logo" width={36} height={36} />
			</Link>

			<div className="app-header-lead__divider" aria-hidden />

			<div className="app-header-lead__page">
				<span className="app-header-lead__page-icon" style={{ '--page-color': color } as React.CSSProperties}>
					<Icon size={15} />
				</span>
				<div className="app-header-lead__text">
					<span className="app-header-lead__title">{title}</span>
					<span className="app-header-lead__subtitle">{subtitle}</span>
				</div>
			</div>
		</div>
	);
};

export default AppHeaderLead;
