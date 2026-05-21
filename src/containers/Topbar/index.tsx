import React from 'react';
import { Layout } from 'antd';
import { toggleCollapsedSideNav } from '../../appRedux/actions';
import UserInfo from '../../components/layout/UserInfo';
import AppHeaderLead from '../../components/layout/AppHeaderLead';
import { NAV_STYLE_DRAWER, NAV_STYLE_FIXED, NAV_STYLE_MINI_SIDEBAR, TAB_SIZE } from '../../constants/ThemeSetting';
import { useDispatch, useSelector } from 'react-redux';
import SwitchRole from '../Sidebar/SwitchRole';
import RecommendationBell from '../../components/layout/RecommendationBell';

const { Header } = Layout;

const Topbar = () => {
	const { navStyle } = useSelector(({ settings }: any) => settings);
	const navCollapsed = useSelector(({ common }: any) => common.navCollapsed);
	const width = useSelector(({ common }: any) => common.width);
	const dispatch = useDispatch();

	return (
		<Header className="app-header-shell">
			<div className="app-header-shell__inner">

				{/* Left — hamburger (mobile) + logo + page title */}
				<div className="app-header-shell__lead">
					{(navStyle === NAV_STYLE_DRAWER || ((navStyle === NAV_STYLE_FIXED || navStyle === NAV_STYLE_MINI_SIDEBAR) && width < TAB_SIZE)) && (
						<div className="gx-linebar gx-mr-0">
							<i className="gx-icon-btn icon icon-menu" onClick={() => dispatch(toggleCollapsedSideNav(!navCollapsed))} />
						</div>
					)}
					<AppHeaderLead />
				</div>

				{/* Right — bell · switch role · user profile */}
				<div className="app-header-shell__actions">
					<RecommendationBell />
					<SwitchRole />
					<UserInfo />
				</div>

			</div>
		</Header>
	);
};

export default Topbar;
