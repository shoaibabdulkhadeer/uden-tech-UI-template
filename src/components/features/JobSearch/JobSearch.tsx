import { Alert, Avatar, Button, Checkbox, Drawer, Empty, Input, message, Modal, notification, Radio, Segmented, Select, Skeleton, Spin, Tabs, Tooltip, Upload } from 'antd';
import { CheckCircleFilled, InboxOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { FaRegSnowflake, FaFingerprint } from 'react-icons/fa';
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
	MdSearch,
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
	MdSpaceDashboard,
	MdAutoGraph,
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
import { getSavedJobs, getSavedJobsReset } from '../../../redux/features/jobSearch/getSavedJobsSlice';
import { unsaveJob, unsaveJobReset } from '../../../redux/features/jobSearch/unsaveJobSlice';
import { getJobById, getJobByIdReset } from '../../../redux/features/jobSearch/getJobByIdSlice';
import { getTrackerApplications, trackerReset } from '../../../redux/features/jobSearch/trackerSlice';
import { addToTracker, addToTrackerReset } from '../../../redux/features/jobSearch/addToTrackerSlice';
import { deleteTracker, deleteTrackerReset } from '../../../redux/features/jobSearch/deleteTrackerSlice';
import { updateTracker, updateTrackerReset } from '../../../redux/features/jobSearch/updateTrackerSlice';
import { getInterviewRounds, getInterviewRoundsReset } from '../../../redux/features/jobSearch/getInterviewRoundsSlice';
import { getProfile, getProfileReset } from '../../../redux/features/profile/getProfileSlice';
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

// IDs that only exist in the local mock dataset — never send these to the API
const MOCK_JOB_IDS = new Set(MOCK_JOBS.map((j) => j.id));
import './job-search.css';
import '../../../styles/phase2-theme.css';
import '../../../styles/dashboard-arena.css';


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

// API-accepted sector values → display labels
const SECTOR_META: Record<string, string> = {
	private:    'Private (MNC / Startup / Corporate)',
	public:     'Public Sector / PSU',
	government: 'Government / Govt Bodies',
	freelance:  'Freelance / Contract',
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
	const { savedJobsData, status: savedJobsStatus, error: savedJobsError } = useSelector(
		(state: any) => state.getSavedJobsReducer
	);
	const { unsaveJobData, status: unsaveJobStatus, error: unsaveJobError, pendingId: unsavePendingId } = useSelector(
		(state: any) => state.unsaveJobReducer
	);
	const { jobByIdData, status: jobByIdStatus, error: jobByIdError } = useSelector(
		(state: any) => state.getJobByIdReducer
	);
	const { profileData, status: profileStatus } = useSelector(
		(state: any) => state.getProfileReducer
	);
	const { trackerData, status: trackerStatus, error: trackerError } = useSelector(
		(state: any) => state.trackerReducer
	);
	const { addToTrackerData, status: addToTrackerStatus, error: addToTrackerError } = useSelector(
		(state: any) => state.addToTrackerReducer
	);
	const { deleteTrackerData, status: deleteTrackerStatus, error: deleteTrackerError, pendingTrackerId: deleteTrackerPendingId } = useSelector(
		(state: any) => state.deleteTrackerReducer
	);
	const { updateTrackerData, status: updateTrackerStatus, error: updateTrackerError } = useSelector(
		(state: any) => state.updateTrackerReducer
	);
	const { interviewRoundsData, status: interviewRoundsStatus, error: interviewRoundsError } = useSelector(
		(state: any) => state.getInterviewRoundsReducer
	);
	const { tokenDetails } = useSelector((state: any) => state?.tokenReducer);

	const [activeView, setActiveView] = useState<ActiveView>('matches');
	const [empFilter, setEmpFilter] = useState<EmploymentKind[]>([]);
	const [workFilter, setWorkFilter] = useState<WorkMode[]>([]);
	const [expFilter, setExpFilter] = useState<string | undefined>(undefined);
	const [sectorFilter, setSectorFilter] = useState<string | undefined>(undefined);
	const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [locationResetKey, setLocationResetKey] = useState(0);
	const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
	const [apiSavedJobs, setApiSavedJobs] = useState<JobItem[]>([]);
	const [savedJobsTotal, setSavedJobsTotal] = useState(0);
	const [savedJobsPage, setSavedJobsPage] = useState(1);
	const SAVED_PAGE_LIMIT = 10;
	const [boostedProfile, setBoostedProfile] = useState<any>(null);
	const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
	const [appStages, setAppStages] = useState<Record<string, 'applied' | 'screening' | 'interview' | 'offer'>>({});
	const [pipelineTab, setPipelineTab] = useState<'applied' | 'screening' | 'interview' | 'offer'>('applied');
	const [trackerJobs, setTrackerJobs] = useState<JobItem[]>([]);
	const [trackerIdMap, setTrackerIdMap] = useState<Record<string, string>>({});
	const [trackerTotal, setTrackerTotal] = useState(0);
	const [trackerPage, setTrackerPage] = useState(1);
	const [trackerLoadingMore, setTrackerLoadingMore] = useState(false);
	const [showTrackerKanban, setShowTrackerKanban] = useState(false);
	const [dragJobId, setDragJobId] = useState<string | null>(null);
	const [dragOverCol, setDragOverCol] = useState<string | null>(null);
	const [dragPos, setDragPos] = useState<{x:number;y:number} | null>(null);
	const [dragMeta, setDragMeta] = useState<{offsetX:number;offsetY:number;w:number;h:number} | null>(null);
	const TRACKER_PAGE_LIMIT = 10;
	const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
	const [previewJob, setPreviewJob] = useState<JobItem | null>(null);
	const [liveInterviewRounds, setLiveInterviewRounds] = useState<any[]>([]);
	const [interviewDataAvailable, setInterviewDataAvailable] = useState<boolean | null>(null);
	const [interviewNotFoundMsg, setInterviewNotFoundMsg] = useState<string | null>(null);
	const [interviewDisclaimer, setInterviewDisclaimer] = useState<string | null>(null);
	const [quickViewJobId, setQuickViewJobId] = useState<string | null>(null);
	const [listLoading, setListLoading] = useState(false);
	const [uiPreview, setUiPreview] = useState<UiPreview>('normal');
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [titleInput, setTitleInput] = useState('');
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
	const quickHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [closingProfile, setClosingProfile] = useState(false);

	const closeProfilePanel = useCallback(() => {
		setClosingProfile(true);
		setTimeout(() => {
			setShowProfileModal(false);
			setClosingProfile(false);
		}, 300); // matches aip-panel-out duration
	}, []);
	const userId = useMemo(() => {
		try {
			const data: any = decodeToken(sessionStorage.getItem('accessToken') || '');
			return data?.userid || data?.userId || data?.user_id || null;
		} catch { return null; }
	}, []);
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


	// Hover open/close for quick-view panel
	// Kanban infinite scroll — load next page when any column reaches bottom
	const handleKanbanScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const el = e.currentTarget;
		const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
		if (nearBottom && trackerJobs.length < trackerTotal && !trackerLoadingMore && !trackerStatus) {
			setTrackerLoadingMore(true);
			dispatch(getTrackerApplications({ pageId: trackerPage + 1, pageLimit: TRACKER_PAGE_LIMIT }));
		}
	}, [trackerJobs.length, trackerTotal, trackerLoadingMore, trackerStatus, trackerPage, dispatch]);

	// Mouse-based kanban drag tracking
	useEffect(() => {
		if (!dragJobId) return;
		const S: Record<string,string> = { applied:'applied', screening:'shortlisted', interview:'interviewing', offer:'offer' };
		const onMove = (e: MouseEvent) => {
			setDragPos({ x: e.clientX, y: e.clientY });
			const cols = document.querySelectorAll('[data-kanban-col]');
			let found: string | null = null;
			cols.forEach(col => {
				const r = col.getBoundingClientRect();
				if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)
					found = col.getAttribute('data-kanban-col');
			});
			setDragOverCol(found);
		};
		const onUp = (e: MouseEvent) => {
			const cols = document.querySelectorAll('[data-kanban-col]');
			let target: string | null = null;
			cols.forEach(col => {
				const r = col.getBoundingClientRect();
				if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)
					target = col.getAttribute('data-kanban-col');
			});
			if (target && (appStages[dragJobId] ?? 'applied') !== target) {
				setAppStages(prev => ({ ...prev, [dragJobId]: target as any }));
				const tid = trackerIdMap[dragJobId];
				if (tid) dispatch(updateTracker({ trackerId: tid, status: S[target] as any }));
			}
			setDragJobId(null); setDragOverCol(null); setDragPos(null); setDragMeta(null);
			document.body.classList.remove('tracker-dragging');
		};
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dragJobId]);

	const onQuickEnter = useCallback((id: string) => {
		if (quickHoverTimer.current) clearTimeout(quickHoverTimer.current);
		setQuickViewJobId(id);
	}, []);
	const onQuickLeave = useCallback(() => {
		quickHoverTimer.current = setTimeout(() => setQuickViewJobId(null), 150);
	}, []);

	// Handle resume upload API response
	useEffect(() => {
		if (!resumeStatus && resumeData && (resumeData?.statusCode === 200 || resumeData?.statusCode === 201)) {
			notification.destroy();
			setMatchLoading(false);
			setAiSteps([]);
			setTypingLine('');
			const data = resumeData?.data;
			const mergedSkills: string[] = Array.from(new Set((data?.skills || []).filter(Boolean)));

			// Auto-apply detected filters directly (banner removed — see js-ai-banner JSX below)
			const detectedExpLevel   = normalizeExpLevel(
				data?.career_level       ??
				data?.experienceLevel    ??
				data?.expLevel           ??
				data?.experience         ??
				(data?.total_experience_years != null
					? String(data.total_experience_years) + ' years'
					: null)
			);
			const detectedWorkMode   = data?.workMode || data?.work_mode || null;
			const detectedEmployment = normalizeEmployment(
				data?.employmentType ?? data?.employment ??
				data?.jobType        ?? data?.job_type   ?? null
			);
			if (mergedSkills.length > 0) setSkillsFilter((prev) => { const m = [...prev]; mergedSkills.forEach((s) => { if (!m.includes(s)) m.push(s); }); return m; });
			if (detectedExpLevel)   setExpFilter(detectedExpLevel);
			if (detectedWorkMode)   setWorkFilter((prev) => prev.includes(detectedWorkMode) ? prev : [...prev, detectedWorkMode]);
			if (detectedEmployment?.length) setEmpFilter((prev) => { const m = [...prev]; detectedEmployment.forEach((e) => { if (!m.includes(e)) m.push(e); }); return m; });
			setFiltersJustApplied(true);
			setTimeout(() => setFiltersJustApplied(false), 3000);
			setTourStep(1);
			setShowFindTour(true);
			/* COMMENTED — AI detected banner (keep for future use)
			setDetectedFilters({
				skills: mergedSkills, expLevel: detectedExpLevel,
				workMode: detectedWorkMode, employment: detectedEmployment, source: 'resume',
			});
			*/
			const parsedLoc = parseLocationString(data?.location);
			if (parsedLoc) setDetectedLocation(parsedLoc);
			// Fetch fresh profile after resume upload (button will show spinner, then go green)
			if (userId) {
				dispatch(getProfile(userId));
			}
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

		const code = saveJobData?.statusCode ?? saveJobData?.status;

		if (code === 200 || code === 201) {
			message.success(saveJobData?.message || 'Job saved successfully');
			// Refresh saved jobs so the tab count updates instantly
			dispatch(getSavedJobs({ pageId: 1, pageLimit: SAVED_PAGE_LIMIT }));
		} else if (code === 404) {
			message.error(saveJobData?.message || 'Job not found — it may have been removed');
		} else if (code === 400) {
			message.warning(saveJobData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(saveJobData?.message || 'Server error');
		} else if (saveJobError) {
			message.error(saveJobError || 'Failed to save job');
		}

		dispatch(saveJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [saveJobData, saveJobStatus, saveJobError]);

	// Handle get saved jobs API response
	useEffect(() => {
		if (savedJobsStatus) return;
		if (!savedJobsData && !savedJobsError) return;

		if (savedJobsError && !savedJobsData) {
			message.error(savedJobsError || 'Failed to fetch saved jobs');
			dispatch(getSavedJobsReset());
			return;
		}

		const code = savedJobsData?.statusCode ?? savedJobsData?.status;

		if (code === 200 || code === 201) {
			// New response shape: { data: { saved_jobs: [...], total, pageId, pageLimit } }
			const raw: any[]  = savedJobsData?.data?.saved_jobs ?? [];
			const total: number = savedJobsData?.data?.total ?? 0;
			const pageId: number = savedJobsData?.data?.pageId ?? 1;

			setSavedJobsTotal(total);
			setSavedJobsPage(pageId);

			const offset = (pageId - 1) * SAVED_PAGE_LIMIT;
			const mapped = raw.map((entry: any, idx: number) =>
				mapApiJobToJobItem(entry.job, offset + idx)
			);

			if (pageId === 1) {
				// First page — replace list and reset savedIds
				setApiSavedJobs(mapped);
				setSavedIds(new Set(mapped.map((j) => j.id)));
			} else {
				// Subsequent pages — append
				setApiSavedJobs((prev) => [...prev, ...mapped]);
				setSavedIds((prev) => {
					const n = new Set(prev);
					mapped.forEach((j) => n.add(j.id));
					return n;
				});
			}
		} else if (code === 400) {
			message.warning(savedJobsData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(savedJobsData?.message || 'Server error');
		}

		dispatch(getSavedJobsReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedJobsData, savedJobsStatus, savedJobsError]);

	// Fetch tracker applications whenever the applied tab is opened
	useEffect(() => {
		if (activeView !== 'applied') return;
		dispatch(getTrackerApplications({ pageId: 1, pageLimit: TRACKER_PAGE_LIMIT }));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeView]);

	// Handle tracker applications API response
	useEffect(() => {
		if (trackerStatus) return;
		if (!trackerData && !trackerError) return;

		if (trackerError && !trackerData) {
			message.error(trackerError || 'Failed to fetch applications');
			dispatch(trackerReset());
			return;
		}

		const code = trackerData?.statusCode ?? trackerData?.status;

		if (code === 200 || code === 201) {
			const raw: any[]    = trackerData?.data?.entries  ?? [];
			const total: number = trackerData?.data?.total    ?? 0;
			const pageId: number = trackerData?.data?.pageId  ?? 1;

			setTrackerTotal(total);
			setTrackerPage(pageId);

			// Map API status values to UI pipeline stages
			const STAGE_MAP: Record<string, 'applied' | 'screening' | 'interview' | 'offer'> = {
				applied:      'applied',
				shortlisted:  'screening',
				interviewing: 'interview',
				offer:        'offer',
				rejected:     'applied',
				withdrawn:    'applied',
			};

			const offset = (pageId - 1) * TRACKER_PAGE_LIMIT;

			// Fix "unknown" display — merge top-level tracker fields into job snapshot
			const mapped = raw.map((entry: any, idx: number) => {
				const snap = entry.job_snapshot ?? entry.job ?? {};
				const jobData = {
					...snap,
					// Ensure id is always resolvable
					job_id:  entry.job_id ?? snap.job_id ?? snap.id ?? snap._id,
					title:   snap.title   || snap.job_title   || entry.title   || 'Untitled Role',
					company: snap.company || snap.company_name || entry.company || 'Unknown Company',
					location: snap.location || snap.city || entry.location || '',
				};
				return mapApiJobToJobItem(jobData, offset + idx);
			});

			const newStages: Record<string, 'applied' | 'screening' | 'interview' | 'offer'> = {};
			const newIdMap: Record<string, string> = {};
			raw.forEach((entry: any) => {
				const jobId = entry.job_id ?? entry.job_snapshot?.job_id ?? entry.job_snapshot?.id ?? entry.job?.id ?? entry.job?._id;
				if (jobId) {
					newStages[jobId] = STAGE_MAP[entry.status] ?? 'applied';
					if (entry.tracker_id) newIdMap[jobId] = entry.tracker_id;
				}
			});

			if (pageId === 1) {
				setTrackerJobs(mapped);
				setAppliedIds(new Set(mapped.map((j) => j.id)));
				setAppStages(newStages);
				setTrackerIdMap(newIdMap);
			} else {
				setTrackerJobs((prev) => [...prev, ...mapped]);
				setAppliedIds((prev) => {
					const n = new Set(prev);
					mapped.forEach((j) => n.add(j.id));
					return n;
				});
				setAppStages((prev) => ({ ...prev, ...newStages }));
				setTrackerIdMap((prev) => ({ ...prev, ...newIdMap }));
			}
		} else if (code === 400) {
			message.warning(trackerData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(trackerData?.message || 'Server error');
		}

		dispatch(trackerReset());
		setTrackerLoadingMore(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackerData, trackerStatus, trackerError]);

	// Handle add-to-tracker (Apply) API response
	useEffect(() => {
		if (addToTrackerStatus) return;
		if (!addToTrackerData && !addToTrackerError) return;

		const jobId = pendingApplyJob?.id;

		if (addToTrackerError && !addToTrackerData) {
			message.error(addToTrackerError || 'Failed to track application');
			dispatch(addToTrackerReset());
			setPendingApplyJob(null);
			return;
		}

		const code = addToTrackerData?.statusCode ?? addToTrackerData?.status;

		if (code === 200 || code === 201) {
			if (jobId) {
				setAppliedIds((prev) => new Set(prev).add(jobId));
				setAppStages((prev) => ({ ...prev, [jobId]: 'applied' }));
			}
			message.success(addToTrackerData?.message || 'Added to your application tracker!');
		} else if (code === 409) {
			// Already tracked — still reflect in UI
			if (jobId) setAppliedIds((prev) => new Set(prev).add(jobId));
			message.info(addToTrackerData?.message || 'Already in your tracker');
		} else if (code === 400) {
			message.warning(addToTrackerData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(addToTrackerData?.message || 'Server error');
		}

		dispatch(addToTrackerReset());
		setPendingApplyJob(null);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addToTrackerData, addToTrackerStatus, addToTrackerError]);

	// Handle delete tracker entry response
	useEffect(() => {
		if (deleteTrackerStatus) return;
		if (!deleteTrackerData && !deleteTrackerError) return;

		if (deleteTrackerError && !deleteTrackerData) {
			message.error(deleteTrackerError || 'Failed to remove from tracker');
			dispatch(deleteTrackerReset());
			return;
		}

		const code = deleteTrackerData?.statusCode ?? deleteTrackerData?.status;
		const removedTrackerId: string = deleteTrackerData?.trackerId;

		if (code === 200 || code === 201) {
			const jobId = Object.keys(trackerIdMap).find(k => trackerIdMap[k] === removedTrackerId);
			if (jobId) {
				setTrackerJobs((prev) => prev.filter((j) => j.id !== jobId));
				setAppliedIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
				setAppStages((prev) => { const s = { ...prev }; delete s[jobId]; return s; });
				setTrackerIdMap((prev) => { const m = { ...prev }; delete m[jobId]; return m; });
			}
			message.success(deleteTrackerData?.message || 'Removed from tracker');
		} else if (code === 404) {
			message.warning(deleteTrackerData?.message || 'Entry not found');
		} else if (code === 400) {
			message.warning(deleteTrackerData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(deleteTrackerData?.message || 'Server error');
		}

		dispatch(deleteTrackerReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteTrackerData, deleteTrackerStatus, deleteTrackerError]);

	// Handle update tracker entry (stage advance) response
	useEffect(() => {
		if (updateTrackerStatus) return;
		if (!updateTrackerData && !updateTrackerError) return;

		if (updateTrackerError && !updateTrackerData) {
			message.error(updateTrackerError || 'Failed to update application status');
			dispatch(updateTrackerReset());
			return;
		}

		const code = updateTrackerData?.statusCode ?? updateTrackerData?.status;

		if (code === 200 || code === 201) {
			// Stage already updated optimistically in UI
		} else if (code === 400) {
			message.warning(updateTrackerData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(updateTrackerData?.message || 'Server error');
		}

		dispatch(updateTrackerReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateTrackerData, updateTrackerStatus, updateTrackerError]);

	// Handle interview rounds API response
	useEffect(() => {
		if (interviewRoundsStatus) return;
		if (!interviewRoundsData && !interviewRoundsError) return;

		if (interviewRoundsError && !interviewRoundsData) {
			// Silently fall back — no toast needed
			setInterviewDataAvailable(false);
			dispatch(getInterviewRoundsReset());
			return;
		}

		const code = interviewRoundsData?.statusCode ?? interviewRoundsData?.status;

		if (code === 200 || code === 201) {
			const d = interviewRoundsData?.data ?? {};
			const rounds: any[] = d.rounds ?? d.interview_rounds ?? interviewRoundsData?.rounds ?? [];
			const dataAvailable: boolean = d.data_available ?? rounds.length > 0;
			const notFoundMsg: string | null = d.not_found_message ?? interviewRoundsData?.message ?? null;
			const disclaimer: string | null = d.disclaimer ?? null;

			setLiveInterviewRounds(rounds);
			setInterviewDataAvailable(dataAvailable);
			setInterviewNotFoundMsg(notFoundMsg);
			setInterviewDisclaimer(disclaimer);
		}

		dispatch(getInterviewRoundsReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [interviewRoundsData, interviewRoundsStatus, interviewRoundsError]);

	// Handle unsave job API response
	useEffect(() => {
		if (unsaveJobStatus) return;
		if (!unsaveJobData && !unsaveJobError) return;

		const code = unsaveJobData?.statusCode ?? unsaveJobData?.status;

		if (code === 200 || code === 201) {
			const removedId = unsaveJobData?.jobId;
			setSavedIds((prev) => { const n = new Set(prev); n.delete(removedId); return n; });
			setApiSavedJobs((prev) => prev.filter((j) => j.id !== removedId));
			setSavedJobsTotal((prev) => Math.max(0, prev - 1));
			message.success(unsaveJobData?.message || 'Job removed from saved list');
		} else if (code === 404) {
			message.error(unsaveJobData?.message || 'Job not found — it may have already been removed');
		} else if (code === 400) {
			message.warning(unsaveJobData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(unsaveJobData?.message || 'Server error');
		} else if (unsaveJobError) {
			message.error(unsaveJobError || 'Failed to remove saved job');
		}

		dispatch(unsaveJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [unsaveJobData, unsaveJobStatus, unsaveJobError]);

	// Handle get job by ID — update preview modal with fresh API data
	useEffect(() => {
		if (jobByIdStatus) return;
		if (!jobByIdData && !jobByIdError) return;

		if (jobByIdError && !jobByIdData) {
			// silently ignore — modal still shows cached data
			dispatch(getJobByIdReset());
			return;
		}

		const code = jobByIdData?.statusCode ?? jobByIdData?.status;

		if (code === 200 || code === 201) {
			const raw = jobByIdData?.data;
			if (raw) {
				setPreviewJob((prev) =>
					prev ? mapApiJobToJobItem(raw, 0) : null
				);
			}
		}

		dispatch(getJobByIdReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jobByIdData, jobByIdStatus, jobByIdError]);

	// Handle get profile response
	useEffect(() => {
		if (profileStatus) return;
		if (!profileData) return;
		const code = profileData?.statusCode ?? profileData?.status;
		if (code === 200 || code === 201) {
			setBoostedProfile(profileData?.data ?? null);
		}
		dispatch(getProfileReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profileData, profileStatus]);

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

	// total tour steps: 3 without resume, 4 with resume (adds JD step)
	const tourTotal = uploadedFile ? 4 : 3;

	useEffect(() => {
		if (!showFindTour) { setTourBubblePos(null); setTourCardRect(null); return; }
		const jdStep  = uploadedFile ? 3 : null;
		const btnStep = uploadedFile ? 4 : 3;
		const selector =
			tourStep === 1 ? '.job-search-sidebar .skill-filter' :
			tourStep === 2 ? '#js-emp-work-filter' :
			tourStep === jdStep ? '.me-jd-row' :
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

	/* Fetch saved jobs on page load — profile is only fetched after resume upload */
	useEffect(() => {
		dispatch(getSavedJobs());
	}, []);

	/* Deep-link from Dashboard (e.g. /job-search?tab=matches) */
	useEffect(() => {
		const tab = new URLSearchParams(location.search).get('tab');
		if (tab === 'matches' || tab === 'saved' || tab === 'applied') {
			setActiveView(tab as ActiveView);
			if (tab === 'saved') {
				setSavedJobsPage(1);
				setSavedJobsTotal(0);
				dispatch(getSavedJobs({ pageId: 1, pageLimit: SAVED_PAGE_LIMIT }));
			}
		}
	}, [location]);

	/* One-time cleanup — remove any stale keys left by previous builds */
	useEffect(() => {
		sessionStorage.removeItem('jobSearch.appliedIds');
		sessionStorage.removeItem('jobSearch.savedIds');
	}, []);

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

	const { userEmail, userRole } = useMemo(() => {
		try {
			const token = sessionStorage.getItem('accessToken');
			if (!token) return { userEmail: '', userRole: 'Learner' };
			const data: any = decodeToken(token);
			return {
				userEmail: data?.email || data?.Email || '',
				userRole:  data?.RoleName || data?.role || 'Learner',
			};
		} catch {
			return { userEmail: '', userRole: 'Learner' };
		}
	}, []);

	const tokenAvailable = tokenDetails?.data?.availablePoints ?? 0;
	const tokenConsumed  = tokenDetails?.data?.consumePoints  ?? 0;
	const tokenTotal     = tokenAvailable + tokenConsumed;
	const tokenUsedPct   = tokenTotal > 0 ? Math.round((tokenConsumed / tokenTotal) * 100) : 0;

	const baseJobs = useMemo(() => {
		if (activeView === 'saved') {
			// Always use API data — never fall back to local savedIds
			return apiSavedJobs;
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
	}, [activeView, appliedIds, apiMatchedJobs, apiSavedJobs, submittedFilters]);

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
		// Mock jobs don't exist in the backend — saving them would always 404
		if (MOCK_JOB_IDS.has(id)) {
			message.info('Search for real jobs first to save them');
			return;
		}
		if (savedIds.has(id)) {
			dispatch(unsaveJob(id));
		} else {
			setSavedIds((prev) => { const n = new Set(prev); n.add(id); return n; });
			dispatch(saveJob(id));
		}
	}, [savedIds]);

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
		// Allow search when: title typed OR (resume/JD + at least one filter)
		const titleOk = titleInput.trim().length > 0;
		const inputOk = uploadedFile !== null || pastedJd.trim().length > 0 || titleOk;
		const filterOk = activeFilterCount > 0 || titleOk;
		if (!inputOk || !filterOk) return;
		setShowReviewModal(true);
	}, [titleInput, uploadedFile, pastedJd, activeFilterCount]);

	// API accepts exactly: 'junior' | 'mid' | 'senior' | 'lead'
	const mapExpLevel = (v: string | undefined): string | undefined => {
		if (!v) return undefined;
		const map: Record<string, string> = {
			entry:      'junior',
			internship: 'junior',   // closest API equivalent
			mid:        'mid',
			senior:     'senior',
			lead:       'lead',
			executive:  'lead',     // closest API equivalent
		};
		return map[v] ?? undefined;
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
		// Prefer fit_score (AI-computed) if available, then semantic score, then local overlap
		const fitScore: number | undefined = item.fit_score ?? item.fitScore;
		let matchScore: number | undefined = fitScore != null
			? fitScore
			: item.score != null
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
			badges:         item.badges || [],
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
			fitScore,
			fitBucket:        item.fit_bucket || item.fitBucket,
			fitExplanation:   item.explanation || item.fitExplanation,
			skillCoveragePct: item.skill_coverage_pct ?? item.skillCoveragePct,
			detail: {
				employmentType:   item.job_type || item.employment_type || '',
				posted:           item.posted_date || item.posted_at || item.postedAt || 'Recently',
				salary,
				experience:       item.experience || item.experience_level || undefined,
				applyUrl:         item.apply_url || item.applyUrl || item.source_url || undefined,
				description:      item.description_summary || item.description || item.job_description || '',
				responsibilities: item.what_youll_do || item.responsibilities || [],
				requirements:     item.requirements || [],
				niceToHave:       item.nice_to_have || [],
				skills,
				skillsMatched:    item.matched_skills || item.skills_matched || item.skillsMatched || [],
				skillGaps:        item.missing_skills || item.skill_gaps || item.skillGaps || [],
				interviewRounds:  item.interview_rounds || item.interviewRounds,
				skillsBreakdown:  item.skills_breakdown || item.skillsBreakdown,
			},
		};
	};

	const handleConfirmSearch = () => {
		setShowReviewModal(false);
		setListLoading(true);
		setSubmittedFilters({ empFilter, workFilter, expFilter, sectorFilter, skillsFilter });

		const locParts = [locationFilter.city, locationFilter.country].filter(Boolean);
		const locationStr = locParts.length ? locParts.join(', ') : undefined;

		const jd = pastedJd.trim();
		// Use 'description' mode when only JD is provided; otherwise 'title'
		const mode = jd && !uploadedFile ? 'description' : 'title';
		// mode='title': prefer user-typed title, else first skill, else generic fallback
		const query = mode === 'title'
			? (titleInput.trim() || (skillsFilter.length > 0 ? skillsFilter[0] : 'Software Engineer'))
			: undefined;

		// Build filters and strip any undefined/null keys before sending
		const rawFilters: Record<string, any> = {
			sector:           sectorFilter || undefined,
			work_mode:        mapWorkMode(workFilter),
			job_type:         mapJobType(empFilter),
			experience_level: mapExpLevel(expFilter),
			location:         locationStr,
			skills:           skillsFilter.length ? skillsFilter : undefined,
		};
		const filters = Object.fromEntries(
			Object.entries(rawFilters).filter(([, v]) => v !== undefined && v !== null)
		);

		dispatch(searchJobs({
			mode,
			query,
			description: jd || undefined,
			max_results: 20,
			...(Object.keys(filters).length > 0 && { filters }),
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

	const handleFullReset = useCallback(() => {
		Modal.confirm({
			title: 'Reset workspace?',
			icon: <MdRestartAlt size={22} style={{ color: '#ef4444', marginRight: 8, flexShrink: 0 }} />,
			content: (
				<div style={{ paddingTop: 4 }}>
					<p style={{ margin: '0 0 10px', color: '#475569', fontSize: 13 }}>
						This will clear all of the following:
					</p>
					<ul style={{ margin: 0, padding: '0 0 0 18px', color: '#64748b', fontSize: 12.5, lineHeight: 1.8 }}>
						<li>Uploaded resume &amp; detected skills</li>
						<li>Job title &amp; job description inputs</li>
						<li>All active filters (employment, work mode, experience, sector, skills)</li>
						<li>Location filter</li>
						<li>All matched job results</li>
					</ul>
					<p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>
						Your saved jobs and application tracker will not be affected.
					</p>
				</div>
			),
			okText: 'Yes, reset all',
			okButtonProps: { danger: true },
			cancelText: 'Cancel',
			onOk: () => {
				resetFilters();
				setTitleInput('');
				dispatch(resumeUploadReset());
				message.success('All prefilled data has been reset');
			},
		});
	}, [resetFilters, previewUrl]);

	// Opens /learn in a new tab with the textarea pre-filled.
	// Bridges the auth token to the new tab via a short-lived localStorage key
	// that PrivateRoute picks up and promotes to sessionStorage.
	const openLearnTab = (jd: string) => {
		const access  = sessionStorage.getItem('accessToken');
		const refresh = sessionStorage.getItem('refreshToken');
		if (access)  localStorage.setItem('_crossTabToken',   access);
		if (refresh) localStorage.setItem('_crossTabRefresh', refresh);
		localStorage.setItem('lpPrefillJd', jd);
		window.open('/learn', '_blank', 'noopener,noreferrer');
	};

	const openJobPreview = useCallback((job: JobItem) => {
		setPreviewJob(job);
		setLiveInterviewRounds([]);
		setInterviewDataAvailable(null);
		setInterviewNotFoundMsg(null);
		setInterviewDisclaimer(null);
		dispatch(getJobById(job.id));
		if (job.company && job.title) {
			dispatch(getInterviewRounds({ company: job.company, role: job.title }));
		}
	}, []);
	const closeJobPreview = useCallback(() => {
		setPreviewJob(null);
		setLiveInterviewRounds([]);
		setInterviewDataAvailable(null);
		setInterviewNotFoundMsg(null);
		setInterviewDisclaimer(null);
		dispatch(getJobByIdReset());
		dispatch(getInterviewRoundsReset());
	}, []);

	const showSkeleton = uiPreview === 'loading' || (listLoading && uiPreview === 'normal');
	const showSavedSkeleton = activeView === 'saved' && savedJobsStatus;
	const showError = uiPreview === 'error';
	const showForcedEmpty = uiPreview === 'empty';
	const listToRender = showForcedEmpty ? [] : filteredJobs;

	const isPristine = activeView === 'matches' && submittedFilters === null && !showSkeleton && !showError;
	const hasSearchInput = uploadedFile !== null || pastedJd.trim().length > 0 || titleInput.trim().length > 0;
	const canSearch     = hasSearchInput && (activeFilterCount > 0 || titleInput.trim().length > 0);
	// keep alias for backward compat with review-modal button
	const hasResumeOrJd = hasSearchInput;


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
					{ value: 'private',    label: 'Private (MNC / Startup / Corporate)' },
					{ value: 'public',     label: 'Public Sector / PSU' },
					{ value: 'government', label: 'Government / Govt Bodies' },
					{ value: 'freelance',  label: 'Freelance / Contract' },
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
									{(uploadedFile && boostedProfile) && (
										<span className="aip-banner-typing">Built by AI · from your previously uploaded resume</span>
									)}
								</div>
								<div className="job-search-profile-body">
									{/* Boost button */}
									<Tooltip
										placement="leftTop"
										overlayClassName="boost-tt-overlay"
										mouseEnterDelay={0.25}
										title={
											profileStatus ? (
												<div className="boost-tt">
													<span className="boost-tt-icon">⚡</span>
													<div className="boost-tt-copy">
														<p className="boost-tt-title">Building AI Profile…</p>
														<p className="boost-tt-sub">Scanning your resume for skills &amp; experience</p>
													</div>
												</div>
											) : boostedProfile ? (
												<div className="boost-tt">
													<span className="boost-tt-icon">✦</span>
													<div className="boost-tt-copy">
														<p className="boost-tt-title">AI Profile ready</p>
														<p className="boost-tt-sub">Your profile was built from your resume — click to view skills, experience &amp; more</p>
													</div>
												</div>
											) : (
												<div className="boost-tt">
													<span className="boost-tt-icon">🚀</span>
													<div className="boost-tt-copy">
														<p className="boost-tt-title">Build your AI Profile</p>
														<p className="boost-tt-sub">Upload a resume to extract your skills and power up job matching</p>
													</div>
												</div>
											)
										}
									>
										<div className={`boost-btn-wrap${profileStatus ? ' boost-btn-wrap--loading' : (uploadedFile && boostedProfile) ? ' boost-btn-wrap--active' : ''}`}>
											<span className="boost-ring" aria-hidden />
											<button
												type="button"
												className="boost-btn"
												onClick={() => setShowProfileModal(true)}
											>
												{profileStatus ? (
													<MdAutoAwesome size={16} className="boost-btn-icon" />
												) : boostedProfile ? (
													<><span className="boost-btn-star">✦</span><span className="boost-btn-label">AI</span></>
												) : (
													<><MdAutoAwesome size={14} className="boost-btn-icon" /><span className="boost-btn-label">AI</span></>
												)}
											</button>
										</div>
									</Tooltip>

									<Avatar size={64} className="job-search-profile-avatar">
										{(boostedProfile?.name || displayName).charAt(0).toUpperCase()}
									</Avatar>
									<div className="job-search-profile-name-row">
										<h2 className="job-search-profile-name">{boostedProfile?.name || displayName}</h2>
										<Tooltip title="Profile verified">
											<CheckCircleFilled className="job-search-profile-verified" aria-label="Verified" />
										</Tooltip>
									</div>
									<p className="job-search-profile-headline">
										{boostedProfile?.current_role || 'Building skills with Uden Tech learning paths'}
									</p>
									<p className="job-search-profile-location">
										<MdLocationOn size={13} className="profile-inline-icon profile-inline-icon--indigo" aria-hidden />
										{boostedProfile?.location || 'Bengaluru, Karnataka'}
									</p>
									{(uploadedFile && boostedProfile?.skills?.length > 0) && (
										<div className="boost-skills-preview">
											{boostedProfile.skills.slice(0, 5).map((s: string) => (
												<span key={s} className="boost-skill-chip">{s}</span>
											))}
											{boostedProfile.skills.length > 5 && (
												<span className="boost-skill-chip boost-skill-chip--more">+{boostedProfile.skills.length - 5} more</span>
											)}
										</div>
									)}
									<div className="profile-stats-row">
										<div className="profile-stat">
											<MdSend size={12} className="profile-stat-icon profile-stat-icon--indigo" />
											<span className="profile-stat-num">{appliedIds.size}</span>
											<span className="profile-stat-label">Applied</span>
										</div>
										<div className="profile-stat">
											<MdBookmark size={12} className="profile-stat-icon profile-stat-icon--violet" />
											<span className="profile-stat-num">{savedJobsTotal || apiSavedJobs.length}</span>
											<span className="profile-stat-label">Saved</span>
										</div>
									</div>
								</div>
							</section>


							<section ref={filterCardRef as React.RefObject<HTMLDivElement>} className={`job-search-card job-search-filters-card${filtersJustApplied ? ' js-filter-card--pulse' : ''}${showFindTour ? ' js-filter-card--tour-active' : ''}`} aria-label="Job filters">
								<div className="job-search-filters-card-head">
									<span className="filters-head-icon"><MdTune size={14} /></span>
									<h3 className="job-search-filters-card-title">Filters</h3>
									{activeFilterCount > 0 && (
										<span className="filters-active-badge">{activeFilterCount}</span>
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
											{submittedFilters !== null && apiMatchedJobs.length > 0 && (
												<span className="view-tab-count">{apiMatchedJobs.length}</span>
											)}
										</button>
										<button type="button"
											className={`view-tab view-tab--amber${activeView === 'saved' ? ' view-tab--active' : ''}`}
											onClick={() => {
												setActiveView('saved');
												// Fetch fresh from API — keep existing data visible while new data loads
												setSavedJobsPage(1);
												setSavedJobsTotal(0);
												dispatch(getSavedJobs({ pageId: 1, pageLimit: SAVED_PAGE_LIMIT }));
											}}>
											<span className="view-tab-icon"><MdBookmark size={13} /></span>
											<span className="view-tab-label">Saved</span>
											{(savedJobsTotal > 0 || apiSavedJobs.length > 0) && (
												<span className="view-tab-count">{savedJobsTotal || apiSavedJobs.length}</span>
											)}
										</button>
										<span className="view-tabs-divider" />
										<button type="button"
											className="view-tab view-tab--emerald"
											onClick={() => { dispatch(getTrackerApplications({ pageId: 1, pageLimit: TRACKER_PAGE_LIMIT })); setShowTrackerKanban(true); }}>
											<span className="view-tab-icon"><MdSend size={13} /></span>
											<span className="view-tab-label">Application Tracker</span>
											{appliedIds.size > 0 && <span className="view-tab-count">{appliedIds.size}</span>}
										</button>
									</div>
									<div className="job-search-feed-head-actions">
										<button
											type="button"
											className="job-search-reset-btn"
											onClick={handleFullReset}
											aria-label="Clear all filters and results"
										>
											<MdRestartAlt size={13} className="job-search-reset-btn-icon" />
											<span>Clear all</span>
										</button>
										<Button
											type="default"
											className="job-search-filters-mobile-trigger"
											onClick={() => setFilterDrawerOpen(true)}
										>
											<MdTune size={18} style={{ marginRight: 6 }} aria-hidden />
											Filters
										</Button>
									</div>
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
																		setBoostedProfile(null);
																		setDetectedFilters(null);
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

											{/* ── Title input + JD toggle row ── */}
											<div className="me-jd-row">
												<label className="me-title-input-wrap">
													<MdSearch size={11} className="me-title-icon" aria-hidden />
													<input
														type="text"
														className="me-title-input"
														placeholder="Job title..."
														value={titleInput}
														onChange={(e) => setTitleInput(e.target.value)}
													/>
													<span className="me-jd-optional">optional</span>
												</label>
												<span className="me-jd-row-line" aria-hidden />
												<button
													type="button"
													className={`me-jd-toggle${showJdSection ? ' me-jd-toggle--open' : ''}`}
													onClick={() => {
									jdOpenRef.current = !jdOpenRef.current;
									const next = jdOpenRef.current;
									jdSectionRef.current?.classList.toggle('me-jd-section--open', next);
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

										{/* COMMENTED — AI detected banner (auto-apply now happens on upload)
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
													<span className="js-ai-apply-tooltip" role="tooltip">
														<span className="js-ai-apply-tooltip-title">
															<span className="js-ai-apply-tooltip-icon"><MdBolt size={11} /></span>
															Apply AI filters
														</span>
														<p className="js-ai-apply-tooltip-desc">
															Instantly loads your detected skills, role type, and work mode into the search filters.
														</p>
														<span className="js-ai-apply-tooltip-hint">
															<MdBolt size={10} /> One click to refine your results
														</span>
													</span>
												</button>
													<button type="button" className="js-ai-skip-btn" onClick={() => setDetectedFilters(null)}>
														Skip
													</button>
												</div>
											</div>
										)}
									COMMENTED — end AI detected banner */}

										{/* ── Primary Find AI Matches CTA ── */}
										<div className="me-find-btn-wrap">
											<div className="me-find-trigger">
												<button
													ref={findBtnRef}
													type="button"
													className={`me-find-btn${listLoading ? ' me-find-btn--loading' : !canSearch ? ' me-find-btn--disabled' : ''}${filtersJustApplied ? ' me-find-btn--glow' : ''}`}
													disabled={listLoading || !canSearch}
													onClick={() => { setShowFindTour(false); handleFindJobs(); }}
												>
													{listLoading ? (
														<>
															<span className="me-find-btn-spinner" />
															<span>Searching…</span>
														</>
													) : (<>
														{!canSearch
															? <MdLockOutline size={15} className="me-find-btn-icon" />
															: <MdAutoAwesome size={15} className="me-find-btn-icon" />
														}
														<span>Find AI Matches</span>
														{activeFilterCount > 0 && (
															<span className="me-find-badge">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}</span>
														)}
													</>)}
												</button>
												{!canSearch && (<>
													<div className="me-find-tooltip" role="tooltip">
														<div className="me-tt-header">
															<span className="me-tt-lock-icon">🔐</span>
															<span className="me-tt-title">Unlock AI Matching</span>
														</div>
														<p className="me-tt-sub">Complete both steps to activate</p>
														<div className="me-tt-divider" />
														<div className="me-tt-checks">
															<div className={`me-tt-check${hasSearchInput ? ' me-tt-check--met' : ''}`}>
																<span className="me-tt-dot" />
																<span>Resume, JD, or job title entered</span>
															</div>
															<div className={`me-tt-check${(activeFilterCount > 0 || titleInput.trim().length > 0) ? ' me-tt-check--met' : ''}`}>
																<span className="me-tt-dot" />
																<span>At least 1 filter or job title entered</span>
															</div>
														</div>
													</div>
													<div className="me-find-tooltip-arrow" />
												</>)}
											</div>
											{!canSearch && (
												<p className="me-find-hint">
													{!hasSearchInput ? 'Upload a resume, paste a JD, or enter a job title' : 'Add at least one filter or enter a job title'}
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

								{showSavedSkeleton ? (
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
								) : null}

								{/* ── Applied pipeline cards — filtered by selected pipeline tab ── */}
								{activeView === 'applied' && !showSkeleton && !showError ? (() => {
									const STAGES = ['applied', 'screening', 'interview', 'offer'] as const;
									const stageJobs = trackerJobs.filter(j => (appStages[j.id] || 'applied') === pipelineTab);
									if (stageJobs.length === 0) return (
										<div className="job-search-empty-wrap">
											{trackerStatus
												? <Spin size="large" />
												: <Empty description={trackerJobs.length === 0 ? 'No applications yet — apply to roles and they will appear here' : `No jobs in the ${pipelineTab} stage`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
											}
										</div>
									);
									return (
										<ul className={`job-search-job-list${quickViewJobId ? ' job-search-job-list--panel-open' : ''}`}>
											{stageJobs.map((job) => {
												const currentIdx = STAGES.indexOf(appStages[job.id] || 'applied');
												const canAdvance = currentIdx < STAGES.length - 1;
												return (
										<li key={job.id} className={`job-search-job-row lineCard job-search-job-row--clickable${quickViewJobId === job.id ? ' job-search-job-row--quick-open' : ''}`} role="button" tabIndex={0}
											onClick={() => openJobPreview(job)}
											onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openJobPreview(job); } }}>
											<div className="job-search-job-actions">
												<Tooltip title={MOCK_JOB_IDS.has(job.id) ? 'Search for real jobs to save them' : savedIds.has(job.id) ? 'Remove from saved' : 'Save job'}>
													<button type="button"
														className={`job-search-job-save ${savedIds.has(job.id) ? 'job-search-job-save--on' : ''} ${unsavePendingId === job.id ? 'job-search-job-save--loading' : ''} ${MOCK_JOB_IDS.has(job.id) ? 'job-search-job-save--mock' : ''}`}
														aria-pressed={savedIds.has(job.id)}
														disabled={unsavePendingId === job.id || MOCK_JOB_IDS.has(job.id)}
														onClick={(e) => toggleSave(job.id, e)}>
														{unsavePendingId === job.id
															? <Spin size="small" />
															: <><span className="job-search-job-save-icon" aria-hidden>{savedIds.has(job.id) ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}</span><span className="job-search-job-save-label">{savedIds.has(job.id) ? 'Saved' : 'Save'}</span></>
														}
													</button>
												</Tooltip>
											
												<Tooltip title="Remove from tracker">
													<button
														type="button"
														className={`tracker-remove-btn${deleteTrackerStatus && trackerIdMap[job.id] === deleteTrackerPendingId ? ' tracker-remove-btn--loading' : ''}`}
														disabled={!!(deleteTrackerStatus && trackerIdMap[job.id] === deleteTrackerPendingId)}
														onClick={(e) => { e.stopPropagation(); const tid = trackerIdMap[job.id]; if (tid) dispatch(deleteTracker(tid)); }}
													>
														{deleteTrackerStatus && trackerIdMap[job.id] === deleteTrackerPendingId ? <Spin size="small" /> : <MdDelete size={16} />}
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
															onClick={(e) => {
																e.stopPropagation();
																const nextStage = STAGES[currentIdx + 1];
																setAppStages(prev => ({ ...prev, [job.id]: nextStage }));
																setPipelineTab(nextStage);
																const tid = trackerIdMap[job.id];
																if (tid) { const S: Record<string,string> = { applied:'applied', screening:'shortlisted', interview:'interviewing', offer:'offer' }; dispatch(updateTracker({ trackerId: tid, status: S[nextStage] as any })); }
															}}>
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
								{!showSkeleton && !showSavedSkeleton && !showError && activeView !== 'applied' ? (
									<ul className={`job-search-job-list${quickViewJobId ? ' job-search-job-list--panel-open' : ''}`}>
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
												className={`job-search-job-row lineCard job-search-job-row--clickable${quickViewJobId === job.id ? ' job-search-job-row--quick-open' : ''}`}
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
															className={`job-search-job-save ${savedIds.has(job.id) ? 'job-search-job-save--on' : ''} ${unsavePendingId === job.id ? 'job-search-job-save--loading' : ''} ${MOCK_JOB_IDS.has(job.id) ? 'job-search-job-save--mock' : ''}`}
															aria-pressed={savedIds.has(job.id)}
															aria-label={MOCK_JOB_IDS.has(job.id) ? 'Search for real jobs to save them' : savedIds.has(job.id) ? 'Remove from saved' : 'Save job'}
															disabled={unsavePendingId === job.id || MOCK_JOB_IDS.has(job.id)}
															onClick={(e) => toggleSave(job.id, e)}
														>
															{unsavePendingId === job.id
																? <Spin size="small" />
																: <><span className="job-search-job-save-icon" aria-hidden>{savedIds.has(job.id) ? <MdBookmark size={18} /> : <MdBookmarkBorder size={18} />}</span><span className="job-search-job-save-label">{savedIds.has(job.id) ? 'Saved' : 'Save'}</span></>
															}
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
														<Tooltip title="Build a learning path for this role" placement="top" mouseEnterDelay={0.5}>
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
								openLearnTab(job.detail.description ?? '');
							},
																});
															}}
														>
															<MdSchool size={12} />
															Learning Path
														</button>
														</Tooltip>

														{/* Click to open full detail — outside quick-wrap so it doesn't trigger panel */}
														<Tooltip title="View full job details" placement="top" mouseEnterDelay={0.5}>
															<button
																type="button"
																className="jc-vd-btn"
																onClick={(e) => { e.stopPropagation(); openJobPreview(job); }}
															>
																<MdDescription size={11} />
																View details
															</button>
														</Tooltip>

														{/* ── Quick view hover panel ── */}
														<div
															className="jc-quick-wrap"
															onMouseEnter={() => onQuickEnter(job.id)}
															onMouseLeave={onQuickLeave}
														>
															{/* Hover trigger */}
															<button
																type="button"
																className={`jc-quick-btn${quickViewJobId === job.id ? ' jc-quick-btn--active' : ''}`}
															>
																<MdBolt size={11} />
																Quick view
															</button>

															{/* Hover panel */}
															<div
																className={`jc-quick-panel${quickViewJobId === job.id ? ' jc-quick-panel--open' : ''}`}
																onMouseEnter={() => onQuickEnter(job.id)}
																onMouseLeave={onQuickLeave}
																onClick={(e) => e.stopPropagation()}
															>
																<div className="jc-quick-header">
																	<p className="jc-quick-title">
																		<MdBolt size={12} />
																		Skills snapshot
																	</p>
																</div>

																{/* AI Fit Score */}
																{(job.fitScore != null || job.matchScore != null) && (() => {
																	const displayScore = job.fitScore ?? job.matchScore ?? 0;
																	const bucketStr    = job.fitBucket || '';
																	const bucketCls    = bucketStr.toLowerCase().includes('strong') ? 'strong'
																		: bucketStr.toLowerCase().includes('high')   ? 'high'
																		: (bucketStr.toLowerCase().includes('medium') || bucketStr.toLowerCase().includes('moderate')) ? 'medium'
																		: bucketStr.toLowerCase().includes('good')   ? 'good'
																		: bucketStr ? 'low' : '';
																	const coveragePct  = job.skillCoveragePct ?? displayScore;
																	return (
																		<div className="jc-fit-row">
																			<div className="jc-fit-ring" style={{'--score': displayScore} as React.CSSProperties}>
																				<span className="jc-fit-num">{displayScore}%</span>
																			</div>
																			<div className="jc-fit-copy">
																				<p className="jc-fit-title">
																					<MdInsights size={10} />
																					{job.fitScore != null ? 'AI Fit Score' : 'Profile Match'}
																				</p>
																				{bucketCls && (
																					<span className={`jc-fit-bucket jc-fit-bucket--${bucketCls}`}>{bucketStr}</span>
																				)}
																				<div className="jc-coverage-wrap">
																					<div className="jc-coverage-track">
																						<div className="jc-coverage-fill" style={{width: `${coveragePct}%`}} />
																					</div>
																					<span className="jc-coverage-label">{coveragePct}% skill coverage</span>
																				</div>
																			</div>
																		</div>
																	);
																})()}

																{/* Required skills */}
																{(job.detail.skills?.length ?? 0) > 0 && (
																	<div className="jc-quick-section">
																		<p className="jc-quick-lbl jc-quick-lbl--required">Required skills</p>
																		<div className="jc-quick-pills">
																			{(job.detail.skills ?? []).slice(0, 5).map((s: string) => (
																				<span key={s} className="jc-quick-pill jc-quick-pill--required">{s}</span>
																			))}
																			{(job.detail.skills?.length ?? 0) > 5 && (
																				<span className="jc-quick-pill jc-quick-pill--more">+{(job.detail.skills?.length ?? 0) - 5}</span>
																			)}
																		</div>
																	</div>
																)}

																{((job.detail.skillsMatched?.length ?? 0) > 0 || (job.detail.skillGaps?.length ?? 0) > 0) ? (
																	<>
																		{(job.detail.skillsMatched?.length ?? 0) > 0 && (
																			<div className="jc-quick-section">
																				<p className="jc-quick-lbl jc-quick-lbl--match"><MdCheckCircle size={10} /> Matched</p>
																				<div className="jc-quick-pills">
																					{(job.detail.skillsMatched ?? []).slice(0, 5).map((s: string) => (
																						<span key={s} className="jc-quick-pill jc-quick-pill--match">{s}</span>
																					))}
																					{(job.detail.skillsMatched?.length ?? 0) > 5 && (
																						<span className="jc-quick-pill jc-quick-pill--more">+{(job.detail.skillsMatched?.length ?? 0) - 5}</span>
																					)}
																				</div>
																			</div>
																		)}
																		{(job.detail.skillGaps?.length ?? 0) > 0 && (
																			<div className="jc-quick-section">
																				<p className="jc-quick-lbl jc-quick-lbl--gap">
																					<MdTrendingUp size={10} /> Skill gaps
																					<span className="jc-quick-lbl-hint">tap to learn</span>
																				</p>
																				<div className="jc-quick-pills">
																					{(job.detail.skillGaps ?? []).slice(0, 5).map((s: string) => (
																						<button
																						key={s}
																						type="button"
																						className="jc-quick-pill jc-quick-pill--gap"
																						onClick={(e) => {
																							e.stopPropagation();
																							openLearnTab(`I want to learn ${s} to improve my career prospects and qualify for more roles.`);
																						}}
																					>
																						{s}<MdSchool size={9} />
																					</button>
																				))}
																				{(job.detail.skillGaps?.length ?? 0) > 5 && (
																					<span className="jc-quick-pill jc-quick-pill--more">+{(job.detail.skillGaps?.length ?? 0) - 5}</span>
																				)}
																			</div>
																			</div>
																		)}
																	</>
																) : (
																	<p className="jc-quick-empty">Run AI match to see skill insights for this role</p>
																)}

																<div className="jc-quick-actions">
																	<button type="button" className="jc-quick-act jc-quick-act--apply"
																		onClick={(e) => {
																			e.stopPropagation();
																			if (job.detail.applyUrl) window.open(job.detail.applyUrl, '_blank', 'noopener,noreferrer');
																			setPendingApplyJob(job);
																		}}>
																			<MdSend size={11} />{job.detail.applyUrl ? 'Apply →' : 'Apply'}
																	</button>
																	<button type="button" className="jc-quick-act jc-quick-act--learn"
																		onClick={(e) => {
																			e.stopPropagation();
																			openLearnTab(job.detail.description ?? '');
																		}}>
																			<MdSchool size={11} />Build skills
																	</button>
																</div>
															</div>
														</div>
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
										{showSkeleton || showError ? '—' : (
											<><MdListAlt size={13} style={{ marginRight: 3, verticalAlign: 'middle', color: '#6366f1' }} aria-hidden />
											{listToRender.length}
											{activeView === 'saved' && savedJobsTotal > 0 ? ` / ${savedJobsTotal}` : ''}
											{activeView === 'matches' && submittedFilters !== null && apiMatchedJobs.length > 0 ? ` of ${apiMatchedJobs.length}` : ''}
											{' '}role{listToRender.length === 1 ? '' : 's'}</>
										)}
									</span>
									{/* Load more — only for saved jobs (search uses max_results, no pagination) */}
									{activeView === 'saved' && (
										apiSavedJobs.length < savedJobsTotal ? (
											<Button
												type="link"
												className="job-search-show-all"
												loading={savedJobsStatus}
												onClick={() => dispatch(getSavedJobs({ pageId: savedJobsPage + 1, pageLimit: SAVED_PAGE_LIMIT }))}
											>
												Load more
											</Button>
										) : savedJobsTotal > 0 ? (
											<span className="job-search-all-loaded">All loaded</span>
										) : null
									)}
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
										{previewJob.fitScore != null ? (
											<span className="jd-match-badge">
												<MdInsights size={12} style={{marginRight:3,verticalAlign:'middle'}}/>
												{previewJob.fitScore}% fit
												{previewJob.fitBucket ? ` · ${previewJob.fitBucket}` : ''}
											</span>
										) : previewJob.matchScore != null ? (
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
{/* score bar removed — fit % already shown in header badge and ring */}
								</div>
							</div>

						</header>

						{/* ── Scrollable body — Skills + Fit + Rounds ── */}
						<div className="jd-body">

							{/* Left column */}
							<div className="jd-body-left">

							{/* About the role */}
							{!jobByIdStatus && previewJob.detail.description && (
								<div className="jd-section-block">
									<h4 className="jd-section-label">
										<span className="jd-section-icon jd-section-icon--violet"><MdDescription size={12}/></span>
										About the role
									</h4>
									<p style={{margin:0,fontSize:'13px',lineHeight:1.7,color:'#374151'}}>{previewJob.detail.description}</p>
								</div>
							)}

							{/* Requirements + What you'll do — side by side */}
							<div className="jd-two-col-block">
								{/* Requirements */}
								<div className="jd-two-col-section">
									<h4 className="jd-section-label">
										<span className="jd-section-icon jd-section-icon--violet"><MdFactCheck size={12}/></span>
										Requirements
									</h4>
									{jobByIdStatus ? (
										<Skeleton active title={false} paragraph={{ rows: 4, width: ['100%','90%','95%','80%'] }} />
									) : (previewJob.detail.requirements ?? []).length > 0 ? (
										<ul className="jd-req-list">
											{(previewJob.detail.requirements ?? []).map((r: string) => (
												<li key={r} className="jd-req-item">
													<span className="jd-req-check"><MdCheckCircle size={13}/></span>
													{r}
												</li>
											))}
										</ul>
									) : (
										<p style={{fontSize:'12.5px',color:'#94a3b8',margin:0}}>No requirements listed.</p>
									)}
								</div>

								{/* What you'll do */}
								<div className="jd-two-col-section">
									<h4 className="jd-section-label">
										<span className="jd-section-icon jd-section-icon--violet"><MdOutlineAssignment size={12}/></span>
										What you&apos;ll do
									</h4>
									{jobByIdStatus ? (
										<Skeleton active title={false} paragraph={{ rows: 5, width: ['100%','90%','95%','85%','80%'] }} className="jd-resp-skel" />
									) : previewJob.detail.responsibilities?.length > 0 ? (
										<ul className="jd-head-resp-list">
											{previewJob.detail.responsibilities.map((r) => (
												<li key={r}>{r}</li>
											))}
										</ul>
									) : (
										<p style={{fontSize:'12.5px',color:'#94a3b8',margin:0}}>No responsibilities listed for this role.</p>
									)}
								</div>
							</div>

							{/* Skills */}
							<div className="jd-skills-section">
								<h4 className="jd-section-label">
									<span className="jd-section-icon jd-section-icon--violet"><MdCode size={12}/></span>
									Skills required
								</h4>
								{jobByIdStatus ? (
									<div className="jd-skills-row">
										{[80,65,90,55,75,70,60].map((w, i) => (
											<Skeleton.Button key={i} active size="small" style={{ width: w, borderRadius: 8 }} />
										))}
									</div>
								) : (
									<div className="jd-skills-row">
										{previewJob.detail.skills.map((s) => (
											<span key={s} className="job-search-preview-skill">{s}</span>
										))}
									</div>
								)}
							</div>

							{/* Interview rounds — left column, below skills */}
							<div className="jd-section-block jd-section-block--rounds">
								<h4 className="jd-section-label">
									<span className="jd-section-icon jd-section-icon--violet"><MdEmojiEvents size={12}/></span>
									Interview rounds
								</h4>
								{interviewRoundsStatus ? (
									<Skeleton active paragraph={{ rows: 4 }} title={{ width: '55%' }} />
								) : interviewDataAvailable === false ? (
									<div className="jd-rounds-not-found">
										<p className="jd-rounds-nf-title">No verified rounds found</p>
										{interviewNotFoundMsg && <p className="jd-rounds-nf-msg">{interviewNotFoundMsg}</p>}
									</div>
								) : (() => {
									const rounds = liveInterviewRounds.length > 0 ? liveInterviewRounds : previewJob.detail.interviewRounds ?? [];
									if (rounds.length === 0 && interviewDataAvailable === null) return <p style={{fontSize:'12.5px',color:'#94a3b8',margin:0}}>Interview data loading…</p>;
									const TYPE_COLOR: Record<string, string> = { hr:'#06b6d4', technical:'#6366f1', case:'#f59e0b', behavioral:'#10b981', onsite:'#8b5cf6', assignment:'#f97316', screening:'#06b6d4' };
									return (
										<div className="jd-ivc-list">
											{rounds.map((rd: any, i: number) => {
												const accent = TYPE_COLOR[(rd.type ?? '').toLowerCase()] ?? '#6366f1';
												const learnText = [rd.name, rd.description, rd.tips].filter(Boolean).join('\n\n');
												return (
													<div key={rd.round ?? i} className="jd-ivc-card" style={{ '--ivc-accent': accent } as React.CSSProperties}>
														<div className="jd-ivc-card-left">
															<span className="jd-ivc-badge" style={{ background: accent }}>{rd.round ?? i + 1}</span>
															<div className="jd-ivc-connector" aria-hidden />
														</div>
														<div className="jd-ivc-card-body">
															<div className="jd-ivc-header">
																<span className="jd-ivc-name">{rd.name}</span>
																{rd.type && <span className="jd-ivc-type-chip" style={{ color: accent, borderColor: accent, background: `${accent}18` }}>{rd.type}</span>}
															</div>
															{rd.duration && <span className="jd-ivc-duration"><MdAccessTime size={11} style={{ marginRight:4, verticalAlign:'middle' }}/>{rd.duration}</span>}
															{rd.description && <p className="jd-ivc-desc">{rd.description}</p>}
															{rd.tips && <div className="jd-ivc-tips"><span className="jd-ivc-tips-label">💡 Tip</span><p className="jd-ivc-tips-text">{rd.tips}</p></div>}
															<button type="button" className="jd-ivc-learn-btn" style={{ '--ivc-accent': accent } as React.CSSProperties} onClick={() => openLearnTab(learnText)}>
																<MdSchool size={13} style={{ marginRight:5 }}/>Learn this round →
															</button>
														</div>
													</div>
												);
											})}
										</div>
									);
								})()}
							</div>

							</div>{/* end jd-body-left */}

							{/* Right column — AI Fit only */}
							<div className="jd-panels-stack">

							{/* Your fit — full row */}
							<div className="jd-panel jd-panel--fit jd-panel--full">
									<h3 className="jd-panel-title">
										<MdWorkspacePremium size={16} className="jd-panel-title-icon jd-panel-title-icon--gold"/>
										Your fit
									</h3>

									{jobByIdStatus ? <Skeleton active paragraph={{ rows: 7 }} title={{ width: '55%' }} /> : <>
									{/* Score ring — prefer fitScore (AI), fall back to matchScore */}
									{(previewJob.fitScore != null || previewJob.matchScore != null) ? (() => {
										const displayScore = previewJob.fitScore ?? previewJob.matchScore ?? 0;
										const bucketStr    = previewJob.fitBucket || '';
										const bucketCls    = bucketStr.toLowerCase().includes('strong') ? 'strong'
											: bucketStr.toLowerCase().includes('high')   ? 'high'
											: bucketStr.toLowerCase().includes('medium') || bucketStr.toLowerCase().includes('moderate') ? 'medium'
											: bucketStr ? 'low' : '';
										return (
											<div className="jd-fit-score-row">
												<div className="jd-fit-score-ring" style={{'--score': displayScore} as React.CSSProperties}>
													<span className="jd-fit-score-num">{displayScore}%</span>
												</div>
												<div className="jd-fit-score-copy">
													<p className="jd-fit-score-title">
														{previewJob.fitScore != null ? 'AI Fit Score' : 'Profile match score'}
													</p>
													{bucketCls && (
														<span className={`jd-fit-bucket jd-fit-bucket--${bucketCls}`}>
															{bucketStr}
														</span>
													)}
													{previewJob.skillCoveragePct != null && (
														<div className="jd-coverage-wrap">
															<div className="jd-coverage-track">
																<div className="jd-coverage-fill" style={{width: `${previewJob.skillCoveragePct}%`}} />
															</div>
															<span className="jd-coverage-label">{previewJob.skillCoveragePct}% skill coverage</span>
														</div>
													)}
												</div>
											</div>
										);
									})() : null}

									{/* Skills breakdown — use skills_breakdown if available, else matched/gaps */}
									{previewJob.detail.skillsBreakdown?.length ? (() => {
										const matched  = previewJob.detail.skillsBreakdown!.filter(s => s.matched);
										const gaps     = previewJob.detail.skillsBreakdown!.filter(s => !s.matched);
										return (
											<>
												{matched.length > 0 && (
													<div className="jd-fit-group">
														<p className="jd-fit-label jd-fit-label--match">
															<MdThumbUp size={12}/> Skills matched
														</p>
														<div className="jd-fit-pills">
															{matched.map(({skill}) => (
																<span key={skill} className="jd-fit-pill jd-fit-pill--match">
																	<MdCheckCircle size={11}/>{skill}
																</span>
															))}
														</div>
													</div>
												)}
												{gaps.length > 0 && (
													<div className="jd-fit-group">
														<p className="jd-fit-label jd-fit-label--gap">
															<MdWarning size={12}/> Skill gaps
															<span className="jd-gap-count">{gaps.length}</span>
														</p>
														<div className="jd-fit-pills">
															{gaps.map(({skill, explanation}) => (
																<button
																	key={skill}
																	type="button"
																	className="jd-fit-pill jd-fit-pill--gap-learn"
																	onClick={() => {
																		const text = explanation?.trim()
																			? `I want to learn ${skill}. ${explanation.trim()}`
																			: `I want to learn ${skill} to improve my career prospects and qualify for more roles.`;
																		openLearnTab(text);
																	}}
																>
																	<MdSchool size={11}/>
																	{skill}
																	<MdAutoGraph size={10} className="jd-gap-chip-learn-icon"/>
																	<span className="jd-gap-chip-tooltip">
																		<span className="jd-gap-chip-tooltip-icon">✦</span>
																		Learn <strong>{skill}</strong> now
																		<span className="jd-gap-chip-tooltip-arrow">→</span>
																	</span>
																</button>
															))}
														</div>
													</div>
												)}
											</>
										);
									})() : (
										<>
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
										</>
									)}

									{/* AI analysis — single string (fitExplanation) or legacy list */}
									{previewJob.fitExplanation ? (
										<div className="jd-fit-group">
											<p className="jd-fit-label"><MdAutoAwesome size={12}/> AI analysis</p>
											<p className="jd-fit-explanation">{previewJob.fitExplanation}</p>
										</div>
									) : previewJob.matchReasons?.length ? (
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
								</>}
								</div>


							</div>{/* end jd-panels-stack */}

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
									}
									setPendingApplyJob(previewJob);
								}}
							>
								<span className="jd-action-icon jd-action-icon--apply">{appliedIds.has(previewJob.id) ? <MdCheckCircle size={16}/> : <MdRocketLaunch size={16}/>}</span>
								<span className="jd-action-text">
									<span className="jd-action-label">{appliedIds.has(previewJob.id) ? 'Applied ✓' : 'Apply now'}</span>
									<span className="jd-action-sub">{previewJob.detail.applyUrl ? '→ company site' : '→ tracker'}</span>
								</span>
							</button>

							<button
								type="button"
								className={`jd-action-btn jd-action-btn--save ${savedIds.has(previewJob.id) ? 'jd-action-btn--saved' : ''} ${unsavePendingId === previewJob.id ? 'jd-action-btn--loading' : ''} ${MOCK_JOB_IDS.has(previewJob.id) ? 'jd-action-btn--mock' : ''}`}
								disabled={unsavePendingId === previewJob.id || MOCK_JOB_IDS.has(previewJob.id)}
								onClick={() => toggleSave(previewJob.id)}>
								{unsavePendingId === previewJob.id
									? <Spin size="small" />
									: <><span className="jd-action-icon jd-action-icon--save">{savedIds.has(previewJob.id) ? <MdBookmark size={16}/> : <MdBookmarkBorder size={16}/>}</span><span className="jd-action-text"><span className="jd-action-label">{savedIds.has(previewJob.id) ? 'Saved' : 'Save for later'}</span><span className="jd-action-sub">→ saved list</span></span></>
								}
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
									openLearnTab(jdText);
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

			{/* ── "Did you apply?" confirmation modal ── */}
			<Modal
				open={!!pendingApplyJob}
				onCancel={() => setPendingApplyJob(null)}
				footer={null}
				width={400}
				centered
				closable
				className="apply-confirm-modal"
			>
				{pendingApplyJob && (
					<div className="acm-wrap">
						<div className="acm-icon-ring">
							<MdRocketLaunch size={24} />
						</div>
						<h3 className="acm-title">Did you apply?</h3>
						<p className="acm-sub">Confirm your application and we'll track it in your pipeline.</p>
						<div className="acm-job-pill">
							<span className="acm-job-title">{pendingApplyJob.title}</span>
							<span className="acm-job-company">{pendingApplyJob.company}</span>
						</div>
						<div className="acm-actions">
							<button
								type="button"
								className="acm-btn acm-btn--yes"
								disabled={addToTrackerStatus}
								onClick={() => {
									dispatch(addToTracker({ job_id: pendingApplyJob.id, status: 'applied' }));
								}}
							>
								{addToTrackerStatus
									? <Spin size="small" />
									: <><MdCheckCircle size={15} /> Yes, I Applied</>
								}
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

			{/* ── AI Filter Review Modal ── */}
			<Modal
				open={showReviewModal}
				onCancel={() => setShowReviewModal(false)}
				footer={null}
				width={720}
				centered
				className="js-review-modal"
				closeIcon={<IoClose size={18} />}
			>
				<div className="js-review-body">
					<div className="js-review-hero">
						<div className="js-review-hero-icon"><MdAutoAwesome size={24} /></div>
						<div className="js-review-hero-copy">
							<p className="js-review-eyebrow">AI Match Engine</p>
							<h2 className="js-review-title">Review your search</h2>
							<p className="js-review-sub">Make sure these look right before we run the search.</p>
						</div>
						<div className="js-review-count-badge">
							<MdTune size={13} />
							{activeFilterCount > 0
								? `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active`
								: titleInput.trim() ? 'Title search' : '0 filters'
							}
						</div>
					</div>

					<div className="js-review-filters">
						{/* Always show title row if user typed one */}
						{titleInput.trim() && (
							<div className="js-review-row">
								<span className="js-review-row-label">Job title</span>
								<span className="js-review-chip js-review-chip--indigo">
									<MdSearch size={10} />{titleInput.trim()}
								</span>
							</div>
						)}

						{/* No-filter notice — only when searching by title alone */}
						{activeFilterCount === 0 && titleInput.trim() && (
							<div className="js-review-no-filter">
								<InfoCircleTwoTone twoToneColor="#6366f1" />
								<div className="js-review-nf-copy">
									<p className="js-review-nf-title">No filters applied</p>
									<p className="js-review-nf-sub">Results will be broad — add filters to narrow your matches. You can still go ahead.</p>
								</div>
							</div>
						)}

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
									<MdFactory size={10} />{SECTOR_META[sectorFilter] ?? sectorFilter}
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

			{/* ── AI Profile Panel (UserInfo-style, left side) ── */}
			{showProfileModal && ReactDOM.createPortal(
				<>
					{/* Backdrop */}
					<div className={`aip-backdrop${closingProfile ? ' aip-backdrop--out' : ''}`} onClick={closeProfilePanel} />

					{/* PS5-style close button — fixed, RIGHT of panel, outside */}
					<button
						type="button"
						className={`aip-close-btn${closingProfile ? ' aip-close-btn--out' : ''}`}
						onClick={closeProfilePanel}
						aria-label="Close AI profile"
					>
						<span className="aip-close-orb" aria-hidden>
							<span className="aip-close-ring aip-close-ring--3" />
							<span className="aip-close-ring aip-close-ring--2" />
							<span className="aip-close-ring aip-close-ring--1" />
							<span className="aip-close-face">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
									<line x1="4" y1="4" x2="16" y2="16" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
									<line x1="16" y1="4" x2="4" y2="16" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
								</svg>
							</span>
						</span>
						<span className="aip-close-label" aria-hidden>CLOSE</span>
					</button>

					{/* Panel */}
					<div className={`aip-panel${closingProfile ? ' aip-panel--out' : ''}`} onClick={(e) => e.stopPropagation()}>
						{profileStatus ? (
							<div className="aip-loading">
								<Spin size="large" />
								<p>Loading AI Profile…</p>
							</div>
						) : (uploadedFile && boostedProfile) ? (
							<>
								{/* ── Sticky header: banner + avatar only ── */}
								<div className="aip-panel-header">
									<div className="aip-banner" aria-hidden>
										<div className="aip-banner-orb aip-banner-orb--1" />
										<div className="aip-banner-orb aip-banner-orb--2" />
										<span className="aip-banner-typing">Built by AI · from your previously uploaded resume</span>
										<div className="aip-banner-badge">
											<MdAutoAwesome size={11} /> AI Profile
										</div>
									</div>
									<div className="aip-avatar-wrap">
										<div className="aip-avatar">
											{(boostedProfile.name || displayName).charAt(0).toUpperCase()}
										</div>
										<span className="aip-ai-dot" aria-label="AI Powered" />
									</div>
								</div>{/* end aip-panel-header */}

								{/* ── Scrollable body (identity + all content) ── */}
								<div className="aip-panel-body">

								{/* Identity */}
								<div className="aip-identity">
									<div className="aip-name-row">
										<span className="aip-name">{boostedProfile.name || displayName}</span>
										<MdVerified className="aip-verified" />
									</div>
									{boostedProfile.current_role && (
										<p className="aip-role">{boostedProfile.current_role}</p>
									)}
									{boostedProfile.summary && (
										<p className="aip-bio">{boostedProfile.summary}</p>
									)}
									<div className="aip-pills">
										{boostedProfile.career_level && (
											<span className="aip-pill aip-pill--indigo">
												<MdLeaderboard size={10} />{boostedProfile.career_level}
											</span>
										)}
										{boostedProfile.location && (
											<span className="aip-pill aip-pill--cyan">
												<MdLocationOn size={10} />{boostedProfile.location}
											</span>
										)}
										{boostedProfile.total_experience_years != null && (
											<span className="aip-pill aip-pill--emerald">
												<MdAccessTime size={10} />{boostedProfile.total_experience_years} yrs exp
											</span>
										)}
									</div>
								</div>

								{/* Stats row */}
								<div className="aip-stats-row">
									<div className="aip-stat">
										<span className="aip-stat-num">{boostedProfile.skills?.length ?? 0}</span>
										<span className="aip-stat-label">Skills</span>
									</div>
									<div className="aip-stat-divider" />
									<div className="aip-stat">
										<span className="aip-stat-num">{boostedProfile.total_experience_years ?? '—'}</span>
										<span className="aip-stat-label">Yrs Exp</span>
									</div>
									<div className="aip-stat-divider" />
									<div className="aip-stat">
										<span className="aip-stat-num">{boostedProfile.certifications?.length ?? 0}</span>
										<span className="aip-stat-label">Certs</span>
									</div>
								</div>

								{/* Skills */}
								{boostedProfile.skills?.length > 0 && (
									<div className="aip-section">
										<h4 className="aip-section-title"><MdCode size={13} /> Skills</h4>
										<div className="aip-chips">
											{boostedProfile.skills.map((s: string) => (
												<span key={s} className="aip-chip aip-chip--skill">{s}</span>
											))}
										</div>
									</div>
								)}

								{/* Technologies */}
								{boostedProfile.technologies?.length > 0 && (
									<div className="aip-section">
										<h4 className="aip-section-title"><MdLaptop size={13} /> Technologies</h4>
										<div className="aip-chips">
											{boostedProfile.technologies.map((t: string) => (
												<span key={t} className="aip-chip aip-chip--tech">{t}</span>
											))}
										</div>
									</div>
								)}

								{/* Preferred Roles */}
								{boostedProfile.preferred_roles?.length > 0 && (
									<div className="aip-section">
										<h4 className="aip-section-title"><MdWorkOutline size={13} /> Preferred Roles</h4>
										<div className="aip-chips">
											{boostedProfile.preferred_roles.map((r: string) => (
												<span key={r} className="aip-chip aip-chip--role">{r}</span>
											))}
										</div>
									</div>
								)}

								{/* Industries */}
								{boostedProfile.industries?.length > 0 && (
									<div className="aip-section">
										<h4 className="aip-section-title"><MdBusiness size={13} /> Industries</h4>
										<div className="aip-chips">
											{boostedProfile.industries.map((ind: string) => (
												<span key={ind} className="aip-chip aip-chip--industry">{ind}</span>
											))}
										</div>
									</div>
								)}

								{/* Education */}
								{boostedProfile.education?.length > 0 && (
									<div className="aip-section">
										<h4 className="aip-section-title"><MdSchool size={13} /> Education</h4>
										{boostedProfile.education.map((edu: any, i: number) => {
											// API returns strings: "Degree | School, Location"
											const isStr = typeof edu === 'string';
											const [degree, school] = isStr
												? edu.split('|').map((s: string) => s.trim())
												: [edu.degree, edu.school];
											return (
												<div key={i} className="aip-edu-item">
													<span className="aip-edu-degree">{degree}</span>
													{school && <span className="aip-edu-school">{school}</span>}
													{!isStr && edu.year && <span className="aip-edu-year">{edu.year}</span>}
												</div>
											);
										})}
									</div>
								)}

								{/* Certifications */}
								{boostedProfile.certifications?.length > 0 && (
									<div className="aip-section">
										<h4 className="aip-section-title"><MdWorkspacePremium size={13} /> Certifications</h4>
										{boostedProfile.certifications.map((cert: string, i: number) => (
											<div key={i} className="aip-cert-item">
												<MdCheckCircle size={11} className="aip-cert-check" />
												<span>{cert}</span>
											</div>
										))}
									</div>
								)}

								</div>{/* end aip-panel-body */}
							</>
						) : (
							<div className="aip-locked">
								<div className="aip-locked-icon-wrap" aria-hidden>
									<span className="aip-locked-orb aip-locked-orb--1" />
									<span className="aip-locked-orb aip-locked-orb--2" />
									<MdLockOutline size={28} className="aip-locked-icon" />
								</div>
								<h3 className="aip-locked-title">Upload Resume to Unlock</h3>
								<p className="aip-locked-sub">
									Your AI profile extracts skills, experience &amp; certifications from your resume — powering smarter job matches.
								</p>
								<button
									type="button"
									className="aip-locked-cta"
									onClick={() => {
										setShowProfileModal(false);
										document.querySelector('.match-engine-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
									}}
								>
									<MdFileUpload size={14} /> Upload Resume
								</button>
							</div>
						)}
					</div>
				</>,
				document.body
			)}
		{/* ── Application Tracker Kanban Modal ── */}
		<Modal
			title={null}
			footer={null}
			visible={showTrackerKanban}
			onCancel={() => setShowTrackerKanban(false)}
			width="96vw"
			style={{ top: 16, paddingBottom: 0 }}
			centered
			destroyOnClose={false}
			className="tracker-kanban-modal"
			wrapClassName="tracker-kanban-modal-wrap"
			closeIcon={<IoClose size={18} />}
		>
			{(() => {
				const KANBAN_STAGES = ['applied','screening','interview','offer'] as const;
				const STAGE_CFG = {
					applied:   { label: 'Applied',   color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <MdSend size={14}/> },
					screening: { label: 'Screening', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <MdListAlt size={14}/> },
					interview: { label: 'Interview', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: <MdPsychology size={14}/> },
					offer:     { label: 'Offer',     color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: <MdEmojiEvents size={14}/> },
				};
				const STATUS_MAP: Record<string,string> = { applied:'applied', screening:'shortlisted', interview:'interviewing', offer:'offer' };

				return (
					<div className="tracker-kanban">
						{/* Header */}
						<div className="tracker-kanban-header">
							<div style={{ flex: 1, minWidth: 0 }}>
								<div className="tracker-kanban-title">
									<MdSend size={18} />
									Application Tracker
									{appliedIds.size > 0 && <span className="tracker-kanban-count">{appliedIds.size}</span>}
									<span className="tracker-kanban-view-label">Kanban View</span>
								</div>
								<p className="tracker-kanban-sub">Track your job applications across every stage of the hiring process</p>
							</div>
							<span className="tracker-kanban-dnd-hint">
								<MdSyncAlt size={13} /> Drag &amp; drop to move
							</span>
						</div>

						{/* Columns */}
						<div className="tracker-kanban-columns">
							{KANBAN_STAGES.map((stage) => {
								const cfg = STAGE_CFG[stage];
								const jobs = trackerJobs.filter(j => (appStages[j.id] ?? 'applied') === stage);
								const isDragOver = dragOverCol === stage;
								const VISIBLE_LIMIT = 5;
								const hasOverflow = jobs.length > VISIBLE_LIMIT;

								return (
									<div
										key={stage}
										className={`tracker-kanban-col${isDragOver ? ' tracker-kanban-col--drag-over' : ''}${hasOverflow ? ' tracker-kanban-col--scrollable' : ''}`}
										data-kanban-col={stage}
										style={isDragOver ? { outline: `2px dashed ${cfg.color}`, outlineOffset: '-2px', borderRadius: '12px' } : undefined}
									>
										{/* Column header */}
										<div className="tracker-kanban-col-head" style={{ borderColor: cfg.border }}>
											<span className="tracker-kanban-col-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</span>
											<span className="tracker-kanban-col-label" style={{ color: cfg.color }}>{cfg.label}</span>
											<span className="tracker-kanban-col-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{jobs.length}</span>
										</div>

										{/* Cards */}
										<div className="tracker-kanban-cards" onScroll={handleKanbanScroll}>
											{trackerStatus && jobs.length === 0 ? (
												<div className="tracker-kanban-loading"><Spin size="small" /></div>
											) : jobs.length === 0 ? (
												<div className="tracker-kanban-empty">
													<span style={{ color: cfg.color, opacity: 0.4, fontSize: 28 }}>{cfg.icon}</span>
													<p>No applications</p>
												</div>
											) : jobs.map((job) => {
												const currentIdx = KANBAN_STAGES.indexOf(appStages[job.id] ?? 'applied');
												const canAdvance = currentIdx < KANBAN_STAGES.length - 1;
												const nextStage = canAdvance ? KANBAN_STAGES[currentIdx + 1] : null;
												const nextCfg = nextStage ? STAGE_CFG[nextStage] : null;

												return (
													<div
														key={job.id}
														className={`tracker-kanban-card${dragJobId === job.id ? ' tracker-kanban-card--dragging' : ''}`}
														style={dragJobId === job.id ? { opacity: 0, pointerEvents: 'none' } : undefined}
														onMouseDown={(e) => {
															e.preventDefault();
															const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
															setDragMeta({ offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, w: rect.width, h: rect.height });
															setDragPos({ x: e.clientX, y: e.clientY });
															setDragJobId(job.id);
														}}
														onClick={() => { if (!dragJobId) openJobPreview(job); }}
													>
														{/* Card top */}
														<div className="tracker-kanban-card-top">
															<span className="tracker-kanban-card-stage-pill" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
																{cfg.icon} {cfg.label}
															</span>
															<button
																type="button"
																className="tracker-kanban-card-remove"
																onClick={(e) => { e.stopPropagation(); const tid = trackerIdMap[job.id]; if (tid) dispatch(deleteTracker(tid)); }}
																title="Remove"
															>
																<MdDelete size={13} />
															</button>
														</div>

														{/* Company + title */}
														<div className="tracker-kanban-card-identity">
															<div className="tracker-kanban-card-logo" style={{ background: `linear-gradient(135deg, hsl(${job.logoHue},70%,52%), hsl(${job.logoHue+40},65%,42%))` }}>
																{job.company.charAt(0)}
															</div>
															<div>
																<p className="tracker-kanban-card-title">{job.title}</p>
																<p className="tracker-kanban-card-company">{job.company} · {job.location}</p>
															</div>
														</div>

														{/* Meta row */}
														<div className="tracker-kanban-card-meta">
															{job.detail?.employmentType && <span className="tracker-kanban-meta-chip">{job.detail.employmentType}</span>}
															{job.workMode && <span className="tracker-kanban-meta-chip">{job.workMode}</span>}
															{job.matchScore != null && <span className="tracker-kanban-meta-chip tracker-kanban-meta-chip--fit">{job.matchScore}% fit</span>}
														</div>

														{/* Stage progress dots */}
														<div className="tracker-kanban-card-footer" onClick={(e) => e.stopPropagation()}>
															<div className="tracker-kanban-footer-row">
																<div className="tracker-kanban-progress">
																	{KANBAN_STAGES.map((s, si) => {
																		const isActive = s === (appStages[job.id] ?? 'applied');
																		const isPast = si < currentIdx;
																		const sCfg = STAGE_CFG[s];
																		return (
																			<div key={s} className="tracker-kanban-progress-step">
																				<div
																					className="tracker-kanban-progress-dot"
																					style={isActive ? { background: sCfg.color, boxShadow: `0 0 0 2px ${sCfg.bg}` } : isPast ? { background: '#10b981' } : { background: '#e2e8f0' }}
																				/>
																				{si < KANBAN_STAGES.length - 1 && (
																					<div className="tracker-kanban-progress-line" style={{ background: isPast ? '#10b981' : '#e2e8f0' }} />
																				)}
																			</div>
																		);
																	})}
																	<span className="tracker-kanban-progress-label" style={{ color: cfg.color }}>{cfg.label}</span>
																</div>
																<button
																	type="button"
																	className="tracker-kanban-view-btn"
																	onMouseDown={(e) => e.stopPropagation()}
																	onClick={(e) => { e.stopPropagation(); openJobPreview(job); }}
																>
																	<MdDescription size={11} /> View details
																</button>
															</div>
														</div>
													</div>
												);
											})}
										</div>
										{/* Overflow within loaded cards */}
										{hasOverflow && (
											<div className="tracker-kanban-col-overflow">
												↕ Scroll to see all {jobs.length} in this stage
											</div>
										)}

										{/* Global load-more hint — only show on last column */}
										{stage === 'offer' && !trackerLoadingMore && trackerJobs.length < trackerTotal && (
											<div className="tracker-kanban-load-more" style={{ borderTop: '1px solid #f1f5f9' }}>
												<span style={{ color: '#94a3b8', fontSize: 11 }}>
													↓ Scroll any column · {trackerTotal - trackerJobs.length} more to load
												</span>
											</div>
										)}

										{/* Spinner while loading next page */}
										{stage === 'offer' && trackerLoadingMore && (
											<div className="tracker-kanban-load-more">
												<Spin size="small" /> Loading more…
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				);
			})()}

			{/* Floating drag card portal — fully opaque, follows cursor */}
			{dragJobId && dragPos && dragMeta && (() => {
				const dj = trackerJobs.find(j => j.id === dragJobId);
				if (!dj) return null;
				return ReactDOM.createPortal(
					<div style={{
						position: 'fixed',
						left: dragPos.x - dragMeta.offsetX,
						top: dragPos.y - dragMeta.offsetY,
						width: dragMeta.w,
						zIndex: 99999,
						pointerEvents: 'none',
						transform: 'rotate(3deg) scale(1.05)',
						boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
						borderRadius: '8px',
						background: '#fff',
						border: '1px solid #94a3b8',
						padding: '9px 10px',
					}}>
						<div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
							<div style={{ width:28, minWidth:28, height:28, borderRadius:6, background:`linear-gradient(135deg, hsl(${dj.logoHue},70%,52%), hsl(${dj.logoHue+40},65%,42%))`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:12, flexShrink:0 }}>
								{dj.company.charAt(0)}
							</div>
							<div style={{ minWidth:0, flex:1, overflow:'hidden' }}>
								<p style={{ margin:'0 0 2px', fontSize:12, fontWeight:600, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{dj.title}</p>
								<p style={{ margin:0, fontSize:10.5, color:'#64748b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{dj.company} · {dj.location}</p>
							</div>
						</div>
					</div>,
					document.body
				);
			})()}
		</Modal>

		</>
	);
}

export default JobSearch;
