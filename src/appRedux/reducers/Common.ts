import {FETCH_ERROR, FETCH_START, FETCH_SUCCESS, HIDE_MESSAGE, SHOW_MESSAGE, SET_SIDEBAR_COLLAPSED} from '../../constants/ActionTypes'
import {TOGGLE_COLLAPSED_NAV, WINDOW_WIDTH} from "../../constants/ActionTypes";

const INIT_STATE = {
  error: "",
  loading: false,
  message: '',
  navCollapsed: true,
  sidebarCollapsed: true,
  width: window.innerWidth,
  pathname: '/',
};

const CommonReducer = (state = INIT_STATE, action:any) => {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      return {
        ...state,
        pathname: action.payload.location.pathname,
      };
    }
    case WINDOW_WIDTH:
      return {
        ...state,
        width: action.width,
      };
    case TOGGLE_COLLAPSED_NAV: {
      return {
        ...state,
        navCollapsed: action.navCollapsed
      }
    }
    case SET_SIDEBAR_COLLAPSED: {
      return {
        ...state,
        sidebarCollapsed: action.sidebarCollapsed
      }
    }
    case FETCH_START: {
      return {...state, error: '', message: '', loading: true};
    }
    case FETCH_SUCCESS: {
      return {...state, error: '', message: '', loading: false};
    }
    case SHOW_MESSAGE: {
      return {...state, error: '', message: action.payload, loading: false};
    }
    case FETCH_ERROR: {
      return {...state, loading: false, error: action.payload, message: ''};
    }
    case HIDE_MESSAGE: {
      return {...state, loading: false, error: '', message: ''};
    }
    default:
      return state;
  }
}

export default CommonReducer;
