import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Route, useLocation } from 'react-router-dom';

import { setInitUrl } from '../../appRedux/actions/Auth';
import { onLayoutTypeChange, onNavStyleChange, setThemeType } from '../../appRedux/actions/Setting';

import {
	LAYOUT_TYPE_BOXED,
	LAYOUT_TYPE_FRAMED,
	LAYOUT_TYPE_FULL,
	NAV_STYLE_ABOVE_HEADER,
	NAV_STYLE_BELOW_HEADER,
	NAV_STYLE_DARK_HORIZONTAL,
	NAV_STYLE_DEFAULT_HORIZONTAL,
	NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
	THEME_TYPE_DARK
} from '../../constants/ThemeSetting';
import AppRoutes from '../../routes';

const RestrictedRoute = ({ component: Component, location, ...rest }: any) => <Route {...rest} render={(props: any) => <Component {...props} />} />;

const setLayoutType = (layoutType: any) => {
	if (layoutType === LAYOUT_TYPE_FULL) {
		document.body.classList.remove('boxed-layout');
		document.body.classList.remove('framed-layout');
		document.body.classList.add('full-layout');
	} else if (layoutType === LAYOUT_TYPE_BOXED) {
		document.body.classList.remove('full-layout');
		document.body.classList.remove('framed-layout');
		document.body.classList.add('boxed-layout');
	} else if (layoutType === LAYOUT_TYPE_FRAMED) {
		document.body.classList.remove('boxed-layout');
		document.body.classList.remove('full-layout');
		document.body.classList.add('framed-layout');
	}
};

const setNavStyle = (navStyle: any) => {
	if (
		navStyle === NAV_STYLE_DEFAULT_HORIZONTAL ||
		navStyle === NAV_STYLE_DARK_HORIZONTAL ||
		navStyle === NAV_STYLE_INSIDE_HEADER_HORIZONTAL ||
		navStyle === NAV_STYLE_ABOVE_HEADER ||
		navStyle === NAV_STYLE_BELOW_HEADER
	) {
		document.body.classList.add('full-scroll');
		document.body.classList.add('horizontal-layout');
	} else {
		document.body.classList.remove('full-scroll');
		document.body.classList.remove('horizontal-layout');
	}
};

let styleSheetLink = document.createElement('link');
styleSheetLink.type = 'text/css';
styleSheetLink.rel = 'stylesheet';
document.body.appendChild(styleSheetLink);

const MyApp = () => {
	const locale = useSelector(({ settings }: any) => settings.locale);
	const navStyle = useSelector(({ settings }: any) => settings.navStyle);
	const layoutType = useSelector(({ settings }: any) => settings.layoutType);
	const themeColor = useSelector(({ settings }: any) => settings.themeColor);
	const themeType = useSelector(({ settings }: any) => settings.themeType);
	const isDirectionRTL = useSelector(({ settings }: any) => settings.isDirectionRTL);

	const dispatch = useDispatch();
	const { initURL } = useSelector(({ auth }: any) => auth);

	const location = useLocation();

	useEffect(() => {
		if (isDirectionRTL) {
			document.documentElement.classList.add('rtl');
			document.documentElement.setAttribute('data-direction', 'rtl');
		} else {
			document.documentElement.classList.remove('rtl');
			document.documentElement.setAttribute('data-direction', 'ltr');
		}

		if (themeColor) {
			styleSheetLink.href = `/css/${themeColor}.min.css`;
		}
	}, [themeColor, isDirectionRTL]);

	useEffect(() => {
		if (themeType === THEME_TYPE_DARK) {
			document.body.classList.add('dark-theme');
			styleSheetLink.href = '/css/dark_theme.min.css';
		} else if (document.body.classList.contains('dark-theme')) {
			document.body.classList.remove('dark-theme');
			styleSheetLink.href = '';
		}
	}, [themeType]);

	useEffect(() => {
		if (locale) document.documentElement.lang = locale.locale;
	}, [locale]);

	useEffect(() => {
		if (initURL === '') {
			dispatch(setInitUrl(location.pathname));
		}
		const params = new URLSearchParams(location.search);

		if (params.has('theme')) {
			dispatch(setThemeType(params.get('theme')));
		}
		if (params.has('nav-style')) {
			dispatch(onNavStyleChange(params.get('nav-style')));
		}
		if (params.has('layout-type')) {
			dispatch(onLayoutTypeChange(params.get('layout-type')));
		}
	}, [location.search, dispatch, initURL, location.pathname]);

	useEffect(() => {
		setLayoutType(layoutType);
		setNavStyle(navStyle);
	}, [layoutType, navStyle]);

	return <AppRoutes />;
};

// export default memo(App);
export default MyApp;
