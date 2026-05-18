import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { toggleCollapsedSideNav } from '../../appRedux/actions';
import UserInfo from '../../components/layout/UserInfo';
import AppHeaderLead from '../../components/layout/AppHeaderLead';
import { NAV_STYLE_DRAWER, NAV_STYLE_FIXED, NAV_STYLE_MINI_SIDEBAR, TAB_SIZE } from '../../constants/ThemeSetting';
import { useDispatch, useSelector } from 'react-redux';
import SwitchRole from '../Sidebar/SwitchRole';
import { MdOutlineWbSunny, MdNightlight } from 'react-icons/md';
import { RiWifiLine } from 'react-icons/ri';

const { Header } = Layout;

const LiveClock = () => {
	const [time, setTime] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(id);
	}, []);
	const h = time.getHours();
	const ampm = h >= 12 ? 'PM' : 'AM';
	const hh = String(h % 12 || 12).padStart(2, '0');
	const mm = String(time.getMinutes()).padStart(2, '0');
	const day = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	const isDay = h >= 6 && h < 19;
	return (
		<div className="topbar-clock" aria-label="Current time">
			{isDay ? <MdOutlineWbSunny className="topbar-clock-icon topbar-clock-icon--day" /> : <MdNightlight className="topbar-clock-icon topbar-clock-icon--night" />}
			<div className="topbar-clock-body">
				<span className="topbar-clock-time">{hh}:{mm} <span className="topbar-clock-ampm">{ampm}</span></span>
				<span className="topbar-clock-date">{day}</span>
			</div>
		</div>
	);
};

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

				{/* Right — clock · switch role · user profile */}
				<div className="app-header-shell__actions">
					<LiveClock />
					<div className="topbar-divider" aria-hidden />
					<SwitchRole />
					<UserInfo />
				</div>

			</div>
		</Header>
	);
};

export default Topbar;
