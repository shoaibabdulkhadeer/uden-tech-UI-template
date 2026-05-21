import { Link } from 'react-router-dom';

const AppHeaderLead = () => {

	return (
		<div className="app-header-lead">
			<Link to="/dashboard" className="app-header-lead__mark" aria-label="Home">
				<img src="/assets/images/download.png" alt="" className="app-header-lead__logo" width={36} height={36} />
			</Link>
		</div>
	);
};

export default AppHeaderLead;
