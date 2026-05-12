import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button, Dropdown, Layout, Menu, Popover, Space, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { toggleCollapsedSideNav } from '../../appRedux/actions';
import SearchBox from '../../components/layout/SearchBox';
import UserInfo from '../../components/layout/UserInfo';
import AppHeaderLead from '../../components/layout/AppHeaderLead';
import AppNotification from '../../components/layout/AppNotification';
import MailNotification from '../../components/layout/MailNotification';
import Auxiliary from '../../util/Auxiliary';

import { NAV_STYLE_DRAWER, NAV_STYLE_FIXED, NAV_STYLE_MINI_SIDEBAR, TAB_SIZE } from '../../constants/ThemeSetting';
import { useDispatch, useSelector } from 'react-redux';
import AppsNavigation from '../Sidebar/AppsNavigation';
import UserProfile from '../Sidebar/UserProfile';
import { BellOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import SwitchRole from '../Sidebar/SwitchRole';
import { AppContext } from '../../context/AppContext';
import { tokenDecoder } from '../../shared/shared-functions';
import { HiMiniBellAlert } from 'react-icons/hi2';
import { RoleEnum } from '../../common/enums';

const { Header } = Layout;

const Topbar = () => {
	const { navStyle } = useSelector(({ settings }: any) => settings);
	const navCollapsed = useSelector(({ common }: any) => common.navCollapsed);
	const width = useSelector(({ common }: any) => common.width);
	const [searchText, setSearchText] = useState('');
	const dispatch = useDispatch(),
		[newAlertTriggered, setNewAlertTriggered] = useState<boolean>(false),
		[alertTriggerCount, setAlertTriggerCount] = useState<number>(0);

	const decodedToken = tokenDecoder(sessionStorage.getItem('accessToken'));
	const roleName = decodedToken?.myDecodedToken?.RoleName ? decodedToken?.myDecodedToken?.RoleName : 'Not defined';

	const updateSearchChatUser = (evt: any) => {
		setSearchText(evt.target.value);
	};

	// useEffect(() => {
	// 	if (SocketData || SocketAdminData) {
	// 		if (roleName === RoleEnum.Admin || roleName === RoleEnum.ConfigurationManager) {
	// 			setNewAlertTriggered(true);
	// 			setAlertTriggerCount((prev: number) => prev + 1);
	// 			setFetchAlertResContex(SocketAdminData?.alertData);
	// 		} else if (roleName === RoleEnum.ConfigurationManager) {
	// 			setNewAlertTriggered(true);
	// 			setAlertTriggerCount((prev: number) => prev + 1);
	// 			setFetchAlertResContex(SocketData?.alertData);
	// 		}
	// 	}
	// }, [SocketData, SocketAdminData]);

	const handleClickUrl = () => {
		// setScroll(true);
		// setAlertTriggerCount(0);
		// setNewAlertTriggered(false);
	};

	return (
		<Header className="app-header-shell">
			<div className="app-header-shell__inner">
				<div className="app-header-shell__lead">
					{navStyle === NAV_STYLE_DRAWER || ((navStyle === NAV_STYLE_FIXED || navStyle === NAV_STYLE_MINI_SIDEBAR) && width < TAB_SIZE) ? (
						<div className="gx-linebar gx-mr-0">
							<i
								className="gx-icon-btn icon icon-menu"
								onClick={() => {
									dispatch(toggleCollapsedSideNav(!navCollapsed));
								}}
							/>
						</div>
					) : null}
					<AppHeaderLead />
				</div>
			{/* <Link to="/realtimedashboard" className="gx-d-block gx-d-lg-none gx-pointer">
			<CardHeader
                  icon={
                    newAlertTriggered ? (
                      <Tooltip
                        title={
                          "A new alert has triggered, click to retrieve the most recent data."
                        }
                      >
                        <Badge
                          count={alertTriggerCount}
                          size="small"
                          offset={[5, 0]}
                        >
                          <BellOutlined
                            className="bell-icon"
                            style={{
                              color: "#F5222D",
                              cursor: "pointer",
                              fontSize: "20px",
                            }}
                           // onClick={handleGetRealTimeData}
                          />
                        </Badge>{" "}
                        &nbsp;
                      </Tooltip>
                    ) : (
                      <HiMiniBellAlert style={{ fontSize: "20px" }} />
                    )
                  }
                  title={"ALERTS"}
                />
		</Link> */}

			{/* <SearchBox styleName="gx-d-none gx-d-lg-block gx-lt-icon-search-bar-lg"
        placeholder="Search in app..."
        onChange={updateSearchChatUser}
        value={searchText} /> */}

			{/* <AppsNavigation />  */}
				<ul className="gx-header-notifications gx-ml-auto gx-mb-0 app-header-shell__actions">
					<li className="gx-user-nav">
						<SwitchRole />
					</li>

					<Auxiliary>
						<li className="gx-user-nav">
							<UserInfo />
						</li>
					</Auxiliary>
				</ul>
			</div>
		</Header>
	);
};

export default Topbar;
