import React, { useCallback, useEffect, useMemo, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import {Drawer, Layout} from "antd";

import SidebarContent from "./SidebarContent";
import {toggleCollapsedSideNav} from "../../appRedux/actions";
import {
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_MINI_SIDEBAR,
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  TAB_SIZE,
  THEME_TYPE_LITE
} from "../../constants/ThemeSetting";

const {Sider} = Layout;

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const {themeType, navStyle} = useSelector(({settings}:any) => settings);
  const navCollapsed = useSelector(({common}:any) => common.navCollapsed);
  const width = useSelector(({common}:any) => common.width);
  const dispatch = useDispatch();

  const onToggleCollapsedNav = useCallback(() => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  }, [dispatch, navCollapsed]);

  useEffect(() => {
    if (navStyle === NAV_STYLE_MINI_SIDEBAR || navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR) {
      setSidebarCollapsed(true);
    }
  }, [navStyle]);

  // Recomputes only when navStyle or width changes
  const drawerStyle = useMemo(() => {
    if (
      (navStyle === NAV_STYLE_FIXED ||
        navStyle === NAV_STYLE_MINI_SIDEBAR ||
        navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) &&
      width < TAB_SIZE
    ) return "gx-collapsed-sidebar";

    if (navStyle === NAV_STYLE_FIXED)                       return "";
    if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR)      return "gx-mini-sidebar gx-mini-custom-sidebar";
    if (navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR)  return "gx-custom-sidebar";
    if (navStyle === NAV_STYLE_MINI_SIDEBAR)                return "gx-mini-sidebar";
    if (navStyle === NAV_STYLE_DRAWER)                      return "gx-collapsed-sidebar";
    return "gx-collapsed-sidebar";
  }, [navStyle, width]);

  return (
    <Sider
      className={`gx-app-sidebar ${drawerStyle} ${themeType !== THEME_TYPE_LITE ? 'gx-layout-sider-dark' : null}`}
      trigger={null}
      collapsed={width < TAB_SIZE ? false : sidebarCollapsed}
      theme={themeType === THEME_TYPE_LITE ? "light" : "dark"}
      collapsible>
      {
        navStyle === NAV_STYLE_DRAWER || width < TAB_SIZE ?
          <Drawer
            className={`gx-drawer-sidebar ${themeType !== THEME_TYPE_LITE ? 'gx-drawer-sidebar-dark' : null}`}
            placement="left"
            closable={false}
            onClose={onToggleCollapsedNav}
            visible={navCollapsed}>
            <SidebarContent sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
          </Drawer> :
          <SidebarContent sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      }
    </Sider>)
};
export default Sidebar;
