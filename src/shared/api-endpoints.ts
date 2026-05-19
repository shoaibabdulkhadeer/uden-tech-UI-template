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
	

	//#endregion
};
