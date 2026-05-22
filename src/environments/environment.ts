/** Set to false before production deploy — skips login and route guards. */
export const BYPASS_AUTH = true;

/** Show sample learning-path cards on the dashboard for UI preview. Set to false when using real API data. */
export const DUMMY_LEARNING_PATHS = false;

/** Unsigned JWT-shaped string so client decode/expiry checks succeed (APIs may still reject). */
export const DEV_BYPASS_ACCESS_TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOiJ0ZXN0LXNlc3Npb24tMDAxIiwidXNlcmlkIjoidGVzdC11c2VyLTAwMSIsInVzZXJOYW1lIjoiQmliaSBUZXN0IiwiZXhwIjoxNzc5MTE3OTk2fQ.NSV1rdOuw1OoZk1T_UZILw-prkFxOyA5lhxx178oskY.bypass';
export const environment = {
	// APP_API_URL: 'https://webappjobaiagentprod-a7fae9fgdkg2a0as.centralindia-01.azurewebsites.net',
	// APP_API_URL: 'http://127.0.0.1:8000/',
	APP_API_URL: 'https://udentech-e2fufmcygshqenea.eastus-01.azurewebsites.net/',
	SERVER_ENVIRONMENT: 'DEV',
	REDIRECT_URL: 'https://cps.uden.tech/version-test/upgrade_to_pro'
};

