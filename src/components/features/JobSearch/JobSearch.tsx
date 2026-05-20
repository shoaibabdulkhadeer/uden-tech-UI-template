import { Alert, Avatar, Button, Checkbox, Drawer, Empty, Input, message, Modal, notification, Radio, Segmented, Select, Skeleton, Tabs, Tooltip, Upload } from 'antd';
import { CheckCircleFilled, InboxOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { easeInOut, motion } from 'framer-motion';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { decodeToken } from 'react-jwt';
import {
	MdAutoAwesome,
	MdBookmark,
	MdBookmarkBorder,
	MdInsights,
	MdListAlt,
	MdTune,
	MdWorkOutline,
	MdFileUpload,
	MdContentPaste,
	MdDelete,
	MdDescription,
	MdBusiness,
	MdBarChart,
	MdLaptop,
	MdStar,
	MdCode,
	MdLocationOn,
	MdSend,
	MdBolt,
	MdFlashOn,
	MdLeaderboard,
	MdTrendingUp,
	MdCheckCircle,
	MdRestartAlt,
	MdSchool,
	MdAdd,
	MdVerified,
	MdAccessTime,
	MdAttachMoney,
	MdPsychology,
	MdBuildCircle,
	MdEmojiEvents,
	MdRecordVoiceOver,
	MdQuiz,
	MdFactCheck,
	MdRocketLaunch,
	MdMenuBook,
	MdOutlineAssignment,
	MdWorkspacePremium,
	MdThumbUp,
	MdWarning,
	MdSyncAlt,
	MdFactory,
	MdLockOutline,
} from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { SiBookstack } from 'react-icons/si';
import { Typewriter } from 'react-simple-typewriter';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { uploadResume, resumeUploadReset } from '../../../redux/features/profile/resumeUploadSlice';
import { searchJobs, jobSearchReset } from '../../../redux/features/jobSearch/jobSearchSlice';
import { saveJob, saveJobReset } from '../../../redux/features/jobSearch/saveJobSlice';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import { LocationFilter } from './LocationFilter';
import {
	EMPLOYMENT_OPTIONS,
	filterJobsByEmployment,
	filterJobsByWorkMode,
	MOCK_JOBS,
	WORK_MODE_OPTIONS,
	type EmploymentKind,
	type JobItem,
	type WorkMode
} from './jobSearchMock';
import './job-search.css';
import '../../../styles/phase2-theme.css';
import '../../../styles/dashboard-arena.css';

const SAVED_STORAGE_KEY = 'jobSearch.savedIds';
const APPLIED_STORAGE_KEY = 'jobSearch.appliedIds';

/**
 * Maps whatever wording the API returns for experience level
 * to one of the three dropdown values: 'entry' | 'mid' | 'senior'.
 * Returns null if nothing matches (filter simply won't be pre-filled).
 */
const normalizeExpLevel = (raw: string | null | undefined): 'entry' | 'mid' | 'senior' | null => {

	if (!raw) return null;
	const v = raw.toLowerCase().replace(/[^a-z0-9\s\-\+]/g, '');

	if (/entry|junior|fresher|intern|trainee|graduate|beginner|0\s*[-–to]+\s*2|less than 2/.test(v))
		return 'entry';

	if (/\bmid\b|middle|intermediate|associate|2\s*[-–to]+\s*5|3\s*[-–to]+\s*5/.test(v))
		return 'mid';

	if (/senior|lead|principal|staff|expert|architect|head|director|manager|5\s*[-–to]+\s*10|5\s*\+|above 5|more than 5/.test(v))
		return 'senior';

	return null;
};

/**
 * Maps whatever wording the API returns for employment type
 * to EmploymentKind values: 'fulltime' | 'contract' | 'parttime' | 'internship'.
 * Accepts a single string OR an array of strings (API may send either).
 * Returns only recognised values — unmatched items are silently dropped.
 */
const normalizeEmployment = (raw: string | string[] | null | undefined): EmploymentKind[] => {
	if (!raw) return [];
	const items = Array.isArray(raw) ? raw : [raw];

	const map = (v: string): EmploymentKind | null => {
		const s = v.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();

		if (/full.?time|permanent|fte|regular/.test(s))            return 'fulltime';
		if (/\bpart.?time\b/.test(s))                               return 'parttime';
		if (/intern(ship)?|trainee|apprentice/.test(s))             return 'internship';
		if (/contract|freelance|consultant|c2c|c2h|temporary/.test(s)) return 'contract';
		return null;
	};

	return items.reduce<EmploymentKind[]>((acc, item) => {
		const result = map(item);
		if (result && !acc.includes(result)) acc.push(result);
		return acc;
	}, []);
};

const STATE_TO_COUNTRY: Record<string, string> = {
	KA:'India', MH:'India', DL:'India', TN:'India', UP:'India', GJ:'India',
	WB:'India', RJ:'India', KL:'India', AP:'India', TS:'India', MP:'India',
	NY:'United States', CA:'United States', TX:'United States', FL:'United States',
	WA:'United States', MA:'United States', IL:'United States', GA:'United States',
	NC:'United States', NJ:'United States', OH:'United States', CO:'United States',
};

const parseLocationString = (loc: string | null | undefined): { city: string; country: string } | null => {
	if (!loc) return null;
	const parts = loc.split(',').map((s) => s.trim());
	const city = parts[0] || '';
	const second = (parts[1] || '').toUpperCase();
	const country = STATE_TO_COUNTRY[second] || parts[1]?.trim() || '';
	return city ? { city, country } : null;
};

const ROUND_ICONS: Record<string, React.ReactNode> = {
	'HR Screening':    <MdRecordVoiceOver size={14}/>,
	'Aptitude Test':   <MdQuiz size={14}/>,
	'Technical':       <MdCode size={14}/>,
	'Skill Assessment':<MdPsychology size={14}/>,
	'Final / CTO':     <MdEmojiEvents size={14}/>,
	'Design Review':   <MdStar size={14}/>,
};

function loadSavedIds(): Set<string> {
	try {
		const raw = sessionStorage.getItem(SAVED_STORAGE_KEY);
		if (!raw) return new Set();
		const arr = JSON.parse(raw) as string[];
		return new Set(arr.filter(Boolean));
	} catch {
		return new Set();
	}
}

function loadAppliedIds(): Set<string> {
	try {
		const raw = sessionStorage.getItem(APPLIED_STORAGE_KEY);
		if (!raw) return new Set();
		const arr = JSON.parse(raw) as string[];
		return new Set(arr.filter(Boolean));
	} catch {
		return new Set();
	}
}

type ActiveView = 'matches' | 'saved' | 'applied';
type UiPreview = 'normal' | 'loading' | 'error' | 'empty';

const EMP_META: Record<string, { icon: React.ReactNode; label: string }> = {
	fulltime:   { icon: <MdWorkOutline size={13} />,  label: 'Full-time'   },
	contract:   { icon: <MdDescription size={13} />,  label: 'Contract'    },
	parttime:   { icon: <MdAccessTime  size={13} />,  label: 'Part-time'   },
	internship: { icon: <MdSchool      size={13} />,  label: 'Internship'  },
};

const WORK_META: Record<string, { icon: React.ReactNode; label: string }> = {
	remote:  { icon: <MdLaptop    size={13} />, label: 'Remote'  },
	hybrid:  { icon: <MdSyncAlt   size={13} />, label: 'Hybrid'  },
	onsite:  { icon: <MdBusiness  size={13} />, label: 'On-site' },
};

const EXP_META: Record<string, string> = {
	internship: 'Internship',
	entry:      'Entry level',
	mid:        'Mid level',
	senior:     'Senior',
	lead:       'Lead / Principal',
	executive:  'Executive',
};

function JobSearch() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch<AppDispatch>();
	const { resumeData, status: resumeStatus, error: resumeError } = useSelector(
		(state: any) => state.resumeUploadReducer
	);
	const { jobSearchData, status: jobSearchStatus, error: jobSearchError } = useSelector(
		(state: any) => state.jobSearchReducer
	);
	const { saveJobData, status: saveJobStatus, error: saveJobError } = useSelector(
		(state: any) => state.saveJobReducer
	);

	const [activeView, setActiveView] = useState<ActiveView>('matches');
	const [empFilter, setEmpFilter] = useState<EmploymentKind[]>([]);
	const [workFilter, setWorkFilter] = useState<WorkMode[]>([]);
	const [expFilter, setExpFilter] = useState<string | undefined>(undefined);
	const [sectorFilter, setSectorFilter] = useState<string | undefined>(undefined);
	const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [locationResetKey, setLocationResetKey] = useState(0);
	const [savedIds, setSavedIds] = useState<Set<string>>(loadSavedIds);
	const [appliedIds, setAppliedIds] = useState<Set<string>>(loadAppliedIds);
	const [appStages, setAppStages] = useState<Record<string, 'applied' | 'screening' | 'interview' | 'offer'>>({});
	const [pipelineTab, setPipelineTab] = useState<'applied' | 'screening' | 'interview' | 'offer'>('applied');
	const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
	const [previewJob, setPreviewJob] = useState<JobItem | null>(null);
	const [listLoading, setListLoading] = useState(false);
	const [uiPreview, setUiPreview] = useState<UiPreview>('normal');
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [pastedJd, setPastedJd] = useState('');
	const [jdResult, setJdResult] = useState('');
	const [showJdInput, setShowJdInput] = useState(true);
	const [matchLoading, setMatchLoading] = useState(false);
	const [matchEngineTab, setMatchEngineTab] = useState('resume');
	const [showJdSection, setShowJdSection] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<any>(null);
	const [aiSteps, setAiSteps] = useState<string[]>([]);
	const [typingLine, setTypingLine] = useState<string>('');
	const [aiSearchStep, setAiSearchStep] = useState(-1);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [showFullResume, setShowFullResume] = useState(false);
	const [detectedFilters, setDetectedFilters] = useState<{ skills: string[]; expLevel: string | null; workMode: WorkMode | null; employment: EmploymentKind[]; source: 'resume' | 'jd' } | null>(null);
	const [detectedLocation, setDetectedLocation] = useState<{ city: string; country: string } | null>(null);
	const [filtersJustApplied, setFiltersJustApplied] = useState(false);
	const [showFindTour, setShowFindTour] = useState(false);
	const [tourStep, setTourStep] = useState<1 | 2 | 3 | 4>(1);
	const [tourBubblePos, setTourBubblePos] = useState<{ top: number; left: number; width: number } | null>(null);
	const [tourCardRect, setTourCardRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
	const findBtnRef = useRef<HTMLButtonElement>(null);
	const filterCardRef = useRef<HTMLElement>(null);
	const jdSectionRef = useRef<HTMLDivElement>(null);
	const jdOpenRef = useRef(false);
	const aiProgressRef = useRef<HTMLDivElement>(null);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [apiMatchedJobs, setApiMatchedJobs] = useState<JobItem[]>([]);
	const [locationFilter, setLocationFilter] = useState<{ city: string; country: string }>({ city: '', country: '' });
	const [pendingApplyJob, setPendingApplyJob] = useState<JobItem | null>(null);
	const [submittedFilters, setSubmittedFilters] = useState<{
		empFilter: EmploymentKind[]; workFilter: WorkMode[];
		expFilter: string | undefined; sectorFilter: string | undefined; skillsFilter: string[];
	} | null>(null);

	const mockUploadRequest = ({ onSuccess }: any) => {
		setTimeout(() => {
			onSuccess("ok");
		}, 1000);
	};

	const handleMatchResume = (info: any) => {
		const { status } = info.file;
		if (status === 'uploading') {
			setMatchLoading(true);
			return;
		}
		if (status === 'done' || status === 'uploading') {
			const file = info.file.originFileObj || info.file;
			if (file instanceof File || file instanceof Blob) {
				const url = URL.createObjectURL(file);
				setPreviewUrl(url);
				setUploadedFile(file);
				// Hit the real resume upload API
				dispatch(uploadResume(file as File));
			} else {
				setUploadedFile(info.file);
			}
		}

		if (status === 'done') {
			setMatchLoading(true);
			setAiSteps([]);

			// Show scanning steps while waiting for API response
			const steps = [
				'AI is scanning document structure...',
				'Extracting skills and experience...',
				'Parsing career trajectory...',
				'Cross-referencing with live roles...',
				'Generating compatibility scores...',
			];

			setTypingLine('');

			let stepIndex = 0;
			let charIndex = 0;

			const typeChar = () => {
				if (stepIndex >= steps.length) return;
				const current = steps[stepIndex];
				if (charIndex <= current.length) {
					setTypingLine(current.slice(0, charIndex));
					charIndex++;
					setTimeout(typeChar, 32);
				} else {
					setAiSteps((prev: any) => [...prev, current]);
					setTypingLine('');
					stepIndex++;
					charIndex = 0;
					setTimeout(typeChar, 380);
				}
			};
			typeChar();
		} else if (status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
			setMatchLoading(false);
		}
	};

	// Handle resume upload API response
	useEffect(() => {
		if (!resumeStatus && resumeData && (resumeData?.statusCode === 200 || resumeData?.statusCode === 201)) {
			notification.destroy();
			setMatchLoading(false);
			setAiSteps([]);
			setTypingLine('');
			const data = resumeData?.data;
			const mergedSkills: string[] = Array.from(new Set((data?.skills || []).filter(Boolean)));

			setDetectedFilters({
				skills:     mergedSkills,
				expLevel:   normalizeExpLevel(
					data?.career_level       ??
					data?.experienceLevel    ??
					data?.expLevel           ??
					data?.experience         ??
					(data?.total_experience_years != null
						? String(data.total_experience_years) + ' years'
						: null)
				),
				workMode:   data?.workMode   || data?.work_mode   || null,
				employment: normalizeEmployment(
					data?.employmentType ?? data?.employment ??
					data?.jobType        ?? data?.job_type   ?? null
				),
				source: 'resume',
			});
			const parsedLoc = parseLocationString(data?.location);
			if (parsedLoc) setDetectedLocation(parsedLoc);
			dispatch(resumeUploadReset());
		} else if (!resumeStatus && resumeData && resumeData?.statusCode === 400) {
			message.warning(resumeData?.message || 'Bad Request');
			setMatchLoading(false);
			setAiSteps([]);
			dispatch(resumeUploadReset());
		} else if (!resumeStatus && resumeData && resumeData?.statusCode === 500) {
			message.error(resumeData?.message || 'Internal Server Error');
			setMatchLoading(false);
			setAiSteps([]);
			setTypingLine('');
			dispatch(resumeUploadReset());
		}
	}, [resumeData, resumeStatus]);

	// Handle job search API response
	useEffect(() => {
		if (jobSearchStatus) return; // still loading
		if (!jobSearchData && !jobSearchError) return;

		setListLoading(false);

		// Thunk rejected (network error or axios threw)
		if (jobSearchError && !jobSearchData) {
			message.error(jobSearchError || 'Job search failed. Please try again.');
			dispatch(jobSearchReset());
			return;
		}

		const code = jobSearchData?.statusCode ?? jobSearchData?.status;

		// FastAPI validation errors come back as { detail: [...] } with no statusCode
		if (jobSearchData?.detail) {
			const msg = jobSearchData.detail?.[0]?.msg || 'Invalid search request';
			message.warning(msg);
			dispatch(jobSearchReset());
			return;
		}

		if (code === 200 || code === 201) {
			const rawJobs: any[] = jobSearchData?.data?.jobs
				|| jobSearchData?.data?.results
				|| jobSearchData?.jobs
				|| [];

			const mapped = Array.isArray(rawJobs) && rawJobs.length > 0
				? rawJobs.map((item, idx) => mapApiJobToJobItem(item, idx))
				: [];

			setApiMatchedJobs(mapped);
			setActiveView('matches');
			dispatch(jobSearchReset());
		} else if (code === 422) {
			message.warning(jobSearchData?.message || 'Invalid search parameters');
			dispatch(jobSearchReset());
		} else if (code === 400) {
			message.warning(jobSearchData?.message || 'Invalid search request');
			dispatch(jobSearchReset());
		} else if (code === 500 || code === 503) {
			message.error(jobSearchData?.message || 'Job search service unavailable');
			dispatch(jobSearchReset());
		} else {
			// Unknown shape — try to extract jobs anyway
			const rawJobs: any[] = jobSearchData?.data?.jobs || jobSearchData?.jobs || [];
			if (Array.isArray(rawJobs) && rawJobs.length > 0) {
				setApiMatchedJobs(rawJobs.map((item, idx) => mapApiJobToJobItem(item, idx)));
				setActiveView('matches');
			}
			dispatch(jobSearchReset());
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jobSearchData, jobSearchStatus, jobSearchError]);

	// Handle save job API response
	useEffect(() => {
		if (saveJobStatus) return;
		if (!saveJobData && !saveJobError) return;

		if (saveJobError && !saveJobData) {
			message.error(saveJobError || 'Failed to save job');
			dispatch(saveJobReset());
			return;
		}

		const code = saveJobData?.statusCode ?? saveJobData?.status;

		if (code === 200 || code === 201) {
			message.success(saveJobData?.message || 'Job saved successfully');
		} else if (code === 400) {
			message.warning(saveJobData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(saveJobData?.message || 'Server error');
		}

		dispatch(saveJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [saveJobData, saveJobStatus, saveJobError]);

	const handleMatchJd = () => {
		if (!pastedJd.trim()) {
			message.warning('Please paste a job description first');
			return;
		}
		setJdResult('');
		setMatchLoading(true);
		setTimeout(() => {
			setMatchLoading(false);
			setJdResult(pastedJd.trim());
			setShowJdInput(false);
			setDetectedFilters({ skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'], expLevel: 'senior', workMode: 'hybrid', employment: ['fulltime'], source: 'jd' });
		}, 1500);
	};

	useEffect(() => {
		sessionStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(savedIds)));
	}, [savedIds]);

	useEffect(() => {
		sessionStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(Array.from(appliedIds)));
	}, [appliedIds]);

	// total tour steps: 3 without resume, 4 with resume (adds JD step)
	const tourTotal = uploadedFile ? 4 : 3;

	useEffect(() => {
		if (!showFindTour) { setTourBubblePos(null); setTourCardRect(null); return; }
		const jdStep  = uploadedFile ? 3 : null;
		const btnStep = uploadedFile ? 4 : 3;
		const selector =
			tourStep === 1 ? '.job-search-sidebar .skill-filter' :
			tourStep === 2 ? '#js-emp-work-filter' :
			tourStep === jdStep ? '.me-jd-divider' :
			tourStep === btnStep ? '.me-find-btn-wrap' : '.me-find-btn-wrap';

		// Scroll target into view first, then measure after scroll settles
		const el = document.querySelector(selector) as HTMLElement | null;
		el?.scrollIntoView({ behavior: 'smooth', block: 'center' });

		const measure = () => {
			const target = document.querySelector(selector) as HTMLElement | null;
			if (!target) return;
			const r = target.getBoundingClientRect();
			if (r.width === 0) return;
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const rect = { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) };
			setTourCardRect(rect);
			const wantLeft = rect.left + rect.width + 14;
			const bubbleW = 280;
			const fitsRight = wantLeft + bubbleW + 10 <= vw;
			setTourBubblePos(fitsRight ? {
				top: Math.min(Math.round(r.top + r.height / 2), vh - 220),
				left: wantLeft,
				width: bubbleW,
			} : {
				top: Math.min(Math.round(r.bottom + 10), vh - 220),
				left: Math.max(8, Math.round(r.left + r.width / 2 - bubbleW / 2)),
				width: bubbleW,
			});
		};
		// 500ms: enough for smooth scroll to finish before we measure
		const t = setTimeout(measure, 500);
		return () => clearTimeout(t);
	}, [showFindTour, tourStep]);

	/* Advance AI search step indicator while list is loading */
	useEffect(() => {
		if (!listLoading) { setAiSearchStep(-1); return; }
		setAiSearchStep(0);
		setTimeout(() => {
			aiProgressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}, 80);
		let step = 0;
		const id = setInterval(() => {
			step += 1;
			if (step >= 4) { clearInterval(id); return; }
			setAiSearchStep(step);
		}, 1400);
		return () => clearInterval(id);
	}, [listLoading]);

	/* Deep-link from Dashboard (e.g. /job-search?tab=matches) */
	useEffect(() => {
		const tab = new URLSearchParams(location.search).get('tab');
		if (tab === 'matches' || tab === 'saved' || tab === 'applied') {
			setActiveView(tab as ActiveView);
		}
	}, [location]);



	const displayName = useMemo(() => {
		try {
			const token = sessionStorage.getItem('accessToken');
			if (!token) return 'Learner';
			const data: any = decodeToken(token);
			return data?.userName || data?.name || 'Learner';
		} catch {
			return 'Learner';
		}
	}, []);

	const baseJobs = useMemo(() => {
		if (activeView === 'saved') {
			const pool = apiMatchedJobs.length > 0 ? [...MOCK_JOBS, ...apiMatchedJobs] : MOCK_JOBS;
			return pool.filter((j) => savedIds.has(j.id));
		}
		if (activeView === 'applied') {
			const pool = apiMatchedJobs.length > 0 ? [...MOCK_JOBS, ...apiMatchedJobs] : MOCK_JOBS;
			return pool.filter((j) => appliedIds.has(j.id));
		}
		if (activeView === 'matches') {
			// Once a real search has been submitted, always show API results (even if empty)
			// so the user sees "no results" rather than falling back to mock data.
			if (submittedFilters !== null) {
				return [...apiMatchedJobs].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
			}
			// Pre-search: show mock data as preview
			return [...MOCK_JOBS]
				.filter((j) => j.matchScore != null)
				.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
		}
		return MOCK_JOBS;
	}, [activeView, savedIds, appliedIds, apiMatchedJobs, submittedFilters]);

	const filteredJobs = useMemo(() => {
		let list = baseJobs;
		if (activeView !== 'saved') {
			list = list.filter((j) => !dismissedIds.has(j.id));
		}
		const f = submittedFilters;
		if (!f) return list;
		list = list.filter((j) => filterJobsByEmployment(j, f.empFilter));
		list = list.filter((j) => filterJobsByWorkMode(j, f.workFilter));
		return list;
	}, [baseJobs, dismissedIds, submittedFilters, activeView]);

	const toggleSave = useCallback((id: string, e?: React.MouseEvent) => {
		e?.stopPropagation();
		setSavedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
				dispatch(saveJob(id));
			}
			return next;
		});
	}, []);

	const dismiss = useCallback(
		(id: string) => {
			setDismissedIds((prev) => new Set(prev).add(id));
			setPreviewJob((p) => (p?.id === id ? null : p));
		},
		[]
	);

	const activeFilterCount = useMemo(() => [
		empFilter.length > 0,
		workFilter.length > 0,
		expFilter != null,
		sectorFilter != null,
		skillsFilter.length > 0,
		locationFilter.city.trim() !== '' || locationFilter.country.trim() !== '',
	].filter(Boolean).length, [empFilter, workFilter, expFilter, sectorFilter, skillsFilter, locationFilter]);

	const handleFindJobs = useCallback(() => {
		if (activeFilterCount === 0) return;
		setShowReviewModal(true);
	}, [activeFilterCount]);

	const mapExpLevel = (v: string | undefined): string | undefined => {
		if (!v) return undefined;
		if (v === 'entry')  return 'junior';
		if (v === 'mid')    return 'mid-level';
		if (v === 'senior') return 'senior';
		return v;
	};

	const mapWorkMode = (modes: WorkMode[]): string | undefined => {
		if (!modes.length) return undefined;
		const m = modes[0];
		if (m === 'onsite') return 'on-site';
		return m;
	};

	const mapJobType = (kinds: EmploymentKind[]): string | undefined => {
		if (!kinds.length) return undefined;
		const m = kinds[0];
		if (m === 'fulltime')   return 'full-time';
		if (m === 'parttime')   return 'part-time';
		if (m === 'internship') return 'internship';
		return m;
	};

	const mapApiJobToJobItem = (item: any, idx: number): JobItem => {
		const rawSalary = item.salary || item.salary_range || '';
		// Filter out garbage salary values (e.g. "rs," or single chars)
		const salary = rawSalary.replace(/[^a-z0-9$£€\s,.\-–]/gi, '').trim().length > 3 ? rawSalary : undefined;

		const skills: string[] = item.skills_required || item.skills || item.required_skills || [];

		// Compute a basic match score from skills overlap if not provided by API
		let matchScore: number | undefined = item.score != null
			? Math.min(100, Math.round(Number(item.score) * 100))
			: item.match_score ?? item.matchScore;
		if (matchScore == null && skillsFilter.length > 0 && skills.length > 0) {
			const lower = skillsFilter.map((s) => s.toLowerCase());
			const matched = skills.filter((s) => lower.some((f) => s.toLowerCase().includes(f) || f.includes(s.toLowerCase())));
			matchScore = Math.round((matched.length / Math.max(skills.length, skillsFilter.length)) * 100);
		}

		return {
			id:             item.job_id || item._id || item.id || String(idx),
			title:          item.title || item.job_title || 'Untitled Role',
			company:        item.company || item.company_name || item.employer || 'Unknown Company',
			location:       item.location || item.city || '',
			logoHue:        (idx * 47 + 180) % 360,
			verified:       item.url_status === 'valid' || item.verified || false,
			badges:         item.source === 'ai_discovered' ? ['AI Match'] : (item.badges || []),
			hiringStatus:   item.hiringStatus || item.hiring_status || 'Actively Recruiting',
			sourceKind:     item.source_kind || item.sourceKind,
			employmentKind: (() => {
				const v = (item.job_type || item.employment_type || item.employmentType || '').toLowerCase();
				if (v.includes('part')) return 'parttime';
				if (v.includes('intern')) return 'internship';
				if (v.includes('contract')) return 'contract';
				return 'fulltime';
			})(),
			workMode: (() => {
				const v = (item.work_mode || item.workMode || '').toLowerCase();
				if (v.includes('hybrid')) return 'hybrid';
				if (v.includes('remote')) return 'remote';
				return 'onsite';
			})(),
			matchScore,
			matchReasons: item.match_reasons || item.matchReasons || [],
			detail: {
				employmentType:   item.job_type || item.employment_type || '',
				posted:           item.posted_date || item.posted_at || item.postedAt || 'Recently',
				salary,
				experience:       item.experience || item.experience_level || undefined,
				applyUrl:         item.apply_url || item.applyUrl || item.source_url || undefined,
				description:      item.description_summary || item.description || item.job_description || '',
				responsibilities: item.responsibilities || [],
				skills,
				skillsMatched:    item.skills_matched || item.skillsMatched || [],
				skillGaps:        item.skill_gaps || item.skillGaps || [],
				interviewRounds:  item.interview_rounds || item.interviewRounds,
			},
		};
	};

	const VALID_SECTORS = new Set(['private', 'public', 'government', 'freelance']);

	const handleConfirmSearch = () => {
		setShowReviewModal(false);
		setListLoading(true);
		setSubmittedFilters({ empFilter, workFilter, expFilter, sectorFilter, skillsFilter });

		const locParts = [locationFilter.city, locationFilter.country].filter(Boolean);
		const locationStr = locParts.length ? locParts.join(', ') : undefined;

		const jd = pastedJd.trim();
		// Use 'description' mode when only JD is provided; otherwise 'title'
		const mode = jd && !uploadedFile ? 'description' : 'title';
		// mode='title' requires a query — fall back to first skill or generic term
		const query = mode === 'title'
			? (skillsFilter.length > 0 ? skillsFilter[0] : 'Software Engineer')
			: undefined;

		// sector must be one of the API's accepted values
		const sector = sectorFilter && VALID_SECTORS.has(sectorFilter) ? sectorFilter : undefined;

		dispatch(searchJobs({
			mode,
			query,
			description: jd || undefined,
			max_results: 20,
			filters: {
				sector,
				work_mode:         mapWorkMode(workFilter),
				job_type:          mapJobType(empFilter),
				experience_level:  mapExpLevel(expFilter),
				location:          locationStr,
				skills:            skillsFilter.length ? skillsFilter : undefined,
			},
		}));
	};

	const applyDetectedFilters = useCallback(() => {
		if (!detectedFilters) return;
		if (detectedFilters.skills.length > 0) {
			setSkillsFilter((prev) => {
				const merged = [...prev];
				detectedFilters.skills.forEach((s) => { if (!merged.includes(s)) merged.push(s); });
				return merged;
			});
		}
		if (detectedFilters.expLevel) setExpFilter(detectedFilters.expLevel);
		if (detectedFilters.workMode) setWorkFilter((prev) => prev.includes(detectedFilters.workMode!) ? prev : [...prev, detectedFilters.workMode!]);
		if (detectedFilters.employment?.length) {
			setEmpFilter((prev) => {
				const merged = [...prev];
				detectedFilters.employment.forEach((e) => { if (!merged.includes(e)) merged.push(e); });
				return merged;
			});
		}
		setDetectedFilters(null);
		setFiltersJustApplied(true);
		setTourStep(1);
		setShowFindTour(true);
		setTimeout(() => setFiltersJustApplied(false), 3000);
	}, [detectedFilters]);

	const resetFilters = useCallback(() => {
		setEmpFilter([]);
		setWorkFilter([]);
		setExpFilter(undefined);
		setSectorFilter(undefined);
		setSkillsFilter([]);
		setSkillInput('');
		setPastedJd('');
		setJdResult('');
		// close JD section via DOM ref (lag-free) then sync React state
		jdOpenRef.current = false;
		jdSectionRef.current?.classList.remove('me-jd-section--open');
		setShowJdSection(false);
		// clear uploaded resume
		setUploadedFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}
		setDetectedFilters(null);
		setDetectedLocation(null);
		setLocationFilter({ city: '', country: '' });
		setLocationResetKey((k) => k + 1);
		setDismissedIds(new Set());
		setSubmittedFilters(null);
		setApiMatchedJobs([]);
		setUiPreview('normal');
	}, [previewUrl]);

	const openJobPreview = useCallback((job: JobItem) => setPreviewJob(job), []);
	const closeJobPreview = useCallback(() => setPreviewJob(null), []);

	const showSkeleton = uiPreview === 'loading' || (listLoading && uiPreview === 'normal');
	const showError = uiPreview === 'error';
	const showForcedEmpty = uiPreview === 'empty';
	const listToRender = showForcedEmpty ? [] : filteredJobs;

	const isPristine = activeView === 'matches' && submittedFilters === null && !showSkeleton && !showError;
	const hasResumeOrJd = uploadedFile !== null || pastedJd.trim().length > 0;

	const PIPELINE_STAGE_META: Record<string, { title: string; sub: string }> = {
		applied:    { title: 'Applied',    sub: 'Jobs you have submitted an application for.' },
		screening:  { title: 'Screening',  sub: 'Applications currently in the HR / initial screening stage.' },
		interview:  { title: 'Interview',  sub: 'Roles where you have an interview scheduled or in progress.' },
		offer:      { title: 'Offer',      sub: 'Congratulations — you have received an offer for these roles!' },
	};

	const feedTitle =
		activeView === 'matches'
			? 'Matched for you'
			: activeView === 'saved'
				? 'Saved jobs'
				: PIPELINE_STAGE_META[pipelineTab]?.title ?? 'Applied jobs';

	const feedSub =
		activeView === 'matches'
			? 'Ranked by fit with your learning path and saved skills (mock scoring).'
			: activeView === 'saved'
				? 'Roles you bookmarked for later. Same detail view as search and matches.'
				: PIPELINE_STAGE_META[pipelineTab]?.sub ?? 'Applications you have started or submitted through the portal.';

	const emptyDescription =
		activeView === 'saved'
			? 'Save jobs from matches with the bookmark control.'
			: activeView === 'matches'
				? 'No recommended roles match your filters — try widening work mode or employment type.'
				: 'You havent applied to any roles yet';

	const filtersBlock = useMemo(() => (
		<div className="job-search-filters-block">
			<div id="js-emp-work-filter" className="js-filter-top-group">
			<p className="job-search-filters-label">
				<span className="filter-label-icon filter-label-icon--indigo"><MdWorkOutline size={12} /></span>
				Employment
			</p>
			<div className="js-chip-group js-chip-group--indigo">
				{EMPLOYMENT_OPTIONS.map(({ label, value }) => (
					<button
						key={value}
						type="button"
						className={`js-chip${empFilter.includes(value as EmploymentKind) ? ' js-chip--active' : ''}`}
						onClick={() => setEmpFilter((prev) =>
							prev.includes(value as EmploymentKind)
								? prev.filter((v) => v !== value)
								: [...prev, value as EmploymentKind]
						)}
					>
						<span className="js-chip-dot" aria-hidden />
						<span className="js-chip-icon" aria-hidden>{EMP_META[value]?.icon}</span>
						{label}
					</button>
				))}
			</div>
			<p className="job-search-filters-label">
				<span className="filter-label-icon filter-label-icon--cyan"><MdLaptop size={12} /></span>
				Work Mode
			</p>
			<div className="js-chip-group js-chip-group--cyan">
				{WORK_MODE_OPTIONS.map(({ label, value }) => (
					<button
						key={value}
						type="button"
						className={`js-chip${workFilter.includes(value as WorkMode) ? ' js-chip--active' : ''}`}
						onClick={() => setWorkFilter((prev) =>
							prev.includes(value as WorkMode)
								? prev.filter((v) => v !== value)
								: [...prev, value as WorkMode]
						)}
					>
						<span className="js-chip-dot" aria-hidden />
						<span className="js-chip-icon" aria-hidden>{WORK_META[value]?.icon}</span>
						{label}
					</button>
				))}
			</div>
			<p className="job-search-filters-label">
				<span className="filter-label-icon filter-label-icon--amber"><MdBarChart size={12} /></span>
				Experience level
			</p>
			<Select
				size="small"
				placeholder="Any experience level"
				value={expFilter}
				onChange={(v) => setExpFilter(v)}
				allowClear
				onClear={() => setExpFilter(undefined)}
				style={{ width: '100%' }}
				className="job-search-exp-select"
				popupClassName="js-select-dropdown"
				transitionName=""
				options={[
					{ value: 'internship',   label: 'Internship' },
					{ value: 'entry',        label: 'Entry level (0–2 yrs)' },
					{ value: 'mid',          label: 'Mid level (2–5 yrs)' },
					{ value: 'senior',       label: 'Senior (5–10 yrs)' },
					{ value: 'lead',         label: 'Lead / Principal (10+ yrs)' },
					{ value: 'executive',    label: 'Executive / Director' },
				]}
			/>
			<p className="job-search-filters-label">
				<span className="filter-label-icon filter-label-icon--emerald"><MdBusiness size={12} /></span>
				Sector
			</p>
			<Select
				size="small"
				placeholder="Any"
				value={sectorFilter}
				onChange={(v) => setSectorFilter(v)}
				allowClear
				onClear={() => setSectorFilter(undefined)}
				style={{ width: '100%' }}
				className="job-search-exp-select"
				popupClassName="js-select-dropdown"
				transitionName=""
				options={[
					{ value: 'private',      label: 'Private' },
					{ value: 'psu',          label: 'Public Sector / PSU' },
					{ value: 'government',   label: 'Government / Govt Bodies' },
					{ value: 'freelance',    label: 'Freelance / Contract' },
					{ value: 'startup',      label: 'Startup' },
					{ value: 'ngo',          label: 'NGO / Non-profit' },
					{ value: 'mnc',          label: 'MNC' },
				]}
			/>
			</div>{/* end js-filter-top-group */}
			<div className="job-search-filters-divider" />
			<div className="skill-filter">
				<div className="skill-filter-head">
					<span className="filter-label-icon filter-label-icon--violet gx-mr-1"><MdCode size={12} /></span>
					<span>Skills</span>
					{skillsFilter.length > 0 && (
						<button type="button" className="loc-filter-clear" onClick={() => { setSkillsFilter([]); setSkillInput(''); }}>
							Clear all
						</button>
					)}
				</div>
				<div className="skill-filter-input-row">
					<Input
						size="small"
						placeholder="e.g. React, Python…"
						value={skillInput}
						onChange={(e) => setSkillInput(e.target.value)}
						onKeyDown={(e) => {
							if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
								e.preventDefault();
								const val = skillInput.trim().replace(/,$/, '');
								if (val && !skillsFilter.includes(val)) {
									setSkillsFilter((prev) => [...prev, val]);
								}
								setSkillInput('');
							}
						}}
						className="skill-filter-input"
					/>
					<button
						type="button"
						className="skill-add-btn"
						onClick={() => {
							const val = skillInput.trim().replace(/,$/, '');
							if (val && !skillsFilter.includes(val)) {
								setSkillsFilter((prev) => [...prev, val]);
							}
							setSkillInput('');
						}}
					>
						<MdAdd size={14} style={{ verticalAlign: 'middle' }} />
					</button>
				</div>
				{skillsFilter?.length > 0 && (
					<div className="skill-badges-wrap">
						{skillsFilter.map((skill, idx) => (
							<span key={skill} className={`skill-badge`}>
								{skill}
								<button
									type="button"
									className="skill-badge-remove"
									onClick={() => setSkillsFilter((prev) => prev.filter((s) => s !== skill))}
									aria-label={`Remove ${skill}`}
								>
									×
								</button>
							</span>
						))}
					</div>
				)}
			</div>
			<div className="job-search-filters-divider" />
			<LocationFilter
				key={`${locationResetKey}-${detectedLocation?.city ?? ''}`}
				initialCity={detectedLocation?.city ?? ''}
				initialCountry={detectedLocation?.country ?? ''}
				onChange={(country, city) => setLocationFilter({ city, country })}
			/>
			<div className="js-filter-cta-row">
			<Button type="link" size="small" className="job-search-filters-reset" onClick={resetFilters}>
				<MdRestartAlt size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />Reset filters
			</Button>
		</div>
		</div>
	), [empFilter, workFilter, expFilter, sectorFilter, skillInput, skillsFilter, locationResetKey, activeFilterCount, filtersJustApplied, showFindTour, resetFilters, handleFindJobs, hasResumeOrJd]);

	return (
		<>
			<div className="job-search-page phase2-dashboard dash-next dash-next-shell">
			<DashboardShellNetwork />
			<div className="job-search-page-inner">
				<header className="dash-next-page-head">
					<div className="dash-next-page-head-row">
						<div className="dash-next-page-head-art-wrap">
							<DashboardPageHeadArt />
						</div>
						<div className="dash-next-page-head-copy">
							<div className="gx-mb-2" style={{ display: 'flex', gap: 8 }}>
								<div className="genz-pill vibrant">
									<MdAutoAwesome className="genz-icon" />
									Active Match Engine
								</div>
								<div className="genz-pill glow">
									<div className="dot" />
									Role Discovery
								</div>
							</div>
							<h1 className="dash-next-page-title">Career Acceleration</h1>
							<p className="dash-next-page-lead">
								Your AI-powered career hub — discover roles aligned with your learning path, analyse your resume or paste a job description to surface the best-fit opportunities, and manage your entire job search from one place.
							</p>
							<div className="career-accel-feature-row">
								<span className="career-accel-feature-chip career-accel-feature-chip--indigo">
									<span className="career-accel-chip-icon"><MdAutoAwesome size={12} /></span>
									AI-matched roles
								</span>
								<span className="career-accel-feature-chip career-accel-feature-chip--cyan">
									<span className="career-accel-chip-icon"><MdDescription size={12} /></span>
									Resume &amp; JD analysis
								</span>
								<span className="career-accel-feature-chip career-accel-feature-chip--amber">
									<span className="career-accel-chip-icon"><MdBookmarkBorder size={12} /></span>
									Job tracker
								</span>
								<span className="career-accel-feature-chip career-accel-feature-chip--emerald">
									<span className="career-accel-chip-icon"><MdWorkOutline size={12} /></span>
									Skill-verified listings
								</span>
							</div>
						</div>
					</div>
				</header>

				<motion.div
					initial={{ y: 16, opacity: 0.7 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.35, ease: easeInOut }}
					className="job-search-motion"
				>
					<div className="job-search-layout">
						<aside className="job-search-sidebar">
							<section className="job-search-card job-search-profile-card">
								<div className="job-search-profile-banner" aria-hidden>
									<div className="job-search-profile-heatmap" />
								</div>
								<div className="job-search-profile-body">
									<Avatar size={64} className="job-search-profile-avatar">
										{displayName.charAt(0).toUpperCase()}
									</Avatar>
									<div className="job-search-profile-name-row">
										<h2 className="job-search-profile-name">{displayName}</h2>
										<Tooltip title="Profile verified">
											<CheckCircleFilled className="job-search-profile-verified" aria-label="Verified" />
										</Tooltip>
									</div>
									<p className="job-search-profile-headline">
										Building skills with Uden Tech learning paths — React, system design, and product craft.
									</p>
									<p className="job-search-profile-location">
										<MdLocationOn size={13} className="profile-inline-icon profile-inline-icon--indigo" aria-hidden />
										Bengaluru, Karnataka
									</p>
									<div className="job-search-profile-company">
										<MdBusiness size={13} className="profile-inline-icon profile-inline-icon--cyan" aria-hidden />
										<span>Uden Tech · Learning platform</span>
									</div>
									<div className="profile-stats-row">
										<div className="profile-stat">
											<MdSend size={12} className="profile-stat-icon profile-stat-icon--indigo" />
											<span className="profile-stat-num">{appliedIds.size}</span>
											<span className="profile-stat-label">Applied</span>
										</div>
										<div className="profile-stat">
											<MdBookmark size={12} className="profile-stat-icon profile-stat-icon--violet" />
											<span className="profile-stat-num">{savedIds.size}</span>
											<span className="profile-stat-label">Saved</span>
										</div>
									</div>
								</div>
							</section>


							<section ref={filterCardRef as React.RefObject<HTMLDivElement>} className={`job-search-card job-search-filters-card${filtersJustApplied ? ' js-filter-card--pulse' : ''}${showFindTour ? ' js-filter-card--tour-active' : ''}`} aria-label="Job filters">
								<div className="job-search-filters-card-head">
									<span className="filters-head-icon"><MdTune size={14} /></span>
									<h3 className="job-search-filters-card-title">Filters</h3>
									{(empFilter.length + workFilter.length + (expFilter ? 1 : 0) + (sectorFilter ? 1 : 0) + skillsFilter.length) > 0 && (
										<span className="filters-active-badge">{empFilter.length + workFilter.length + (expFilter ? 1 : 0) + (sectorFilter ? 1 : 0) + skillsFilter.length}</span>
									)}
								</div>
								<div className="job-search-filters-card-body">{filtersBlock}</div>
							</section>

							<div className="learn-path-ad-card" role="complementary" aria-label="Upgrade your skills">
								<div className="learn-path-ad-orb learn-path-ad-orb--1" aria-hidden />
								<div className="learn-path-ad-orb learn-path-ad-orb--2" aria-hidden />
								<div className="learn-path-ad-orb learn-path-ad-orb--3" aria-hidden />
								<div className="learn-path-ad-grid" aria-hidden />
								<div className="learn-path-ad-body">
									<div className="learn-path-ad-badge">
										<MdRocketLaunch size={11} aria-hidden />
										AI-Powered
									</div>
									<h3 className="learn-path-ad-title">
										Upgrade your<br />
										<span className="learn-path-ad-title-highlight">skills today</span>
									</h3>
									<p className="learn-path-ad-sub">
										Let AI build a personalised learning path in seconds — tailored to your goals and career.
									</p>
									<button
										type="button"
										className="learn-path-ad-cta"
										onClick={() => navigate('/learn')}
									>
										<MdAutoAwesome size={14} aria-hidden />
										<span>Generate Learn Path</span>
										<span className="learn-path-ad-cta-arrow" aria-hidden>→</span>
									</button>
								</div>
								<div className="learn-path-ad-metrics" aria-hidden>
									<div className="learn-path-ad-metric">
										<span className="learn-path-ad-metric-num">2.4k+</span>
										<span className="learn-path-ad-metric-label">Paths built</span>
									</div>
									<div className="learn-path-ad-metric-divider" />
									<div className="learn-path-ad-metric">
										<span className="learn-path-ad-metric-num">94%</span>
										<span className="learn-path-ad-metric-label">Success rate</span>
									</div>
								</div>
							</div>

							<button
								type="button"
								className="job-search-back-chip"
								onClick={() => navigate('/dashboard')}
							>
								<MdAutoAwesome size={16} aria-hidden />
								<span>Back to dashboard</span>
							</button>
						</aside>

						<main className="job-search-main">
							<section className="job-search-card job-search-feed-card">
								<header className="job-search-feed-head">
								<div className="job-search-feed-head-top">
									<div className="view-tabs">
										<button type="button"
											className={`view-tab view-tab--indigo${activeView === 'matches' ? ' view-tab--active' : ''}`}
											onClick={() => setActiveView('matches')}>
											<span className="view-tab-icon"><MdAutoAwesome size={13} /></span>
											<span className="view-tab-label">Matched</span>
											<span className="view-tab-count">{MOCK_JOBS.filter(j => j.matchScore).length}</span>
										</button>
										<button type="button"
											className={`view-tab view-tab--amber${activeView === 'saved' ? ' view-tab--active' : ''}`}
											onClick={() => setActiveView('saved')}>
											<span className="view-tab-icon"><MdBookmark size={13} /></span>
											<span className="view-tab-label">Saved</span>
											{savedIds.size > 0 && <span className="view-tab-count">{savedIds.size}</span>}
										</button>
										<span className="view-tabs-divider" />
										<button type="button"
											className={`view-tab view-tab--emerald${activeView === 'applied' ? ' view-tab--active' : ''}`}
											onClick={() => setActiveView('applied')}>
											<span className="view-tab-icon"><MdSend size={13} /></span>
											<span className="view-tab-label">Application Tracker</span>
											{appliedIds.size > 0 && <span className="view-tab-count">{appliedIds.size}</span>}
										</button>
									</div>
									<Button
										type="default"
										className="job-search-filters-mobile-trigger"
										onClick={() => setFilterDrawerOpen(true)}
									>
										<MdTune size={18} style={{ marginRight: 6 }} aria-hidden />
										Filters
									</Button>
								</div>
								{activeView === 'applied' && (
									<div className="pipeline-stage-strip">
										{(['applied', 'screening', 'interview', 'offer'] as const).map((stage, idx, arr) => {
											const count = Array.from(appliedIds).filter(id => (appStages[id] || 'applied') === stage).length;
											const stageOrder = ['applied', 'screening', 'interview', 'offer'] as const;
											const activeIdx = stageOrder.indexOf(pipelineTab);
											const isActive = pipelineTab === stage;
											const isPast = activeIdx > idx;
											const STAGE_ICONS = [MdSend, MdListAlt, MdPsychology, MdEmojiEvents];
											const STAGE_LABELS = ['Applied', 'Screening', 'Interview', 'Offer'];
											const Icon = STAGE_ICONS[idx];
											return (
												<Fragment key={stage}>
													<button
														type="button"
														className={`pipeline-stage-pill${isActive ? ' pipeline-stage-pill--active' : ''}${isPast ? ' pipeline-stage-pill--past' : ''}`}
														onClick={() => setPipelineTab(stage)}
													>
														<span className="pipeline-stage-pill-icon"><Icon size={12} /></span>
														<span className="pipeline-stage-pill-label">{STAGE_LABELS[idx]}</span>
														{count > 0 && <span className="pipeline-stage-pill-count">{count}</span>}
													</button>
													{idx < arr.length - 1 && (
														<span className={`pipeline-stage-connector${isPast ? ' pipeline-stage-connector--filled' : ''}`} />
													)}
												</Fragment>
											);
										})}
									</div>
								)}
										{activeView === 'matches' && (
										<div className="job-search-card stalker-card match-engine-container">

											{/* Resume upload / file card */}
											<div className="match-engine-content">
												<motion.div
													key="resume"
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													className="match-upload-zone"
												>
													{!uploadedFile ? (
														<Upload.Dragger
															name="file"
															multiple={false}
															onChange={handleMatchResume}
															customRequest={mockUploadRequest}
															showUploadList={false}
															className="premium-dragger"
														>
															<div className="dragger-inner">
																<div className="dragger-icon-wrap">
																	<div className="ncs-wave-container">
																		<div className="ncs-wave-ring" />
																		<div className="ncs-wave-ring" />
																		<div className="ncs-wave-ring" />
																		<div className="ncs-wave-ring" />
																		<MdFileUpload size={18} className="dragger-upload-icon" />
																	</div>
																</div>
																<div className="dragger-text-wrap">
																	<span className="dragger-main-text">Drop resume or click to browse</span>
																	<span className="dragger-hint-text">PDF, DOCX · Max 5 MB</span>
																</div>
															</div>
														</Upload.Dragger>
													) : (
														<div className="ai-analysis-card">
															<div className="analysis-doc-snap">
																<div className="doc-snap-preview">
																	<div className="doc-snap-page">
																		<div className="doc-snap-line short" />
																		<div className="doc-snap-line long" />
																		<div className="doc-snap-line mid" />
																		<div className="doc-snap-line short" />
																	</div>
																	<div className="doc-snap-badge">
																		<MdDescription size={14} />
																	</div>
																</div>
																<div className="doc-details">
																	<div className="doc-details-head">
																		<span className="doc-name">{uploadedFile.name}</span>
																		<Button
																			type="link"
																			size="small"
																			className="doc-view-link"
																			onClick={() => setShowFullResume(true)}
																		>
																			View Full
																		</Button>
																	</div>
																	<span className="doc-size">
																		{(uploadedFile.size / 1024).toFixed(1)} KB • Ready
																	</span>
																</div>
																<Button
																	type="text"
																	icon={<MdDelete size={18} />}
																	onClick={() => {
																		if (previewUrl) URL.revokeObjectURL(previewUrl);
																		setUploadedFile(null);
																		setPreviewUrl(null);
																		setMatchLoading(false);
																		setAiSteps([]);
																		dispatch(resumeUploadReset());
																	}}
																	className="analysis-remove-btn"
																/>
															</div>

															{matchLoading && (
																<div className="ai-thinking-area">
																	<div className="thinking-dot-wrap">
																		<div className="thinking-dot" />
																		<div className="thinking-dot" />
																		<div className="thinking-dot" />
																	</div>
																	<div className="thinking-logs">
																		{aiSteps.map((step, idx) => (
																			<div key={idx} className="thinking-text thinking-text--done">{step}</div>
																		))}
																		{typingLine && (
																			<div className="thinking-text thinking-text--typing">
																				{typingLine}<span className="typing-cursor" />
																			</div>
																		)}
																	</div>
																</div>
															)}
														</div>
													)}
												</motion.div>
											</div>

											{/* ── JD section toggle ── */}
											<div className="me-jd-divider">
												<button
													type="button"
													className={`me-jd-toggle${showJdSection ? ' me-jd-toggle--open' : ''}`}
													onClick={() => {
									jdOpenRef.current = !jdOpenRef.current;
									const next = jdOpenRef.current;
									// Toggle CSS class directly — no React re-render, paint happens immediately
									jdSectionRef.current?.classList.toggle('me-jd-section--open', next);
									// Update state only for button label/icon, deferred so it doesn't block paint
									requestAnimationFrame(() => setShowJdSection(next));
								}}
												>
													<span className="me-jd-toggle-icon">{showJdSection ? <MdRestartAlt size={12} /> : <MdAdd size={12} />}</span>
													{showJdSection ? 'Remove Job Description' : 'Also add a Job Description'}
													<span className="me-jd-optional">optional</span>
												</button>
											</div>

											{/* ── JD textarea (collapsible) ── */}
											<div ref={jdSectionRef} className="me-jd-section">
												<div className="me-jd-section-inner">
													<div className="me-section-head">
														<span className="me-section-icon me-section-icon--jd"><MdContentPaste size={12} /></span>
														<span className="me-section-label">Job Description</span>
														{pastedJd.trim() && (
															<button
																type="button"
																className="me-jd-clear"
																onClick={() => { setPastedJd(''); setJdResult(''); }}
															>
																Clear
															</button>
														)}
													</div>
													<Input.TextArea
														rows={4}
														placeholder="Paste a job description to refine your matches and send it to the AI search…"
														value={pastedJd}
														onChange={(e) => setPastedJd(e.target.value)}
														className="premium-textarea me-jd-textarea"
														style={{ width: '100%' }}
													/>
													{pastedJd.trim() && (
														<p className="me-jd-hint">
															<MdAutoAwesome size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
															JD will be sent to AI search when you click Find AI Matches
														</p>
													)}
												</div>
											</div>

										{detectedFilters && !matchLoading && (
											<div className="js-ai-banner">
												<div className="js-ai-banner-head">
													<span className="js-ai-banner-icon"><MdAutoAwesome size={13} /></span>
													<span className="js-ai-banner-title">
														AI detected from your {detectedFilters.source === 'resume' ? 'resume' : 'job description'}
													</span>
													<button type="button" className="js-ai-banner-dismiss" onClick={() => setDetectedFilters(null)} aria-label="Dismiss">
														<IoClose size={13} />
													</button>
												</div>
												<div className="js-ai-banner-chips">
													{detectedFilters.skills.map((s) => (
														<span key={s} className="js-ai-chip js-ai-chip--skill">{s}</span>
													))}
													{detectedFilters.expLevel && (
														<span className="js-ai-chip js-ai-chip--exp">{detectedFilters.expLevel}</span>
													)}
													{detectedFilters.workMode && (
														<span className="js-ai-chip js-ai-chip--mode">{detectedFilters.workMode}</span>
													)}
													{detectedFilters.employment?.map((e) => (
														<span key={e} className="js-ai-chip js-ai-chip--emp">{e}</span>
													))}
												</div>
												<div className="js-ai-banner-actions">
													<button type="button" className="js-ai-apply-btn" onClick={applyDetectedFilters}>
														<MdBolt size={12} />
														Add to filters
													</button>
													<button type="button" className="js-ai-skip-btn" onClick={() => setDetectedFilters(null)}>
														Skip
													</button>
												</div>
											</div>
										)}

										{/* ── Primary Find AI Matches CTA ── */}
										<div className="me-find-btn-wrap">
											<div className="me-find-trigger">
												<button
													ref={findBtnRef}
													type="button"
													className={`me-find-btn${listLoading ? ' me-find-btn--loading' : (!hasResumeOrJd || activeFilterCount === 0) ? ' me-find-btn--disabled' : ''}${filtersJustApplied ? ' me-find-btn--glow' : ''}`}
													disabled={listLoading || !hasResumeOrJd || activeFilterCount === 0}
													onClick={() => { setShowFindTour(false); handleFindJobs(); }}
												>
													{listLoading ? (
														<>
															<span className="me-find-btn-spinner" />
															<span>Searching…</span>
														</>
													) : (<>
														{(!hasResumeOrJd || activeFilterCount === 0)
															? <MdLockOutline size={15} className="me-find-btn-icon" />
															: <MdAutoAwesome size={15} className="me-find-btn-icon" />
														}
														<span>Find AI Matches</span>
														{activeFilterCount > 0 && (
															<span className="me-find-badge">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}</span>
														)}
													</>)}
												</button>
												{(!hasResumeOrJd || activeFilterCount === 0) && (<>
													<div className="me-find-tooltip" role="tooltip">
														<div className="me-tt-header">
															<span className="me-tt-lock-icon">🔐</span>
															<span className="me-tt-title">Unlock AI Matching</span>
														</div>
														<p className="me-tt-sub">Complete both steps to activate</p>
														<div className="me-tt-divider" />
														<div className="me-tt-checks">
															<div className={`me-tt-check${hasResumeOrJd ? ' me-tt-check--met' : ''}`}>
																<span className="me-tt-dot" />
																<span>Resume uploaded or JD pasted</span>
															</div>
															<div className={`me-tt-check${activeFilterCount > 0 ? ' me-tt-check--met' : ''}`}>
																<span className="me-tt-dot" />
																<span>At least 1 filter selected</span>
															</div>
														</div>
													</div>
													<div className="me-find-tooltip-arrow" />
												</>)}
											</div>
											{(!hasResumeOrJd || activeFilterCount === 0) && (
												<p className="me-find-hint">
													{!hasResumeOrJd ? 'Upload a resume or paste a JD first' : 'Add at least one filter to search'}
												</p>
											)}
										</div>
									</div>
									)}

									<div
										key={activeView === 'applied' ? pipelineTab : activeView}
										className="job-search-feed-head-copy feed-stage-reveal"
									>
										<h2 className="job-search-feed-title">
											<span className={`filter-label-icon filter-label-icon--${activeView === 'matches' ? 'indigo' : activeView === 'saved' ? 'amber' : 'emerald'}`} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }}>
												{activeView === 'matches' && <MdAutoAwesome size={13} />}
												{activeView === 'saved' && <MdBookmark size={13} />}
												{activeView === 'applied' && pipelineTab === 'applied' && <MdSend size={13} />}
												{activeView === 'applied' && pipelineTab === 'screening' && <MdListAlt size={13} />}
												{activeView === 'applied' && pipelineTab === 'interview' && <MdPsychology size={13} />}
												{activeView === 'applied' && pipelineTab === 'offer' && <MdEmojiEvents size={13} />}
											</span>
											{feedTitle}
										</h2>
										<p className="job-search-feed-sub">{feedSub}</p>
									</div>
								</header>

								{showError ? (
									<div className="job-search-alert-wrap">
										<Alert
											type="error"
											showIcon
											message="Couldn't load jobs"
											description="Network or server issue (simulated). Retry will succeed once APIs are wired."
											action={
												<Button size="small" type="primary" onClick={() => setUiPreview('normal')}>
													Retry
												</Button>
											}
										/>
									</div>
								) : null}

								{showSkeleton ? (<>
									{/* ── AI search progress panel ── */}
									<div ref={aiProgressRef} className="ai-search-progress">
										<div className="ai-sp-header">
											<span className="ai-sp-orb" />
											<span className="ai-sp-title">AI is finding your matches</span>
										</div>
										{[
											{ icon: '🧠', label: 'Scanning your profile & skills' },
											{ icon: '🎯', label: 'Matching skills to open roles' },
											{ icon: '🔍', label: 'Searching 10,000+ opportunities' },
											{ icon: '✨', label: 'Ranking your best-fit matches' },
										].map((s, i) => {
											const done    = i < aiSearchStep;
											const current = i === aiSearchStep;
											return (
												<div key={i} className={`ai-sp-step${done ? ' ai-sp-step--done' : current ? ' ai-sp-step--active' : ' ai-sp-step--pending'}`}>
													<span className="ai-sp-step-icon">
														{done ? '✓' : current ? <span className="ai-sp-pulse-dot" /> : <span className="ai-sp-idle-dot" />}
													</span>
													<span className="ai-sp-step-icon-emoji">{s.icon}</span>
													<span className="ai-sp-step-label">{s.label}{current ? <span className="ai-sp-ellipsis"><span>.</span><span>.</span><span>.</span></span> : ''}</span>
												</div>
											);
										})}
									</div>

									<ul className="job-search-skeleton-list" aria-hidden>
										{[0, 1, 2, 3].map((k) => (
											<li key={k} className="job-search-skeleton-row">
												<Skeleton.Avatar active size={48} shape="square" />
												<div className="job-search-skeleton-lines">
													<Skeleton active title={{ width: '55%' }} paragraph={{ rows: 2, width: ['100%', '80%'] }} />
												</div>
											</li>
										))}
									</ul>
								</>) : null}

								{/* ── Applied pipeline cards — filtered by selected pipeline tab ── */}
								{activeView === 'applied' && !showSkeleton && !showError ? (() => {
									const STAGES = ['applied', 'screening', 'interview', 'offer'] as const;
									const stageJobs = listToRender.filter(j => (appStages[j.id] || 'applied') === pipelineTab);
									if (stageJobs.length === 0) return (
										<div className="job-search-empty-wrap">
											<Empty description={listToRender.length === 0 ? 'No applications yet — apply to roles and they will appear here' : `No jobs in ${pipelineTab} stage`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
										</div>
									);
									return (
										<ul className="job-search-job-list">
											{stageJobs.map((job) => {
												const currentIdx = STAGES.indexOf(appStages[job.id] || 'applied');
												const canAdvance = currentIdx < STAGES.length - 1;
												return (
										<li key={job.id} className="job-search-job-row lineCard job-search-job-row--clickable" role="button" tabIndex={0}
											onClick={() => openJobPreview(job)}
											onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openJobPreview(job); } }}>
											<div className="job-search-job-actions">
												<Tooltip title={savedIds.has(job.id) ? 'Remove from saved' : 'Save job'}>
													<button type="button" className={`job-search-job-save ${savedIds.has(job.id) ? 'job-search-job-save--on' : ''}`}
														aria-pressed={savedIds.has(job.id)} onClick={(e) => toggleSave(job.id, e)}>
														<span className="job-search-job-save-icon" aria-hidden>{savedIds.has(job.id) ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}</span>
														<span className="job-search-job-save-label">{savedIds.has(job.id) ? 'Saved' : 'Save'}</span>
													</button>
												</Tooltip>
											</div>
											<div className="job-search-job-logo" style={{ background: `linear-gradient(135deg, hsl(${job.logoHue},70%,52%), hsl(${job.logoHue + 40},65%,42%))` }} aria-hidden>
												<div className="logo-mesh-ring" />
												<div className="logo-mesh-ring logo-mesh-ring--2" />
												<span className="logo-monogram">{job.company.charAt(0)}</span>
											</div>
											<div className="job-search-job-main">
												<div className="job-search-job-title-row">
													<span className="job-search-job-title job-search-job-title--inline">{job.title}</span>
													{job.matchScore != null && (
														<span className="job-search-fit-pill" title="Match score">
															{job.matchScore}% fit
														</span>
													)}
												</div>
												<p className="job-search-job-meta-line">
													<MdBusiness size={12} className="job-meta-icon" aria-hidden />{job.company}
													<span className="job-search-job-dot"> · </span>
													<MdLocationOn size={12} className="job-meta-icon" aria-hidden />{job.location}
												</p>
												<p className="job-search-job-meta-line job-search-job-meta-line--tags">
													<span className="job-search-job-kind">{EMPLOYMENT_OPTIONS.find((o) => o.value === job.employmentKind)?.label}</span>
													<span className="job-search-job-dot"> · </span>
													<span className="job-search-job-kind">{WORK_MODE_OPTIONS.find((o) => o.value === job.workMode)?.label}</span>
												</p>
												<div className="pipeline-card-advance" onClick={(e) => e.stopPropagation()}>
													{canAdvance ? (
														<button type="button" className="pipeline-advance-inline-btn"
															onClick={(e) => { e.stopPropagation(); setAppStages(prev => ({ ...prev, [job.id]: STAGES[currentIdx + 1] })); setPipelineTab(STAGES[currentIdx + 1]); }}>
															<MdCheckCircle size={12} /> Move to {STAGES[currentIdx + 1].charAt(0).toUpperCase() + STAGES[currentIdx + 1].slice(1)}
														</button>
													) : (
														<span className="pipeline-offer-chip"><MdEmojiEvents size={12} /> Offer received!</span>
													)}
												</div>
											</div>
										</li>
												);
											})}
										</ul>
									);
								})() : null}

								<div className={`job-list-reveal-wrap${isPristine ? ' job-list-reveal-wrap--pristine' : ''}`}>
								{!showSkeleton && !showError && activeView !== 'applied' ? (
									<ul className="job-search-job-list">
										{listLoading ? (
											Array.from({ length: 4 }).map((_, i) => (
												<li key={`skeleton-${i}`} className="job-search-job-row lineCard">
													<Skeleton active avatar paragraph={{ rows: 2 }} />
												</li>
											))
										) : (
											listToRender.map((job) => (
											<li
												key={job.id}
												className="job-search-job-row lineCard job-search-job-row--clickable"
												role="button"
												tabIndex={0}
												onClick={() => openJobPreview(job)}
												onKeyDown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault();
														openJobPreview(job);
													}
												}}
											>
												<div className="job-search-job-actions">
													{activeView === 'matches' ? (
														<button
															type="button"
															className="job-search-job-dismiss"
															aria-label={`Dismiss ${job.title}`}
															onClick={(e) => {
																e.stopPropagation();
																dismiss(job.id);
															}}
														>
															<IoClose size={18} />
														</button>
													) : null}
													<Tooltip
														title={
															savedIds.has(job.id)
																? 'Remove from saved jobs'
																: 'Save — appears under Saved & Job tracker'
														}
													>
														<button
															type="button"
															className={`job-search-job-save ${savedIds.has(job.id) ? 'job-search-job-save--on' : ''}`}
															aria-pressed={savedIds.has(job.id)}
															aria-label={savedIds.has(job.id) ? 'Remove from saved' : 'Save job'}
															onClick={(e) => toggleSave(job.id, e)}
														>
															<span className="job-search-job-save-icon" aria-hidden>
																{savedIds.has(job.id) ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}
															</span>
															<span className="job-search-job-save-label">
																{savedIds.has(job.id) ? 'Saved' : 'Save'}
															</span>
														</button>
													</Tooltip>
												</div>
												<div
													className="job-search-job-logo"
													style={{
														background: `linear-gradient(135deg, hsl(${job.logoHue}, 70%, 52%), hsl(${job.logoHue + 40}, 65%, 42%))`
													}}
													aria-hidden
												>
													<div className="logo-mesh-ring" />
													<div className="logo-mesh-ring logo-mesh-ring--2" />
													<span className="logo-monogram">{job.company.charAt(0)}</span>
												</div>
												<div className="job-search-job-main">
													<div className="job-search-job-title-row">
														<span className="job-search-job-title job-search-job-title--inline">{job.title}</span>
														{job.verified ? (
															<Tooltip title="Verified employer">
																<span className="job-search-job-shield" aria-label="Verified">
																	✓
																</span>
															</Tooltip>
														) : null}
														{job.matchScore != null ? (
															<span className="job-search-fit-pill" title="Mock match score">
																{job.matchScore}% fit
															</span>
														) : null}
													</div>
													<p className="job-search-job-meta-line">
														<MdBusiness size={12} className="job-meta-icon" aria-hidden />{job.company}
														<span className="job-search-job-dot"> · </span>
														<MdLocationOn size={12} className="job-meta-icon" aria-hidden />{job.location}
													</p>
													<p className="job-search-job-meta-line job-search-job-meta-line--tags">
														<span className="job-search-job-kind">{EMPLOYMENT_OPTIONS.find((o) => o.value === job.employmentKind)?.label}</span>
														<span className="job-search-job-dot"> · </span>
														<span className="job-search-job-kind">{WORK_MODE_OPTIONS.find((o) => o.value === job.workMode)?.label}</span>
														{job.detail.experience && <>
															<span className="job-search-job-dot"> · </span>
															<span className="job-search-job-kind">{job.detail.experience}</span>
														</>}
													</p>
													{(job.detail.salary || job.detail.posted !== 'Recently') && (
														<p className="job-search-job-meta-line job-search-job-meta-line--info">
															{job.detail.salary && (
																<span className="job-card-salary"><MdAttachMoney size={12} aria-hidden />{job.detail.salary}</span>
															)}
															{job.detail.salary && job.detail.posted !== 'Recently' && <span className="job-search-job-dot"> · </span>}
															{job.detail.posted !== 'Recently' && (
																<span className="job-card-posted"><MdAccessTime size={11} aria-hidden />{job.detail.posted}</span>
															)}
															{job.sourceKind && (
																<span className="job-card-source-chip">
																	{job.sourceKind === 'ats' ? '🏢 ATS' : job.sourceKind === 'direct' ? '✅ Direct' : job.sourceKind}
																</span>
															)}
														</p>
													)}
													{activeView === 'matches' && job.matchReasons?.length ? (
														<div className="job-search-match-reasons">
															{job.matchReasons.map((r) => (
																<span key={r} className="job-search-match-reason">
																	<MdAutoAwesome size={11} className="match-reason-icon" aria-hidden />
																	{r}
																</span>
															))}
														</div>
													) : null}
														{job.hiringStatus || appliedIds.has(job.id) ? (
														<p className="job-search-job-status">
															<span className="job-search-job-status-dot" aria-hidden />
															{appliedIds.has(job.id) ? 'Application submitted' : job.hiringStatus}
														</p>
													) : null}
													<div className="job-search-job-badges">
														{job.badges?.length ? job.badges.map((b) => (
															<span key={b} className="job-search-pill">
																{b === 'Promoted' && <MdBolt size={11} className="badge-inline-icon" aria-hidden />}
																{b === 'Easy apply' && <MdFlashOn size={11} className="badge-inline-icon" aria-hidden />}
																{b === 'Leadership' && <MdLeaderboard size={11} className="badge-inline-icon" aria-hidden />}
																{b === 'New posting' && <MdTrendingUp size={11} className="badge-inline-icon" aria-hidden />}
																{b}
															</span>
														)) : null}
														<button
															type="button"
															className="job-lp-btn"
															onClick={(e) => {
																e.stopPropagation();
																Modal.confirm({
																	title: 'Go to Learning Path?',
																	content: `You'll be taken to the Learning Path page with the job description for "${job.title}" at ${job.company} pre-filled. Ready to generate your path?`,
																	okText: 'Yes, let\'s go',
																	cancelText: 'Cancel',
																	onOk: () => {
								sessionStorage.setItem('lpPrefillJd', job.detail.description ?? '');
								window.open('/learn', '_blank');
							},
																});
															}}
														>
															<MdSchool size={12} />
															Learning Path
														</button>
													</div>
												</div>
											</li>
										)))}
									</ul>
								) : null}
									{isPristine && (
										<div className="job-reveal-gate" role="region" aria-label="Get matched jobs">
											<div className="job-reveal-gate-inner">
												<div className="job-reveal-gate-icon"><MdRocketLaunch size={30} /></div>
												<h3 className="job-reveal-gate-title">Discover roles matched for you</h3>
												<p className="job-reveal-gate-sub">Apply your filters and let AI surface the best-fit roles for you.</p>
												<div className="job-reveal-gate-actions">
													<button type="button" className="job-reveal-btn job-reveal-btn--primary"
													  onClick={() => { document.querySelector('.match-engine-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setMatchEngineTab('resume'); }}>
													  <MdFileUpload size={15} /> Upload Resume
													</button>
													<button type="button" className="job-reveal-btn job-reveal-btn--secondary"
													  onClick={() => { document.querySelector('.match-engine-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setMatchEngineTab('jd'); }}>
													  <MdContentPaste size={15} /> Paste Job Description
													</button>
												</div>
											</div>
										</div>
									)}
								</div>
								{!showSkeleton && !showError && activeView !== 'applied' && listToRender.length === 0 ? (
									<div className="job-search-empty-wrap">
										<Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />
									</div>
								) : null}

								<div className="job-search-feed-footer">
									<span className="job-search-result-count">
										{showSkeleton || showError ? '—' : (<><MdListAlt size={13} style={{ marginRight: 3, verticalAlign: 'middle', color: '#6366f1' }} aria-hidden />{listToRender.length} role{listToRender.length === 1 ? '' : 's'}</>) }
									</span>
									<Button type="link" className="job-search-show-all" disabled>
										Load more (API)
									</Button>
								</div>
							</section>
						</main>
					</div>
				</motion.div>
			</div>
		</div>

		<Modal
				title={
					<div className="resume-preview-modal-title">
						<MdDescription style={{ marginRight: 10, color: '#6366f1' }} />
						Resume Preview - {uploadedFile?.name}
					</div>
				}
				visible={showFullResume}
				onCancel={() => setShowFullResume(false)}
				footer={null}
				width="100%"
				style={{ top: 0, padding: 0, maxWidth: '100vw' }}
				bodyStyle={{ height: 'calc(100vh - 55px)', padding: 0 }}
				className="resume-full-preview-modal"
				destroyOnClose
			>
				<div className="resume-full-preview-body" style={{ height: '100%' }}>
					{previewUrl && (
						<iframe 
							src={previewUrl} 
							width="100%" 
							height="100%" 
							style={{ border: 'none' }}
							title="Resume Full Preview"
						/>
					)}
				</div>
			</Modal>

			<Drawer
				title="Filters"
				placement="right"
				width={300}
				onClose={() => setFilterDrawerOpen(false)}
				visible={filterDrawerOpen}
				className="job-search-filter-drawer"
			>
				{filtersBlock}
			</Drawer>

			<Modal
				title={null}
				footer={null}
				visible={!!previewJob}
				onCancel={closeJobPreview}
				width="96vw"
				style={{ top: 2, paddingBottom: 0 }}
				centered
				destroyOnClose
				className="job-search-job-preview-modal"
				wrapClassName="job-search-job-preview-modal-wrap"
			>
				{previewJob ? (
					<div className="job-search-preview">

						{/* ── Scrollable area: header + body ── */}
						<div className="jd-scroll-area">

						{/* ── Hero header ── */}
						<header className="job-search-preview-head">
							{/* Top row: logo + identity */}
							<div className="jd-head-top">
								<div
									className="job-search-preview-logo"
									style={{ background: `linear-gradient(135deg, hsl(${previewJob.logoHue}, 70%, 52%), hsl(${previewJob.logoHue + 40}, 65%, 42%))` }}
									aria-hidden
								>
									<div className="logo-mesh-ring" />
									<div className="logo-mesh-ring logo-mesh-ring--2" />
									<span className="logo-monogram logo-monogram--lg">{previewJob.company.charAt(0)}</span>
								</div>
								<div className="job-search-preview-head-copy">
									<div className="job-search-preview-title-row">
										<h2 className="job-search-preview-title">{previewJob.title}</h2>
										{previewJob.verified ? (
											<Tooltip title="Verified employer">
												<MdVerified size={20} className="jd-verified-icon" aria-label="Verified" />
											</Tooltip>
										) : null}
										{previewJob.matchScore != null ? (
											<span className="jd-match-badge"><MdInsights size={12} style={{marginRight:3,verticalAlign:'middle'}}/>{previewJob.matchScore}% match</span>
										) : null}
									</div>
									<p className="job-search-preview-company">
										<MdBusiness size={13} style={{marginRight:4,verticalAlign:'middle',opacity:0.7}}/>
										{previewJob.company}
										<span className="job-search-job-dot"> · </span>
										<MdLocationOn size={13} style={{marginRight:2,verticalAlign:'middle',opacity:0.7}}/>
										{previewJob.location}
									</p>
									<div className="job-search-preview-meta-line">
										<span className="job-search-preview-chip"><MdWorkOutline size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{previewJob.detail.employmentType}</span>
										<span className="job-search-preview-chip job-search-preview-chip--muted"><MdAccessTime size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{previewJob.detail.posted}</span>
										{previewJob.detail.salary ? (
											<span className="job-search-preview-chip job-search-preview-chip--accent"><MdAttachMoney size={10} style={{marginRight:1,verticalAlign:'middle'}}/>{previewJob.detail.salary}</span>
										) : null}
										{previewJob.detail.experience ? (
											<span className="job-search-preview-chip job-search-preview-chip--muted"><MdBarChart size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{previewJob.detail.experience}</span>
										) : null}
										{previewJob.sourceKind ? (
											<span className="job-search-preview-chip job-search-preview-chip--muted">
												{previewJob.sourceKind === 'ats' ? '🏢 ATS Listing' : previewJob.sourceKind === 'direct' ? '✅ Direct Apply' : previewJob.sourceKind}
											</span>
										) : null}
										{previewJob.hiringStatus ? (
											<span className="job-search-preview-chip jd-chip--hiring"><MdTrendingUp size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{previewJob.hiringStatus}</span>
										) : null}
									</div>
									{previewJob.matchScore != null ? (
										<div className="jd-score-bar-wrap">
											<div className="jd-score-bar-track">
												<div className="jd-score-bar-fill" style={{width:`${previewJob.matchScore}%`}} />
											</div>
											<span className="jd-score-bar-label">{previewJob.matchScore}% profile match</span>
										</div>
									) : null}
								</div>
							</div>

							{/* Bottom row: About + What you'll do inside header */}
							<div className="jd-head-desc">
								<div className="jd-head-desc-col">
									<p className="jd-head-desc-label"><MdDescription size={12}/> About the role</p>
									<p className="jd-head-desc-text">{previewJob.detail.description}</p>
								</div>
								<div className="jd-head-desc-col">
									<p className="jd-head-desc-label"><MdOutlineAssignment size={12}/> What you&apos;ll do</p>
									<ul className="jd-head-resp-list">
										{previewJob.detail.responsibilities.map((r) => (
											<li key={r}>{r}</li>
										))}
									</ul>
								</div>
							</div>
						</header>

						{/* ── Scrollable body — Skills + Fit + Rounds ── */}
						<div className="jd-body">

							{/* Skills */}
							<div className="jd-skills-section">
								<h4 className="jd-section-label">
									<span className="jd-section-icon jd-section-icon--violet"><MdCode size={12}/></span>
									Skills required
								</h4>
								<div className="jd-skills-row">
									{previewJob.detail.skills.map((s) => (
										<span key={s} className="job-search-preview-skill">{s}</span>
									))}
								</div>
							</div>

							{/* Two-panel: Your fit + Interview rounds */}
							<div className="jd-panels">

								{/* Left: Your fit */}
								<div className="jd-panel jd-panel--fit">
									<h3 className="jd-panel-title">
										<MdWorkspacePremium size={16} className="jd-panel-title-icon jd-panel-title-icon--gold"/>
										Your fit
									</h3>

									{previewJob.matchScore != null ? (
										<div className="jd-fit-score-row">
											<div className="jd-fit-score-ring" style={{'--score': previewJob.matchScore} as React.CSSProperties}>
												<span className="jd-fit-score-num">{previewJob.matchScore}%</span>
											</div>
											<div className="jd-fit-score-copy">
												<p className="jd-fit-score-title">Profile match score</p>
												<p className="jd-fit-score-sub">Based on your skills &amp; learning path</p>
											</div>
										</div>
									) : null}

									{previewJob.detail.skillsMatched?.length ? (
										<div className="jd-fit-group">
											<p className="jd-fit-label jd-fit-label--match">
												<MdThumbUp size={12}/> Skills matched
											</p>
											<div className="jd-fit-pills">
												{previewJob.detail.skillsMatched.map((s) => (
													<span key={s} className="jd-fit-pill jd-fit-pill--match"><MdCheckCircle size={11}/>{s}</span>
												))}
											</div>
										</div>
									) : null}

									{previewJob.detail.skillGaps?.length ? (
										<div className="jd-fit-group">
											<p className="jd-fit-label jd-fit-label--gap">
												<MdWarning size={12}/> Gaps to bridge
											</p>
											<div className="jd-fit-pills">
												{previewJob.detail.skillGaps.map((s) => (
													<span key={s} className="jd-fit-pill jd-fit-pill--gap"><MdSchool size={11}/>{s}</span>
												))}
											</div>
										</div>
									) : null}

									{previewJob.matchReasons?.length ? (
										<div className="jd-fit-group">
											<p className="jd-fit-label"><MdAutoAwesome size={12}/> AI explanation</p>
											<ul className="jd-fit-reasons">
												{previewJob.matchReasons.map((r) => (
													<li key={r}>{r}</li>
												))}
											</ul>
										</div>
									) : null}

									{previewJob.detail.eligibility?.length ? (
										<div className="jd-fit-group">
											<p className="jd-fit-label"><MdFactCheck size={12}/> Eligibility checklist</p>
											<ul className="jd-fit-checklist">
												{previewJob.detail.eligibility.map((e) => (
													<li key={e}><span className="jd-check"><MdCheckCircle size={10}/></span>{e}</li>
												))}
											</ul>
										</div>
									) : null}
								</div>

								{/* Right: Interview rounds */}
								<div className="jd-panel jd-panel--rounds">
									<h3 className="jd-panel-title">
										<MdEmojiEvents size={16} className="jd-panel-title-icon jd-panel-title-icon--indigo"/>
										Interview rounds
									</h3>
									<div className="jd-rounds-list">
										{(previewJob.detail.interviewRounds ?? [
											{ round: 1, name: 'HR Screening',    subtitle: 'Culture fit & role overview call' },
											{ round: 2, name: 'Aptitude Test',   subtitle: 'Logic, problem-solving & verbal reasoning' },
											{ round: 3, name: 'Technical',       subtitle: 'Live coding & system design questions' },
											{ round: 4, name: 'Skill Assessment',subtitle: 'Take-home project or pair programming task' },
											{ round: 5, name: 'Final / CTO',     subtitle: 'Leadership discussion & offer negotiation' },
										]).map((rd) => (
												<div key={rd.round} className="jd-round-item">
													<span className="jd-round-icon">{ROUND_ICONS[rd.name] ?? <MdListAlt size={14}/>}</span>
													<span className="jd-round-num">Rd {rd.round}</span>
													<span className="jd-round-copy">
														<span className="jd-round-name">{rd.name}</span>
														{rd.subtitle && <span className="jd-round-sub">{rd.subtitle}</span>}
													</span>
													<span className="jd-round-arrow">→</span>
												</div>
											))}
									</div>
									<p className="jd-rounds-hint"><MdMenuBook size={12} style={{marginRight:4,verticalAlign:'middle'}}/>Tap any round to prepare</p>
								</div>
							</div>

						</div>{/* end jd-body */}

						</div>{/* end jd-scroll-area */}

						{/* ── 4-action footer ── */}
						<footer className="jd-footer">
							<button
								type="button"
								className="jd-action-btn jd-action-btn--apply"
								disabled={appliedIds.has(previewJob.id)}
								onClick={() => {
									if (previewJob.detail.applyUrl) {
										window.open(previewJob.detail.applyUrl, '_blank', 'noopener,noreferrer');
										setPendingApplyJob(previewJob);
									} else {
										setAppliedIds((prev) => new Set(prev).add(previewJob.id));
										setAppStages((prev) => ({ ...prev, [previewJob.id]: 'applied' }));
										message.success('Marked as applied in your tracker!');
									}
								}}
							>
								<span className="jd-action-icon jd-action-icon--apply">{appliedIds.has(previewJob.id) ? <MdCheckCircle size={16}/> : <MdRocketLaunch size={16}/>}</span>
								<span className="jd-action-text">
									<span className="jd-action-label">{appliedIds.has(previewJob.id) ? 'Applied ✓' : 'Apply now'}</span>
									<span className="jd-action-sub">{previewJob.detail.applyUrl ? '→ company site' : '→ tracker'}</span>
								</span>
							</button>

							<button type="button" className={`jd-action-btn jd-action-btn--save ${savedIds.has(previewJob.id) ? 'jd-action-btn--saved' : ''}`} onClick={() => toggleSave(previewJob.id)}>
								<span className="jd-action-icon jd-action-icon--save">{savedIds.has(previewJob.id) ? <MdBookmark size={16}/> : <MdBookmarkBorder size={16}/>}</span>
								<span className="jd-action-text"><span className="jd-action-label">{savedIds.has(previewJob.id) ? 'Saved' : 'Save for later'}</span><span className="jd-action-sub">→ saved list</span></span>
							</button>

							<button
								type="button"
								className="jd-action-btn jd-action-btn--skills"
								onClick={() => {
									// Build a rich JD string: title + company + description
									const jdText = [
										previewJob.title && `Role: ${previewJob.title}`,
										previewJob.company && `Company: ${previewJob.company}`,
										previewJob.detail?.description,
									].filter(Boolean).join('\n\n');
									sessionStorage.setItem('lpPrefillJd', jdText);
									window.open('/learn', '_blank');
								}}
							>
								<span className="jd-action-icon jd-action-icon--skills"><MdSchool size={16}/></span>
								<span className="jd-action-text"><span className="jd-action-label">Build skills</span><span className="jd-action-sub">→ full learning path</span></span>
							</button>

                      {/* for now commented maybe in future can be used based on requirement */}
							{/* <button type="button" className="jd-action-btn jd-action-btn--prepare" onClick={() => message.info('Opening round prep…')}>
								<span className="jd-action-icon jd-action-icon--prepare"><MdPsychology size={16}/></span>
								<span className="jd-action-text"><span className="jd-action-label">Prepare round</span><span className="jd-action-sub">→ round learning path</span></span>
							</button> */}
						</footer>
					</div>
				) : null}
			</Modal>

			{/* ── Did you apply? confirmation modal ── */}
			<Modal
				open={!!pendingApplyJob}
				onCancel={() => setPendingApplyJob(null)}
				footer={null}
				centered
				width={420}
				className="apply-confirm-modal"
				closable={false}
			>
				{pendingApplyJob && (
					<div className="acm-wrap">
						<div className="acm-icon-ring">
							<MdRocketLaunch size={26} />
						</div>
						<h3 className="acm-title">Did you apply?</h3>
						<p className="acm-sub">
							We opened <strong>{pendingApplyJob.company}</strong>'s application page in a new tab.
							Let us know so we can track it in your pipeline.
						</p>
						<div className="acm-job-pill">
							<span className="acm-job-title">{pendingApplyJob.title}</span>
							<span className="acm-job-company">{pendingApplyJob.company}</span>
						</div>
						<div className="acm-actions">
							<button
								type="button"
								className="acm-btn acm-btn--yes"
								onClick={() => {
									setAppliedIds((prev) => new Set(prev).add(pendingApplyJob.id));
									setAppStages((prev) => ({ ...prev, [pendingApplyJob.id]: 'applied' }));
									setPendingApplyJob(null);
									message.success('Added to your applied pipeline!');
								}}
							>
								<MdCheckCircle size={15} /> Yes, I applied
							</button>
							<button
								type="button"
								className="acm-btn acm-btn--no"
								onClick={() => setPendingApplyJob(null)}
							>
								Not yet
							</button>
						</div>
					</div>
				)}
			</Modal>

			{/* ── Tour spotlight ── */}
			{showFindTour && tourCardRect && ReactDOM.createPortal(
				<>
					{/* Click outside to dismiss */}
					<div style={{ position: 'fixed', inset: 0, zIndex: 1079 }} onClick={() => setShowFindTour(false)} aria-hidden />

					{/* Spotlight: expand by sp px on each side so the outline has breathing room */}
					{(() => { const sp = 10; return (
						<div
							className="js-tour-spotlight"
							style={{ top: tourCardRect.top - sp, left: tourCardRect.left - sp, width: tourCardRect.width + sp * 2, height: tourCardRect.height + sp * 2 }}
							aria-hidden
						/>
					); })()}

					{/* Bubble */}
					{tourBubblePos && (
						<div className="js-tour-bubble js-tour-bubble--right" style={{ top: tourBubblePos.top, left: tourBubblePos.left, width: tourBubblePos.width, transform: 'translateY(-50%)' }}>
							<div className="js-tour-bubble-arrow" aria-hidden />
							<button type="button" className="js-tour-bubble-close" onClick={() => setShowFindTour(false)} aria-label="Dismiss tour">
								<IoClose size={12} />
							</button>
							{(() => {
								const goNext = (next: 1|2|3|4, extra?: () => void) => {
									setTourCardRect(null);
									setTourBubblePos(null);
									setTourStep(next);
									extra?.();
								};
								const dots = Array.from({ length: tourTotal }, (_, i) => (
									<span key={i} className={`js-tour-dot${i + 1 === tourStep ? ' js-tour-dot--active' : ''}`} />
								));
								const jdStep  = uploadedFile ? 3 : null;
								const btnStep = uploadedFile ? 4 : 3;

								if (tourStep === 1) return (
									<>
										<p className="js-tour-bubble-eyebrow"><MdAutoAwesome size={11} />Step 1 of {tourTotal}</p>
										<p className="js-tour-bubble-text">
											These <strong>skills were pre-filled</strong> from your resume. Add or remove any to sharpen your search.
										</p>
										<div className="js-tour-bubble-footer">
											<span className="js-tour-bubble-dots">{dots}</span>
											<button type="button" className="js-tour-bubble-cta" onClick={() => goNext(2)}>Next →</button>
										</div>
									</>
								);

								if (tourStep === 2) return (
									<>
										<p className="js-tour-bubble-eyebrow"><MdAutoAwesome size={11} />Step 2 of {tourTotal}</p>
										<p className="js-tour-bubble-text">
											Tweak <strong>Employment type</strong> and <strong>Work Mode</strong> to filter for roles that fit your lifestyle — remote, hybrid, full-time, contract and more.
										</p>
										<div className="js-tour-bubble-footer">
											<span className="js-tour-bubble-dots">{dots}</span>
											<button type="button" className="js-tour-bubble-cta" onClick={() => goNext(3)}>Next →</button>
										</div>
									</>
								);

								if (tourStep === jdStep) return (
									<>
										<p className="js-tour-bubble-eyebrow"><MdAutoAwesome size={11} />Step 3 of {tourTotal}</p>
										<p className="js-tour-bubble-text">
											Got a job in mind? <strong>Paste the job description</strong> here — the AI will use it to find roles that closely match that specific role.
										</p>
										<div className="js-tour-bubble-footer">
											<span className="js-tour-bubble-dots">{dots}</span>
											<button type="button" className="js-tour-bubble-cta" onClick={() => goNext(4 as 4, () => {
												// open JD section so it's visible when step targets it
												jdOpenRef.current = true;
												jdSectionRef.current?.classList.add('me-jd-section--open');
												setShowJdSection(true);
											})}>Next →</button>
										</div>
									</>
								);

								// final step — Find AI Matches button
								return (
									<>
										<p className="js-tour-bubble-eyebrow"><MdAutoAwesome size={11} />Step {tourTotal} of {tourTotal}</p>
										<p className="js-tour-bubble-text">
											All set! Click <strong>Find AI Matches</strong> to run your personalised AI job search.
										</p>
										<div className="js-tour-bubble-footer">
											<span className="js-tour-bubble-dots">{dots}</span>
											<button type="button" className="js-tour-bubble-cta" onClick={() => setShowFindTour(false)}>Got it ✓</button>
										</div>
									</>
								);
							})()}
						</div>
					)}
				</>,
				document.body
			)}

			{/* ── AI Filter Review Modal ── */}
			<Modal
				open={showReviewModal}
				onCancel={() => setShowReviewModal(false)}
				footer={null}
				width={520}
				centered
				className="js-review-modal"
				closeIcon={<IoClose size={18} />}
			>
				<div className="js-review-body">
					<div className="js-review-hero">
						<div className="js-review-hero-icon"><MdAutoAwesome size={28} /></div>
						<p className="js-review-eyebrow">AI Match Engine</p>
						<h2 className="js-review-title">Review your filters</h2>
						<p className="js-review-sub">Make sure these look right before we run the search — each query uses AI matching.</p>
						<div className="js-review-count-badge">
							<MdTune size={13} />
							{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
						</div>
					</div>

					<div className="js-review-filters">
						{empFilter.length > 0 && (
							<div className="js-review-row">
								<span className="js-review-row-label">Employment</span>
								<div className="js-review-chips">
									{empFilter.map((e) => (
										<span key={e} className="js-review-chip js-review-chip--indigo">
											{EMP_META[e]?.icon}
											{EMP_META[e]?.label ?? e}
										</span>
									))}
								</div>
							</div>
						)}
						{workFilter.length > 0 && (
							<div className="js-review-row">
								<span className="js-review-row-label">Work mode</span>
								<div className="js-review-chips">
									{workFilter.map((w) => (
										<span key={w} className="js-review-chip js-review-chip--cyan">
											{WORK_META[w]?.icon}
											{WORK_META[w]?.label ?? w}
										</span>
									))}
								</div>
							</div>
						)}
						{expFilter && (
							<div className="js-review-row">
								<span className="js-review-row-label">Experience</span>
								<span className="js-review-chip js-review-chip--amber">
									<MdBarChart size={10} />
									{EXP_META[expFilter] ?? expFilter}
								</span>
							</div>
						)}
						{sectorFilter && (
							<div className="js-review-row">
								<span className="js-review-row-label">Sector</span>
								<span className="js-review-chip js-review-chip--emerald">
									<MdFactory size={10} />{sectorFilter}
								</span>
							</div>
						)}
						{skillsFilter.length > 0 && (
							<div className="js-review-row">
								<span className="js-review-row-label">Skills</span>
								<div className="js-review-chips">
									{skillsFilter.map((s) => (
										<span key={s} className="js-review-chip js-review-chip--violet">
											<MdCode size={10} />{s}
										</span>
									))}
								</div>
							</div>
						)}
						{(locationFilter.city || locationFilter.country) && (
							<div className="js-review-row">
								<span className="js-review-row-label">Location</span>
								<span className="js-review-chip js-review-chip--cyan">
									<MdLocationOn size={10} />
									{[locationFilter.city, locationFilter.country].filter(Boolean).join(', ')}
								</span>
							</div>
						)}
					</div>

					<div className="js-review-notice">
						<MdWarning size={13} />
						Filters can't be changed mid-search. Edit first if needed, then confirm.
					</div>

					<div className="js-review-actions">
						<button type="button" className="js-review-edit-btn" onClick={() => setShowReviewModal(false)}>
							Edit filters
						</button>
					<Tooltip
					title={!hasResumeOrJd ? 'Upload a resume or paste a job description to unlock AI matching' : ''}
					placement="top"
				>
					<span style={{ display: 'inline-flex', cursor: !hasResumeOrJd ? 'not-allowed' : 'default' }}>
						<button type="button" className={`js-review-confirm-btn${!hasResumeOrJd ? ' js-review-confirm-btn--locked' : ''}`}
							disabled={!hasResumeOrJd}
							style={{ pointerEvents: !hasResumeOrJd ? 'none' : 'auto' }}
							onClick={handleConfirmSearch}>
							<MdRocketLaunch size={14} />
							Find my matches
						</button>
					</span>
				</Tooltip>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default JobSearch;
