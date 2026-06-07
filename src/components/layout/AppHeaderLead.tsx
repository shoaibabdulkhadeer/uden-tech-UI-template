import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TAB_SIZE } from '../../constants/ThemeSetting';

const AppHeaderLead = () => {
	const sidebarCollapsed = useSelector(({ common }: any) => common.sidebarCollapsed);
	const width = useSelector(({ common }: any) => common.width);

	// Only show in topbar when sidebar is collapsed on desktop
	if (!sidebarCollapsed || width < TAB_SIZE) return null;

	return (
		<Link
			to="/dashboard"
			style={{
				display: 'flex',
				alignItems: 'center',
				textDecoration: 'none',
				marginLeft: 4,
			}}
		>
			<img
				src="/assets/images/download.png"
				alt="logo"
				style={{ height: 28, width: 'auto' }}
			/>
		</Link>
	);
};

export default AppHeaderLead;
