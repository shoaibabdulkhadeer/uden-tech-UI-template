import { Link, useLocation } from 'react-router-dom';

const ROUTE_LEAD: Record<string, { title: string; subtitle: string }> = {
	'/dashboard': { title: 'Dashboard', subtitle: 'Overview and learning progress' },
	'/learn': { title: 'Learning hub', subtitle: 'Paths, skills, and growth' },
	'/job-search': { title: 'Job search', subtitle: 'Roles matched to your path' }
};

const AppHeaderLead = () => {
	const { pathname } = useLocation();
	const lead = ROUTE_LEAD[pathname] ?? { title: 'Workspace', subtitle: 'Uden Tech learning' };

	return (
		<div className="app-header-lead">
			<Link to="/dashboard" className="app-header-lead__mark" aria-label="Home">
				<img src="/assets/images/download.png" alt="" className="app-header-lead__logo" width={36} height={36} />
			</Link>
			<div className="app-header-lead__text">
				<span className="app-header-lead__title">{lead.title}</span>
				<span className="app-header-lead__subtitle">{lead.subtitle}</span>
			</div>
		</div>
	);
};

export default AppHeaderLead;
