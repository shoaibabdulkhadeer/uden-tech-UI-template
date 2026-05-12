import {SWITCH_LANGUAGE, TOGGLE_COLLAPSED_NAV, WINDOW_WIDTH} from "../../constants/ActionTypes";
import {LAYOUT_TYPE, NAV_STYLE, THEME_COLOR, THEME_TYPE, UPDATE_RTL_STATUS} from "../../constants/ThemeSetting";

export function toggleCollapsedSideNav(navCollapsed:any) {
  return {type: TOGGLE_COLLAPSED_NAV, navCollapsed};
}

export function updateWindowWidth(width:any) {
  return (dispatch:any) => {
    dispatch({type: WINDOW_WIDTH, width});
  }
}

export function setThemeType(themeType:any) {
  return (dispatch:any) => {
    dispatch({type: THEME_TYPE, themeType});
  }
}

export function setThemeColor(themeColor:any) {
  return (dispatch:any) => {
    dispatch({type: THEME_COLOR, themeColor});
  }
}

export function setDirectionRTL(rtlStatus:any) {
  return (dispatch:any) => {
    dispatch({type: UPDATE_RTL_STATUS, rtlStatus});
  }
}

export function onNavStyleChange(navStyle:any) {
  return (dispatch:any) => {
    dispatch({type: NAV_STYLE, navStyle});
  }
}

export function onLayoutTypeChange(layoutType:any) {
  return (dispatch:any) => {
    dispatch({type: LAYOUT_TYPE, layoutType});
  }
}

export function switchLanguage(locale:any) {
  return (dispatch:any) => {
    dispatch({
      type: SWITCH_LANGUAGE,
      payload: locale
    });
  }
}
