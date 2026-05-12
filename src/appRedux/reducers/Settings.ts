import { SWITCH_LANGUAGE } from '../../constants/ActionTypes';
import {
	LAYOUT_TYPE,
	LAYOUT_TYPE_FULL,
	NAV_STYLE,
	NAV_STYLE_FIXED,
	THEME_COLOR,
	THEME_TYPE,
	THEME_TYPE_LITE,
	THEME_TYPE_SEMI_DARK,
	UPDATE_RTL_STATUS
} from '../../constants/ThemeSetting';

const initialSettings = {
	navStyle: localStorage.navStyle ?? NAV_STYLE_FIXED,
	layoutType: localStorage.layoutType ?? LAYOUT_TYPE_FULL,
	// themeType: localStorage.themeType ?? THEME_TYPE_SEMI_DARK,
	themeType:  THEME_TYPE_LITE,
	// themeColor: localStorage.themeColor ?? '',

	isDirectionRTL: localStorage.isDirectionRTL ?? false,
	locale: {
		languageId: 'english',
		locale: 'en',
		name: 'English',
		icon: 'us'
	}
};

const SettingsReducer = (state = initialSettings, action: any) => {
	switch (action.type) {
		case THEME_TYPE:
			localStorage.themeType = action.themeType;
			return {
				...state,
				themeType: action.themeType
			};
		case THEME_COLOR:
			localStorage.themeColor = action.themeColor;
			return {
				...state,
				themeColor: action.themeColor
			};

		case UPDATE_RTL_STATUS:
			localStorage.rtlStatus = action.rtlStatus;
			return {
				...state,
				isDirectionRTL: action.rtlStatus
			};

		case NAV_STYLE:
			localStorage.navStyle = action.navStyle;
			return {
				...state,
				navStyle: action.navStyle
			};
		case LAYOUT_TYPE:
			localStorage.layoutType = action.layoutType;
			return {
				...state,
				layoutType: action.layoutType
			};

		case SWITCH_LANGUAGE:
			return {
				...state,
				locale: action.payload
			};
		default:
			return state;
	}
};

export default SettingsReducer;
