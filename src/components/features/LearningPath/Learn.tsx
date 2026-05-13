import { CheckCircleOutlined, DownOutlined, InfoCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import {
	Alert,
	Avatar,
	Badge,
	Button,
	Checkbox,
	Collapse,
	Form,
	message,
	Modal,
	notification,
	Popover,
	Progress,
	ProgressProps,
	Select,
	Skeleton,
	Switch,
	Tag,
	Tooltip
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { easeInOut, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { BsWrenchAdjustableCircleFill } from 'react-icons/bs';
import { FaArrowCircleRight, FaArrowLeft, FaHeartBroken, FaLocationArrow, FaLongArrowAltRight, FaRegEye } from 'react-icons/fa';
import { FaCircleMinus, FaTags } from 'react-icons/fa6';
import { GiSplitCross } from 'react-icons/gi';
import { GrPowerReset } from 'react-icons/gr';
import { IoReturnDownBackOutline } from 'react-icons/io5';
import { MdAutoAwesome, MdQuiz } from 'react-icons/md';
import { PiCertificateFill, PiEngineBold, PiTimerFill } from 'react-icons/pi';
import { RxDashboard } from 'react-icons/rx';
import { SiBookstack, SiChartdotjs, SiConfluence } from 'react-icons/si';
import { TbMoodSadFilled } from 'react-icons/tb';
import { VscActivateBreakpoints } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import { getTokenDetails } from '../../../redux/features/dashboard/tokenSlice';
import { addContinueLearningPath, continueLearningPathReset } from '../../../redux/features/learningPath/continueLearningPathSlice';
import { addFeedbackLink, feedbackLinksReset } from '../../../redux/features/learningPath/feedbackLinksSlice';
import { addLearningPath, learningPathReset } from '../../../redux/features/learningPath/learningPathSlice';
import { markAsComplete, markAsCompleteReset } from '../../../redux/features/learningPath/markAsCompleteSlice';
import { addSummarize, summarizeReset } from '../../../redux/features/learningPath/SummarizeSlice';
import { attemptedQuizAPI, resetattemptedQuiz } from '../../../redux/features/Quiz/attemptedQuiz';
import { getQuizAPI, resetgetQuiz } from '../../../redux/features/Quiz/getQuiz';
import { resetviewEachQuiz } from '../../../redux/features/Quiz/viewIndividualQuiz';
import Instructions from '../Quiz/instructions';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import AttemptedQuizModal from './attemptedQuizModal';
import './learn.css';
import '../../../styles/dashboard-nextgen.css';
import '../../../styles/dashboard-arena.css';
import QuizAttempts from './quizPopover';
import { DeleteLearningPath } from '../../../redux/features/learningPath/deleteLearningPathSlice';
import { getJobDescriptionApi, getJobDescriptionReset } from '../../../redux/features/learningPath/getJobDescriptionSlice';
import { RootState } from '@react-three/fiber';
import { environment } from '../../../environments/environment';

const twoColors: ProgressProps['strokeColor'] = { '0%': '#108ee9', '100%': '#87d068' };

const Learn = () => {
	const Navigate = useNavigate(),
		{ pathdata, status: learnLoader } = useSelector((state: any) => state?.learningPathReducer),
		{ summaryData, status: summaryLoader } = useSelector((state: any) => state?.summarizeReducer),
		{ continuepathdata, status: continuepathLoader } = useSelector((state: any) => state?.continueLearningPathReducer),
		{ getQuizRes, getQuizloading } = useSelector((state: any) => state?.getQuiz),
		[quizQuestions, setQuizQuestions] = useState<any>([]),
		[showLoading, setShowLoading] = useState(false),
		[showNote, setShowNote] = useState<any>(true),
		[showQuiz, setShowQuiz] = useState(false),
		location = useLocation(),
		backtodashboard = location?.state?.backToDashboard,
		assesmentcount = location?.state?.assessmentCount,
		quizTitle = location?.state?.QuizTitle,
		QuizLPID = location?.state?.QuizLPID,
		fromContinue = location.state?.fromContinue ?? false,
		[form] = Form.useForm(),
		[learnPath, setLearnPath] = useState<any>([]),
		[summaryNote, setSummaryNote] = useState<any>(),
		[selectedMode, setSelectedMode] = useState<any>('WEEK'),
		[LPID, setLPID] = useState<any>(),
		{ attemptedQuizRes, attemptedQuizloading } = useSelector((state: any) => state?.attemptedQuiz),
		{ viewEachQuizRes, viewEachQuizloading } = useSelector((state: any) => state?.viewEachQuiz),
		{ getJobDescription, getJobDescriptionLoading } = useSelector((state: any) => state?.getJobDescriptionReducer),
		[totalQuiz, setTotalQuiz] = useState<any>([]),
		[individualQuizData, setIndividualQuizData] = useState<any>({}),
		[showQuizAttemptModal, setShowQuizAttemptModal] = useState(false),
		dispatch = useDispatch(),
		[open, setOpen] = useState(false),
		[modalContent, setModalContent] = useState<any>(null),
		[generateModal, setGenerateModal] = useState(false),
		[topicWiseQuiz, setTopicWiseQuiz] = useState(false),
		[topicId, setTopicId] = useState<any>(),
		[subTitle, setSubTitle] = useState<any>(false),
		[JDID, setJDID] = useState<any>(),
		[mainQuizTitle, setMainQuizTitle] = useState<any>(false),
		[reviewAcknowledge, setReviewAcknowledge] = useState(false),
		[pagesummary, setPagesummary] = useState('');

	const charCountRef = useRef<HTMLSpanElement>(null);

	const { tokenDetails, status: tokendetailsLoader } = useSelector((state: any) => state?.tokenReducer);
	const { feedbackData, status: feedbackLoader } = useSelector((state: any) => state?.feedbackLinksReducer);
	const { completeData, status: markasLoader } = useSelector((state: any) => state?.markAsCompleteReducer);
	const redirectUrl = environment.REDIRECT_URL;

	message.config({
		// top: 30,
		duration: 2,
		maxCount: 1,
		getContainer: () => document.body
	});

	useEffect(() => {
		if (location?.state?.showQuiz) {
			setShowQuiz(true);
		}
	}, [location.state]);

	useEffect(() => {
		if (!topicWiseQuiz && LPID) {
			dispatch(addContinueLearningPath({ LearningPathID: LPID }));
		}
	}, [topicWiseQuiz]);

	const handleModeChange = (value: any) => {
		const v = value && typeof value === 'object' && 'value' in value ? value.value : value;
		setSelectedMode(v);
		if (v === 'WEEK') {
			// navigate('/my-lead');
		}
	};

	useEffect(() => {
		setMainQuizTitle(true);
	}, [attemptedQuizRes]);

	useEffect(() => {
		if (LPID) {
			dispatch(
				attemptedQuizAPI({
					// "userId": "6836bb0a76f470f3574cb2cb",
					learningPathId: LPID
				})
			);
		}
	}, [LPID, dispatch]);

	useEffect(() => {
		if (LPID && showQuiz === false) {
			dispatch(
				attemptedQuizAPI({
					// "userId": "6836bb0a76f470f3574cb2cb",
					learningPathId: LPID
				})
			);
		}
	}, [showQuiz]);

	useEffect(() => {
		if (!attemptedQuizloading && attemptedQuizRes && attemptedQuizRes?.statusCode === 200) {
			// message.success(attemptedQuizRes?.message);
			setTotalQuiz(attemptedQuizRes?.data?.attemptedQuiz);
			dispatch(resetattemptedQuiz());
		} else if (!attemptedQuizloading && attemptedQuizRes && attemptedQuizRes?.statusCode === 400) {
			message.warning(attemptedQuizRes?.message);
			dispatch(resetattemptedQuiz());
		} else if (!attemptedQuizloading && attemptedQuizRes && attemptedQuizRes?.statusCode === 500) {
			message.error(attemptedQuizRes?.message);
			dispatch(resetattemptedQuiz());
		}
	}, [attemptedQuizRes]);

	useEffect(() => {
		if (!viewEachQuizloading && viewEachQuizRes && viewEachQuizRes?.statusCode === 200) {
			setIndividualQuizData(viewEachQuizRes?.data);
			dispatch(resetviewEachQuiz());
		} else if (!viewEachQuizloading && viewEachQuizRes && viewEachQuizRes?.statusCode === 400) {
			message.warning(viewEachQuizRes?.message);
			dispatch(resetviewEachQuiz());
		} else if (!viewEachQuizloading && viewEachQuizRes && viewEachQuizRes?.statusCode === 500) {
			message.error(viewEachQuizRes?.message);
			dispatch(resetviewEachQuiz());
		}
	}, [viewEachQuizRes]);

	useEffect(() => {
		if (!getQuizloading && getQuizRes) {
			const { statusCode, message } = getQuizRes;
			if (statusCode === 202) {
				notification.warning({
					message: 'Notice',
					description: message
				});
				dispatch(resetgetQuiz());
			} else if (statusCode === 200) {
				// message.success(message); // if you want success message
				setQuizQuestions(getQuizRes?.data?.Question_Bank || []);
				setShowLoading(false);
				dispatch(resetgetQuiz());
			} else if (statusCode === 206) {
				notification.info({
					message: (
						<p className="gx-p-0 gx-m-0" style={{ fontWeight: 500 }}>
							Out of Tokens ☹️ !!
						</p>
					),
					description: (
						<div>
							<p>You don’t have minimum available tokens. Please purchase tokens to continue.</p>
							<Button type="primary" size="small" onClick={() => (window.location.href = redirectUrl)} style={{ marginTop: 8 }}>
								Go to Token Purchase
							</Button>
						</div>
					),
					placement: 'topRight',
					duration: 0,
					key: 'token-warning'
				});
				dispatch(resetgetQuiz());
			} else if (statusCode === 400) {
				message.warning(message);
			} else if (statusCode === 500) {
				message.error(message);
				dispatch(resetgetQuiz());
			}
		}
	}, [getQuizRes, getQuizloading]);

	const [isGenerated, setIsGenerated] = useState(false);
	useEffect(() => {
		if (!learnLoader && pathdata && pathdata?.statusCode === 200) {
			notification.destroy();

			setIsGenerated(true);
			dispatch(getTokenDetails());
			setLearnPath(pathdata?.data?.details);
			setLPID(pathdata?.data?.learningPathID);
			setJDID(pathdata?.data?.jdID);
			dispatch(learningPathReset());
		} else if (!learnLoader && pathdata && pathdata?.statusCode === 202) {
			notification?.destroy();
			notification.info({
				message: 'Similar Learning Path Found',
				description: 'You already have a similar learning path. You’ve been redirected there now.',
				duration: 5,
				placement: 'topRight',
				key: 'learning-path-notification'
			});

			dispatch(addContinueLearningPath({ LearningPathID: pathdata?.data?.learningPathID }));
			dispatch(learningPathReset());
		} else if (!learnLoader && pathdata && pathdata?.statusCode === 400) {
			message.warning(pathdata?.message || 'Bad Request');
			dispatch(learningPathReset());
		} else if (!learnLoader && pathdata && pathdata?.statusCode === 500) {
			message.error(pathdata?.message || 'Internal Server Error');
			dispatch(learningPathReset());
		}
	}, [pathdata, learnLoader]);

	useEffect(() => {
		if (learnLoader && !pathdata?.statusCode) {
			notification.warning({
				message: 'Please wait...',
				description: 'The AI is thoughtfully shaping your journey — your Learning Path will arrive soon.',
				placement: 'topRight',
				duration: 0
			});
		}
	}, [learnLoader, pathdata]);

	useEffect(() => {
		if (continuepathdata?.statusCode === 200) {
			// message.success(dashboardData?.message);
			setLearnPath(continuepathdata?.data?.details);
			setSummaryNote(continuepathdata?.data?.summary);
			setPagesummary(continuepathdata?.data?.details?.roleSummary);
			setLPID(continuepathdata?.data?.LearningPathID);
			setJDID(continuepathdata?.data?.jdId);

			setIsGenerated(true);
			setShowNote(false);
			//    Navigate('/learn')

			dispatch(continueLearningPathReset());
		} else if (continuepathdata?.statusCode === 400) {
			message.warning(continuepathdata?.message);
			dispatch(continueLearningPathReset());
		} else if (continuepathdata?.statusCode === 500) {
			message.error(continuepathdata?.message);
			dispatch(continueLearningPathReset());
		}
	}, [continuepathdata, continuepathLoader]);

	useEffect(() => {
		if (getJobDescription?.statusCode === 200) {
			// message.success(dashboardData?.message);
			// setLearnPath(continuepathdata?.data?.details);
			setSummaryNote(getJobDescription?.data?.details);
			// setPagesummary(continuepathdata?.data?.details?.roleSummary);
			// setLPID(continuepathdata?.data?.LearningPathID);
			// setJDID(continuepathdata?.data?.jdId)

			// setIsGenerated(true);
			// setShowNote(false);
			//    Navigate('/learn')

			dispatch(getJobDescriptionReset());
		} else if (getJobDescription?.statusCode === 400) {
			message.warning(getJobDescription?.message);
			dispatch(getJobDescriptionReset());
		} else if (getJobDescription?.statusCode === 500) {
			message.error(getJobDescription?.message);
			dispatch(getJobDescriptionReset());
		}
	}, [getJobDescription]);

	notification.config({
		placement: 'topRight',
		top: 80,
		duration: 3,
		// @ts-ignore
		zIndex: 20200 // Not in types, but works at runtime (ignore TS warning if necessary)
	});

	useEffect(() => {
		if (feedbackData?.statusCode === 200) {
			// message.success("Thank you for your valuable feedback!");
			notification.success({
				message: <p className="gx-p-0 gx-m-0 "> Thank you for your valuable feedback! </p>
			});
			dispatch(feedbackLinksReset());
		} else if (feedbackData?.statusCode === 400 || feedbackData?.statusCode === 500) {
			message.warning(feedbackData?.message);
			dispatch(feedbackLinksReset());
		}
	}, [feedbackData, feedbackLoader]);

	const navigate = useNavigate();

	useEffect(() => {
		if (!summaryLoader && summaryData && summaryData?.statusCode === 200) {
		 setSummaryNote(summaryData?.data?.details);
		 setJDID(summaryData?.data?.details?.JdID)
		 setShowNote(false);
		 setGenerateModal(true);
		 // dispatch(addLearningPath({ text: summaryData?.data?.details?.roleSummary }));
		 dispatch(summarizeReset());
		} else if (!summaryLoader && summaryData && summaryData?.statusCode === 202) {
		 notification.info({
		  message: (
		   <p className="gx-p-0 gx-m-0" style={{ fontWeight: 500 }}>
			Out of Tokens ☹️ !!
		   </p>
		  ),
		  description: (
		   <div>
			<p>You don’t have minimum available tokens. Please purchase tokens to continue.</p>
			<Button
			 type="primary"
			 size="small"
			 onClick={() => window.location.href = redirectUrl}
			 style={{ marginTop: 8 }}
			>
			 Go to Token Purchase
			</Button>
		   </div>
		  ),
		  placement: 'topRight',
		  duration: 0,
		  key: 'token-warning',
		 });
		 dispatch(summarizeReset());
		} else if (!summaryLoader && summaryData && summaryData?.statusCode === 206) {
		 notification.warning({
		  message:
		   'Improper Input'
		  ,
		  description:
		   <p>{summaryData?.message}. Kindly check the input and try again.</p>
		  ,
		  placement: 'topRight',
		  duration: 10,
		  key: 'token-warning',
		 });
		 dispatch(summarizeReset());
		} else if (!summaryLoader && summaryData && summaryData?.statusCode === 400) {
		 message.error(summaryData?.message);
		 dispatch(summarizeReset());
		} else if (!summaryLoader && summaryData && summaryData?.statusCode >= 500) {
		 message.error('Something went wrong, please try again later');
		 dispatch(summarizeReset());
		}
	   }, [summaryData, summaryLoader]);

	useEffect(() => {
		dispatch(getTokenDetails());
	}, []);

	useEffect(() => {
		if (location.state?.jd) {
			form.setFieldsValue({ text: location.state.jd });
		}
	}, []);

	const onFinish = (values: any) => {
		setSummaryNote('');
		// Add logic to generate learning path here
		dispatch(addSummarize(values));
		// dispatch(addLearningPath(values))
	};

	const { Panel } = Collapse;

	const titleStyle = [
		{
			textStyle: 'gx-text-pink'
		},
		{
			textStyle: 'gx-text-green'
		},
		{
			textStyle: 'gx-text-red'
		},
		{
			textStyle: 'gx-text-pink'
		},
		{
			textStyle: 'gx-text-amber'
		}
	];

	const badgeStyles: any = [
		{
			className: 'gx-bg-pink',
			iconClass: 'icon icon-data-display'
		},
		{
			className: 'gx-bg-purple',
			iconClass: 'icon icon-map-google'
		},
		{
			className: 'gx-bg-green',
			iconClass: 'icon icon-profile'
		},
		{
			className: 'gx-bg-red',
			iconClass: 'icon icon-tickets'
		},
		{
			className: 'gx-bg-amber',
			iconClass: 'icon icon-widgets'
		}
	];

	const OpenSubTopicModel = (item: any) => {
		setOpen(true);
		setModalContent(item);
	};
	const handleQuickQuiz = () => {
		setShowLoading(true);
		dispatch(
			getQuizAPI({
				learningPathId: LPID,
				subtopicId: ''
			})
		);
		setShowQuiz(true);
	};

	const [isAcknowledged, setIsAcknowledged] = useState(false);

	const onChange = (e: any) => {
		setIsAcknowledged(e?.target?.checked);
	};

	const tagColors: any = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];

	const certificationsColors = ['#f50', '#2db7f5', '#87d068', '#108ee9'];

	const [openPopover, setOpenPopover] = useState(''); // stores the open link
	const [feedbacks, setFeedbacks] = useState<any>({}); // stores feedback per link
	const togglePopover = (link: any) => {
		setOpenPopover((prev) => (prev === link ? '' : link));
	};

	const handleChange = (link: any, value: any) => {
		setFeedbacks((prev: any) => ({ ...prev, [link]: value }));
	};

	const handleCancel = () => {
		setOpenPopover('');
	};

	const [skillWiseQuiz, setSkillWiseQuiz] = useState<any>();

	const handleSingleQuiz = (item: any) => {
		setTopicWiseQuiz(true);
		setSkillWiseQuiz(item?.attemptedQuiz?.length);
		setTopicId(item?.subTopicId); // Generate a random topicId
		// dispatch(getQuizAPI(LPID));
		dispatch(
			getQuizAPI({
				learningPathId: LPID,
				subtopicId: item?.subTopicId
			})
		);
	};

	const handleSubmit = (link: any) => {
		dispatch(
			addFeedbackLink({
				feedbackLink: link,
				feedback: feedbacks[link]
			})
		);
		setOpenPopover('');
		setFeedbacks((prev: any) => ({ ...prev, [link]: '' }));
	};

	const closePopover = () => {
		setOpenPopover('');
	};

	useEffect(() => {
		if (completeData?.statusCode === 200) {
			const { subTopicId, is_complete } = completeData?.data || {};

			setLearnPath((prev: any) => {
				const updatedPath = [...prev.learningPath];
				const index = updatedPath?.findIndex((item) => item?.subTopicId === subTopicId);
				if (index !== -1) {
					updatedPath[index] = {
						...updatedPath[index],
						isComplete: is_complete
					};
				}
				return {
					...prev,
					learningPath: updatedPath
				};
			});
			message.success(completeData?.message || 'Marked as complete successfully');
			dispatch(markAsCompleteReset());
		} else if (completeData?.statusCode === 400 || completeData?.statusCode === 500) {
			message.error(completeData?.message || 'Something went wrong, please try again later');
			dispatch(markAsCompleteReset());
		}
	}, [completeData]);

	const markasCompletedfunc = (subTopicId: any) => {
		dispatch(
			markAsComplete({
				subtopicId: subTopicId,
				learningPathId: LPID
			})
		);
	};

	const handleReviewAcknowledgement = () => {
		setGenerateModal(true);
		setReviewAcknowledge(true);
		dispatch(getJobDescriptionApi({ jdId: JDID }));
	};

	return (
		<>
			{/* <div className='gx-d-flex gx-align-items-center '>

			<div
				className="card-icon1 orders-icon "
				style={{
					padding: '5px'
				}}
			>
				<SiChainguard size={26} />
			</div>
                <p className='gx-p-0 gx-m-0 gx-fs-lg '>Generate Learning Path</p>sss
        </div> */}

			{(showQuiz && !getQuizloading && quizQuestions?.length > 0 && getQuizRes !== 202) ||
			(topicWiseQuiz && !getQuizloading && quizQuestions.length > 0 && getQuizRes !== 202) ? (
				<Instructions
					quizTitle={quizTitle}
					setShowQuiz={setShowQuiz}
					quizQuestions={quizQuestions}
					LPID={LPID}
					backToDashboard={backtodashboard}
					QuizLPID={QuizLPID}
					setTopicWiseQuiz={setTopicWiseQuiz}
					topicId={topicId}
					setTopicId={setTopicId}
					totalQuiz={totalQuiz}
					setQuizQuestions={setQuizQuestions}
					skillWiseQuiz={skillWiseQuiz}
					assesmentcount={assesmentcount}
				/>
			) : (
				<div className="learn-page phase2-dashboard dash-next dash-next-shell dash-next--arena">
					<DashboardShellNetwork />
					<header className="dash-next-page-head">
						<div className="dash-next-page-head-row">
							<DashboardPageHeadArt className="dash-next-page-head-art" />
							<div className="dash-next-page-head-copy">
								<div className="gx-mb-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
									<div className="genz-pill vibrant">
										<MdAutoAwesome className="genz-icon" />
										AI Path Engine
									</div>
									<div className="genz-pill glow">
										<div className="dot" />
										Live Generation
									</div>
								</div>
								<h1 className="dash-next-page-title">
									<span className="dash-next-page-title-inner">Learning Path</span>
								</h1>
								<p className="dash-next-page-lead">
									Paste a job description or describe your goals — AI builds a personalised, milestone-driven learning path tailored to your skill gaps.
								</p>
								<div className="career-accel-feature-row">
									<span className="career-accel-feature-chip career-accel-feature-chip--indigo">
										<span className="career-accel-chip-icon"><MdAutoAwesome size={12} /></span>
										AI-generated path
									</span>
									<span className="career-accel-feature-chip career-accel-feature-chip--cyan">
										<span className="career-accel-chip-icon"><VscActivateBreakpoints size={12} /></span>
										Skill &amp; week modes
									</span>
									<span className="career-accel-feature-chip career-accel-feature-chip--amber">
										<span className="career-accel-chip-icon"><MdQuiz size={12} /></span>
										Built-in quizzes
									</span>
									<span className="career-accel-feature-chip career-accel-feature-chip--emerald">
										<span className="career-accel-chip-icon"><PiCertificateFill size={12} /></span>
										Certifications
									</span>
								</div>
							</div>
						</div>
					</header>
					<motion.div initial={{ y: 300, opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: easeInOut }}>
						<div className="boxshadowcard1 gx-pb-3 phase2-learn-shell learn-next-main-card" style={{ borderRadius: '10px' }}>
						<div className="learn-next-card-toolbar learn-toolbar-bar">
							<div className="learn-toolbar-left">
								<div className="learn-toolbar-nav">
								<Tooltip title="Open dashboard overview">
									<button
										type="button"
										className="learn-next-overview-chip"
										onClick={() => Navigate('/dashboard')}
									>
										<RxDashboard className="learn-next-overview-chip-icon" size={15} aria-hidden />
										<span className="learn-next-overview-chip-label">Overview</span>
									</button>
								</Tooltip>
								<FaLongArrowAltRight size={14} className="learn-next-toolbar-flow-icon" aria-hidden />
								<span className="learn-next-toolbar-mode-label">Mode</span>
								<Select
									size="small"
									placeholder="Mode"
									className="learn-next-mode-select gx-fs-xs"
									dropdownClassName="learn-next-mode-dropdown"
									dropdownMatchSelectWidth={false}
									labelInValue
									suffixIcon={
										<span className="learn-next-mode-select-chevron" aria-hidden>
											<DownOutlined />
										</span>
									}
									style={{ minWidth: 132 }}
									value={{
										value: selectedMode,
										label: (
											<span className="learn-next-mode-trigger-inner">
												{selectedMode === 'SKILL' ? (
													<>
														<span className="learn-next-mode-trigger-glyph learn-next-mode-trigger-glyph--skill">
															<VscActivateBreakpoints size={15} aria-hidden />
														</span>
														<span className="learn-next-mode-trigger-text">Skill path</span>
													</>
												) : (
													<>
														<span className="learn-next-mode-trigger-glyph learn-next-mode-trigger-glyph--week">
															<PiTimerFill size={15} aria-hidden />
														</span>
														<span className="learn-next-mode-trigger-text">Week path</span>
													</>
												)}
											</span>
										)
									}}
									onChange={handleModeChange}
								>
									<Select.Option value="SKILL" key="SKILL">
										<div className="learn-next-mode-option">
											<span className="learn-next-mode-option-glow learn-next-mode-option-glow--skill" aria-hidden />
											<span className="learn-next-mode-option-icon-wrap learn-next-mode-option-icon-wrap--skill">
												<VscActivateBreakpoints size={18} aria-hidden />
											</span>
											<span className="learn-next-mode-option-copy">
												<span className="learn-next-mode-option-title">Skill based</span>
												<span className="learn-next-mode-option-desc">
													Group milestones by competency — great for depth-first mastery.
												</span>
											</span>
										</div>
									</Select.Option>
									<Select.Option value="WEEK" key="WEEK">
										<div className="learn-next-mode-option">
											<span className="learn-next-mode-option-glow learn-next-mode-option-glow--week" aria-hidden />
											<span className="learn-next-mode-option-icon-wrap learn-next-mode-option-icon-wrap--week">
												<PiTimerFill size={18} aria-hidden />
											</span>
											<span className="learn-next-mode-option-copy">
												<span className="learn-next-mode-option-title">Week based</span>
												<span className="learn-next-mode-option-desc">
													Pace the path by calendar weeks — steady rhythm, predictable blocks.
												</span>
											</span>
										</div>
									</Select.Option>
								</Select>
								</div>

								<span className="learn-toolbar-group-sep" aria-hidden />

								<div className="learn-toolbar-actions">
									<button type="button" className="learn-toolbar-util-btn" onClick={() => Navigate('/dashboard')}>
										<IoReturnDownBackOutline size={13} />
										<span>Dashboard</span>
									</button>
									<button type="button" className="learn-toolbar-util-btn" onClick={() => { form.setFieldValue('text', ''); if (charCountRef.current) { charCountRef.current.textContent = '0 / 100'; charCountRef.current.className = 'learn-compose-char-count'; } }}>
										<GrPowerReset size={12} />
										<span>Reset</span>
									</button>
									<button type="button" className="learn-toolbar-util-btn learn-toolbar-util-btn--danger" onClick={() => setShowNote((v: any) => !v)}>
										<FaCircleMinus size={12} />
										<span>{showNote ? 'Minimize' : 'Show input'}</span>
									</button>
								</div>
							</div>

							<div className="learn-toolbar-right gx-d-flex gx-align-items-center">
								{/* {continuepathdata?.statusCode === 200 ? null : */}

								<Tooltip title="View the acknowledgment you accepted before generating the learning path">
									{LPID && (
										<Button
											loading={getJobDescriptionLoading}
											className="gx-d-flex gx-align-items-center gx-link gx-mb-0 gx-mr-1"
											type="default"
											onClick={handleReviewAcknowledgement}
											size="small"
										>
											{/* <Avatar src='/assets/images/review.gif' style={{ height: '32px', width: '28px' }} /> */}
											<FaRegEye className="gx-mr-1" />
											<span>Review Acknowledgment</span>
										</Button>
									)}
								</Tooltip>

								{LPID && totalQuiz.length > 0 && (
									<QuizAttempts
										setMainQuizTitle={setMainQuizTitle}
										questionsLength={totalQuiz.length}
										viewEachQuizloading={viewEachQuizloading}
										setShowQuizAttemptsModal={setShowQuizAttemptModal}
										totalQuiz={totalQuiz}
									>
										<Tooltip
											title={
												!showLoading || !getQuizloading ? (
													<div className="gx-text-center">
														Take Quiz
														<Tag color="orange" className="gx-mt-1" style={{ marginLeft: 8 }}>
															1 Quiz Attempt = 1 Token Deduction
														</Tag>
													</div>
												) : (
													'AI is preparing the questions...'
												)
											}
											placement="top"
										>
											<Badge count={totalQuiz.length} size="small" style={{ backgroundColor: 'orange', color: 'white' }}>
												<Button
													// type={!showLoading || !getQuizloading ? "primary" : "default"}
													type="primary"
													shape="circle"
													onClick={!showLoading || !getQuizloading ? handleQuickQuiz : undefined}
													className="gx-m-0 gx-mx-1 btnhover"
													size="middle"
													icon={!showLoading || !getQuizloading ? <MdQuiz /> : <LoadingOutlined />}
												/>
											</Badge>
										</Tooltip>
									</QuizAttempts>
								)}
								{LPID && totalQuiz.length == 0 && (
									<Tooltip
										title={
											(!showLoading || !getQuizloading || !topicId) && (
												<div>
													This quiz includes all the skills in your learning path. Make sure you have attempted skill-wise quizzes before attempting
													this quiz.{' '}
													<Tag color="orange" className="gx-mt-1" style={{ marginLeft: 8 }}>
														1 Quiz Attempt = 1 Token Deduction
													</Tag>
												</div>
											)
										}
										placement="topLeft"
									>
										<Button
											// type={!showLoading || !getQuizloading ? "primary" : "default"}
											type="primary"
											shape="circle"
											onClick={!showLoading || !getQuizloading ? handleQuickQuiz : undefined}
											className="gx-m-0 gx-mx-1 btnhover"
											size="middle"
											icon={!showLoading || !getQuizloading ? <MdQuiz /> : <LoadingOutlined />}
										/>
									</Tooltip>
								)}
							</div>
						</div>

						<div className="learn-next-card-divider" aria-hidden />
						<div className={`note-container gx-px-2 ${showNote ? 'open' : ''}`}>
							<div className="learn-compose-studio">

																{/* ── Compose body ── */}
								<div className="learn-compose-body">
									{/* eyebrow + status */}
									<div className="learn-compose-eyebrow-row">
										<span className="learn-compose-eyebrow">
											<MdAutoAwesome size={11} className="learn-compose-eyebrow-icon" />
											AI Path Engine
										</span>
										<span className="learn-compose-status">
											<span className="learn-compose-status-dot" aria-hidden />
											Ready
										</span>
									</div>

									<h2 className="learn-compose-title gx-m-0">Describe your target role</h2>
									<p className="learn-compose-subtitle gx-m-0">
										Paste a job description or tell us what you want to learn — AI builds a personalised path.
									</p>

									<Form
										form={form}
										layout="vertical"
										onFinish={onFinish}
										onValuesChange={(changed) => {
											if (changed.text !== undefined && charCountRef.current) {
												const len = (changed.text ?? '').length;
												charCountRef.current.textContent = `${len} / 100`;
												charCountRef.current.className = `learn-compose-char-count${len >= 100 ? ' learn-compose-char-count--ready' : ''}`;
											}
										}}
										className="learn-compose-form"
									>
										<Form.Item
											name="text"
											validateTrigger="onBlur"
											className="gx-m-0 learn-compose-field"
											rules={[
												{ required: true, message: <p className="gx-p-0 gx-m-0 gx-fs-sm gx-mt-1">Please enter some text!</p> },
												{ min: 100, message: <p className="gx-p-0 gx-m-0 gx-fs-sm gx-mt-1">Please enter at least 100 characters.</p> }
											]}
										>
											<div className="learn-compose-field-wrap">
												<TextArea
													rows={3}
													placeholder="e.g. 'Frontend Engineer at a SaaS company — strong in React, TypeScript, system design…'"
													className="learn-compose-textarea"
												/>
												<span ref={charCountRef} className="learn-compose-char-count">0 / 100</span>
											</div>
										</Form.Item>

										{!pagesummary && (
											<div className="learn-compose-tip">
												<MdAutoAwesome size={13} className="learn-compose-tip-icon" />
												<span>AI generates a week-by-week or skill-by-skill plan from your input — the more detail you add, the sharper the path.</span>
											</div>
										)}

										<Form.Item className="gx-p-0 gx-m-0">
											<Button
												htmlType="submit"
												type="primary"
												className="learn-compose-cta"
												disabled={learnLoader || summaryLoader || isGenerated}
												loading={learnLoader || summaryLoader}
												block
											>
												{!(learnLoader || summaryLoader) && <PiEngineBold size={15} className="learn-compose-cta-icon" />}
												Generate Learning Path
											</Button>
										</Form.Item>
									</Form>
								</div>
							</div>
						</div>

						{/* 
                        <div className='gx-mx-3 gx-fs-sm gx-my-1 gx-p-1' style={{backgroundColor:"#E8FFFE",borderRadius:"3px"}}> 
                        
                        {summaryNote}

                        </div> */}
						{pagesummary && (
							<Alert
								message={
									<div className="learn-next-summary-inner">
										<div className="learn-next-summary-heading gx-d-flex gx-align-items-start">
											<div className="learn-next-summary-icon" aria-hidden>
												<SiBookstack className="learn-next-summary-icon-svg" />
											</div>
											<div className="learn-next-summary-heading-copy">
												<p className="learn-next-summary-eyebrow gx-m-0">Generated summary</p>
												<p className="learn-next-summary-title gx-m-0 gx-d-flex gx-align-items-center gx-flex-wrap">
													Summarized version
													<Tooltip
														placement="right"
														title={
															!fromContinue
																? 'This is a summary of the description you entered above. Use Show Input to see the full text.'
																: 'This is the summarized version of your learning path context.'
														}
													>
														<InfoCircleTwoTone className="learn-next-summary-info-icon gx-ml-2" />
													</Tooltip>
												</p>
											</div>
										</div>
										<div className="learn-next-summary-body gx-mt-2">
											<Typewriter words={[pagesummary]} typeSpeed={30} cursor={true} cursorColor="#059669" />
										</div>
									</div>
								}
								type="success"
								className="learn-next-summary-alert gx-mb-0 gx-mx-2 gx-fs-sm"
								showIcon={false}
							/>
						)}

						<div className="learn-next-path-section learn-next-path-graph gx-timeline-section gx-timeline-center gx-pt-3 gx-pb-2 gx-px-3 gx-m-0">
							<div className="learn-next-path-panel-header dash-next-toolbar dash-next-paths-header">
								<div className="learn-next-path-panel-header-row gx-d-flex gx-align-items-center gx-justify-content-between gx-w-100">
									<div className="gx-d-flex gx-align-items-center learn-next-path-panel-heading" style={{ gap: 14 }}>
										<div className="dash-next-paths-header-icon learn-next-path-header-icon" aria-hidden>
											<SiBookstack className="dash-next-paths-header-svg" />
										</div>
										<div className="dash-next-paths-header-block learn-next-path-header-copy">
											<p className="dash-next-paths-header-eyebrow gx-mb-0">Your learning path</p>
											{learnLoader ? (
												<Skeleton.Button
													active
													size="small"
													shape="default"
													style={{ width: 220, height: 28, borderRadius: '10px', marginTop: 6 }}
												/>
											) : (
												<h2 className="dash-next-paths-header-label gx-m-0 gx-mt-1">{learnPath?.title ?? 'Learn Linux'}</h2>
											)}
										</div>
									</div>
									<div className="learn-next-path-duration">
										<PiTimerFill size={16} className="learn-next-path-duration-icon" aria-hidden />
										<span className="learn-next-path-duration-label">Est. duration</span>
										{learnLoader ? (
											<Skeleton.Button active size="small" shape="default" style={{ width: 72, height: 26, borderRadius: '999px' }} />
										) : (
											<span className="learn-next-path-duration-pill">{learnPath?.duration ?? '6 weeks'}</span>
										)}
									</div>
								</div>
							</div>

							{learnPath?.certifications?.length > 0 && (
								<div className="learn-next-cert-strip gx-d-flex gx-align-items-center gx-mb-2 gx-mt-2">
									<p className="gx-p-0 gx-mr-1 gx-fs-sm gx-d-flex gx-align-items-center" style={{ marginTop: '3px', fontWeight: 500 }}>
										<PiCertificateFill size={20} className="gx-mx-1 gx-link" />
										CERTIFICATIONS -
									</p>
									{learnPath?.certifications?.map((skill: any, index: any) => (
										<Tag className="gx-fs-xs gx-p-0 gx-px-1 gx-py-0" color={tagColors[index % tagColors?.length]} key={index}>
											{skill}
										</Tag>
									))}
								</div>
							)}

							{learnPath?.learningPath?.length > 0 ? (
								learnPath?.learningPath?.map((item: any, index: number) => {
									const isInverted = index % 2 !== 0;
									const badgeIndex = index % badgeStyles?.length;
									const { className, iconClass } = badgeStyles[badgeIndex];

									const titleIndex = index % titleStyle?.length;
									const { textStyle } = titleStyle[titleIndex];

									return (
										<div
											className={`gx-timeline-item gx-timeline-time-item gx-py-0 gx-my-0 gx-px-6 ${isInverted ? 'gx-timeline-inverted' : ''} ${
												index === item?.length - 1 ? 'gx-mb-10' : ''
											}`}
											key={index}
										>
											<div className="gx-timeline-time gx-font-weight-semi-bold" style={{ padding: '5px !important' }}>
												{selectedMode === 'SKILL' ? `Skill - ${index + 1}` : `${item?.weeks}`}
											</div>
											{/* <div className="gx-timeline-time gx-font-weight-semi-bold" style={{ padding: '5px !important' }}>
												{item?.weeks}
											</div> */}

											<div className={`gx-timeline-badge ${className} iconcard`}>
												<i className={`${iconClass} gx-p-2`}></i>
											</div>

											<motion.div initial={{ x: 300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
												<div className="cardWrapper">
													<div className={`gx-timeline-panel lineCard gx-px-0`}>
														{learnLoader || generateModal ? (
															<Skeleton active />
														) : (
															<>
																{/* <div className=' gx-mx-4 gx-mt-1'> */}

																<div className="gx-timeline-tile gx-link gx-d-flex gx-ml-4">
																	<div className="gx-status-pos">
																		<span className="gx-status gx-online"></span>
																	</div>
																	<p className={`gx-ml-4 ${textStyle} gx-fs-md`}>{item?.title}</p>
																</div>
																<Tag color="purple" className="gx-m-0 gx-mb-1 gx-mx-4 gx-px-3 gx-fs-xs">
																	{item?.skill}
																</Tag>
																<p className="gx-fs-sm gx-mb-0 gx-mx-4">
																	{item?.brief_summary?.length > 150 ? `${item?.brief_summary.slice(0, 150)}...` : item?.brief_summary}
																</p>
																<div
																	className="gx-d-flex gx-mx-3 gx-align-items-center gx-justify-content-between"
																	style={{ zIndex: 1, position: 'relative', pointerEvents: 'auto' }}
																>
																	<Button
																		className="gx-mt-1 gx-ml-1 gx-d-flex gx-align-items-center gx-link"
																		size="small"
																		style={{ marginLeft: '4px', zIndex: 2, position: 'relative', cursor: 'pointer' }}
																		onClick={() => OpenSubTopicModel(item)}
																	>
																		Explore Sub Topics
																		<FaLocationArrow className="gx-ml-1" />
																	</Button>
																	{item?.attemptedQuiz?.length > 0 ? (
																		<QuizAttempts
																			setMainQuizTitle={setMainQuizTitle}
																			singleSkill={item?.skill}
																			questionsLength={item?.attemptedQuiz?.length}
																			viewEachQuizloading={viewEachQuizloading}
																			setShowQuizAttemptsModal={setShowQuizAttemptModal}
																			totalQuiz={item?.attemptedQuiz}
																		>
																			<Badge
																				count={item?.attemptedQuiz?.length || 0}
																				style={{
																					backgroundColor: 'orange',
																					color: '#ffffff',
																					lineHeight: '9px',
																					height: '11px',
																					minWidth: '11px',
																					padding: '0 2px',
																					marginRight: '7px',
																					paddingTop: '2px',
																					marginTop: '4px'
																				}}
																			>
																				<Tooltip
																					title={
																						<div className="gx-text-center">
																							Take skill wise quiz.{' '}
																							<Tag color="orange" className="gx-mt-1" style={{ marginLeft: 8 }}>
																								1 Quiz Attempt = 1 Token Deduction
																							</Tag>
																						</div>
																					}
																				>
																					<Button
																						type="primary"
																						shape="circle"
																						size="small"
																						onClick={() => handleSingleQuiz(item)}
																						className="gx-mb-1 gx-mr-2 gx-mt-1"
																						icon={
																							showLoading && getQuizloading && topicId === item?.subTopicId ? (
																								<LoadingOutlined style={{ fontSize: '14px' }} />
																							) : (
																								<MdQuiz style={{ fontSize: '14px' }} />
																							)
																						}
																						style={{
																							zIndex: 2,
																							position: 'relative',
																							cursor: 'pointer',
																							height: '30px',
																							width: '30px',
																							padding: 0,
																							display: 'flex',
																							alignItems: 'center',
																							justifyContent: 'center'
																						}}
																					/>
																				</Tooltip>
																			</Badge>
																		</QuizAttempts>
																	) : (
																		<Badge
																			count={item?.attemptedQuiz?.length || 0}
																			style={{
																				backgroundColor: 'orange',
																				color: 'white',
																				lineHeight: '9px',
																				height: '11px',
																				minWidth: '11px',
																				padding: '0 2px',
																				marginRight: '7px',
																				paddingTop: '2px',
																				fontWeight: 'normal'
																			}}
																		>
																			<Tooltip
																				title={
																					<div className="gx-text-center">
																						Take skill wise quiz.
																						<Tag color="orange" className="gx-mt-1" style={{ marginLeft: 8 }}>
																							1 Quiz Attempt = 1 Token Deduction
																						</Tag>
																					</div>
																				}
																			>
																				<Button
																					type="primary"
																					shape="circle"
																					size="small"
																					onClick={() => handleSingleQuiz(item)}
																					className="gx-mb-2 gx-mr-2"
																					icon={
																						showLoading && getQuizloading && topicId === item?.subTopicId ? (
																							<LoadingOutlined style={{ fontSize: '14px' }} />
																						) : (
																							<MdQuiz style={{ fontSize: '14px' }} />
																						)
																					}
																					style={{
																						zIndex: 2,
																						position: 'relative',
																						cursor: 'pointer',
																						height: '30px',
																						width: '30px',
																						padding: 0,
																						display: 'flex',
																						alignItems: 'center',
																						justifyContent: 'center'
																					}}
																				/>
																			</Tooltip>
																		</Badge>
																	)}
																</div>

																{/* </div> */}

																<div
																	className="gx-py-2 gx-px-2"
																	style={{
																		backgroundColor: item?.isComplete ? 'rgb(225 252 228)' : '#e0f2fe',
																		width: '100%',
																		display: 'flex',
																		justifyContent: 'flex-end',
																		borderRadius: '8px',
																		alignItems: 'center',
																		zIndex: 10000
																	}}
																>
																	<Switch
																		checkedChildren="Topic Completed"
																		unCheckedChildren="Mark as Completed"
																		size="small"
																		checked={item?.isComplete}
																		onChange={() => markasCompletedfunc(item?.subTopicId)}
																		className="gx-mr-2 gx-link"
																		style={{ zIndex: '10000px !important', cursor: 'pointer' }}
																	/>
																	{/* {item?.isComplete ? (
																		<p className="gx-fs-sm gx-p-0 gx-m-0 gx-ml-2 gx-d-flex gx-align-items-center">
																			{' '}
																			<img
																				src="/assets/images/trophy.gif"
																				alt="success-img"
																				style={{
																					width: 23,
																					height: 23
																				}}
																			/>
																		</p>
																	) : (
																		null
																	)} */}

																	{/* <Checkbox onChange={() => markasCompletedfunc(item?.subTopicId)} checked={item?.isComplete}>
																	{item?.isComplete ? (
																		<p className="gx-fs-sm gx-p-0 gx-m-0 gx-d-flex gx-align-items-center">
																			{' '}
																			Completed
																			<img
																				src="/assets/images/trophy.gif"
																				alt="success-img"
																				style={{
																					width: 20,
																					height: 20
																				}}
																			/>
																		</p>
																	) : (
																		<p className="gx-fs-sm gx-p-0 gx-m-0"> Mark as Completed </p>
																	)}
															
																</Checkbox> */}
																</div>
															</>
														)}

														{/* <p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center gx-mt-1">
              <PiTimerFill size={15} className="gx-mr-1" /> Time Required
            </p>
            <Progress percent={40} strokeColor={twoColors} /> */}
													</div>
												</div>
											</motion.div>
										</div>
									);
								})
							) : (
								<>
									{/* DevOps Roadmap Step 1 */}
									<div className="gx-timeline-item gx-timeline-time-item gx-py-0 gx-my-0 gx-px-6" style={{ padding: '-5px !important' }}>
										<motion.div initial={{ x: -300, opacity: 0.5 }} animate={{ x: -30, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
											<div className="gx-timeline-time gx-px- gx-mx-0 gx-font-weight-semi-bold">
												{selectedMode === 'SKILL' ? `Skill - 1` : 'Week - 1-2'}
											</div>
										</motion.div>
										<div className="gx-timeline-badge gx-bg-pink iconcard">
											<i className="icon icon-data-display gx-p-2"></i>
										</div>
										<motion.div initial={{ x: 300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
											<div className="gx-timeline-panel lineCard">
												{learnLoader || generateModal ? (
													<Skeleton active />
												) : (
													<>
														<h4 className="gx-timeline-tile gx-text-pink">Learn Linux & Networking Basics</h4>
														<p className="gx-fs-sm gx-mb-0">
															Get hands-on with Linux commands, SSH, system monitoring, and basic networking concepts like DNS, ports, and HTTP.
														</p>
														<Tag color="purple" className="gx-m-0 gx-my-1 gx-fs-sm gx-mr-1">
															Foundations
														</Tag>
														<Tag color="magenta" className="gx-m-0 gx-my-1 gx-fs-sm">
															Linux
														</Tag>
														<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center gx-mt-1">
															<PiTimerFill size={15} className="gx-mr-1" /> Time Required
														</p>
														<Progress percent={20} strokeColor={twoColors} className="gx-mb-3" />
													</>
												)}
											</div>
										</motion.div>
									</div>

									{/* DevOps Roadmap Step 2 */}

									<div className="gx-timeline-item gx-timeline-time-item gx-timeline-inverted gx-py-0 gx-my-0 gx-px-6">
										<motion.div initial={{ x: 300, opacity: 0.5 }} animate={{ x: 30, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
											<div className="gx-timeline-time gx-px- gx-mx-0 gx-font-weight-semi-bold">
												{selectedMode === 'SKILL' ? `Skill - 2` : 'Week - 2-3'}
											</div>
										</motion.div>
										<div className="gx-timeline-badge gx-bg-purple iconcard">
											<i className="icon icon-map-google gx-p-2"></i>
										</div>
										<motion.div initial={{ x: -300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
											<div className="gx-timeline-panel lineCard">
												{learnLoader || generateModal ? (
													<Skeleton active />
												) : (
													<>
														<h4 className="gx-timeline-tile gx-text-purple">Understand Version Control with Git</h4>
														<p className="gx-fs-sm">Master Git basics, branches, merges, rebases, pull requests, and GitHub workflows.</p>
														<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center">
															<PiTimerFill size={15} className="gx-mr-1" /> Time Required
														</p>
														<Progress percent={40} strokeColor={twoColors} className="gx-mb-3" />
													</>
												)}
											</div>
										</motion.div>
									</div>

									{/* DevOps Roadmap Step 3 */}
									<div className="gx-timeline-item gx-timeline-time-item gx-py-0 gx-my-0 gx-px-6">
										<motion.div initial={{ x: -300, opacity: 0.5 }} animate={{ x: -20, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
											<div className="gx-timeline-time gx-px- gx-mx-0 gx-font-weight-semi-bold">
												{selectedMode === 'SKILL' ? `Skill - 3` : 'Week - 3-4'}
											</div>
										</motion.div>
										<div className="gx-timeline-badge gx-bg-green iconcard">
											<i className="icon icon-profile gx-p-2"></i>
										</div>
										<div className="gx-timeline-panel lineCard">
											{learnLoader || generateModal ? (
												<Skeleton active />
											) : (
												<>
													<h4 className="gx-timeline-tile gx-text-green">Learn Continuous Integration (CI)</h4>
													<p>Set up CI pipelines using tools like Jenkins, GitHub Actions, or GitLab CI to automatically test and build code.</p>
													<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center">
														<PiTimerFill size={15} className="gx-mr-1" /> Time Required
													</p>
													<Progress percent={60} strokeColor={twoColors} className="gx-mb-3" />
												</>
											)}
										</div>
									</div>

									{/* DevOps Roadmap Step 4 */}
									<div className="gx-timeline-item gx-timeline-time-item gx-timeline-inverted gx-py-0 gx-my-0 gx-px-6">
										<motion.div initial={{ x: 300, opacity: 0.5 }} animate={{ x: 30, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
											<div className="gx-timeline-time gx-px- gx-mx-0 gx-font-weight-semi-bold">
												{selectedMode === 'SKILL' ? `Skill - 4` : 'Week - 4-5'}
											</div>
										</motion.div>
										<div className="gx-timeline-badge gx-bg-red iconcard">
											<i className="icon icon-tickets gx-p-2"></i>
										</div>
										<div className="gx-timeline-panel lineCard">
											{learnLoader || generateModal ? (
												<Skeleton active />
											) : (
												<>
													<h4 className="gx-timeline-tile gx-text-red">Master Configuration Management</h4>
													<p>Use tools like Ansible, Puppet, or Chef to automate server provisioning and environment setup.</p>
													<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center">
														<PiTimerFill size={15} className="gx-mr-1" /> Time Required
													</p>
													<Progress percent={75} strokeColor={twoColors} className="gx-mb-3" />
												</>
											)}
										</div>
									</div>

									{/* DevOps Roadmap Step 5 */}
									<div className="gx-timeline-item gx-timeline-time-item gx-py-0 gx-my-0 gx-px-6">
										<motion.div initial={{ x: -300, opacity: 0.5 }} animate={{ x: -30, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
											<div className="gx-timeline-time gx-px- gx-mx-0 gx-font-weight-semi-bold">
												{selectedMode === 'SKILL' ? `Skill - 5` : 'Week - 5'}
											</div>
										</motion.div>
										<div className="gx-timeline-badge gx-bg-amber iconcard">
											<i className="icon icon-widgets gx-p-2"></i>
										</div>
										<div className="gx-timeline-panel lineCard">
											{learnLoader || generateModal ? (
												<Skeleton active />
											) : (
												<>
													<h4 className="gx-timeline-tile gx-text-amber">Deploy with Containers & Kubernetes</h4>
													<p>Containerize applications using Docker and orchestrate deployments with Kubernetes or Docker Swarm.</p>
													<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center">
														<PiTimerFill size={15} className="gx-mr-1" /> Time Required
													</p>
													<Progress percent={100} strokeColor={twoColors} className="gx-mb-3" />
												</>
											)}
										</div>
									</div>
								</>
							)}

							{/* Timeline Item 1 */}
							{/* <p className='gx-p-0 gx-m-0'>hey</p> */}
							{/* <div className="gx-timeline-item gx-timeline-time-item">
								<div className="gx-timeline-time">Path Step - 1 </div>
								<div className="gx-timeline-badge gx-bg-pink iconcard">
									<i className="icon icon-data-display gx-p-2"></i>
								</div>
								<motion.div initial={{ x: 300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
									<div className="gx-timeline-panel lineCard">
										<h4 className="gx-timeline-tile gx-text-pink">Completed first 50 projects</h4>
										<p className="gx-fs-sm gx-mb-0 ">
											It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
										</p>

										<Tag color="purple" className="gx-m-0 gx-my-1 gx-fs-sm gx-mr-1">
											Initial
										</Tag>
										<Tag color="magenta" className="gx-m-0 gx-my-1 gx-fs-sm">
											Prototype
										</Tag>

										<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center gx-mt-1">
											<PiTimerFill size={15} className="gx-mr-1" /> Time Required{' '}
										</p>
										<Progress percent={40} strokeColor={twoColors} />
									</div>
								</motion.div>
							</div> */}
						</div>
					</div>
					</motion.div>
				</div>
			)}
			<AttemptedQuizModal
				openModal={showQuizAttemptModal}
				individualQuizData={individualQuizData}
				setShowQuizAttemptModal={setShowQuizAttemptModal}
			/>

			<Modal
				closeIcon={<GiSplitCross title="close" size={18} className="gx-m-0 gx-p-0 gx-fs-sm gx-text-danger" />}
				title={
					<div className="gx-d-flex gx-align-items-center card-titles">
						{/* <BsSubstack size={16} className='gx-mr-2 gx-link'/> */}
						<img
							src="/assets/images/pipeline.gif"
							className="gx-mr-1"
							alt="success-img"
							style={{
								width: 35,
								height: 35
							}}
						/>
						Sub Topic - {modalContent?.weeks}
						{/* <p className='gx-p-0 gx-m-0 gx-fs-xs'>Sub Topic </p>
					<p className='gx-p-0 gx-m-0 gx-fs-xs'></p> */}
					</div>
				}
				centered
				open={open}
				onOk={() => setOpen(false)}
				onCancel={() => {
					setOpen(false);
				}}
				width={1000}
				// zIndex={10000}
				footer={null}
				maskClosable={false}
				keyboard={false}
				style={{ top: '10px', overflow: 'hidden' }}
				modalRender={(modalNode) => (
					<motion.div
						key={open ? 'open' : 'closed'}
						initial={{ x: 300, opacity: 0.5 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: 300, opacity: 0 }}
						transition={{ duration: 0.9, ease: easeInOut }}
					>
						{modalNode}
					</motion.div>
				)}
			>
				<div className="job-card">
					<motion.div initial={{ x: 300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
						<div className="job-header">
							<div
								className="card-icon1 orders-icon"
								style={{
									padding: '5px'
								}}
							>
								<SiConfluence size={35} />
							</div>
							<div className="job-info">
								<h2 className="job-title gx-mb-1" style={{ color: 'rgb(3 95 168)' }}>
									{modalContent?.title}
								</h2>
								<p className="company-location" style={{ color: 'rgb(45 137 0)' }}>
									Skills - {modalContent?.skill}
								</p>
								<div className="tags">
									<Tag color="purple" className="gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center">
										<PiTimerFill size={14} className="gx-mr-1" />
										Topic Duration :{modalContent?.weeks}
									</Tag>
									<Tag color="volcano" className="gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center">
										<PiTimerFill size={14} className="gx-mr-1" />
										Total Estimated Duration :{learnPath?.duration}
									</Tag>
								</div>
							</div>
							<Button size="small" className="gx-d-flex gx-align-items-center" type="primary" onClick={() => setOpen(false)}>
								<FaArrowLeft className="gx-mr-1" />
								Go Back
							</Button>
						</div>
					</motion.div>

					<motion.div initial={{ x: 500, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
						<section className="job-section">
							<div>
								<h3 className="gx-d-flex gx-align-items-center">
									<FaTags className="gx-link gx-mr-1" /> About this role
								</h3>
								<p>{learnPath?.roleSummary}</p>
							</div>
						</section>
					</motion.div>

					<motion.div initial={{ x: 700, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
						<section className="job-section">
							<h3 className="gx-d-flex gx-align-items-center">
								<SiChartdotjs className="gx-link gx-mr-1" /> Brief Summary
							</h3>
							<p>{modalContent?.brief_summary}</p>
						</section>
					</motion.div>

					<motion.div initial={{ x: 800, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: easeInOut }}>
						<section className="job-section">
							<h3 className="gx-d-flex gx-align-items-center">
								<SiBookstack className="gx-link gx-mr-1" />
								Preparation Topics{' '}
							</h3>
							<ul>
								{modalContent?.topics?.map((topic: any) => {
									return <li>{topic}</li>;
								})}
							</ul>
						</section>
					</motion.div>

					{modalContent?.toolsAndTechnologies?.length > 0 && (
						<section className="job-section">
							<h3 className="gx-d-flex gx-align-items-center gx-m-0 gx-mb-1">
								<BsWrenchAdjustableCircleFill className="gx-link gx-mr-1" />
								Tool and Technologies{' '}
							</h3>
							<p className="gx-p-0 gx-m-0 gx-fs-xs gx-ml-4 gx-mb-2">
								The tools and technologies listed for this job description reflect current industry trends and can significantly boost your chances of
								success in interviews.
							</p>
							<ul>{modalContent?.toolsAndTechnologies?.map((tool: any, index: any) => <li key={index}>{tool}</li>)}</ul>
						</section>
					)}

					{modalContent?.previous_question_and_answers?.length > 0 && (
						<Collapse defaultActiveKey={['1']} onChange={onChange} className="gx-mt-2">
							<Panel
								header={
									<div className="">
										<div className="gx-d-flex gx-align-items-center">
											<img
												src="/assets/images/ticket.gif"
												alt="active"
												style={{ width: 22, borderRadius: '8px' }}
												className="gx-p-0 gx-m-0 gx-mr-1 "
											/>

											<p className="gx-p-0 gx-m-0 gx-fs-md gx-link" style={{ fontWeight: 600 }}>
												{' '}
												Previously Asked Questions{' '}
											</p>
										</div>
										<p className="gx-p-0 gx-m-0 gx-fs-xs gx-ml-4">
											{' '}
											Explore interview questions previously asked by various companies to boost your preparation and improve your chances of success.
										</p>
									</div>
								}
								key="1"
							>
								<section className="">
									{/* <h3 className="gx-d-flex gx-align-items-center">
								<SiBookstack className="gx-link gx-mr-1" />
								Preparation Topics
							</h3> */}
									{/* <ul> */}
									{modalContent?.previous_question_and_answers?.map((topic: any) => {
										return (
											<div className="gx-my-2">
												<p className="gx-m-0 gx-p-0 gx-d-flex gx-align-items-center" style={{ fontWeight: 500 }}>
													<img
														src="/assets/images/Qna.png"
														alt="active"
														style={{ width: 13, borderRadius: '8px' }}
														className="gx-p-0 gx-m-0 gx-mr-1 "
													/>
													{topic?.question}
												</p>
												<p className="gx-m-0 gx-p-0 gx-d-flex gx-align-items-center gx-fs-sm gx-pt-1">
													<FaArrowCircleRight size={13} className="gx-mr-1" color="green" />
													{topic?.answer}
												</p>
											</div>
										);
									})}

									{/* </ul> */}
								</section>
							</Panel>
						</Collapse>
					)}

					<section className="job-section">
						<h3 className="gx-d-flex gx-align-items-center">
							<SiChartdotjs className="gx-link gx-mr-1" style={{ color: 'rgb(3 95 168)' }} /> Resources
						</h3>
						<p>
							{modalContent?.resources?.map((resource: any) => {
								const link = resource?.link;
								const feedback: any = feedbacks[link] || '';

								return (
									<ul key={link} className="gx-m-0 gx-p-0 gx-ml-3 gx-my-1">
										<li>
											{resource?.name} *
											<Tag color="purple" className="gx-ml-1">
												{resource?.type}
											</Tag>
										</li>
										<div className="gx-d-flex gx-justify-content-between">
											<a href={link} target="_blank" rel="noopener noreferrer" className="gx-link gx-m-0 gx-m-0">
												{link}
											</a>

											<Popover
												open={openPopover === link}
												onOpenChange={() => {}}
												zIndex={10000}
												content={
													<div className="gx-d-flex" style={{ flexDirection: 'column', alignItems: 'end' }}>
														<p className="gx-m-0 gx-fs-sm">Let us know what's wrong with the link</p>
														<TextArea
															rows={3}
															placeholder="Describe the issue..."
															value={feedback}
															onChange={(e) => handleChange(link, e?.target?.value)}
															className="gx-mt-2"
														/>
														<div className="gx-d-flex gx-mt-2">
															<Button size="small" className="gx-mr-1" onClick={handleCancel}>
																Cancel
															</Button>
															<Button
																size="small"
																type="primary"
																loading={feedbackLoader}
																onClick={() => handleSubmit(link)}
																disabled={!feedback?.trim()}
															>
																Submit
															</Button>
														</div>
													</div>
												}
												title={
													<p className="gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center gx-justify-content-between">
														<div className="gx-d-flex gx-align-items-center">
															<TbMoodSadFilled className="gx-mr-1" size={15} /> Found a broken link?
														</div>
														<GiSplitCross onClick={handleCancel} title="close" size={15} className="gx-m-0 gx-link gx-p-0 gx-fs-sm gx-text-danger" />
													</p>
												}
											>
												<Button
													size="small"
													type="ghost"
													onClick={() => togglePopover(link)}
													className="gx-d-flex gx-mr-3 gx-m-0 gx-p-0 gx-px-2 gx-align-items-center"
												>
													<FaHeartBroken size={13} className="gx-mr-1" /> Report an Issue
												</Button>
											</Popover>
										</div>
									</ul>
								);
							})}
						</p>
					</section>
				</div>
			</Modal>

			<Modal
				closeIcon={<GiSplitCross title="close" size={18} className="gx-m-0 gx-p-0 gx-fs-sm gx-text-danger" />}
				centered
				open={generateModal}
				onOk={() => setGenerateModal(false)}
				onCancel={() => {
					setSummaryNote({});
					setGenerateModal(false);
					setIsAcknowledged(false);
					continuepathdata ? setShowNote(false) : setShowNote(true);
					!LPID && form.setFieldValue('text', '');
					!LPID && dispatch(DeleteLearningPath({ jdId: JDID }));
				}}
				width={1000}
				zIndex={10000}
				footer={null}
				// mask={false}
				maskClosable={false}
				keyboard={false}
				style={{ top: 2, width: '100%', margin: '10px' }}
			>
				{/* {summaryNote && ( */}
				<div>
					<div className="email-confirmation-container">
						<div className="email-box">
							<img
								src="/assets/images/startup.gif"
								alt="Mail Icon"
								className="email-icon"
								style={{
									width: 50,
									height: 50
								}}
							/>
							<h3>About Company - {summaryNote?.company}</h3>
							<p className="gx-mt-1 gx-p-0">{summaryNote?.about_company}`</p>
							<h3>Summarized Version</h3>
							<p className="gx-mt-1 gx-p-0">{summaryNote?.summary}</p>

							<div>
								{summaryNote?.previous_questions?.length > 0 && <span className="highlight">Previously asked Questions </span>}

								<div className="gx-mt-2">
									{summaryNote?.previous_questions?.map((question: any, index: any) => (
										<li className="gx-d-flex gx-align-items-center">
											<VscActivateBreakpoints size={14} className="gx-mr-1" /> {question}{' '}
										</li>
									))}
								</div>
							</div>

							<h3 className="gx-mt-3">Learning Path Confirmation</h3>
							<p className="gx-mt-2 gx-p-0">
								Please confirm that you <span className="highlight">possess the mandatory skills listed below </span>, as this will help us assess
								your current proficiency. Your confirmation will enable us to generate a personalized learning path tailored to your needs.
							</p>

							<div className="gx-d-flex" style={{ flexDirection: 'column' }}>
								<span className="highlight">Mandatory Skills Required</span>

								<div className="gx-mt-2">
									{summaryNote?.required_skills?.map((skill: any, index: any) => (
										<Tag color={tagColors[index % tagColors?.length]} key={index}>
											{skill}
										</Tag>
									))}
								</div>
							</div>
							<div className="gx-d-flex gx-mt-1" style={{ flexDirection: 'column' }}>
								<span className="highlight">Optional Skills </span>

								<div className="gx-mt-2">
									{summaryNote?.optional_skills?.map((skill: any, index: any) => (
										<Tag color={tagColors[index % tagColors?.length]} key={index}>
											{skill}
										</Tag>
									))}
								</div>
							</div>

							<div className="gx-d-flex gx-mt-1" style={{ flexDirection: 'column' }}>
								{summaryNote?.certifications?.length > 0 && <span className="highlight">Certifications</span>}

								<div className="gx-mt-2">
									{summaryNote?.certifications?.map((skill: any, index: any) => (
										<Tag color={certificationsColors[index % certificationsColors?.length]} key={index}>
											{skill}
										</Tag>
									))}
								</div>
							</div>
							{reviewAcknowledge ? (
								<Checkbox className="gx-mt-2 gx-fs-md" checked>
									I acknowledge that I have read and understood the above instructions.
								</Checkbox>
							) : (
								<Checkbox checked={isAcknowledged} className="gx-mt-2 gx-fs-md" onChange={onChange}>
									I acknowledge that I have read and understood the above instructions.
								</Checkbox>
							)}

							{/* <p className="gx-fs-xs gx-ml-4">
  If you do not have the required skills, please <span className="resend-link">cancel the learning path</span>.
</p> */}
						</div>
					</div>

					{!reviewAcknowledge && (
						<div className="gx-mt-4 gx-d-flex" style={{ justifyContent: 'end' }}>
							<Button
								size="small"
								style={{ alignSelf: 'end' }}
								onClick={() => {
									setSummaryNote({});
									setGenerateModal(false);
									setIsAcknowledged(false);
									setShowNote(true);
									form.setFieldValue('text', '');
									dispatch(DeleteLearningPath({ jdId: JDID }));
								}}
							>
								Cancel
							</Button>
							<Button
								type="primary"
								size="small"
								disabled={!isAcknowledged}
								loading={learnLoader}
								onClick={() => {
									dispatch(
										addLearningPath({
											text: summaryNote?.summary,
											company: summaryNote?.company,
											requiredSkills:
												Array.isArray(summaryNote?.required_skills) && summaryNote?.required_skills.length > 0 ? summaryNote?.required_skills : null,
											optionalSkills:
												Array.isArray(summaryNote?.optional_skills) && summaryNote?.optional_skills.length > 0 ? summaryNote?.optional_skills : null,
											jdId: JDID
										})
									);
									setGenerateModal(false);
									setPagesummary(summaryNote?.summary);
								}}
								style={{ alignSelf: 'end' }}
							>
								Generate Learning Path
							</Button>
						</div>
					)}
				</div>
				{/* )} */}
			</Modal>
		</>
	);
};

export default Learn;
