import { get } from 'lodash';
import { environment } from '../environments/environment';

export const API_ENDPOINTS = {
	//#region AUTH
	PARSE_TOKEN: ``,
	APP_TOKEN: ``,
	LOGOUT: ``,
	SETDEFAULT_ROLE: ``,
	MENUS_DATA: ``,
	VERIFY_CUSTOMER: ``,
	LOGOUT_SESSION:'/logout',
	APP_REFRESH_TOKEN:'/sessionrelogin',
	//#endregion AUTH

	ADD_LEARNING_PATH:'/generateLearningPath',
	ADD_SUMMARY:'/summarize',
	FETCH_LEARING_PATH:'/fetchlearningpath',
	CONTINUE_LEARNING:'/getLearningPath',
	GET_TOKEN_DETAILS:'/getTokenDetails',
	ADD_FEEDBACK_LINK:'/feedbackLinks',
	MARK_AS_COMPLETE:'/markcomplete',
	DELETE_LEARNING_PATH:'/deleteJobDescription',
	GET_JOB_DESCRIPTION : '/getJobDescription',

	//#region QUIZ
	GET_QUIZ: '/startQuiz',
	SUBMIT_QUIZ: '/submitQuiz',
	ATTEMPTED_QUIZZES : '/attemptedQuiz',
	GET_TOPIC_WISE_ATTEMPTED_QUIZZES : '/topicWiseAttemptedQuiz',
	VIEW_EACH_QUIZ : '/viewresults',
	GET_TOPIC_WISE_QUIZ: '/getTopicWiseQuiz',


	//#region Career Accelaration
	RESUME_UPLOAD : '/v2/profile/resume',
	GET_PROFILE   : '/v2/profile/{user_id}',
	JOB_SEARCH    : '/v2/jobs/search',
	JOB_SAVE      : '/v2/jobs/save/{job_id}',
	JOB_UNSAVE    : '/v2/jobs/save/{job_id}',
	JOB_GET_SAVED  : '/v2/jobs/saved',
	JOB_GET_BY_ID  : '/v2/jobs/{job_id}',
	RECOMMENDATIONS: '/v2/match/recommendations',
	GET_INTERVIEW_ROUNDS: '/v2/interview',
	GET_TRACKER:     '/v2/tracker',
	ADD_TRACKER:     '/v2/tracker',
	DELETE_TRACKER:  '/v2/tracker/{tracker_id}',
	UPDATE_TRACKER:  '/v2/tracker/{tracker_id}',

	//#endregion

	//#region Admin
	GET_ADMIN_JOBS:    '/v2/admin/jobs',
	GET_BROKEN_LINKS:  '/v2/admin/urls/broken',
	FIX_BROKEN_URL:    '/v2/admin/urls/{job_id}',
	CHECK_URL:         '/v2/admin/urls/check',
	EDIT_ADMIN_JOB:    '/v2/admin/jobs/{job_id}',
	DELETE_ADMIN_JOB:  '/v2/admin/jobs/{job_id}',
	//#endregion
};
