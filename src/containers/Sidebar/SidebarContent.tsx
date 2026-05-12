import { Menu, Modal, Tooltip } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CiLogout } from 'react-icons/ci';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSession } from '../../redux/features/auth/logoutSessionSlice';
import { AppDispatch } from '../../redux/store';
import { toggleCollapsedSideNav } from '../../appRedux/actions';
import {
	NAV_STYLE_DRAWER,
	NAV_STYLE_FIXED,
	NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
	NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
	TAB_SIZE,
	THEME_TYPE_LITE
} from '../../constants/ThemeSetting';
import CustomScrollbars from '../../util/CustomScrollbars';
import DashboardShellNetwork from '../../components/features/Dashboard/DashboardShellNetwork';
import SidebarLogo from './SidebarLogo';
import '../../styles/dashboard-nextgen.css';
import './SidebarContent.css';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const SidebarContent = ({ sidebarCollapsed, setSidebarCollapsed }: { sidebarCollapsed: boolean; setSidebarCollapsed: (v: boolean) => void }) => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const width = useSelector(({ common }: any) => common.width);
	const { navStyle, themeType } = useSelector(({ settings }: any) => settings),
		getNoHeaderClass = (navStyle: any) => {
			if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR || navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) {
				return 'gx-no-header-notifications';
			}
			return '';
		},
		getNavStyleSubMenuClass = (navStyle: any) => {
			if (navStyle === NAV_STYLE_FIXED) {
				return 'gx-no-header-submenu-popup ant-menu-item-selected';
			}
			return '';
		};

	const [openKeys, setOpenKeys] = useState<string[]>([]); // State to manage open submenus
	const openKeysBeforeCollapseRef = useRef<string[]>([]);
	// const menusData = useSelector((state: any) => state?.menus?.menusData);

	const closeOverlayDrawer = useCallback(() => {
		if (navStyle === NAV_STYLE_DRAWER || width < TAB_SIZE) {
			dispatch(toggleCollapsedSideNav(false));
		}
	}, [dispatch, navStyle, width]);

	useEffect(() => {
		if (sidebarCollapsed) {
			setOpenKeys((prev) => {
				openKeysBeforeCollapseRef.current = prev;
				return [];
			});
		} else {
			setOpenKeys(openKeysBeforeCollapseRef.current);
		}
	}, [sidebarCollapsed]);

	const onOpenChange = (keys: string[]) => {
		const latestOpenKey = keys.find((key) => !openKeys.includes(key));
		setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
	};

	const menusData = {
		data: {
			Menu: [
				// {
				// {
				// 	MenuId: 'Profile',

				// 	subMenu: [
				// 	  {
				// 		id: 'Profile',
				// 		SubmenuTitle: 'Profile',
				// 		Url: '/home',
				// 		IconClass: 'icon icon-avatar',
				// 	  },
				// 	],
				//   },
				{
					MenuId: 'dashboard',
					//   MenuTitle: 'Dashboard',
					//   IconClass: 'fas fa-tachometer-alt',
					subMenu: [
						{
							id: 'dashboard',
							SubmenuTitle: 'Dashboard',
							Url: '/dashboard',
							IconClass: 'icon icon-data-display',
						},
					],
				},
				{
					MenuId: 'generate',
					// MenuTitle: 'Generate Learning Path',
					//   IconClass: 'fas fa-tachometer-alt',
					subMenu: [
						{
							id: 'generate',
							SubmenuTitle: 'Learning Path',
							Url: '/learn',
							IconClass: 'icon icon-ripple',
						},
					],
				},
				{
					MenuId: 'jobsearch',
					subMenu: [
						{
							id: 'job-search',
							SubmenuTitle: 'Career Acceleration',
							Url: '/job-search',
							IconClass: 'icon icon-search-new',
						},
					],
				},
				{
					MenuId: 'jobmanagement',
					subMenu: [
						{
							id: 'job-management',
							SubmenuTitle: 'Admin Nexus',
							Url: '/job-management',
							IconClass: 'icon icon-setting',
						},
					],
				},
				{
					MenuId: 'usermanagement',
					subMenu: [
						{
							id: 'user-management',
							SubmenuTitle: 'User Management',
							Url: '/user-management',
							IconClass: 'icon icon-avatar',
						},
					],
				},
				//   MenuId: 'Dashboard',
				//   MenuTitle: 'Dashboard',
				//   IconClass: 'fas fa-tachometer-alt',
				//   subMenu: [
				// 	{
				// 	  id: 'Dashboard',
				// 	  SubmenuTitle: 'Generate Learning Path',
				// 	  Url: '/dashboard/overview',
				// 	  IconClass: 'icon icon-data-display',
				// 	},
				//   ],
				// },
				// {
				//   MenuId: 'users',
				//   MenuTitle: 'Users',
				//   IconClass: 'fas fa-users',
				//   subMenu: [
				// 	{
				// 	  id: 'all-users',
				// 	  SubmenuTitle: 'All Users',
				// 	  Url: '/users/all',
				// 	  IconClass: 'fas fa-user-friends',
				// 	},
				// 	{
				// 	  id: 'add-user',
				// 	  SubmenuTitle: 'Add User',
				// 	  Url: '/users/add',
				// 	  IconClass: 'fas fa-user-plus',
				// 	},
				//   ],
				// },

			],
		},
	};

	const [selectedKey, setSelectedKey] = useState<string>('');


	const location = useLocation();

	useEffect(() => {
		const activeKey = location.pathname;
		if (activeKey === '/dashboard') {
			setSelectedKey('dashboard');
		} else if (activeKey === '/learn') {
			setSelectedKey('generate');
		} else if (activeKey === '/job-search') {
			setSelectedKey('job-search');
		} else if (activeKey === '/job-management') {
			setSelectedKey('job-management');
		} else if (activeKey === '/user-management') {
			setSelectedKey('user-management');
		} else {
			setSelectedKey('');
		}
	}, [location]);

	const shellThemeClass =
		themeType === THEME_TYPE_LITE ? 'gx-sidebar-learn-shell--light' : 'gx-sidebar-learn-shell--dark';

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
			onCancel() {}
		});
	}, [dispatch, navigate]);

	return (
		<div className={`gx-sidebar-learn-shell ${shellThemeClass}`}>
			<div className="gx-sidebar-learn-nodes" aria-hidden>
				<DashboardShellNetwork className="gx-sidebar-shell-network" suspendLoop={sidebarCollapsed} />
			</div>

			<div className="gx-sidebar-learn-front">
				<SidebarLogo sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
				<div className="gx-sidebar-content gx-sidebar-learn-scroll">
					<div className={` ${getNoHeaderClass(navStyle)}`}>{/* Optional header content */}</div>
					<CustomScrollbars className="gx-layout-sider-scrollbar" style={{ minHeight: '500px' }}>
						<Menu
						openKeys={openKeys} // Controlled open keys
						onOpenChange={onOpenChange} // Handle submenu open/close
						selectedKeys={selectedKey ? [selectedKey] : []}
						theme={themeType === THEME_TYPE_LITE ? 'light' : 'dark'}
						mode="inline"
					>
						<MenuItemGroup key="main" className="gx-menu-group" title={''}>
							{menusData?.data?.Menu?.map((menu: any) => {
								if (menu?.subMenu?.length === 1) {
									// Render as a single menu item without a collapse button
									const submenu = menu?.subMenu[0];
									return (
										<Menu.Item key={submenu?.id}>
											<Link
												to={submenu?.Url}
												onClick={() => {
													setSelectedKey(submenu?.id);
													closeOverlayDrawer();
												}}
											>
												<i className={submenu?.IconClass} />
												<span>{submenu?.SubmenuTitle}</span>
											</Link>
										</Menu.Item>

									);
								} else {
									// Render as a collapsible submenu
									return (
										<SubMenu
											key={menu?.MenuId}
											popupClassName={getNavStyleSubMenuClass(navStyle)}
											title={
												<span>
													<i className={menu?.IconClass} />
													<span>{menu?.MenuTitle}</span>
												</span>
											}
										>
											{menu?.subMenu?.map((submenu: any) => (
												<Menu.Item key={submenu?.id}>
													<Tooltip title={submenu?.SubmenuTitle?.length >= 15 ? submenu?.SubmenuTitle : ''}>
														<Link to={submenu?.Url}>
															<i className={submenu?.IconClass} />
															<span>{submenu?.SubmenuTitle}</span>
														</Link>
													</Tooltip>
												</Menu.Item>
											))}
										</SubMenu>
									);
								}
							})}
						</MenuItemGroup>
					</Menu>

					{/* <Menu
							defaultOpenKeys={[selectedMainMenu.toString()]}
							selectedKeys={[selectedKeys]}
							theme={themeType === THEME_TYPE_LITE ? 'light' : 'dark'}
							mode="inline"
						>
							<MenuItemGroup key="main" className="gx-menu-group" title={''}>
								{menusData?.data?.Menu?.map((menu: any) => (
									<SubMenu
										key={menu?.MenuId}
										popupClassName={getNavStyleSubMenuClass(navStyle)}
										title={
											<span onClick={() => handleMenuClick(menu.MenuId)}>
												<i className={menu?.IconClass} />
												<span>{menu.MenuTitle}</span>
											</span>
										}
									>
										{menu?.subMenu?.map((submenu: any) => (
											<Menu.Item
												key={submenu.id}
												onClick={() => {
													setOpenedMenu(submenu.id);
												}}
												className={openedMenu === submenu.id ? 'ant-menu-item-selected' : ''}
											>
												<Link to={submenu.Url}>
													<i className={submenu?.IconClass} />
													<span>{submenu?.SubmenuTitle}</span>
												</Link>
											</Menu.Item>
										))}
									</SubMenu>
								))}
							</MenuItemGroup>
						</Menu> */}
					</CustomScrollbars>
				</div>

				<div className="gx-sidebar-learn-foot">
					<Link
						to="/learn"
						className="gx-sidebar-learn-foot-link"
						onClick={() => {
							setSelectedKey('generate');
							closeOverlayDrawer();
						}}
					>
						<span className="gx-sidebar-learn-foot-icon" aria-hidden>
							<i className="icon icon-ripple" />
						</span>
						<span className="gx-sidebar-learn-foot-text">
							<span className="gx-sidebar-learn-foot-title">Learning hub</span>
							<span className="gx-sidebar-learn-foot-sub">Paths, skills & steady growth</span>
						</span>
					</Link>
					<button
						type="button"
						className="gx-sidebar-learn-logout"
						onClick={handleSidebarLogout}
					>
						<span className="gx-sidebar-learn-logout-icon" aria-hidden>
							<CiLogout size={20} />
						</span>
						<span className="gx-sidebar-learn-logout-text">
							<span className="gx-sidebar-learn-logout-title">Log out</span>
							<span className="gx-sidebar-learn-logout-sub">End this session</span>
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default React.memo(SidebarContent);
