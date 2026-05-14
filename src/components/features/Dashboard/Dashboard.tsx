import { InfoCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { Badge, Button, Col, Empty, message, notification, Progress, ProgressProps, Row, Skeleton, Tag, Tooltip } from 'antd';
import Search from 'antd/lib/input/Search';
import { easeInOut, motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BsBatteryFull } from 'react-icons/bs';
import { FaFireAlt } from 'react-icons/fa';
import { FaLocationArrow, FaNoteSticky } from 'react-icons/fa6';
import { GiSkills } from 'react-icons/gi';
import { IoFileTrayFull } from 'react-icons/io5';
import {
	MdAutoAwesome,
	MdComputer,
	MdDoNotTouch,
	MdEmojiEvents,
	MdInsights,
	MdMemory,
	MdPlaylistAddCheckCircle,
	MdQuiz,
	MdRocketLaunch,
	MdSmartToy,
	MdToken,
	MdWorkOutline
} from 'react-icons/md';
import { PiTimerFill } from 'react-icons/pi';
import { SiProgress } from 'react-icons/si';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { truncateText } from '../../../common/commonfunctions';
import { DUMMY_LEARNING_PATHS, environment } from '../../../environments/environment';
import { getQuizAPI, resetgetQuiz } from '../../../redux/features/Quiz/getQuiz';
import { addDashboardData, dashboardReset } from '../../../redux/features/dashboard/dashboardSlice';
import { getTokenDetails } from '../../../redux/features/dashboard/tokenSlice';
import { addContinueLearningPath } from '../../../redux/features/learningPath/continueLearningPathSlice';
import WaveAnimation from '../../child-components/wave-animation/waveAnimation';
import AiLearningPathsHeroArt from './AiLearningPathsHeroArt';
import DashboardPageHeadArt from './DashboardPageHeadArt';
import DashboardShellNetwork from './DashboardShellNetwork';
import './dashboard.css';
import '../../../styles/phase2-theme.css';
import '../../../styles/dashboard-arena.css';

/** Icons instead of GIFs for path list thumbnails (cycles per card). */
const PATH_GRID_THUMB_ICONS = [MdRocketLaunch, MdMemory, MdEmojiEvents, MdComputer, MdSmartToy, GiSkills] as const;

/** Sample rows — same shape as API `MyLearningPaths` items (for layout preview only). */
const DASHBOARD_DUMMY_PATHS = [
	{
		_preview: true,
		LearningPathID: 'dummy-lp-1',
		Title: 'Full-Stack AI Engineering Path',
		roleSummary:
			'Progress from Python fundamentals through MLOps and LLM application design. Includes hands-on APIs, vector stores, evaluation, and deployment patterns used in production AI teams.',
		duration: '6 weeks',
		progress: 62,
		assessmentCount: 2,
		consumedTokens: 8
	},
	{
		_preview: true,
		LearningPathID: 'dummy-lp-2',
		Title: 'Cloud Security & Zero Trust',
		roleSummary:
			'Identity, IAM hardening, network segmentation, and incident response playbooks tailored for SaaS environments.',
		duration: '4 weeks',
		progress: 28,
		assessmentCount: 0,	
		consumedTokens: 3
	},
	{
		_preview: true,
		LearningPathID: 'dummy-lp-3',
		Title: 'Product Analytics Deep Dive',
		roleSummary:
			'Experiment design, funnel analysis, cohort reporting, and stakeholder-ready dashboards with SQL and modern BI tools.',
		duration: '3 weeks',
		progress: 100,
		assessmentCount: 5,
		consumedTokens: 14
	},
	{
		_preview: true,
		LearningPathID: 'dummy-lp-4',
		Title: 'UX Writing for Complex Products',
		roleSummary:
			'Microcopy systems, accessibility-aware language, and onboarding flows for enterprise dashboards and AI-assisted UIs.',
		duration: '2 weeks',
		progress: 0,
		assessmentCount: 0,
		consumedTokens: 0
	}
];

/** Skills per path ID when API does not send `skills` / `Skills` yet (dummy + fallback). */
const LEARNING_PATH_SKILL_MAP: Record<string, string[]> = {
	'dummy-lp-1': ['Python', 'LLMs', 'REST APIs', 'MLOps', 'Vector databases'],
	'dummy-lp-2': ['IAM', 'Zero Trust', 'Network security', 'Incident response'],
	'dummy-lp-3': ['SQL', 'Experiment design', 'Cohort analysis', 'Dashboards', 'Analytics'],
	'dummy-lp-4': ['UX writing', 'Accessibility', 'Microcopy', 'Onboarding flows']
};

const TITLE_SKILL_STOP = new Set([
	'the',
	'for',
	'and',
	'with',
	'your',
	'path',
	'from',
	'deep',
	'dive',
	'product',
	'complex',
	'modern',
	'saas'
]);

function skillsForLearningPath(path: any): string[] {
	const raw = path?.Skills ?? path?.skills;
	if (Array.isArray(raw) && raw.length) {
		return raw.map((s: unknown) => String(s).trim()).filter(Boolean);
	}
	const id = path?.LearningPathID;
	if (id && LEARNING_PATH_SKILL_MAP[id]) {
		return [...LEARNING_PATH_SKILL_MAP[id]];
	}
	const title = path?.Title || '';
	return title
		.replace(/[&,.]/g, ' ')
		.split(/\s+/)
		.map((w: string) => w.trim())
		.filter((w: string) => w.length > 2 && !TITLE_SKILL_STOP.has(w.toLowerCase()))
		.slice(0, 6);
}

/** Skills from paths the learner has started (progress &gt; 0); `mastered` if any contributing path is complete. */
function aggregateSkillsFromPaths(paths: any[]): { label: string; mastered: boolean }[] {
	const map = new Map<string, { label: string; mastered: boolean }>();
	for (const p of paths || []) {
		const prog = Number(p?.progress ?? 0);
		if (prog <= 0) continue;
		const mastered = prog >= 100;
		for (const s of skillsForLearningPath(p)) {
			const key = s.toLowerCase();
			if (key.length < 2) continue;
			const prev = map.get(key);
			map.set(key, {
				label: prev?.label || s,
				mastered: Boolean(prev?.mastered || mastered)
			});
		}
	}
	return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function careerSkillInitial(label: string): string {
	const t = label.trim();
	if (!t) return '?';
	const ch = t.charAt(0).toUpperCase();
	return /[A-Z0-9]/i.test(ch) ? ch : '?';
}

/** Up to 5 rings; ~3–4 skills per ring when possible; extras spill into the outer ring. */
function splitSkillsIntoRings(skills: { label: string; mastered: boolean }[]): { label: string; mastered: boolean }[][] {
	if (skills.length === 0) return [];
	const MAX_RINGS = 5;
	const n = skills.length;
	const ringCount = Math.min(MAX_RINGS, Math.max(1, Math.ceil(n / 4)));
	const base = Math.floor(n / ringCount);
	const rem = n % ringCount;
	const rings: { label: string; mastered: boolean }[][] = [];
	let offset = 0;
	for (let r = 0; r < ringCount; r++) {
		const size = base + (r < rem ? 1 : 0);
		rings.push(skills.slice(offset, offset + size));
		offset += size;
	}
	return rings;
}

/** CSS radii (translateY distance from hub) — inner → outer. */
const CAREER_ORBIT_RADII = [
	'min(56px, 17vw)',
	'min(74px, 22vw)',
	'min(92px, 27vw)',
	'min(108px, 32vw)',
	'min(124px, 36vw)'
] as const;

/** Each ring runs at its own speed so orbits don’t look synced. */
const CAREER_ORBIT_DURATIONS = ['40s', '52s', '45s', '58s', '48s'] as const;

const Dashboard = () => {
	const { dashboardData, status: dashboardLoader } = useSelector((state: any) => state?.dashboardReducer),
		{ getQuizRes, getQuizloading } = useSelector((state: any) => state?.getQuiz),
		{ continuepathdata, status: continuepathLoader } = useSelector((state: any) => state?.continueLearningPathReducer),
		[learningPaths, setLearningPaths] = useState<any>([]),
		[insightCard, setInsightCard] = useState<any>(),
		dispatch = useDispatch(),
		[searchText, setSearchText] = useState(''),
		[filteredPaths, setFilteredPaths] = useState<any[]>(() => (DUMMY_LEARNING_PATHS ? DASHBOARD_DUMMY_PATHS : [])),
		[showLoading, setShowLoading] = useState(false),
		[quizTitle, setQuizTitle] = useState(''),
		[assesmentCount, setAssementCount] = useState(0),
		[welcomePeekOpen, setWelcomePeekOpen] = useState(false),
		welcomePeekCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
		[insightsPeekOpen, setInsightsPeekOpen] = useState(false),
		insightsPeekCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
		location = useLocation(),
		Navigate = useNavigate();

	const clearWelcomePeekTimer = () => {
		if (welcomePeekCloseTimer.current != null) {
			clearTimeout(welcomePeekCloseTimer.current);
			welcomePeekCloseTimer.current = null;
		}
	};

	const openWelcomePeek = () => {
		clearWelcomePeekTimer();
		setWelcomePeekOpen(true);
	};

	const scheduleCloseWelcomePeek = () => {
		clearWelcomePeekTimer();
		welcomePeekCloseTimer.current = setTimeout(() => {
			setWelcomePeekOpen(false);
			welcomePeekCloseTimer.current = null;
		}, 280);
	};

	const clearInsightsPeekTimer = () => {
		if (insightsPeekCloseTimer.current != null) {
			clearTimeout(insightsPeekCloseTimer.current);
			insightsPeekCloseTimer.current = null;
		}
	};

	const openInsightsPeek = () => {
		clearInsightsPeekTimer();
		setInsightsPeekOpen(true);
	};

	const scheduleCloseInsightsPeek = () => {
		clearInsightsPeekTimer();
		insightsPeekCloseTimer.current = setTimeout(() => {
			setInsightsPeekOpen(false);
			insightsPeekCloseTimer.current = null;
		}, 280);
	};

	const showConsumedToken = environment?.SERVER_ENVIRONMENT;

	useEffect(
		() => () => {
			clearWelcomePeekTimer();
			clearInsightsPeekTimer();
		},
		[]
	);

	useEffect(() => {
		dispatch(addDashboardData());
	}, []);

	useEffect(() => {
		if (!dashboardLoader && dashboardData && dashboardData?.statusCode === 200) {
			// message.success(dashboardData?.message);
			// setLearnPath(dashboardData?.data?.details);
			setLearningPaths(dashboardData?.data?.MyLearningPaths);
			setInsightCard(dashboardData?.data?.InsightCard);
			dispatch(dashboardReset());
		} else if (!dashboardLoader && dashboardData && dashboardData?.statusCode === 400) {
			message.warning(dashboardData?.message);
			dispatch(dashboardReset());
		} else if (!dashboardLoader && dashboardData && dashboardData?.statusCode === 500) {
			message.error(dashboardData?.message);
			dispatch(dashboardReset());
		}
	}, [dashboardData, dashboardLoader]);
	let [quizLPId, setQuizLPID] = useState(null);

	const handleQuickQuiz = (learn: any) => {
		setShowLoading(true);
		setActiveLoadingId(learn?.LearningPathID);

		dispatch(
			getQuizAPI({
				learningPathId: learn?.LearningPathID,
				subtopicId: ''
			})
		);
		setAssementCount(learn?.assessmentCount);
		setQuizLPID(learn?.LearningPathID);
		setQuizTitle(learn?.Title);
	};
	const redirectUrl = environment.REDIRECT_URL;

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
				Navigate('/learn', {
					state: {
						showQuiz: true,
						backToDashboard: true,
						QuizLPID: quizLPId,
						QuizTitle: quizTitle,
						assessmentCount: assesmentCount
					}
				});
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
				dispatch(resetgetQuiz());
			} else if (statusCode === 500) {
				message.error(message);
				dispatch(resetgetQuiz());
			}
		}
	}, [getQuizRes, getQuizloading]);

	const ContinueFunction = (LPID: any) => {
		if (String(LPID || '').startsWith('dummy-')) {
			message.info('Sample data — turn off DUMMY_LEARNING_PATHS in environment to open a real path.');
			return;
		}
		dispatch(addContinueLearningPath({ LearningPathID: LPID }));
		Navigate('/learn', { state: { fromContinue: true } });
	};

	const titleStyle = [
		// {
		// 	textStyle: 'gx-text-pink'
		// },
		{
			textStyle: 'gx-text-green'
		},
		{
			textStyle: 'gx-text-red'
		},
		{
			textStyle: 'gx-text-purple'
		},
		{
			textStyle: 'gx-text-orange'
		},
		{
			textStyle: 'gx-text-blue'
		}
	];

	const [activeLoadingId, setActiveLoadingId] = useState<string | null>(null);

	const effectiveLearningPaths = useMemo(() => {
		if (DUMMY_LEARNING_PATHS) {
			return DASHBOARD_DUMMY_PATHS;
		}
		return learningPaths || [];
	}, [learningPaths]);

	const careerSkillsProfile = useMemo(() => aggregateSkillsFromPaths(effectiveLearningPaths), [effectiveLearningPaths]);

	const careerSkillsStats = useMemo(() => {
		const mastered = careerSkillsProfile.filter((s) => s.mastered).length;
		return {
			total: careerSkillsProfile.length,
			mastered,
			building: careerSkillsProfile.length - mastered
		};
	}, [careerSkillsProfile]);

	const careerSkillRings = useMemo(() => splitSkillsIntoRings(careerSkillsProfile), [careerSkillsProfile]);

	useEffect(() => {
		if (!searchText) {
			setFilteredPaths(effectiveLearningPaths);
		} else {
			const lowerSearch = searchText?.toLowerCase();
			const filtered = effectiveLearningPaths.filter(
				(path: any) => path?.Title?.toLowerCase()?.includes(lowerSearch) || path?.roleSummary?.toLowerCase()?.includes(lowerSearch)
			);
			setFilteredPaths(filtered);
		}
	}, [searchText, effectiveLearningPaths]);


	useEffect(() => {
		dispatch(getTokenDetails());
	}, []);

	const twoColors: ProgressProps['strokeColor'] = {
		'0%': '#108ee9',
		'100%': '#87d068'
	};

	const handleButtonText = (progress: any) => {
		if (progress === 100) {
			return 'Learning  Completed';
		} else if (progress < 100.0 && progress > 0.0) {
			return 'Continue Learning';
		} else {
			return 'Start Learning';
		}
	};

	const handleButtonColor = (progress: any) => {
		if (progress === 100) {
			return '#28a745';
		} else if (progress < 100.0 && progress > 0.0) {
			return '#0469B9';
		} else {
			return '#f7b92a';
		}
	};

	return (
		<div className="dashboard phase2-dashboard dash-next dash-next-shell">
			<DashboardShellNetwork />
			<header className="dash-next-page-head">
				<div className="dash-next-page-head-row">
					<div className="dash-next-page-head-art-wrap">
						<DashboardPageHeadArt />
					</div>
					<div className="dash-next-page-head-copy">
						<div className="gx-mb-2" style={{ display: 'flex', gap: 8 }}>
							<div className="genz-pill vibrant">
								<MdAutoAwesome className="genz-icon" />
								AI Systems Live
							</div>
							<div className="genz-pill glow">
								<div className="dot" />
								Uden Tech Core
							</div>
						</div>
						<h1 className="dash-next-page-title">Intelligence Dashboard</h1>
						<p className="dash-next-page-lead">
							Real-time monitoring of your career trajectory and learning velocity.
						</p>
					</div>
				</div>
			</header>
			<Row className="gx-m-0 dash-next-top-row" gutter={[16, 12]}>
				<Col xs={24} md={8} className="gx-m-0 dash-next-top-col">
					<motion.div
						className="dash-next-top-card-wrap"
						initial={{ x: -300, opacity: 0.5 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.6, ease: easeInOut }}
					>
						<div
							className={`welcome-section gx-mr-0 shadow dash-next-welcome dash-next-welcome--slider phase2-card-interactive${welcomePeekOpen ? ' dash-next-welcome--peek-open' : ''}`}
							style={{ overflow: 'hidden', position: 'relative' }}
						>
							<div
								className="dash-next-welcome-slider"
								tabIndex={0}
								role="button"
								aria-expanded={welcomePeekOpen}
								aria-controls="welcome-learning-path-details"
								aria-label="Learning path details. Hover or focus to expand."
								onMouseEnter={openWelcomePeek}
								onMouseLeave={scheduleCloseWelcomePeek}
								onFocus={openWelcomePeek}
								onBlur={scheduleCloseWelcomePeek}
							>
								<div className="dash-next-welcome-slider-tab" aria-hidden>
									<span className="dash-next-welcome-slider-chevron" />
								</div>
								<div className="dash-next-welcome-slider-panel" id="welcome-learning-path-details" role="region" aria-label="About learning paths">
									<p className="dash-next-welcome-slider-heading">About learning paths</p>
									<p className="dash-next-welcome-slider-lead">
										Your workspace builds custom journeys from your goals—then keeps everything in one place.
									</p>
									<p className="dash-next-welcome-slider-subheading">What you get</p>
									<ul className="dash-next-welcome-slider-list">
										<li>AI-generated paths matched to roles and skills</li>
										<li>Progress, quizzes, and milestones tracked per path</li>
										<li>Pick up where you left off anytime</li>
									</ul>
									<p className="dash-next-welcome-slider-footnote">Open any path to continue in one click.</p>
								</div>
							</div>
							<div
								className="recharts-wrapper"
								style={{ width: '', cursor: 'default', height: '80px', position: 'absolute', bottom: '-10px', right: 0 }}
							>
								<svg className="recharts-surface" width="168" height="80" viewBox="0 0 168 80" version="1.1">
									<defs>
										<clipPath id="recharts19-clip">
											<rect x="0" y="0" height="80" width="168" />
										</clipPath>
									</defs>
									<defs>
										<linearGradient id="color" x1="0" y1="0" x2="1" y2="0">
											<stop offset="5%" stopColor="#fb7185" stopOpacity="0.9" />
											<stop offset="95%" stopColor="#937DFF" stopOpacity="0.9" />
										</linearGradient>
									</defs>
									<g className="recharts-layer recharts-area">
										<g className="recharts-layer">
											<path
												strokeWidth="0"
												style={{ fill: 'url(#color)' }}
												fill="url(#color)"
												fillOpacity="1"
												width="168"
												height="70"
												type="linear"
												stroke="none"
												className="recharts-curve recharts-area-area"
												d="M0,70L42,35L84,50L126,0L168,35L168,80L126,80L84,80L42,80L0,80Z"
											/>
											<path
												strokeWidth="0"
												stroke="#867AE5"
												fill="none"
												fillOpacity="1"
												width="168"
												height="80"
												className="recharts-curve recharts-area-curve"
												type="linear"
												d="M0,70L42,35L84,50L126,0L168,35"
											/>
										</g>
									</g>
								</svg>
								<div
									className="recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-top"
									style={{
										pointerEvents: 'none',
										visibility: 'hidden',
										position: 'absolute',
										top: '0px',
										left: '0px',
										transform: 'translate(10px, 30.4688px)'
									}}
								>
									<div
										className="recharts-default-tooltip"
										style={{
											margin: '0px',
											padding: '10px',
											backgroundColor: 'rgb(255, 255, 255)',
											border: '1px solid rgb(204, 204, 204)',
											whiteSpace: 'nowrap'
										}}
									>
										<p className="recharts-tooltip-label" style={{ margin: '0px' }}>
											0
										</p>
									</div>
								</div>
							</div>
							<div className="moving-bubble"></div>
							<div className="welcome-content gx-mt-5 gx-ml-4 dash-next-welcome-content">
								<div className="dash-next-welcome-eyebrow-row">
									<span className="dash-next-welcome-live-dot" aria-hidden />
									<span className="dash-next-welcome-eyebrow-chip">
										<MdAutoAwesome className="dash-next-welcome-eyebrow-chip-icon" aria-hidden />
										<span className="dash-next-welcome-eyebrow-chip-label">Learning workspace</span>
									</span>
									<span className="dash-next-welcome-eyebrow-row-divider" aria-hidden />
									<span
										className="dash-next-welcome-info-trigger"
										onMouseEnter={openWelcomePeek}
										onMouseLeave={scheduleCloseWelcomePeek}
										onFocus={openWelcomePeek}
										onBlur={scheduleCloseWelcomePeek}
										tabIndex={0}
										role="button"
										aria-label="Show learning path details"
										title="Opens the same details panel as the colored strip"
									>
										<InfoCircleTwoTone className="dash-next-welcome-info-icon" />
									</span>
								</div>
								<p className="dash-next-hero-title gx-p-0 gx-m-0 gx-d-flex gx-align-items-center gx-flex-wrap dash-next-welcome-hero-line" style={{ gap: '8px' }}>
									<span className="dash-next-welcome-hero-title-gradient">Welcome to Uden Tech</span>
									<MdEmojiEvents className="gx-mr-1 dash-next-welcome-hero-icon" aria-hidden />
								</p>
								<p className="dash-next-hero-sub motivation gx-fs-sm gx-p-0 gx-m-0">
									Generate tailored learning paths and track progress in one place.
								</p>
								<Button
									size="small"
									type="primary"
									className="dash-next-cta gx-mt-1 gx-d-inline-flex gx-align-items-center btnhover"
									onClick={() => Navigate('/learn')}
								>
									Generate Learning Path
									<FaLocationArrow size={10} className="gx-ml-1 dash-next-cta-icon" />
								</Button>
							</div>
						</div>
					</motion.div>
				</Col>
				<Col xs={24} md={8} className="gx-m-0 dash-next-top-col">
					<motion.div
						className="dash-next-top-card-wrap"
						initial={{ y: -300, opacity: 0.5 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5, ease: easeInOut }}
					>
						<div
							className={`ant-card shadow ant-card-bordered gx-card-widget gx-mb-0 dash-next-panel dash-next-insights dash-next-insights--slider dash-next-top-card-inner${insightsPeekOpen ? ' dash-next-insights--peek-open' : ''}`}
							style={{ position: 'relative', overflow: 'hidden' }}
						>
							<div
								className="dash-next-insights-slider"
								tabIndex={0}
								role="button"
								aria-expanded={insightsPeekOpen}
								aria-controls="insights-learning-path-details"
								aria-label="Learning path insights details. Hover or focus to expand."
								onMouseEnter={openInsightsPeek}
								onMouseLeave={scheduleCloseInsightsPeek}
								onFocus={openInsightsPeek}
								onBlur={scheduleCloseInsightsPeek}
							>
								<div className="dash-next-insights-slider-tab" aria-hidden>
									<span className="dash-next-insights-slider-chevron" />
								</div>
								<div
									className="dash-next-insights-slider-panel"
									id="insights-learning-path-details"
									role="region"
									aria-label="About learning path insights"
								>
									<p className="dash-next-insights-slider-heading">About these metrics</p>
									<p className="dash-next-insights-slider-lead">
										A live snapshot of your workspace—paths, progress stages, and assessments in one place.
									</p>
									<ul className="dash-next-insights-slider-list">
										<li>Path counts: total, completed, in progress, and not started</li>
										<li>Assessment and subtopic test totals across your paths</li>
										<li>Numbers update as you generate paths and finish milestones</li>
									</ul>
								</div>
							</div>
							<div className="ant-card-body">
								<div className="gx-entry-sec ">
									<div className="gx-timeline-info dash-next-insights-list">
										<div className="dash-next-insights-header">
											<div className="dash-next-insights-eyebrow-row">
												<span className="dash-next-insights-live-dot" aria-hidden />
												<span className="dash-next-insights-eyebrow-chip">
													<MdInsights className="dash-next-insights-eyebrow-chip-icon" aria-hidden />
													<span className="dash-next-insights-eyebrow-chip-label">Live metrics</span>
												</span>
												<span className="dash-next-insights-eyebrow-row-divider" aria-hidden />
												<span
													className="dash-next-insights-info-trigger"
													onMouseEnter={openInsightsPeek}
													onMouseLeave={scheduleCloseInsightsPeek}
													onFocus={openInsightsPeek}
													onBlur={scheduleCloseInsightsPeek}
													tabIndex={0}
													role="button"
													aria-label="Show insights details"
													title="Opens the same details panel as the colored strip"
												>
													<InfoCircleTwoTone className="dash-next-insights-info-icon" />
												</span>
											</div>
											<p className="dash-next-insights-hero-title gx-m-0 gx-p-0">
												<span className="dash-next-insights-hero-gradient">Learning Path Insights</span>
											</p>
										</div>
										<ul className="rewardsline-list">
											<li className="rewardsline-item	gx-mb-2">
												<div className="gx-d-flex gx-align-items-center">
													<div className="">
														<IoFileTrayFull color="#4D2D9B" size={18} aria-hidden />
													</div>
													<div className="rewardsline-content">
														<p className="gx-mb-0 gx-p-0 gx-fs-sm">Total Learning Paths</p>
														<p className="gx-m-0 gx-p-0 gx-fs-xs">Overview</p>
													</div>
												</div>
												<Badge count={insightCard?.TotalLearningPaths} size="small" color="green" showZero className="gx-mr-3" />
											</li>
											<li className="rewardsline-item gx-mb-2">
												<div className="gx-d-flex gx-align-items-center">
													<div className="">
														<BsBatteryFull color="#61c92e" size={18} aria-hidden />
													</div>
													<div className="rewardsline-content">
														<p className="gx-mb-0 gx-p-0 gx-fs-sm">Completed LP</p>
														<p className="gx-m-0 gx-p-0 gx-fs-xs">Achieved</p>
													</div>
												</div>
												<Badge count={insightCard?.CompletedLearningPaths} size="small" color="green" showZero className=" gx-mr-3 " />
											</li>
											<li className="rewardsline-item gx-mb-2">
												<div className="gx-d-flex gx-align-items-center">
													<div className="">
														<SiProgress color="#FF5500" size={18} aria-hidden />
													</div>
													<div className="rewardsline-content">
														<p className="gx-mb-0 gx-p-0 gx-fs-sm">In Progress LP</p>
														<p className="gx-m-0 gx-p-0 gx-fs-xs">Ongoing</p>
													</div>
												</div>
												<Badge count={insightCard?.InProgressLearningPaths} color="green" size="small" showZero className="gx-mr-3 " />
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</Col>

				<Col xs={24} md={8} className="gx-m-0 dash-next-top-col">
					<motion.div
						className="dash-next-top-card-wrap"
						initial={{ y: -300, opacity: 0.5 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5, ease: easeInOut }}
					>
						<div
							className="ant-card ant-card-bordered gx-card-widget gx-card-full gx-mb-0 dash-next-panel dash-next-badges dash-next-top-card-inner"
							style={{ position: 'relative', cursor: 'pointer' }}
						>
							<div className="dash-next-badges-wave-back" aria-hidden>
								<div className="dash-next-badges-wave">
									<WaveAnimation variant="fullWidth" />
								</div>
							</div>
							<div className="dash-next-badges-inner">
								<div className="dash-next-badges-header">
									<div className="dash-next-badges-header-text">
										<h3 className="dash-next-badges-title gx-m-0 gx-p-0 gx-d-flex gx-align-items-center gx-flex-wrap">
											<span className="dash-next-badges-title-main gx-pr-2">Skill Badges</span>
											<Tooltip
												placement="right"
												zIndex={5000}
												title="Milestone tiers unlock as you complete learning paths."
											>
												<span className="dash-next-badges-title-info-wrap">
													<InfoCircleTwoTone className="dash-next-badges-title-info" />
												</span>
											</Tooltip>
										</h3>
									</div>
								</div>
								<ul className="dash-next-badges-list">
									<li className="dash-next-badge-tier">
										<div className="dash-next-badge-tier-icon">
											<MdRocketLaunch className="dash-next-badge-tier-svg" aria-hidden />
										</div>
										<div className="dash-next-badge-tier-body">
											<p className="dash-next-badge-tier-name gx-m-0">Knowledge Seeker</p>
											<div className="dash-next-badge-progress">
												<div className="dash-next-badge-progress-track">
													<div
														className="dash-next-badge-progress-fill dash-next-badge-progress-fill--emerald"
														style={{ width: learningPaths?.length >= 1 ? '100%' : '100%' }}
													/>
												</div>
												<span className="dash-next-badge-progress-label">{learningPaths?.length >= 1 ? '1/1' : '1/1'}</span>
											</div>
										</div>
									</li>
									<li className="dash-next-badge-tier">
										<div className="dash-next-badge-tier-icon">
											<MdMemory className="dash-next-badge-tier-svg" aria-hidden />
										</div>
										<div className="dash-next-badge-tier-body">
											<p className="dash-next-badge-tier-name gx-m-0">Trailblazer</p>
											<div className="dash-next-badge-progress">
												<div className="dash-next-badge-progress-track">
													<div
														className="dash-next-badge-progress-fill dash-next-badge-progress-fill--violet"
														style={{ width: insightCard?.CompletedLearningPaths >= 2 ? '100%' : '0%' }}
													/>
												</div>
												<span className="dash-next-badge-progress-label">{insightCard?.CompletedLearningPaths >= 2 ? '1/1' : '0/1'}</span>
											</div>
										</div>
									</li>
									<li className="dash-next-badge-tier">
										<div className="dash-next-badge-tier-icon">
											<MdEmojiEvents className="dash-next-badge-tier-svg" aria-hidden />
										</div>
										<div className="dash-next-badge-tier-body">
											<p className="dash-next-badge-tier-name gx-m-0">The Precisionist</p>
											<div className="dash-next-badge-progress">
												<div className="dash-next-badge-progress-track">
													<div
														className="dash-next-badge-progress-fill dash-next-badge-progress-fill--gold"
														style={{ width: insightCard?.CompletedLearningPaths >= 5 ? '100%' : '0%' }}
													/>
												</div>
												<span className="dash-next-badge-progress-label">{insightCard?.CompletedLearningPaths >= 5 ? '1/1' : '0/1'}</span>
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</motion.div>
				</Col>
			</Row>

			<Row className="gx-m-0 dash-next-career-constellation-row" gutter={[16, 12]}>
				<Col xs={24} className="gx-m-0">
					<motion.div
						className="dash-next-career-constellation-wrap"
						initial={{ y: 18, opacity: 0.72 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5, ease: easeInOut }}
					>
						<section
							className="dash-next-career-constellation phase2-card-interactive"
							aria-labelledby="dash-career-constellation-title"
						>
							<div className="dash-next-career-constellation-sheen" aria-hidden />
							<div className="dash-next-career-constellation-grid">
								<div className="dash-next-career-constellation-intro">
									<p className="dash-next-career-constellation-eyebrow gx-m-0">Skill constellation</p>
									<div className="dash-next-career-constellation-title-row gx-d-flex gx-align-items-center gx-flex-wrap">
										<span className="dash-next-career-constellation-icon" aria-hidden>
											<GiSkills className="dash-next-career-constellation-icon-svg" />
										</span>
										<div className="dash-next-career-constellation-heading-group">
											<h3 id="dash-career-constellation-title" className="dash-next-career-constellation-title gx-m-0">
												Your stack from learning paths
											</h3>
											<p className="dash-next-career-constellation-sub gx-m-0">
												Up to five rings with a few skills each (about 3–4 when there are enough). Dots blink and each ring
												spins at its own speed — hover for the full skill name.
											</p>
										</div>
									</div>
									{careerSkillsProfile.length > 0 ? (
										<ul className="dash-next-career-constellation-stats" aria-label="Skill summary">
											<li>
												<span className="dash-next-career-stat-value">{careerSkillsStats.total}</span>
												<span className="dash-next-career-stat-label">skills mapped</span>
											</li>
											<li>
												<span className="dash-next-career-stat-value dash-next-career-stat-value--emerald">
													{careerSkillsStats.mastered}
												</span>
												<span className="dash-next-career-stat-label">from completed paths</span>
											</li>
											<li>
												<span className="dash-next-career-stat-value dash-next-career-stat-value--cyan">
													{careerSkillsStats.building}
												</span>
												<span className="dash-next-career-stat-label">in progress</span>
											</li>
										</ul>
									) : null}
									<div className="dash-next-career-constellation-actions">
										<button
											type="button"
											className="dash-next-career-constellation-cta"
											onClick={() => Navigate('/job-search?tab=matches')}
										>
											<span className="dash-next-career-constellation-cta-glow" aria-hidden />
											<MdWorkOutline className="dash-next-career-constellation-cta-ico" size={18} aria-hidden />
											<span>Open matched jobs</span>
										</button>
										<p className="dash-next-career-constellation-cta-hint gx-m-0">
											Lands on <strong>Matched</strong> — roles scored to this stack (mock data until APIs connect).
										</p>
									</div>
								</div>

								<div
									className={`dash-next-career-constellation-canvas${careerSkillsProfile.length === 0 ? ' dash-next-career-constellation-canvas--empty' : ''}`}
								>
									<div className="dash-next-career-orbit-rings" aria-hidden>
										{[0, 1, 2, 3, 4].map((i) => (
											<div key={i} className={`dash-next-career-orbit-ring dash-next-career-orbit-ring--${i + 1}`} />
										))}
									</div>
									<div className="dash-next-career-hub">
										<span className="dash-next-career-hub-ring" aria-hidden />
										<GiSkills className="dash-next-career-hub-icon" aria-hidden />
									</div>
									{careerSkillsProfile.length === 0 ? (
										<div className="dash-next-career-constellation-empty-callout">
											<MdInsights className="dash-next-career-empty-ico" size={22} aria-hidden />
											<p className="dash-next-career-empty-title gx-m-0">Map unlocks with path progress</p>
											<p className="dash-next-career-empty-copy gx-m-0">
												Continue any journey below — nodes appear here automatically.
											</p>
										</div>
									) : (
										<div className="dash-next-career-satellites" role="list" aria-label="Skills on concentric orbits">
											{careerSkillRings.map((ring, ringIdx) => {
												const radius = CAREER_ORBIT_RADII[Math.min(ringIdx, CAREER_ORBIT_RADII.length - 1)];
												const duration = CAREER_ORBIT_DURATIONS[ringIdx % CAREER_ORBIT_DURATIONS.length];
												const count = ring.length;
												return ring.map(({ label, mastered }, j) => {
													const angle = count > 0 ? (360 / count) * j : 0;
													const blinkLag = ringIdx * 0.38 + j * 0.11;
													return (
														<Tooltip
															key={`r${ringIdx}-s${j}-${label}`}
															mouseEnterDelay={0.12}
															overlayClassName="dash-next-career-skill-tooltip"
															title={
																<div>
																	<div className="dash-next-career-tooltip-title">{label}</div>
																	<div className="dash-next-career-tooltip-sub">
																		Ring {ringIdx + 1} of {careerSkillRings.length} ·{' '}
																		{mastered
																			? 'Completed learning path'
																			: 'In progress on a learning path'}
																	</div>
																</div>
															}
														>
															<div
																role="listitem"
																className={`dash-next-career-satellite ${mastered ? 'dash-next-career-satellite--sealed' : 'dash-next-career-satellite--spark'}`}
																style={
																	{
																		'--slot-angle': `${angle}deg`,
																		'--orbit-r': radius,
																		'--orbit-duration': duration,
																		'--blink-lag': `${blinkLag}s`
																	} as CSSProperties
																}
															>
																<span className="dash-next-career-blink" aria-label={label}>
																	<span className="dash-next-career-blink-glow" aria-hidden />
																	<span className="dash-next-career-blink-pulse" aria-hidden />
																	<span className="dash-next-career-blink-core" aria-hidden />
																	<span className="dash-next-career-blink-letter">{careerSkillInitial(label)}</span>
																</span>
															</div>
														</Tooltip>
													);
												});
											})}
										</div>
									)}
								</div>
							</div>
							<div className="dash-next-career-legend-bar">
								<span className="dash-next-career-legend-item dash-next-career-legend-item--sealed">
									<span className="dash-next-career-legend-dot" aria-hidden />
									Completed path
								</span>
								<span className="dash-next-career-legend-item dash-next-career-legend-item--spark">
									<span className="dash-next-career-legend-dot" aria-hidden />
									In progress
								</span>
								<span className="dash-next-career-legend-hint">Up to 5 rings · hover a dot · orbit pauses on hover</span>
							</div>
						</section>
					</motion.div>
				</Col>
			</Row>

			{/* </div> */}

			<div className="learning-path-section dash-next-paths">
				<header className="dash-next-toolbar dash-next-paths-header dash-next-paths-header--with-hero gx-d-flex gx-align-items-center gx-justify-content-between gx-flex-wrap">
					<div className="dash-next-paths-header-lead gx-d-flex gx-flex-wrap gx-align-items-center">
						<div className="dash-next-paths-header-block">
							<p className="dash-next-paths-header-eyebrow gx-m-0 gx-p-0">Path library</p>
							<div className="dash-next-paths-header-title-row gx-d-flex gx-align-items-center gx-flex-wrap">
								<span className="dash-next-paths-header-icon" aria-hidden>
									<MdComputer className="dash-next-paths-header-svg" />
								</span>
								<div className="dash-next-paths-header-heading-group">
									<div className="dash-next-paths-header-label-row gx-d-flex gx-align-items-center gx-flex-wrap">
										<span className="dash-next-paths-header-label">My Learning Paths</span>
										{DUMMY_LEARNING_PATHS && (
											<Tag color="purple" className="gx-mb-0 dash-next-paths-header-tag" style={{ fontSize: 11 }}>
												Preview data
											</Tag>
										)}
									</div>
								</div>
							</div>
							<p className="dash-next-paths-header-sub gx-m-0 gx-p-0">
								Browse and search every journey you&apos;ve started—your featured path stays on top, then the rest of your list.
							</p>
						</div>
						<div className="dash-next-paths-header-visual" aria-hidden>
							{/* Raster only appears after a successful load; otherwise the colorful SVG shows (no broken / black img overlay). */}
							<picture className="dash-next-paths-hero-picture dash-next-paths-hero-picture--missing">
								<source
									type="image/avif"
									srcSet={`${process.env.PUBLIC_URL}/assets/images/ai-learning-path-cluster.avif`}
								/>
								<img
									className="dash-next-paths-hero-img"
									src={`${process.env.PUBLIC_URL}/assets/images/ai-learning-path-cluster.png`}
									alt=""
									width={132}
									height={132}
									loading="lazy"
									decoding="async"
									onLoad={(e) => {
										const pic = e.currentTarget.closest('.dash-next-paths-hero-picture');
										pic?.classList.remove('dash-next-paths-hero-picture--missing');
									}}
									onError={(e) => {
										const pic = e.currentTarget.closest('.dash-next-paths-hero-picture');
										pic?.classList.add('dash-next-paths-hero-picture--missing');
									}}
								/>
							</picture>
							<AiLearningPathsHeroArt className="dash-next-paths-hero-svg" />
						</div>
					</div>

					<Search
						placeholder="Search paths, skills, topics…"
						allowClear
						className="dash-next-paths-search gx-m-0 gx-p-0"
						value={searchText}
						onChange={(e) => setSearchText(e?.target?.value)}
					/>
				</header>

				<div className="learning-paths-wrapper dash-next-paths-list">
					{dashboardLoader && !DUMMY_LEARNING_PATHS ? (
						<div className="learning-path-card dash-next-path-card shadow gx-w-100 gx-my-1 dash-next-skeleton-card">
							<Skeleton avatar paragraph={{ rows: 3 }} active />
						</div>
					) : filteredPaths?.length === 0 ? (
						<div className="gx-my-2 gx-p-5 gx-d-flex gx-justify-content-center learning-path-card shadow dash-next-empty">
							<Empty description="No Learning Paths Found" />
						</div>
					) : (
						<>
							{/* First card - Full Width */}
							{filteredPaths?.[0] && (
								<div className="learning-path-card dash-next-path-card gx-mb-2 gx-pb-2 gx-mt-0 full-width-card dash-next-featured phase2-card-interactive">
									<div className="path-icon dash-next-path-thumb">
										<MdSmartToy className="gx-mr-1 dash-next-path-thumb-icon" aria-hidden />
									</div>
									<div className="path-content dash-next-path-main">
										<Tooltip title="This title is based on historical data.">
											<p className="gx-text-indigo dash-next-path-title" style={{ fontSize: '16px' }}>
												{filteredPaths?.[0]?.Title}
											</p>
										</Tooltip>
										<p className="dash-next-path-desc">{truncateText(filteredPaths?.[0]?.roleSummary)}</p>

										<div className="dash-next-path-meta">
											<p className="instructor dash-next-path-chip dash-next-path-chip--muted">By AI Model</p>
											<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center dash-next-path-chip dash-next-path-chip--time">
												<PiTimerFill size={15} className="gx-mr-1" /> Time — {filteredPaths?.[0]?.duration}
											</p>
										</div>

										<Progress
											className="dash-next-path-progress"
											percent={Math?.round(filteredPaths?.[0]?.progress || 0)}
											strokeColor={twoColors}
											showInfo
										/>

										<div className="gx-d-flex gx-justify-content-between gx-align-items-center dash-next-path-actions">
											<div className="gx-d-flex gx-align-items-center">
												<Button
													size="small"
													className="gx-fs-xs gx-my-1 gx-d-flex gx-align-items-center btnhover"
													onClick={() => ContinueFunction(filteredPaths?.[0]?.LearningPathID)}
													loading={continuepathLoader}
													style={{ backgroundColor: handleButtonColor(filteredPaths?.[0]?.progress), color: 'white' }}
												>
													{handleButtonText(filteredPaths?.[0]?.progress)}

													{/* {filteredPaths?.[0]?.progress >= "100" ? 'Learning Completed' : 'Continue Learning'} */}

													<FaFireAlt size={15} className="gx-ml-1" />
												</Button>
												{showConsumedToken === 'PROD' && (
													<Tag
														color="purple"
														style={{ padding: '2px' }}
														className="gx-m-0 gx-px-2 gx-mr-2 gx-fs-sm gx-font-weight-normal gx-d-flex gx-align-items-center"
													>
														<MdToken size={18} className="gx-mr-1" /> Consumed Tokens - {filteredPaths[0]?.consumedTokens}
													</Tag>
												)}
											</div>

											{filteredPaths?.[0]?.assessmentCount !== 0 ? (
												<Tooltip
													title={
														showLoading && getQuizloading && activeLoadingId === filteredPaths?.[0]?.LearningPathID ? (
															'AI is preparing the questions...'
														) : (
															<>
																You have attempted{' '}
																{filteredPaths?.[0]?.assessmentCount
																	? filteredPaths[0].assessmentCount === 1
																		? '1 quiz'
																		: `${filteredPaths[0].assessmentCount} quizzes`
																	: 'no quizzes'}
																. Click the button below to take a new quiz.
																<Tag color="orange" style={{ marginLeft: 8 }}>
																	1 Quiz Attempt = 1 Token Deduction
																</Tag>
															</>
														)
													}
													placement="topLeft"
												>
													<Badge count={filteredPaths?.[0]?.assessmentCount} size="small" style={{ backgroundColor: 'orange', color: 'white' }}>
														<Button
															// type={!showLoading || !getQuizloading ? "primary" : "default"}
															type="primary"
															shape="circle"
															id={filteredPaths?.[0]?.LearningPathID}
															key={filteredPaths?.[0]?.LearningPathID}
															onClick={!showLoading || !getQuizloading ? () => handleQuickQuiz(filteredPaths?.[0]) : undefined}
															className="gx-m-0 gx-mx-1 btnhover"
															size="middle"
															icon={activeLoadingId === filteredPaths?.[0]?.LearningPathID && getQuizloading ? <LoadingOutlined /> : <MdQuiz />}
														/>
													</Badge>
												</Tooltip>
											) : (
												<Tooltip
													title={
														showLoading && getQuizloading && activeLoadingId === filteredPaths?.[0]?.LearningPathID ? (
															'AI is preparing the questions...'
														) : (
															<>
																This quiz includes all the skills in your learning path. Make sure you have attempted skill-wise quizzes before
																attempting this quiz.
																<Tag color="orange" style={{ marginLeft: 8 }}>
																	1 Quiz Attempt = 1 Token Deduction
																</Tag>
															</>
														)
													}
													placement="topLeft"
												>
													<Button
														// type={!showLoading || !getQuizloading ? "primary" : "default"}
														id={filteredPaths?.[0]?.LearningPathID}
														key={filteredPaths?.[0]?.LearningPathID}
														type="primary"
														shape="circle"
														onClick={!showLoading || !getQuizloading ? () => handleQuickQuiz(filteredPaths?.[0]) : undefined}
														className="gx-m-0 gx-mx-1 btnhover"
														size="middle"
														icon={activeLoadingId === filteredPaths?.[0]?.LearningPathID && getQuizloading ? <LoadingOutlined /> : <MdQuiz />}
													/>
												</Tooltip>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Remaining cards in 2-column grid */}
							<div className="grid-cards dash-next-grid">
								{dashboardLoader && !DUMMY_LEARNING_PATHS
									? Array.from({ length: 4 }).map((_, index) => (
											<div key={index} className="learning-path-card dash-next-path-card shadow gx-my-1 dash-next-skeleton-card">
												<Skeleton avatar paragraph={{ rows: 3 }} active />
											</div>
										))
									: filteredPaths?.slice(1)?.map((learn: any, index: number) => {
											const titleIndex = index % titleStyle?.length;
											const { textStyle } = titleStyle[titleIndex];
											const ThumbIcon = PATH_GRID_THUMB_ICONS[index % PATH_GRID_THUMB_ICONS.length];
											return (
												<div key={index} className="learning-path-card dash-next-path-card dash-next-path-card--grid gx-my-1">
													<div className="path-icon dash-next-path-thumb">
														<ThumbIcon className="dash-next-path-thumb-icon" aria-hidden />
													</div>
													<div className="path-content dash-next-path-main">
														<Tooltip title="This title is based on historical data.">
															<p className={`dash-next-path-title ${textStyle}`} style={{ fontSize: '15px' }}>
																{learn?.Title}
															</p>
														</Tooltip>
														<p className="dash-next-path-desc">{truncateText(learn?.roleSummary)}</p>

														<div className="dash-next-path-meta">
															<p className="instructor dash-next-path-chip dash-next-path-chip--muted">By AI Model</p>
															<p className="gx-p-0 gx-m-0 gx-fs-sm gx-d-flex gx-align-items-center dash-next-path-chip dash-next-path-chip--time">
																<PiTimerFill size={15} className="gx-mr-1" /> Time — {learn?.duration}
															</p>
														</div>

														<Progress
															className="dash-next-path-progress gx-px-2"
															percent={Math?.round(learn?.progress || 0)}
															strokeColor={twoColors}
															showInfo
														/>

														<div className="gx-d-flex gx-align-items-center gx-justify-content-between dash-next-path-actions">
															<div className="gx-d-flex gx-align-items-center">
																<Button
																	size="small"
																	className="gx-fs-xs gx-my-1 gx-d-flex gx-align-items-center"
																	onClick={() => ContinueFunction(learn?.LearningPathID)}
																	loading={continuepathLoader}
																	style={{ backgroundColor: handleButtonColor(learn?.progress), color: 'white' }}
																>
																	{handleButtonText(learn?.progress)}
																	{/* {learn?.progress >= "100" ? 'Learning Completed' : 'Continue Learning'} */}

																	<FaFireAlt size={15} className="gx-ml-1" />
																</Button>
																{showConsumedToken === 'PROD' && (
																	<Tag
																		color="purple"
																		style={{ padding: '2px' }}
																		className="gx-m-0 gx-px-2 gx-mr-2 gx-fs-sm gx-font-weight-normal gx-d-flex gx-align-items-center"
																	>
																		<MdToken size={18} className="gx-mr-1" /> Consumed Tokens - {learn?.consumedTokens}
																	</Tag>
																)}
															</div>

															{learn?.assessmentCount !== 0 ? (
																<Tooltip
																	title={
																		showLoading && getQuizloading && activeLoadingId === learn?.LearningPathID ? (
																			'AI is preparing the questions...'
																		) : (
																			<>
																				You have attempted {learn?.assessmentCount === 1 ? '1 Quiz' : `${learn?.assessmentCount} quizzes`}. Click the
																				button below to take a new quiz.
																				<Tag color="orange" style={{ marginLeft: 8 }}>
																					1 Quiz Attempt = 1 Token Deduction
																				</Tag>
																			</>
																		)
																	}
																	placement="topLeft"
																>
																	<Badge count={learn?.assessmentCount} size="small" style={{ backgroundColor: 'orange', color: 'white' }}>
																		<Button
																			// type={!showLoading || !getQuizloading ? "primary" : "default"}
																			type="primary"
																			shape="circle"
																			id={learn?.LearningPathID}
																			key={learn?.LearningPathID}
																			onClick={!showLoading || !getQuizloading ? () => handleQuickQuiz(learn) : undefined}
																			className="gx-m-0 gx-mx-1 "
																			size="middle"
																			icon={activeLoadingId === learn?.LearningPathID && getQuizloading ? <LoadingOutlined /> : <MdQuiz />}
																		/>
																	</Badge>
																</Tooltip>
															) : (
																<Tooltip
																	title={
																		showLoading && getQuizloading && activeLoadingId === learn?.LearningPathID ? (
																			'AI is preparing the questions...'
																		) : (
																			<>
																				This quiz includes all the skills in your learning path. Make sure you have attempted skill-wise quizzes
																				before attempting this quiz.
																				<Tag color="orange" className="gx-mt-1" style={{ marginLeft: 8 }}>
																					1 Quiz Attempt = 1 Token Deduction
																				</Tag>
																			</>
																		)
																	}
																	placement="topLeft"
																>
																	<Button
																		// type={!showLoading || !getQuizloading ? "primary" : "default"}
																		type="primary"
																		shape="circle"
																		id={learn?.LearningPathID}
																		key={learn?.LearningPathID}
																		onClick={!showLoading || !getQuizloading ? () => handleQuickQuiz(learn) : undefined}
																		className="gx-m-0 gx-mx-1"
																		size="middle"
																		icon={activeLoadingId === learn?.LearningPathID && getQuizloading ? <LoadingOutlined /> : <MdQuiz />}
																	/>
																</Tooltip>
															)}
														</div>
													</div>
												</div>
											);
										})}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
