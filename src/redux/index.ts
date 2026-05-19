import { combineReducers } from 'redux';
import Auth from '../appRedux/reducers/Auth';
import Common from '../appRedux/reducers/Common';
import Settings from '../appRedux/reducers/Settings';
import { appTakenSlice, logoutSlice, setDefaultRole, switchRoleSlice } from './features/auth/Authentication';
import { learningPathReducer } from './features/learningPath/learningPathSlice';
import { summarizeReducer } from './features/learningPath/SummarizeSlice';
import { getQuizStateSlice } from './features/Quiz/getQuiz';
import { dashboardReducer } from './features/dashboard/dashboardSlice';
import { continueLearningPathReducer } from './features/learningPath/continueLearningPathSlice';
import { submitQuizStateSlice } from './features/Quiz/submitQuiz';
import { attemptedQuizStateSlice } from './features/Quiz/attemptedQuiz';
import { viewEachQuizStateSlice } from './features/Quiz/viewIndividualQuiz';
import { sessionLoginReducer } from './features/auth/sessionLoginSlice';
import { tokenReducer } from './features/dashboard/tokenSlice';
import { logoutSessionReducer } from './features/auth/logoutSessionSlice';
import { feedbackLinksReducer } from './features/learningPath/feedbackLinksSlice';
import { markAsCompleteReducer } from './features/learningPath/markAsCompleteSlice';
import { DeletelearningPathReducer } from './features/learningPath/deleteLearningPathSlice';
import { getJobDescriptionReducer } from './features/learningPath/getJobDescriptionSlice';
import { resumeUploadReducer } from './features/profile/resumeUploadSlice';

export default combineReducers({
	settings: Settings,
	auth: Auth,
	common: Common,
	appToken: appTakenSlice,
	switchRole: switchRoleSlice,
	logout: logoutSlice,
	setDefaultRole: setDefaultRole,
	learningPathReducer:learningPathReducer,
	summarizeReducer:summarizeReducer,
	getQuiz: getQuizStateSlice,
	dashboardReducer:dashboardReducer,
	continueLearningPathReducer:continueLearningPathReducer,
	submitQuiz: submitQuizStateSlice, 
	attemptedQuiz : attemptedQuizStateSlice,
	viewEachQuiz: viewEachQuizStateSlice,
	sessionLoginReducer:sessionLoginReducer,
	tokenReducer:tokenReducer,
	logoutSessionReducer:logoutSessionReducer,
	feedbackLinksReducer:feedbackLinksReducer,
	markAsCompleteReducer:markAsCompleteReducer,
	deleteLearningPathReducer:DeletelearningPathReducer,
	getJobDescriptionReducer:getJobDescriptionReducer,
	resumeUploadReducer:resumeUploadReducer,

});


