import { startTransition } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
	NAV_STYLE_DRAWER,
	NAV_STYLE_FIXED,
	NAV_STYLE_MINI_SIDEBAR,
	NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
	NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
	TAB_SIZE,
	THEME_TYPE_LITE
} from '../../constants/ThemeSetting';

const SidebarLogo = ({
	sidebarCollapsed,
	setSidebarCollapsed
}: {
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (v: boolean) => void;
}) => {
	const { themeType } = useSelector(({ settings }: any) => settings);
	const width = useSelector(({ common }: any) => common.width);
	let navStyle = useSelector(({ settings }: any) => settings.navStyle);
	if (width < TAB_SIZE && navStyle === NAV_STYLE_FIXED) {
		navStyle = NAV_STYLE_DRAWER;
	}

	const showCollapseToggle =
		width >= TAB_SIZE &&
		(navStyle === NAV_STYLE_FIXED ||
			navStyle === NAV_STYLE_MINI_SIDEBAR ||
			navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR ||
			navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR);

	return (
		<div className="gx-layout-sider-header">
			{showCollapseToggle ? (
				<div className="gx-linebar">
					<i
						className={`gx-icon-btn icon icon-${!sidebarCollapsed ? 'menu-unfold' : 'menu-fold'} ${
							themeType !== THEME_TYPE_LITE ? 'gx-text-white' : ''
						}`}
						role="button"
						tabIndex={0}
						aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							const next = !sidebarCollapsed;
							startTransition(() => setSidebarCollapsed(next));
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								e.stopPropagation();
								const next = !sidebarCollapsed;
								startTransition(() => setSidebarCollapsed(next));
							}
						}}
					/>
				</div>
			) : null}
			<Link to="/dashboard" className="gx-site-logo">
				{navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR && width >= TAB_SIZE ? (
					<img alt="lo" src={'/assets/images/download.png'} />
				) : themeType === THEME_TYPE_LITE ? (
					<img alt="logo1" src={'/assets/images/download.png'} width={76} />
				) : (
					<div className='gx-d-flex gx-align-items-center'>
					<img alt="logo2" src={'/assets/images/download.png'} width={70} />
					{/* <p className='gx-p-0 gx-m-0' style={{color:"blue"}}>Uden Tech</p> */}
					</div>
				)}
			</Link>
		</div>
	);
};

export default SidebarLogo;
