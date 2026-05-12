import React from 'react';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../AppSidebar';
import HorizontalDefault from '../../Topbar/HorizontalDefault';
import HorizontalDark from '../../Topbar/HorizontalDark';
import InsideHeader from '../../Topbar/InsideHeader';
import AboveHeader from '../../Topbar/AboveHeader';
import BelowHeader from '../../Topbar/BelowHeader';
import Topbar from '../../Topbar';
import NoHeaderNotification from '../../Topbar/NoHeaderNotification';
import Customizer from '../../Customizer';
import {
	NAV_STYLE_ABOVE_HEADER,
	NAV_STYLE_BELOW_HEADER,
	NAV_STYLE_DARK_HORIZONTAL,
	NAV_STYLE_DEFAULT_HORIZONTAL,
	NAV_STYLE_DRAWER,
	NAV_STYLE_FIXED,
	NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
	NAV_STYLE_MINI_SIDEBAR,
	NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
	NAV_STYLE_NO_HEADER_MINI_SIDEBAR
} from '../../../constants/ThemeSetting';

const { Content } = Layout;

const PublicLayout = () => {
	const { navStyle } = useSelector(({ settings }: any) => settings);

	const getNavStyles = (navStyle: any) => {
		switch (navStyle) {
			case NAV_STYLE_DEFAULT_HORIZONTAL:
				return <HorizontalDefault />;
			case NAV_STYLE_DARK_HORIZONTAL:
				return <HorizontalDark />;
			case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
				return <InsideHeader />;
			case NAV_STYLE_ABOVE_HEADER:
				return <AboveHeader />;
			case NAV_STYLE_BELOW_HEADER:
				return <BelowHeader />;
			case NAV_STYLE_FIXED:
				return <Topbar />;
			case NAV_STYLE_DRAWER:
				return <Topbar />;
			case NAV_STYLE_MINI_SIDEBAR:
				return <Topbar />;
			case NAV_STYLE_NO_HEADER_MINI_SIDEBAR:
				return <NoHeaderNotification />;
			case NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR:
				return <NoHeaderNotification />;
			default:
				return null;
		}
	};

	return (
		<Layout className="gx-app-layout">
			<AppSidebar navStyle={navStyle} />
			<Layout>
				{getNavStyles('gx-container-wrap')}
				<Content className={`gx-layout-content gx-container-wrap`}>
					<div
						style={{
							padding: '10px 24px 0 24px'
						}}
					>
						<Outlet />
					</div>
				</Content>
			</Layout>
			<Customizer />
		</Layout>
	);
};
export default PublicLayout;
