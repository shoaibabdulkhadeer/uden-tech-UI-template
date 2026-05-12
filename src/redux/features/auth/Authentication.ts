import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import API from '../../../config/axios.config';
import { API_ENDPOINTS } from '../../../shared/api-endpoints';
import { environment } from '../../../environments/environment';
import { notification } from 'antd';

//#region AppToken
interface appTokenType {
	appTokenData: any;
	appTokenLoading: boolean;
	appTokenError: string;
}
interface switchRoleType {
	switchRoleData: any;
	switchRoleLoading: boolean;
	switchRoleError: string;
}

const switchRoleInitialState: any = {
	switchRoleData: [],
	switchRoleLoading: false,
	switchRoleError: ''
};

const defaultRoleState: any = {
	defaultRoleData: 0,
	defaultRoleLoading: false,
	defaultRoleError: ''
};

const initialState: appTokenType = {
	appTokenData: [],
	appTokenLoading: false,
	appTokenError: ''
};

const AppTokenAction = createAsyncThunk('app_token', async (input: any) => {
	try {
		const response: any = await API.post(`${API_ENDPOINTS.APP_TOKEN}`, JSON.stringify(input.body), {
			headers: { ...input.headers, 'Ocp-Apim-Subscription-Key': `` }
		});
		return response?.data;
	} catch (error: any) {
		throw error.response;
	}
});

const AppTokenSlice = createSlice({
	name: 'app_token',
	initialState,
	reducers: {
		reset: (state) => {
			state.appTokenData = [];
			state.appTokenLoading = false;
			state.appTokenError = '';
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(AppTokenAction.pending, (state) => {
				state.appTokenLoading = true;
				state.appTokenError = '';
			})
			.addCase(AppTokenAction.fulfilled, (state, action: PayloadAction<any>) => {
				state.appTokenData = action.payload;
				state.appTokenLoading = false;
				state.appTokenError = '';
			})
			.addCase(AppTokenAction.rejected, (state, action: PayloadAction<any>) => {
				state.appTokenData = {};
				state.appTokenLoading = false;
				state.appTokenError = action.payload?.error?.message || 'Something went wrong.';
			});
	}
});

//#endregion

//#region SwitchRole
const SwitchRoleAction = createAsyncThunk('switch_role', async (input: any) => {
	try {
		const response: any = await API.post(`${API_ENDPOINTS.APP_TOKEN}`, input.body, {
			headers: { ...input.headers, 'Ocp-Apim-Subscription-Key': `` }
		});
		return response?.data;
	} catch (error: any) {
		throw error.response;
	}
});

const SwitchRoleSlice = createSlice({
	name: 'switch_role',
	initialState: switchRoleInitialState,
	reducers: {
		reset: (state: switchRoleType) => {
			state.switchRoleData = [];
			state.switchRoleLoading = false;
			state.switchRoleError = '';
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(SwitchRoleAction.pending, (state: switchRoleType) => {
				state.switchRoleLoading = true;
				state.switchRoleError = '';
			})
			.addCase(SwitchRoleAction.fulfilled, (state: switchRoleType, action: PayloadAction<any>) => {
				state.switchRoleData = action.payload;
				state.switchRoleLoading = false;
				state.switchRoleError = '';
			})
			.addCase(SwitchRoleAction.rejected, (state: switchRoleType, action: PayloadAction<any>) => {
				state.switchRoleData = {};
				state.switchRoleLoading = false;
				state.switchRoleError = action.payload?.error?.message || 'Something went wrong.';
			});
	}
});

//#endregion

//#region
const SetDefaultRoleAction = createAsyncThunk('set_default_role', async (input: any) => {
	try {
		const response: any = await API.post(`${API_ENDPOINTS.SETDEFAULT_ROLE}`, input.body, {
			headers: { ...input.headers }
		});
		return response?.data;
	} catch (error: any) {
		throw error.response;
	}
});

// Create slice for setting default role ID
const SetDefaultRoleSlice = createSlice({
	name: 'set_default_role',
	initialState: defaultRoleState,
	reducers: {
		reset: (state: any) => {
			state.defaultRoleData = 0;
			state.defaultRoleLoading = false;
			state.defaultRoleError = '';
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(SetDefaultRoleAction.pending, (state: any) => {
				state.defaultRoleLoading = true;
				state.defaultRoleError = '';
			})
			.addCase(SetDefaultRoleAction.fulfilled, (state: any, action: PayloadAction<any>) => {
				state.defaultRoleData = action.payload;
				state.defaultRoleLoading = false;
				state.defaultRoleError = '';
			})
			.addCase(SetDefaultRoleAction.rejected, (state: any, action: PayloadAction<any>) => {
				state.defaultRoleData = {};
				state.defaultRoleLoading = false;
				state.defaultRoleError = action.payload?.error?.message || 'Something went wrong.';
			});
	}
});

//#endregion

//#region Logout
interface logoutType {
	logoutLoading: boolean;
	logoutError: string;
	logoutStatus: string;
}

const logoutInitialState: logoutType = {
	logoutLoading: false,
	logoutError: '',
	logoutStatus: ''
};

const logoutAction = createAsyncThunk('logout', async (accessToken: string) => {
	try {
		await API.post(`${API_ENDPOINTS.LOGOUT}`, null, {
			headers: {
				AccessToken: accessToken
			}
		});
		return true; // If logout is successful, return true
	} catch (error: any) {
		notification.error({
			// Display error notification
			message: error.response?.data?.message || 'Logout Failed'
		});
		throw error.response;
	}
});

const LogoutSlice = createSlice({
	name: 'logout',
	initialState: logoutInitialState,
	reducers: {
		resetLogoutState: (state) => {
			state.logoutLoading = false;
			state.logoutError = '';
			state.logoutStatus = '';
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(logoutAction.pending, (state) => {
				state.logoutLoading = true;
				state.logoutError = '';
				state.logoutStatus = '';
			})
			.addCase(logoutAction.fulfilled, (state) => {
				state.logoutLoading = false;
				state.logoutError = '';
				state.logoutStatus = 'success';
			})
			.addCase(logoutAction.rejected, (state, action: any) => {
				state.logoutLoading = false;
				state.logoutError = action.payload?.error?.message || 'Something went wrong.';
				state.logoutStatus = 'failed';
			});
	}
});
//#endregion

export { AppTokenAction, SwitchRoleAction, logoutAction, SetDefaultRoleAction };

export const reset = AppTokenSlice.actions,
	resetSwitchRole = SwitchRoleSlice.actions,
	resetLogoutState = LogoutSlice.actions,
	resetDefaultRoleState = SetDefaultRoleSlice.actions;
export const appTakenSlice = AppTokenSlice.reducer,
	switchRoleSlice = SwitchRoleSlice.reducer,
	logoutSlice = LogoutSlice.reducer,
	setDefaultRole = SetDefaultRoleSlice.reducer;
