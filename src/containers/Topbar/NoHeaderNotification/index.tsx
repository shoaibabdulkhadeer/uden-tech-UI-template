import { Header } from "antd/lib/layout/layout";
import { useDispatch, useSelector } from "react-redux";
import UserInfo from "../../../components/layout/UserInfo";
import Auxiliary from "../../../util/Auxiliary";
import SwitchRole from "../../Sidebar/SwitchRole";
import React from "react";
import { toggleCollapsedSideNav } from "../../../appRedux/actions";
import { TAB_SIZE } from "../../../constants/ThemeSetting";
import AppHeaderLead from "../../../components/layout/AppHeaderLead";

const NoHeaderNotification = () => {
  const dispatch = useDispatch();
  const navCollapsed = useSelector(({common}:any) => common.navCollapsed);
  const width = useSelector(({common}:any) => common.width);

  return (
    <Header className="app-header-shell">
      <div className="app-header-shell__inner">
        <div className="app-header-shell__lead">
          {width < TAB_SIZE ? (
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
      {/* <Link to="/" className="gx-d-block gx-d-lg-none gx-pointer">
        <img alt="" src={("/assets/images/w-logo.png")} /></Link> */}

      {/* <SearchBox styleName="gx-d-none gx-d-lg-block gx-lt-icon-search-bar-lg"
        placeholder="Search in app..."
        onChange={updateSearchChatUser}
        value={searchText} /> */}
  
          {/* <AppsNavigation />  */}
      <ul className="gx-header-notifications gx-ml-auto gx-mb-0 app-header-shell__actions">
        <li className="gx-notify gx-notify-search gx-d-inline-block gx-d-lg-none">
          {/* <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={
            <SearchBox styleName="gx-popover-search-bar"
              placeholder="Search in app..."
              onChange={updateSearchChatUser}
              value={searchText} />
          } trigger="click">
            <span className="gx-pointer gx-d-block"><i className="icon icon-search-new" /></span>
          </Popover> */}
        </li>
        {/* {width >= TAB_SIZE ? null : */}
          {/* <Auxiliary>
            <li className="gx-notify">
              <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={<AppNotification />}
                trigger="click">
                <span className="gx-pointer gx-d-block"><i className="icon icon-notification" /></span>
              </Popover>
            </li>

            <li className="gx-msg">
              <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight"
                content={<MailNotification />} trigger="click">
                <span className="gx-pointer gx-status-pos gx-d-block">
                  <i className="icon icon-chat-new" />
                  <span className="gx-status gx-status-rtl gx-small gx-orange" />
                </span>
              </Popover>
            </li>
          </Auxiliary> */}
        {/* } */}
          <Auxiliary>
            <li className="gx-user-nav"><SwitchRole /></li>
            <li className="gx-user-nav"><UserInfo /></li>
          </Auxiliary>
      </ul>
      </div>
    </Header>
  )
};

export default NoHeaderNotification;
