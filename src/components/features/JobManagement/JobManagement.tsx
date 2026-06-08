import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { getAdminJobs, getAdminJobsReset } from '../../../redux/features/admin/getAdminJobsSlice';
import { editAdminJob, editAdminJobReset } from '../../../redux/features/admin/editAdminJobSlice';
import { postAdminJob, postAdminJobReset } from '../../../redux/features/admin/postAdminJobSlice';
import { deleteAdminJob, deleteAdminJobReset } from '../../../redux/features/admin/deleteAdminJobSlice';
import { getBrokenLinks, getBrokenLinksReset } from '../../../redux/features/admin/getBrokenLinksSlice';
import { getAdminStats, getAdminStatsReset } from '../../../redux/features/admin/getAdminStatsSlice';
import { extractJobUrl, extractJobUrlReset } from '../../../redux/features/admin/extractJobUrlSlice';
import { fixBrokenUrl, fixBrokenUrlReset } from '../../../redux/features/admin/fixBrokenUrlSlice';
import { checkUrl, checkUrlReset } from '../../../redux/features/admin/checkUrlSlice';
import {
	Button,
	Switch,
	Input,
	Modal,
	Form,
	Row,
	Col,
	Tooltip,
	message,
	Popconfirm,
	Progress,
	Avatar,
	Select,
	Skeleton,
	Tag,
	Empty,
	Pagination,
	Spin
} from 'antd';
import {
	MdWorkOutline,
	MdAdd,
	MdEdit,
	MdDeleteOutline,
	MdVisibilityOff,
	MdVisibility,
	MdBarChart,
	MdSearch,
	MdBusiness,
	MdLink,
	MdHistory,
	MdListAlt,
	MdAutoAwesome,
	MdTrendingUp,
	MdMonitorHeart,
	MdOutlineSecurity,
	MdRestartAlt,
	MdCircle,
	MdLocationOn,
	MdPeople,
	MdCalendarToday,
	MdOpenInNew,
	MdCheckCircle,
	MdRemoveRedEye,
	MdFilterList,
	MdLaptopMac,
	MdVerified,
	MdStar,
	MdInfo,
	MdAccessTime,
	MdWork,
	MdSchool,
	MdAttachMoney,
	MdLinkOff,
	MdEditNote,
	MdOpenInNew as MdOpenInNewIcon,
	MdInsights,
	MdWorkspacePremium,
	MdEmojiEvents,
	MdBookmark,
	MdCloudDownload,
	MdCheckCircleOutline,
} from 'react-icons/md';
import { motion, easeInOut } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import './job-management.css';
import '../JobSearch/job-search.css';
import '../../../styles/phase2-theme.css';
import '../../../styles/dashboard-arena.css';


interface JobEntry {
	id: string;
	title: string;
	company: string;
	location: string;
	status: 'active' | 'disabled';
	visibility: 'visible' | 'hidden';
	applyLink: string;
	applicants: number;
	postedOn: string;
	description: string;
	responsibilities: string[];
	workMode: 'remote' | 'hybrid' | 'onsite';
	employmentType: 'full-time' | 'part-time' | 'contract';
	salary: string;
	skills: string[];
	logoHue: number;
	badges?: string[];
	// API-sourced extras
	experience?: string;
	experienceLevel?: string;
	sourceKind?: string;
	urlStatus?: string;
	urlNote?: string;
	sector?: string;
	requirements?: string[];
	niceToHave?: string[];
	skillsExplanations?: Record<string, string>;
	source?: string;
	cachedAt?: string;
	currency?: string;
}

const MOCK_ADMIN_JOBS: JobEntry[] = [
	{
		id: '1',
		title: 'Frontend Engineer II',
		company: 'Amazon',
		location: 'Bengaluru, India',
		status: 'active',
		visibility: 'visible',
		applyLink: 'https://amazon.jobs/123',
		applicants: 45,
		postedOn: '2026-05-01',
		logoHue: 220,
		workMode: 'hybrid',
		employmentType: 'full-time',
		salary: '₹28L – ₹42L / yr',
		badges: ['Promoted', 'Easy apply'],
		description: 'Join Amazon\'s consumer UI platform team to build next-generation shopping experiences used by hundreds of millions of customers worldwide. You\'ll work on high-impact surfaces including the product detail page, checkout, and post-order flows.',
		responsibilities: [
			'Build and maintain scalable React components for Amazon\'s core shopping surfaces',
			'Collaborate with design systems team to implement accessible, pixel-perfect UIs',
			'Optimize rendering performance for sub-100ms interactions at massive scale',
			'Participate in code reviews, architecture discussions, and on-call rotations'
		],
		skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'CSS-in-JS', 'Jest']
	},
	{
		id: '2',
		title: 'Senior React Developer',
		company: 'Uden Tech',
		location: 'Remote',
		status: 'active',
		visibility: 'visible',
		applyLink: 'https://uden.tech/careers/2',
		applicants: 128,
		postedOn: '2026-05-05',
		logoHue: 260,
		workMode: 'remote',
		employmentType: 'full-time',
		salary: '$95K – $130K / yr',
		badges: ['New posting', 'Leadership'],
		description: 'We\'re building the future of AI-powered career acceleration and need a senior React developer to lead our learner-facing product. You\'ll own the frontend architecture of our learning path engine and job-match interface.',
		responsibilities: [
			'Lead frontend development of the Uden Tech learner platform and admin tooling',
			'Design and implement the component design system from scratch',
			'Integrate AI-powered APIs for job matching, skill gap analysis, and path generation',
			'Mentor junior engineers and define frontend best practices across the team'
		],
		skills: ['React', 'TypeScript', 'Redux Toolkit', 'Ant Design', 'Framer Motion', 'REST/AI APIs']
	},
	{
		id: '3',
		title: 'UI Engineer',
		company: 'Stripe',
		location: 'Dublin, Ireland',
		status: 'disabled',
		visibility: 'visible',
		applyLink: 'https://stripe.com/jobs/3',
		applicants: 12,
		postedOn: '2026-04-28',
		logoHue: 160,
		workMode: 'hybrid',
		employmentType: 'full-time',
		salary: '€80K – €110K / yr',
		badges: [],
		description: 'Stripe\'s UI Engineering team crafts the interfaces that power global internet commerce. As a UI Engineer you\'ll work closely with product designers and backend engineers to build the Dashboard — the primary surface used by millions of businesses to run their payments infrastructure.',
		responsibilities: [
			'Build and ship high-quality product features in the Stripe Dashboard',
			'Work with product designers to refine interaction patterns and visual specifications',
			'Write robust, well-tested React code with a focus on maintainability',
			'Contribute to Stripe\'s internal design system and component libraries'
		],
		skills: ['React', 'TypeScript', 'CSS Modules', 'Storybook', 'Playwright', 'Figma']
	},
	{
		id: '4',
		title: 'Product Engineer',
		company: 'Linear',
		location: 'San Francisco, CA',
		status: 'active',
		visibility: 'hidden',
		applyLink: 'https://linear.app/jobs/4',
		applicants: 89,
		postedOn: '2026-05-03',
		logoHue: 200,
		workMode: 'onsite',
		employmentType: 'full-time',
		salary: '$140K – $180K / yr',
		badges: ['Promoted'],
		description: 'Linear is building the future of software project management. As a Product Engineer you\'ll own full feature areas from database schema through to polished UI, working in a small and exceptionally high-bar team that ships fast and maintains a remarkably clean codebase.',
		responsibilities: [
			'Own complete features end-to-end: schema design, API, and UI implementation',
			'Maintain and improve Linear\'s real-time sync engine and offline-first architecture',
			'Work directly with users to understand pain points and iterate quickly',
			'Help define engineering standards and patterns used across the entire product'
		],
		skills: ['React', 'TypeScript', 'GraphQL', 'PostgreSQL', 'Electron', 'Figma']
	}
];

const WORK_MODE_LABELS: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };
const EMP_LABELS: Record<string, string> = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract' };

// Helper: map a raw API job to JobEntry shape
function mapApiToJobEntry(job: any, idx: number): JobEntry {
	const badges: string[] = [];
	if (job.url_status === 'valid') badges.push('Verified');
	if (job.source === 'ai_discovered') badges.push('AI Found');
	const recentWords = ['today', 'yesterday', '1 day', '2 days', '3 days'];
	if (recentWords.some((w) => (job.posted_date || '').toLowerCase().includes(w))) badges.push('New');
	if (job.experience_level) badges.push(job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1));

	return {
		id:             job.job_id || job._id || String(idx),
		title:          job.title || 'Untitled Role',
		company:        job.company || 'Unknown Company',
		location:       job.location || '',
		status:         'active',
		visibility:     'visible',
		applyLink:      job.apply_url || job.source_url || '',
		applicants:     0,
		postedOn:       job.posted_date || job.cached_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
		description:    job.description || job.description_summary || '',
		responsibilities: job.what_youll_do || [],
		workMode:       (['remote', 'hybrid', 'onsite'].includes(job.work_mode) ? job.work_mode : 'hybrid') as 'remote' | 'hybrid' | 'onsite',
		employmentType: (job.job_type === 'full-time' || job.job_type === 'part-time' || job.job_type === 'contract' ? job.job_type : 'full-time') as 'full-time' | 'part-time' | 'contract',
		salary:         job.salary_range || '',
		skills:         job.skills_required || [],
		logoHue:        (idx * 47 + 180) % 360,
		badges,
		experience:          job.experience || undefined,
		experienceLevel:     job.experience_level || undefined,
		sourceKind:          job.source_kind || undefined,
		urlStatus:           job.url_status || undefined,
		urlNote:             job.url_note || undefined,
		sector:              job.sector || undefined,
		requirements:        job.requirements?.length ? job.requirements : undefined,
		niceToHave:          job.nice_to_have?.length ? job.nice_to_have : undefined,
		skillsExplanations:  job.skills_explanations && Object.keys(job.skills_explanations).length ? job.skills_explanations : undefined,
		source:              job.source || undefined,
		cachedAt:            job.cached_at || undefined,
		currency:            job.currency || undefined,
	};
}

// ── Parse a raw description blob into structured sections ──────────────────
function parseJobDescription(raw: string): { about: string; responsibilities: string[]; requirements: string[] } {
	if (!raw) return { about: '', responsibilities: [], requirements: [] };

	// Normalize: unify line endings + replace all curly/smart apostrophes → straight '
	const text = raw
		.replace(/\r\n/g, '\n')
		.replace(/[‘’‚′″]/g, "'")
		.trim();

	const ABOUT_SRC = "about (?:the )?(?:role|position|job)|about this (?:role|position)|the role|overview";
	const RESP_SRC  = "what you'?ll do|what you will do|responsibilities|key responsibilities|your responsibilities|job duties";
	const REQ_SRC   = "requirements|qualifications|what you have|what you need|what you bring|what we'?re looking for|basic qualifications|preferred qualifications|minimum qualifications|must[- ]have";
	const SKIP_SRC  = "nice[- ]to[- ]have|benefits|perks|compensation|about (?:the )?(?:company|us)|our story|who we are";

	const IS_ABOUT = new RegExp(ABOUT_SRC, 'i');
	const IS_RESP  = new RegExp(RESP_SRC,  'i');
	const IS_REQ   = new RegExp(REQ_SRC,   'i');
	const IS_SKIP  = new RegExp(SKIP_SRC,  'i');

	// helper: first 3 sentences of a text block
	const cap3 = (s: string): string => {
		const sents = s.match(/[^.!?]+[.!?]+\s*/g) ?? [];
		return sents.length > 3
			? sents.slice(0, 3).join('').trim() + '…'
			: s.trim();
	};

	// ── Strategy 1: multi-line with standalone section headers ──
	const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
	if (lines.length > 2) {
		type Sec = 'about' | 'resp' | 'req' | 'skip';
		let sec: Sec = 'about';
		let found = false;
		const about: string[] = [], resp: string[] = [], req: string[] = [];

		for (const line of lines) {
			const bare = line.replace(/^[-•*·→►▸>]\s*/, '').replace(/:$/, '').trim();
			if (bare.length < 80 && IS_ABOUT.test(bare)) { sec = 'about'; found = true; continue; }
			if (bare.length < 80 && IS_RESP.test(bare))  { sec = 'resp';  found = true; continue; }
			if (bare.length < 80 && IS_REQ.test(bare))   { sec = 'req';   found = true; continue; }
			if (bare.length < 80 && IS_SKIP.test(bare))  { sec = 'skip';  found = true; continue; }
			const clean = line.replace(/^[-•*·→►▸>]\s*/, '').trim();
			if (sec === 'about') about.push(clean);
			else if (sec === 'resp') resp.push(clean);
			else if (sec === 'req')  req.push(clean);
		}
		if (found) return { about: cap3(about.join(' ')), responsibilities: resp, requirements: req };
	}

	// ── Strategy 2: one big paragraph — collect ALL section header positions first ──
	const INLINE_SRC = `(${ABOUT_SRC}|${RESP_SRC}|${REQ_SRC}|${SKIP_SRC})\\s*:`;
	const INLINE_RE  = new RegExp(INLINE_SRC, 'gi');
	const allHits: Array<{ index: number; matchLen: number; header: string }> = [];
	let m: RegExpExecArray | null;
	while ((m = INLINE_RE.exec(text)) !== null) {
		allHits.push({ index: m.index, matchLen: m[0].length, header: m[1] });
	}

	if (allHits.length > 0) {
		const toItems = (s: string): string[] =>
			s.split(/\.\s+(?=[A-Z])|\n+/)
			 .map(l => l.replace(/^[-•*·]\s*/, '').trim())
			 .filter(l => l.length > 8 && l.length < 400);

		const intro   = text.slice(0, allHits[0].index).trim();
		const segs    = allHits.map((h, i) => ({
			header: h.header,
			body:   text.slice(h.index + h.matchLen, i + 1 < allHits.length ? allHits[i + 1].index : text.length).trim(),
		}));

		const aboutSeg = segs.find(s => IS_ABOUT.test(s.header));
		const respSeg  = segs.find(s => IS_RESP.test(s.header));
		const reqSeg   = segs.find(s => IS_REQ.test(s.header));

		return {
			about:            cap3(aboutSeg ? aboutSeg.body : intro),
			responsibilities: respSeg ? toItems(respSeg.body) : [],
			requirements:     reqSeg  ? toItems(reqSeg.body)  : [],
		};
	}

	// ── Fallback: no sections found — show first 3 sentences only ──
	return { about: cap3(text), responsibilities: [], requirements: [] };
}

const JobManagement = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();

	const { adminJobsData, status: adminJobsStatus, error: adminJobsError } = useSelector(
		(state: any) => state.getAdminJobsReducer
	);
	const { editAdminJobData, status: editAdminJobStatus, error: editAdminJobError } = useSelector(
		(state: any) => state.editAdminJobReducer
	);
	const { postAdminJobData, status: postAdminJobStatus, error: postAdminJobError } = useSelector(
		(state: any) => state.postAdminJobReducer
	);

	const { deleteAdminJobData, status: deleteAdminJobStatus, error: deleteAdminJobError, pendingJobId: deletePendingJobId } = useSelector(
		(state: any) => state.deleteAdminJobReducer
	);


	const { adminStatsData, status: adminStatsStatus, error: adminStatsError } = useSelector(
		(state: any) => state.getAdminStatsReducer
	);
	const [platformStats, setPlatformStats] = useState<{
		totalJobs: number; adminPosted: number; aiDiscovered: number; trackerEntries: number; savedJobs: number;
	} | null>(null);

	// ── Import from URL ──
	const { extractJobUrlData, status: extractJobUrlStatus, error: extractJobUrlError } = useSelector(
		(state: any) => state.extractJobUrlReducer
	);
	const [importUrlModal, setImportUrlModal] = useState(false);
	const [importUrl, setImportUrl] = useState('');
	const [importUrlError, setImportUrlError] = useState('');
	const [isImported, setIsImported] = useState(false);

	const { brokenLinksData, status: brokenLinksStatus, error: brokenLinksError } = useSelector(
		(state: any) => state.getBrokenLinksReducer
	);
	const [brokenLinks, setBrokenLinks] = useState<any[]>([]);
	const [brokenLinksTotal, setBrokenLinksTotal] = useState(0);
	const [brokenLinksPage, setBrokenLinksPage] = useState(1);
	const BROKEN_PAGE_LIMIT = 10;
	const PAGE_LIMIT = 10;

	const { fixBrokenUrlData, status: fixBrokenUrlStatus, error: fixBrokenUrlError, pendingJobId: fixPendingJobId } = useSelector(
		(state: any) => state.fixBrokenUrlReducer
	);
	const [fixUrlInputs, setFixUrlInputs] = useState<Record<string, string>>({});
	const { checkUrlData, status: checkUrlStatus, error: checkUrlError } = useSelector(
		(state: any) => state.checkUrlReducer
	);
	// Per-job check results: { [job_id]: { live, status_code, message, checkingJobId } }
	const [checkResults, setCheckResults] = useState<Record<string, any>>({});
	const [checkingJobId, setCheckingJobId] = useState<string | null>(null);
	const [fixModalJob, setFixModalJob] = useState<any | null>(null);
	const [fixModalUrl, setFixModalUrl] = useState('');
	const [fixModalCheckResult, setFixModalCheckResult] = useState<any | null>(null);

	const [jobs, setJobs] = useState<JobEntry[]>([]);
	const [adminPage, setAdminPage] = useState(1);
	const [adminTotal, setAdminTotal] = useState(0);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingJob, setEditingJob] = useState<JobEntry | null>(null);
	const [activeTab, setActiveTab] = useState('1');
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [visibilityFilter, setVisibilityFilter] = useState<string[]>([]);
	const [workModeFilter, setWorkModeFilter] = useState<string[]>([]);
	const [empTypeFilter, setEmpTypeFilter] = useState<string[]>([]);
	const [applicantsFilter, setApplicantsFilter] = useState<string>('');
	const [postedFilter, setPostedFilter] = useState<string>('');
	const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [previewJob, setPreviewJob] = useState<JobEntry | null>(null);
	const [showFullAbout, setShowFullAbout] = useState(false);
	const parsedDesc = useMemo(() => parseJobDescription(previewJob?.description ?? ''), [previewJob?.description]);
	// reset expansion whenever a different job is opened
	useEffect(() => { setShowFullAbout(false); }, [previewJob?.id]);

	const [deleteConfirmJob, setDeleteConfirmJob] = useState<JobEntry | null>(null);
	// Ref holds latest filter values so the debounced fn always reads fresh state
	const filtersRef = useRef({ workModeFilter, empTypeFilter, skillsFilter });
	filtersRef.current = { workModeFilter, empTypeFilter, skillsFilter };

	// Helper to build API params from current filter ref + a given page
	const buildParams = (page: number, title?: string) => {
		const { workModeFilter: wm, empTypeFilter: et, skillsFilter: sk } = filtersRef.current;
		return {
			pageId:    page,
			pageLimit: PAGE_LIMIT,
			title:     (title ?? '').trim() || undefined,
			work_mode: wm.length === 1 ? wm[0] : undefined,
			job_type:  et.length === 1 ? et[0] : undefined,
			skills:    sk.length > 0   ? sk.join(',') : undefined,
		};
	};

	// Debounce ref for search input (no lodash dependency)
	const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const debouncedTitleSearch = (title: string) => {
		if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
		searchTimerRef.current = setTimeout(() => {
			setAdminPage(1);
			dispatch(getAdminJobs(buildParams(1, title)));
		}, 500);
	};

	// Initial fetch on mount
	useEffect(() => {
		dispatch(getAdminJobs(buildParams(1)));
		dispatch(getAdminStats());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Handle admin stats API response
	useEffect(() => {
		if (adminStatsStatus) return;
		if (!adminStatsData && !adminStatsError) return;

		if (adminStatsError && !adminStatsData) {
			dispatch(getAdminStatsReset());
			return;
		}

		const code = adminStatsData?.statusCode ?? adminStatsData?.status;
		if (code === 200) {
			const d = adminStatsData?.data ?? {};
			setPlatformStats({
				totalJobs:       d.jobs?.total          ?? 0,
				adminPosted:     d.jobs?.admin_posted   ?? 0,
				aiDiscovered:    d.jobs?.ai_discovered  ?? 0,
				trackerEntries:  d.tracker_entries      ?? 0,
				savedJobs:       d.saved_jobs           ?? 0,
			});
		}
		dispatch(getAdminStatsReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminStatsData, adminStatsStatus, adminStatsError]);

	// ── Extract Job URL response handler ──
	// Helper: pull the best human-readable message from any error shape
	const extractErrMsg = (data: any, fallback: string): string => {
		if (!data) return fallback;
		if (typeof data.message === 'string' && data.message) return data.message;
		if (typeof data.detail === 'string'  && data.detail)  return data.detail;
		if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
		const code = data.statusCode ?? data.status;
		if (code === 400) return 'Invalid request — please check the URL format.';
		if (code === 401 || code === 403) return 'Access denied — this page requires login or is behind a paywall.';
		if (code === 404) return 'Job posting not found — the URL may be outdated or removed.';
		if (code === 422) return 'Could not process the URL — make sure it points to a public job posting.';
		if (code >= 500) return 'Server error — please try again in a moment.';
		return fallback;
	};

	useEffect(() => {
		if (extractJobUrlStatus) return;
		if (!extractJobUrlData && !extractJobUrlError) return;

		// Any error (network, 4xx, 5xx) — extractJobUrlError is set; data may also be set to the error body
		if (extractJobUrlError) {
			const msg = extractErrMsg(extractJobUrlData, extractJobUrlError || 'Failed to extract job details.');
			setImportUrlError(msg);
			dispatch(extractJobUrlReset());
			return;
		}

		const code = extractJobUrlData?.statusCode ?? extractJobUrlData?.status;
		if (code === 200) {
			if (!extractJobUrlData?.data?.extracted) {
				setImportUrlError(extractJobUrlData?.message || 'Could not extract job details from this URL. The page may require login or be behind a paywall.');
				dispatch(extractJobUrlReset());
				return;
			}
			const ext = extractJobUrlData?.data?.extracted ?? {};

			// Normalize enum fields — AI may return combined strings like "contract | full-time"
			const validJobTypes   = ['full-time', 'part-time', 'contract', 'internship'];
			const validWorkModes  = ['remote', 'hybrid', 'onsite'];
			const validExpLevels  = ['junior', 'mid', 'senior', 'lead', 'executive'];

			const pickFirst = (raw: string | undefined, allowed: string[]): string | undefined => {
				if (!raw) return undefined;
				const lower = raw.toLowerCase().trim();
				if (allowed.includes(lower)) return lower;
				return raw.toLowerCase().split(/[\|,\/&\+\s]+/).map(s => s.trim()).find(p => allowed.includes(p)) ?? undefined;
			};

			// Pre-fill the existing Add Job form with extracted data
			form.setFieldsValue({
				title:            ext.title            ?? '',
				company:          ext.company          ?? '',
				location:         ext.location         ?? '',
				work_mode:        pickFirst(ext.work_mode,        validWorkModes),
				job_type:         pickFirst(ext.job_type,         validJobTypes),
				experience_level: pickFirst(ext.experience_level, validExpLevels),
				salary_range:     ext.salary_range     ?? undefined,
				apply_url:        ext.apply_url        ?? ext.source_url ?? '',
				skills_required:  ext.skills_required  ?? [],
				description:      ext.description      ?? '',
			});
			setIsImported(true);
			setEditingJob(null);
			setImportUrlModal(false);
			setIsModalVisible(true);
		} else {
			setImportUrlError(extractJobUrlData?.message || 'Could not extract job details from this URL');
		}
		dispatch(extractJobUrlReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [extractJobUrlData, extractJobUrlStatus, extractJobUrlError]);

	// Fetch whenever page number changes (page button click)
	useEffect(() => {
		dispatch(getAdminJobs(buildParams(adminPage, searchText)));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminPage]);

	// Instant refetch when dropdown filters (work mode / job type / skills) change
	useEffect(() => {
		setAdminPage(1);
		dispatch(getAdminJobs(buildParams(1, searchText)));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workModeFilter, empTypeFilter, skillsFilter]);

	// Handle admin jobs API response
	useEffect(() => {
		if (adminJobsStatus) return;
		if (!adminJobsData && !adminJobsError) return;

		if (adminJobsError && !adminJobsData) {
			message.error(adminJobsError || 'Failed to load jobs');
			dispatch(getAdminJobsReset());
			return;
		}

		const code = adminJobsData?.statusCode ?? adminJobsData?.status;

		if (code === 200 || code === 201) {
			const rawJobs: any[] = adminJobsData?.data?.jobs ?? adminJobsData?.jobs ?? [];
			const total: number  = adminJobsData?.data?.total ?? adminJobsData?.total ?? rawJobs.length;
			const mapped = rawJobs.map((job, idx) => mapApiToJobEntry(job, idx));
			setJobs(mapped);
			setAdminTotal(total);
		} else if (code === 400) {
			message.warning(adminJobsData?.message || 'Bad request');
		} else if (code === 401 || code === 403) {
			message.error('Unauthorized — admin access required');
		} else if (code === 500) {
			message.error(adminJobsData?.message || 'Server error');
		}

		dispatch(getAdminJobsReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminJobsData, adminJobsStatus, adminJobsError]);

	// Handle edit job API response
	useEffect(() => {
		if (editAdminJobStatus) return;
		if (!editAdminJobData && !editAdminJobError) return;

		if (editAdminJobError && !editAdminJobData) {
			message.error(editAdminJobError || 'Failed to update job');
			dispatch(editAdminJobReset());
			return;
		}

		const code = editAdminJobData?.statusCode ?? editAdminJobData?.status;

		if (code === 200 || code === 201) {
			message.success('Job updated successfully!');
			// Refresh the list with current filters
			dispatch(getAdminJobs(buildParams(adminPage, searchText)));
			setIsModalVisible(false);
			setEditingJob(null);
			form.resetFields();
		} else if (code === 400) {
			message.warning(editAdminJobData?.message || 'Invalid data');
		} else if (code === 401 || code === 403) {
			message.error('Unauthorized');
		} else if (code === 404) {
			message.error('Job not found');
		} else if (code === 500) {
			message.error(editAdminJobData?.message || 'Server error');
		}

		dispatch(editAdminJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editAdminJobData, editAdminJobStatus, editAdminJobError]);

	// Handle post (create) job API response
	useEffect(() => {
		if (postAdminJobStatus) return;
		if (!postAdminJobData && !postAdminJobError) return;

		if (postAdminJobError && !postAdminJobData) {
			message.error(postAdminJobError || 'Failed to create job');
			dispatch(postAdminJobReset());
			return;
		}

		const code = postAdminJobData?.statusCode ?? postAdminJobData?.status;

		if (code === 200 || code === 201) {
			message.success('Job posted successfully!');
			dispatch(getAdminJobs(buildParams(1, searchText)));
			setAdminPage(1);
			setIsModalVisible(false);
			setEditingJob(null);
			form.resetFields();
		} else if (code === 400) {
			message.warning(postAdminJobData?.message || 'Invalid data — check all required fields');
		} else if (code === 401 || code === 403) {
			message.error('Unauthorized');
		} else if (code === 409) {
			message.warning(postAdminJobData?.message || 'A job with this title already exists');
		} else if (code === 500) {
			message.error(postAdminJobData?.message || 'Server error');
		}

		dispatch(postAdminJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postAdminJobData, postAdminJobStatus, postAdminJobError]);


	// Handle delete job API response
	useEffect(() => {
		if (deleteAdminJobStatus) return;
		if (!deleteAdminJobData && !deleteAdminJobError) return;

		if (deleteAdminJobError && !deleteAdminJobData) {
			message.error(deleteAdminJobError || 'Failed to delete job');
			dispatch(deleteAdminJobReset());
			return;
		}

		const code = deleteAdminJobData?.statusCode ?? deleteAdminJobData?.status;

		if (code === 200 || code === 201) {
			message.success('Job deleted successfully');
			// Remove from local list immediately for instant feedback
			const deletedId = deleteAdminJobData?.jobId;
			if (deletedId) setJobs(prev => prev.filter(j => j.id !== deletedId));
			// Refresh from API to sync pagination
			dispatch(getAdminJobs(buildParams(adminPage, searchText)));
		} else if (code === 400) {
			message.warning(deleteAdminJobData?.message || 'Bad request');
		} else if (code === 401 || code === 403) {
			message.error('Unauthorized — admin access required');
		} else if (code === 404) {
			message.warning('Job not found — it may have already been deleted');
			dispatch(getAdminJobs(buildParams(adminPage, searchText)));
		} else if (code === 500) {
			message.error(deleteAdminJobData?.message || 'Server error');
		}

		dispatch(deleteAdminJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteAdminJobData, deleteAdminJobStatus, deleteAdminJobError]);

	// Fetch broken links when tab 3 is active
	useEffect(() => {
		if (activeTab !== '3') return;
		dispatch(getBrokenLinks({ pageId: brokenLinksPage, pageLimit: BROKEN_PAGE_LIMIT }));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab, brokenLinksPage]);

	// Handle broken links response
	useEffect(() => {
		if (brokenLinksStatus) return;
		if (!brokenLinksData && !brokenLinksError) return;

		if (brokenLinksError && !brokenLinksData) {
			message.error(brokenLinksError || 'Failed to fetch broken links');
			dispatch(getBrokenLinksReset());
			return;
		}

		const code = brokenLinksData?.statusCode ?? brokenLinksData?.status;
		if (code === 200 || code === 201) {
			const urls: any[] = brokenLinksData?.data?.urls ?? [];
			const total: number = brokenLinksData?.data?.total ?? urls.length;
			setBrokenLinks(urls);
			setBrokenLinksTotal(total);
		} else if (code === 400) {
			message.warning(brokenLinksData?.message || 'Bad request');
		} else if (code === 500) {
			message.error(brokenLinksData?.message || 'Server error');
		}
		dispatch(getBrokenLinksReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [brokenLinksData, brokenLinksStatus, brokenLinksError]);
		const now = new Date();

	// Handle fix broken URL response
	useEffect(() => {
		if (fixBrokenUrlStatus) return;
		if (!fixBrokenUrlData && !fixBrokenUrlError) return;

		if (fixBrokenUrlError && !fixBrokenUrlData) {
			message.error(fixBrokenUrlError || 'Failed to fix URL');
			dispatch(fixBrokenUrlReset());
			return;
		}

		const code = fixBrokenUrlData?.statusCode ?? fixBrokenUrlData?.status;
		if (code === 200 || code === 201) {
			message.success('URL updated — refreshing list…');
			// Clear this job's input and re-fetch latest broken links
			const fixedId = fixBrokenUrlData?.jobId;
			setFixModalJob(null); setFixModalUrl('');
			setFixModalCheckResult(null);
			dispatch(getBrokenLinks({ pageId: brokenLinksPage, pageLimit: BROKEN_PAGE_LIMIT }));
		} else if (code === 400) {
			message.warning(fixBrokenUrlData?.message || 'Invalid URL');
		} else if (code === 404) {
			message.warning('Job not found');
		} else if (code === 500) {
			message.error(fixBrokenUrlData?.message || 'Server error');
		}
		dispatch(fixBrokenUrlReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fixBrokenUrlData, fixBrokenUrlStatus, fixBrokenUrlError]);


	// Handle check URL response
	useEffect(() => {
		if (checkUrlStatus) return;
		if (!checkUrlData && !checkUrlError) return;

		if (checkUrlError && !checkUrlData) {
			setFixModalCheckResult({ error: true, note: checkUrlError });
			dispatch(checkUrlReset()); setCheckingJobId(null); return;
		}

		const code = checkUrlData?.statusCode ?? checkUrlData?.status;
		const d = checkUrlData?.data ?? checkUrlData;
		if (code === 200 || code === 201) {
			setFixModalCheckResult({
				live:       d?.reachable ?? d?.is_live ?? false,
				statusCode: d?.status_code ?? d?.statusCode ?? null,
				allowed:    d?.robots_allowed ?? true,
				note:       d?.note ?? checkUrlData?.message ?? null,
			});
		}
		dispatch(checkUrlReset());
		setCheckingJobId(null);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checkUrlData, checkUrlStatus, checkUrlError]);
	const filteredJobs = useMemo(() => {
		const now = new Date();

		return jobs.filter((j) => {
			const matchSearch =
				j.title.toLowerCase().includes(searchText.toLowerCase()) ||
				j.company.toLowerCase().includes(searchText.toLowerCase()) ||
				j.location.toLowerCase().includes(searchText.toLowerCase());
			const matchStatus     = statusFilter.length === 0     || statusFilter.includes(j.status);
			const matchVisibility = visibilityFilter.length === 0 || visibilityFilter.includes(j.visibility);
			const matchWorkMode   = workModeFilter.length === 0   || workModeFilter.includes(j.workMode);
			const matchEmpType    = empTypeFilter.length === 0    || empTypeFilter.includes(j.employmentType);
			const matchApplicants = !applicantsFilter || (() => {
				if (applicantsFilter === '0')    return j.applicants === 0;
				if (applicantsFilter === '1-20') return j.applicants >= 1 && j.applicants <= 20;
				if (applicantsFilter === '21-50') return j.applicants >= 21 && j.applicants <= 50;
				if (applicantsFilter === '50+')  return j.applicants > 50;
				return true;
			})();
			const matchPosted = !postedFilter || (() => {
				const days = Math.floor((now.getTime() - new Date(j.postedOn).getTime()) / 86400000);
				if (postedFilter === '7')  return days <= 7;
				if (postedFilter === '14') return days <= 14;
				if (postedFilter === '30') return days <= 30;
				return true;
			})();
			const matchSkills = skillsFilter.length === 0 ||
				skillsFilter.every((s) => j.skills.some((js) => js.toLowerCase().includes(s.toLowerCase())));
			return matchSearch && matchStatus && matchVisibility && matchWorkMode && matchEmpType && matchApplicants && matchPosted && matchSkills;
		});
	}, [jobs, searchText, statusFilter, visibilityFilter, workModeFilter, empTypeFilter, applicantsFilter, postedFilter, skillsFilter]);

	const trendPcts = useMemo(
		() => jobs.slice(0, 4).map(() => (Math.random() * 20).toFixed(1)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[jobs.length]
	);

	const handleAddOrEdit = (values: any) => {
		if (editingJob) {
			// Map form field names back to API field names
			dispatch(editAdminJob({
				jobId:            editingJob.id,
				title:            values.title,
				company:          values.company,
				description:      values.description,
				location:         values.location,
				sector:           values.sector,
				work_mode:        values.work_mode,
				job_type:         values.job_type,
				experience_level: values.experience_level,
				skills_required:  values.skills_required,
				salary_range:     values.salary_range,
				apply_url:        values.apply_url,
			}));
		} else {
			dispatch(postAdminJob({
				title:            values.title,
				company:          values.company,
				description:      values.description,
				location:         values.location,
				sector:           values.sector,
				work_mode:        values.work_mode,
				job_type:         values.job_type,
				experience_level: values.experience_level,
				skills_required:  values.skills_required,
				salary_range:     values.salary_range,
				apply_url:        values.apply_url,
			}));
		}
	};

	const toggleStatus = (id: string) => {
		setJobs(jobs.map((j) => (j.id === id ? { ...j, status: j.status === 'active' ? 'disabled' : 'active' } : j)));
	};

	const toggleVisibility = (id: string) => {
		setJobs(jobs.map((j) => (j.id === id ? { ...j, visibility: j.visibility === 'visible' ? 'hidden' : 'visible' } : j)));
	};

	const deleteJob = (id: string) => {
		setJobs(jobs.filter((j) => j.id !== id));
		message.info('Role removed');
	};

	return (
		<div className="job-mgmt-page phase2-dashboard dash-next dash-next-shell">
			<DashboardShellNetwork />

			<div className="job-mgmt-page-inner">
				<header className="dash-next-page-head">
					<div className="dash-next-page-head-row">
						<div className="dash-next-page-head-art-wrap">
							<DashboardPageHeadArt />
						</div>
						<div className="dash-next-page-head-copy">
							<div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
								<h1 className="dash-next-page-title" style={{ margin: 0 }}>
									Admin Nexus
								</h1>
								<div className="genz-pill vibrant genz-pill--sm">
									<MdAutoAwesome className="genz-icon" />
									Applicant Operations
								</div>
								<div className="genz-pill glow genz-pill--sm">
									<div className="dot" />
									Admin Access
								</div>
							</div>
							<p className="dash-next-page-lead">
								Centralized administration for job lifecycle and applicant flow.
							</p>
						</div>
					</div>
				</header>

				<Row gutter={[16, 16]} className="admin-stats-row">
					<Col xs={24} sm={12} lg={6}>
						<motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
							<div className="admin-stat-card nexus-premium-card card-live">
								<div className="card-glow-accent" />
								<div className="card-header-row">
									<div className="dot-wrapper"><span className="pulse-dot" /></div>
									<div className="glass-pill">
										<MdAutoAwesome className="pill-icon" />
										<span className="pill-text">LIVE METRICS</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">
											{adminStatsStatus ? <Spin size="small" /> : (platformStats?.totalJobs ?? 0)}
										</span>
										<div className="stat-trend-box"><MdTrendingUp size={10} /><span className="stat-trend">Live</span></div>
									</div>
									<div className="stat-desc">Total Jobs</div>
									<div className="sparkline-container">
										{[40,70,50,90,60].map((h,i) => <div key={i} className="spark-bar" style={{ height: `${h}%` }} />)}
									</div>
								</div>
							</div>
						</motion.div>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
							<div className="admin-stat-card nexus-premium-card card-reach">
								<div className="card-glow-accent" />
								<div className="card-header-row">
									<div className="dot-wrapper"><span className="pulse-dot" /></div>
									<div className="glass-pill">
										<MdBarChart className="pill-icon" />
										<span className="pill-text">ADMIN POSTED</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">
											{adminStatsStatus ? <Spin size="small" /> : (platformStats?.adminPosted ?? 0)}
										</span>
										<div className="stat-trend-box"><MdTrendingUp size={10} /><span className="stat-trend">Live</span></div>
									</div>
									<div className="stat-desc">Admin Posted</div>
									<div className="sparkline-container">
										{[30,55,45,80,70].map((h,i) => <div key={i} className="spark-bar" style={{ height: `${h}%` }} />)}
									</div>
								</div>
							</div>
						</motion.div>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
							<div className="admin-stat-card nexus-premium-card card-system">
								<div className="card-glow-accent" />
								<div className="card-header-row">
									<div className="dot-wrapper"><span className="pulse-dot" /></div>
									<div className="glass-pill">
										<MdMonitorHeart className="pill-icon" />
										<span className="pill-text">AI DISCOVERED</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">
											{adminStatsStatus ? <Spin size="small" /> : (platformStats?.aiDiscovered ?? 0)}
										</span>
										<div className="stat-trend-box"><MdTrendingUp size={10} /><span className="stat-trend">Live</span></div>
									</div>
									<div className="stat-desc">AI Discovered</div>
									<div className="sparkline-container">
										{[20,25,22,28,24].map((h,i) => <div key={i} className="spark-bar" style={{ height: `${h}%` }} />)}
									</div>
								</div>
							</div>
						</motion.div>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
							<div className="admin-stat-card nexus-premium-card card-conversion">
								<div className="card-glow-accent" />
								<div className="stat-saved-sub">
									<MdBookmark size={10} />
									<span>Saved Jobs: {adminStatsStatus ? '…' : (platformStats?.savedJobs ?? 0)}</span>
								</div>
								<div className="card-header-row">
									<div className="dot-wrapper"><span className="pulse-dot" /></div>
									<div className="glass-pill">
										<MdPeople className="pill-icon" />
										<span className="pill-text">TRACKER</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">
											{adminStatsStatus ? <Spin size="small" /> : (platformStats?.trackerEntries ?? 0)}
										</span>
										<div className="stat-trend-box"><MdTrendingUp size={10} /><span className="stat-trend">Live</span></div>
									</div>
									<div className="stat-desc">Application Tracker</div>
									<div className="sparkline-container">
										{[30,42,38,55,48].map((h,i) => <div key={i} className="spark-bar" style={{ height: `${h}%` }} />)}
									</div>
								</div>
							</div>
						</motion.div>
					</Col>
				</Row>

<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.6, ease: easeInOut, delay: 0.2 }}
				>
					<div className="admin-main-card">

						{/* ── Tab bar + actions in one row ── */}
						<div className="admin-nexus-tab-bar">
							<div className="view-tabs admin-view-tabs">
								<button type="button"
									className={`view-tab view-tab--indigo${activeTab === '1' ? ' view-tab--active' : ''}`}
									onClick={() => setActiveTab('1')}
								>
									<span className="view-tab-icon"><MdListAlt size={13} /></span>
									<span className="view-tab-label">Manage Roles</span>
									<span className="view-tab-count">{jobs.length}</span>
								</button>
								<button type="button"
									className={`view-tab view-tab--violet${activeTab === '2' ? ' view-tab--active' : ''}`}
									onClick={() => setActiveTab('2')}
								>
									<span className="view-tab-icon"><MdHistory size={13} /></span>
									<span className="view-tab-label">Activity Monitor</span>
								</button>
								<button type="button"
									className={`view-tab view-tab--rose${activeTab === '3' ? ' view-tab--active' : ''}`}
									onClick={() => setActiveTab('3')}
								>
									<span className="view-tab-icon"><MdLinkOff size={13} /></span>
									<span className="view-tab-label">Broken Links</span>
									{brokenLinksTotal > 0 && <span className="view-tab-count view-tab-count--red">{brokenLinksTotal}</span>}
								</button>
							</div>
							{activeTab === '1' && (
								<div className="admin-nexus-tab-actions">
									<Input
										placeholder="Search by job title..."
										prefix={<MdSearch size={15} style={{ color: '#94a3b8' }} />}
										className="admin-search admin-nexus-search"
										value={searchText}
										onChange={(e) => {
											const val = e.target.value;
											setSearchText(val);
											if (!val.trim()) {
												// Cleared — cancel pending debounce and fetch immediately
												if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
												setAdminPage(1);
												dispatch(getAdminJobs(buildParams(1, '')));
											} else {
												debouncedTitleSearch(val);
											}
										}}
										allowClear
									/>
									<Button
										className="admin-import-url-btn"
										icon={<MdCloudDownload size={16} />}
										onClick={() => { setImportUrl(''); setImportUrlError(''); setImportUrlModal(true); }}
									>
										Import from URL
									</Button>
									<Button
										type="primary"
										className="stalker-btn-primary admin-nexus-add-btn"
										icon={<MdAdd size={16} />}
										onClick={() => { setEditingJob(null); setIsImported(false); form.resetFields(); setIsModalVisible(true); }}
									>
										Add New Job
									</Button>
								</div>
							)}
						</div>

						<div className="admin-tab-content-area">
							{activeTab === '1' && (
								<motion.div
									key="roles"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.4, ease: easeInOut }}
								>

									{/* Two-column layout: filter sidebar + role list */}
									<div className="admin-roles-layout">

										{/* LEFT — filter toolbox */}
										<aside className="admin-roles-sidebar">
											<div className="admin-filter-card">

												{/* Card header */}
												<div className="admin-filter-card-head">
													<span className="admin-filter-card-title">
														<MdFilterList size={15} />
														Filters
													</span>
													{(searchText || statusFilter.length > 0 || visibilityFilter.length > 0 || workModeFilter.length > 0 || empTypeFilter.length > 0 || skillsFilter.length > 0) && (
														<button
															type="button"
															className="afc-reset-btn"
															onClick={() => {
																if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
																setSearchText('');
																setStatusFilter([]);
																setVisibilityFilter([]);
																setWorkModeFilter([]);
																setEmpTypeFilter([]);
																setSkillsFilter([]);
																setSkillInput('');
																setAdminPage(1);
																dispatch(getAdminJobs({ pageId: 1, pageLimit: PAGE_LIMIT }));
															}}
														>
															<MdRestartAlt size={12} /> Clear all
														</button>
													)}
												</div>

												{/* Status */}
												<div className="afc-section">
													<div className="afc-section-head">
														<span className="afc-section-icon afc-section-icon--indigo"><MdCircle size={7} /></span>
														Status
														{statusFilter.length > 0 && <span className="afc-active-badge">{statusFilter.length}</span>}
													</div>
													{(['active', 'disabled'] as const).map((val) => (
														<button key={val} type="button"
															className={`afc-option afc-option--indigo${statusFilter.includes(val) ? ' afc-option--active' : ''}`}
															onClick={() => setStatusFilter(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val])}
														>
															<span className="afc-option-dot" />
															<span className="afc-option-label">{val.charAt(0).toUpperCase() + val.slice(1)}</span>
															<MdCheckCircle size={13} className="afc-option-check" aria-hidden />
														</button>
													))}
												</div>

												{/* Visibility */}
												<div className="afc-section">
													<div className="afc-section-head">
														<span className="afc-section-icon afc-section-icon--violet"><MdVisibility size={9} /></span>
														Visibility
														{visibilityFilter.length > 0 && <span className="afc-active-badge">{visibilityFilter.length}</span>}
													</div>
													{(['visible', 'hidden'] as const).map((val) => (
														<button key={val} type="button"
															className={`afc-option afc-option--violet${visibilityFilter.includes(val) ? ' afc-option--active' : ''}`}
															onClick={() => setVisibilityFilter(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val])}
														>
															<span className="afc-option-dot" />
															<span className="afc-option-label">{val.charAt(0).toUpperCase() + val.slice(1)}</span>
															<MdCheckCircle size={13} className="afc-option-check" aria-hidden />
														</button>
													))}
												</div>

												{/* Work Mode */}
												<div className="afc-section">
													<div className="afc-section-head">
														<span className="afc-section-icon afc-section-icon--cyan"><MdLaptopMac size={9} /></span>
														Work Mode
														{workModeFilter.length > 0 && <span className="afc-active-badge">{workModeFilter.length}</span>}
													</div>
													{(['remote', 'hybrid', 'onsite'] as const).map((val) => (
														<button key={val} type="button"
															className={`afc-option afc-option--cyan${workModeFilter.includes(val) ? ' afc-option--active' : ''}`}
															onClick={() => setWorkModeFilter(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val])}
														>
															<span className="afc-option-dot" />
															<span className="afc-option-label">{WORK_MODE_LABELS[val]}</span>
															<MdCheckCircle size={13} className="afc-option-check" aria-hidden />
														</button>
													))}
												</div>

												{/* Employment */}
												<div className="afc-section">
													<div className="afc-section-head">
														<span className="afc-section-icon afc-section-icon--amber"><MdBarChart size={9} /></span>
														Employment
														{empTypeFilter.length > 0 && <span className="afc-active-badge">{empTypeFilter.length}</span>}
													</div>
													{(['full-time', 'part-time', 'contract'] as const).map((val) => (
														<button key={val} type="button"
															className={`afc-option afc-option--amber${empTypeFilter.includes(val) ? ' afc-option--active' : ''}`}
															onClick={() => setEmpTypeFilter(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val])}
														>
															<span className="afc-option-dot" />
															<span className="afc-option-label">{EMP_LABELS[val]}</span>
															<MdCheckCircle size={13} className="afc-option-check" aria-hidden />
														</button>
													))}
												</div>

												{/* Skills */}
												<div className="afc-section afc-section--last">
													<div className="afc-section-head">
														<span className="afc-section-icon afc-section-icon--violet"><MdWorkOutline size={9} /></span>
														Skills
														{skillsFilter.length > 0 && <span className="afc-active-badge">{skillsFilter.length}</span>}
													</div>
													<div className="afc-skills-input-wrap">
														<Input
															size="small"
															placeholder="e.g. React, Python…"
															value={skillInput}
															onChange={(e) => setSkillInput(e.target.value)}
															onKeyDown={(e) => {
																if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
																	e.preventDefault();
																	const v = skillInput.trim().replace(/,$/, '');
																	if (v && !skillsFilter.includes(v)) setSkillsFilter(p => [...p, v]);
																	setSkillInput('');
																}
															}}
															className="afc-skills-input"
														/>
													</div>
													{skillsFilter.length > 0 && (
														<div className="afc-skills-tags">
															{skillsFilter.map((s) => (
																<span key={s} className="afc-skill-tag">
																	{s}
																	<button type="button" className="afc-skill-remove"
																		onClick={() => setSkillsFilter(p => p.filter(x => x !== s))}
																	>×</button>
																</span>
															))}
														</div>
													)}
												</div>

											</div>
										</aside>

										{/* RIGHT — role card list */}
										<div className="admin-roles-content">
									<ul className="admin-role-list">
										{/* Loading skeleton */}
										{adminJobsStatus ? (
											[0,1,2,3].map((k) => (
												<li key={k} className="admin-role-card" style={{ pointerEvents: 'none' }}>
													<Skeleton avatar={{ size: 48, shape: 'square' }} active paragraph={{ rows: 3 }} title={{ width: '45%' }} />
												</li>
											))
										) : filteredJobs.length === 0 ? (
											<li className="admin-role-empty">
												<MdWorkOutline size={32} />
												<p>{jobs.length === 0 ? 'No jobs loaded yet' : 'No roles match your filters'}</p>
											</li>
										) : filteredJobs.map((job) => (
											<li key={job.id} className="admin-role-card">

												{/* Company logo */}
												<div
													className="admin-role-logo"
													style={{ background: `linear-gradient(145deg, hsl(${job.logoHue},72%,56%), hsl(${job.logoHue + 35},68%,38%))` }}
												>
													<span className="logo-monogram">{job.company.charAt(0)}</span>
												</div>

												{/* Main content */}
												<div className="admin-role-main">
													{/* Title row */}
													<div className="admin-role-title-row">
														<span className="admin-role-title">{job.title}</span>
														{job.status === 'active' && (
															<span className="admin-role-verified">
																<MdCheckCircle size={12} />
																Live
															</span>
														)}
														{job.visibility === 'hidden' && (
															<span className="admin-role-stealth">
																<MdVisibilityOff size={11} />
																Stealth
															</span>
														)}
													</div>

													{/* Meta line */}
													<p className="admin-role-meta">
														<MdBusiness size={12} className="role-meta-icon" />
														{job.company}
														<span className="role-dot">·</span>
														<MdLocationOn size={12} className="role-meta-icon" />
														{job.location}
														<span className="role-dot">·</span>
														{EMP_LABELS[job.employmentType]}
														<span className="role-dot">·</span>
														{WORK_MODE_LABELS[job.workMode]}
														<span className="role-dot">·</span>
														<span className="admin-role-salary">{job.salary}</span>
													</p>

													{/* Description */}
													<p className="admin-role-desc">{job.description}</p>

													{/* Skills */}
													<div className="admin-role-skills">
														{job.skills.map((s) => (
															<span key={s} className="admin-role-skill-tag">{s}</span>
														))}
													</div>

													{/* Footer row */}
													<div className="admin-role-footer">
														<div className="admin-role-stats">
															<span className="admin-role-stat">
																<MdPeople size={13} />
																{job.applicants} applicants
															</span>
															<span className="role-dot">·</span>
															<span className="admin-role-stat">
																<MdCalendarToday size={12} />
																{new Date(job.postedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
															</span>
														</div>

														{/* Admin actions */}
														<div className="admin-role-actions">
															<Tooltip title="Preview as candidate">
																<button
																	type="button"
																	className="admin-action-chip admin-action-chip--view"
																	onClick={() => setPreviewJob(job)}
																>
																	<MdRemoveRedEye size={13} />
																	View
																</button>
															</Tooltip>
															<Tooltip title="Edit role">
																<button
																	type="button"
																	className="admin-action-chip"
																	onClick={() => {
	setEditingJob(job);
	// Pre-fill using API field names
	form.setFieldsValue({
		title:            job.title,
		company:          job.company,
		description:      job.description,
		location:         job.location,
		sector:           job.sector,
		work_mode:        job.workMode,
		job_type:         job.employmentType,
		experience_level: job.experienceLevel,
		skills_required:  job.skills,
		salary_range:     job.salary,
		apply_url:        job.applyLink,
	});
	setIsModalVisible(true);
}}
																>
																	<MdEdit size={13} />
																	Edit
																</button>
															</Tooltip>
															<Tooltip title={job.visibility === 'visible' ? 'Make stealth' : 'Make public'}>
																<button
																	type="button"
																	className={`admin-action-chip${job.visibility === 'hidden' ? ' admin-action-chip--stealth' : ''}`}
																	onClick={() => toggleVisibility(job.id)}
																>
																	{job.visibility === 'visible' ? <MdVisibility size={13} /> : <MdVisibilityOff size={13} />}
																	{job.visibility === 'visible' ? 'Visible' : 'Hidden'}
																</button>
															</Tooltip>
															<Tooltip title={job.status === 'active' ? 'Disable role' : 'Enable role'}>
																<Switch
																	size="small"
																	checked={job.status === 'active'}
																	onChange={() => toggleStatus(job.id)}
																	className="nexus-switch"
																/>
															</Tooltip>
										<Tooltip title="Delete role">
											<button
												type="button"
												className="admin-action-chip admin-action-chip--danger"
												disabled={!!(deleteAdminJobStatus && deletePendingJobId === job.id)}
												onClick={() => setDeleteConfirmJob(job)}
											>
												{deleteAdminJobStatus && deletePendingJobId === job.id
													? <Spin size="small" />
													: <MdDeleteOutline size={13} />}
											</button>
										</Tooltip>
														</div>
													</div>
												</div>
											</li>
										))}
									</ul>

									{/* Pagination */}
									{!adminJobsStatus && adminTotal > PAGE_LIMIT && (
										<div className="admin-pagination-wrap">
											<Pagination
												current={adminPage}
												total={adminTotal}
												pageSize={PAGE_LIMIT}
												showSizeChanger={false}
												showTotal={(total, range) => `${range[0]}–${range[1]} of ${total} jobs`}
												onChange={(page) => {
													setAdminPage(page);
													window.scrollTo({ top: 0, behavior: 'smooth' });
												}}
											/>
										</div>
									)}
										</div>{/* admin-roles-content */}
									</div>{/* admin-roles-layout */}
								</motion.div>
							)}

							{activeTab === '2' && (
								<motion.div
									key="monitor"
									initial={{ opacity: 0, x: 10 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.3 }}
								>
									<div className="activity-monitor-content">
										<Row gutter={[16, 16]}>
											<Col xs={24} lg={16}>
												<div className="monitor-card nexus-card-glass">
													<div className="monitor-card-header">
														<div className="header-label">
															<span className="kicker">REAL-TIME</span>
															<h3>Application Pulse</h3>
														</div>
														<div className="live-status-pill">
															<span className="pulse-dot" />
															LIVE
														</div>
													</div>
													<div className="pulse-chart-container">
														<div className="pulse-bars">
															{[40,70,45,90,65,85,50,75,40,60,80,55].map((h,i) => (
																<div key={i} className="pulse-bar-gradient" style={{ height: `${h}%` }} />
															))}
														</div>
														<div className="pulse-labels">
															<span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
														</div>
													</div>
												</div>
											</Col>
											<Col xs={24} lg={8}>
												<div className="monitor-card compact nexus-card-glass">
													<div className="monitor-card-header">
														<div className="header-label">
															<span className="kicker">CONVERSION</span>
															<h3>Success Flow</h3>
														</div>
													</div>
													<div className="conversion-stats">
														<div className="conversion-item">
															<div className="conversion-meta"><span className="label">Click-to-Apply</span><span className="value">12.4%</span></div>
															<Progress percent={72} strokeColor="#6366f1" showInfo={false} size="small" className="nexus-progress" />
														</div>
														<div className="conversion-item">
															<div className="conversion-meta"><span className="label">Engagement</span><span className="value">88%</span></div>
															<Progress percent={88} strokeColor="#a855f7" showInfo={false} size="small" className="nexus-progress" />
														</div>
														<div className="conversion-item">
															<div className="conversion-meta"><span className="label">Retention</span><span className="value">94%</span></div>
															<Progress percent={94} strokeColor="#10b981" showInfo={false} size="small" className="nexus-progress" />
														</div>
													</div>
												</div>
											</Col>
											<Col xs={24} md={12}>
												<div className="monitor-card nexus-card-glass">
													<div className="monitor-card-header">
														<div className="header-label"><span className="kicker">LOGS</span><h3>Live Event Stream</h3></div>
													</div>
													<div className="activity-feed">
														{[
															{ user: 'Sarah K.', action: 'Applied to', target: 'Frontend Engineer', time: '2m ago', color: '#6366f1' },
															{ user: 'Alex M.', action: 'Saved', target: 'UX Designer', time: '15m ago', color: '#a855f7' },
															{ user: 'Nexus Bot', action: 'Scraped', target: '12 New Jobs', time: '1h ago', color: '#10b981' },
															{ user: 'Admin', action: 'Hidden', target: 'Intern Role', time: '3h ago', color: '#f43f5e' }
														].map((item, idx) => (
															<div className="feed-item-nexus" key={idx}>
																<Avatar style={{ backgroundColor: item.color }} size={32} className="feed-avatar-nexus">{item.user[0]}</Avatar>
																<div className="feed-copy">
																	<div className="feed-text"><strong>{item.user}</strong> {item.action} <span className="highlight">{item.target}</span></div>
																	<div className="time">{item.time}</div>
																</div>
															</div>
														))}
													</div>
												</div>
											</Col>
											<Col xs={24} md={12}>
												<div className="monitor-card nexus-card-glass">
													<div className="monitor-card-header">
														<div className="header-label"><span className="kicker">POPULAR</span><h3>Hot Opportunities</h3></div>
													</div>
													<div className="trending-list-nexus">
														{jobs.slice(0, 4).map((job, idx) => (
															<div className="trending-item-nexus" key={idx}>
																<div className="rank-badge">{idx + 1}</div>
																<div className="trending-info">
																	<div className="title">{job.title}</div>
																	<div className="meta">{job.company} · {job.applicants} hits</div>
																</div>
																<div className="trend-pct">
																	<MdTrendingUp />
																	+{trendPcts[idx]}%
																</div>
															</div>
														))}
													</div>
												</div>
											</Col>
										</Row>
									</div>
								</motion.div>
							)}

						{activeTab === '3' && (
							<motion.div
								key="broken"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
							>
								<div className="broken-links-content">
									{/* Header */}
									<div className="broken-links-header">
										<div className="broken-links-title">
											<MdLinkOff size={18} style={{ color: '#ef4444' }} />
											<div>
												<h3 className="bl-heading">Broken / Unverified Links</h3>
												<p className="bl-sub">{brokenLinksData?.message || 'Jobs with broken or unverified apply URLs'}</p>
											</div>
										</div>
									</div>

									{/* Table */}
									{brokenLinksStatus ? (
										<div className="bl-skeleton-list">
											{[0,1,2,3].map(k => (
												<Skeleton key={k} active paragraph={{ rows: 2 }} title={{ width: '40%' }} />
											))}
										</div>
									) : brokenLinks.length === 0 ? (
										<Empty description="No broken or unverified links found" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />
									) : (
										<div className="bl-list">
											{brokenLinks.map((item, i) => (
												<div key={item.job_id || i} className="bl-card">
													{/* Logo */}
													<div className="bl-card-left">
												<div className="bl-logo" style={{ background: `linear-gradient(145deg, hsl(${(i * 47 + 180) % 360},68%,54%), hsl(${(i * 47 + 215) % 360},62%,40%))` }}>
															{item.company?.charAt(0) ?? '?'}
														</div>
													</div>
											
													{/* Body */}
													<div className="bl-card-body">
											
														{/* Row 1: title + badge */}
														<div className="bl-card-top">
															<div className="bl-card-info">
																<span className="bl-title">{item.title}</span>
																<span className="bl-company"><MdBusiness size={11} />{item.company}</span>
															</div>
															<Tag color={item.url_status === 'verified' || item.url_note?.toLowerCase().includes('updated') ? 'green' : item.url_status === 'unverified' ? 'orange' : 'red'} style={{ margin: 0, fontSize: 11, flexShrink: 0 }}>
																{item.url_note?.toLowerCase().includes('updated') ? 'URL Updated ✓' : item.url_status}
															</Tag>
														</div>
											
														{/* Row 2: current broken URL */}
														<div className="bl-url-row">
															<MdLinkOff size={12} style={{ color: '#ef4444', flexShrink: 0 }} />
															<span className="bl-url">{item.apply_url || '—'}</span>
															<a href={item.apply_url} target="_blank" rel="noreferrer" className="bl-open-btn" onClick={e => e.stopPropagation()}>
																<MdOpenInNew size={13} />
															</a>
														</div>

													{/* Row 3: meta + fix button */}
													<div className="bl-meta">
														<span className="bl-meta-item"><MdHistory size={11} />Cached: {item.cached_at}</span>
														{item.url_note && <span className="bl-meta-item bl-note">{item.url_note}</span>}
														<span className="bl-meta-item bl-jobid">ID: {item.job_id}</span>
														<button
															type="button"
															className="bl-fix-trigger-btn"
															onClick={() => setFixModalJob({ ...item, logoHue: (i * 47 + 180) % 360 })}
														>
															<MdEditNote size={13} /> Fix URL
														</button>
													</div>

													</div>
												</div>
											))}
										</div>
									)}

									{/* Pagination */}
									{!brokenLinksStatus && brokenLinksTotal > BROKEN_PAGE_LIMIT && (
										<div className="admin-pagination-wrap" style={{ marginTop: 16 }}>
											<Pagination
												current={brokenLinksPage}
												total={brokenLinksTotal}
												pageSize={BROKEN_PAGE_LIMIT}
												showSizeChanger={false}
												showTotal={(total, range) => `${range[0]}–${range[1]} of ${total} links`}
												onChange={(page) => setBrokenLinksPage(page)}
											/>
										</div>
									)}
								</div>
							</motion.div>
						)}
						</div>
					</div>
				</motion.div>

				{/* Add / Edit Modal */}
				<Modal
					open={isModalVisible}
					onCancel={() => { setIsModalVisible(false); setEditingJob(null); setIsImported(false); }}
					footer={null}
					centered
					className="arm-modal"
					width={580}
					title={null}
					closable={false}
				>
					{/* Custom header */}
					<div className="arm-header">
						<div className="arm-header-icon">
							{isImported ? <MdCheckCircleOutline size={18} /> : editingJob ? <MdEdit size={18} /> : <MdAdd size={18} />}
						</div>
						<div className="arm-header-text">
							<h3 className="arm-header-title">
								{isImported ? 'Review Extracted Job' : editingJob ? 'Edit Job' : 'Add New Job'}
							</h3>
							<p className="arm-header-sub">
								{isImported ? 'AI-extracted details — review and edit before saving' : editingJob ? 'Update the role details below' : 'Fill in the details to publish a new role'}
							</p>
						</div>
						<button type="button" className="arm-close-btn" onClick={() => { setIsModalVisible(false); setEditingJob(null); setIsImported(false); }}>×</button>
					</div>
					{isImported && (
						<div className="arm-ai-extracted-banner">
							<MdCheckCircleOutline size={14} />
							<span>Fields auto-filled by AI — verify for accuracy before saving</span>
						</div>
					)}

					<Form form={form} layout="vertical" onFinish={handleAddOrEdit} className="arm-form">

						{/* Title */}
						<Form.Item
							name="title"
							label="Job Title"
							rules={[
								{ required: true, message: 'Job title is required' },
								{ min: 3, message: 'Title must be at least 3 characters' },
								{ max: 120, message: 'Title cannot exceed 120 characters' },
							]}
						>
							<Input placeholder="e.g. Senior Software Engineer" className="arm-input" />
						</Form.Item>

						{/* Company + Location */}
						<div className="arm-row">
							<Form.Item
								name="company"
								label="Company"
								rules={[
									{ required: true, message: 'Company name is required' },
									{ min: 2, message: 'At least 2 characters' },
								]}
							>
								<Input placeholder="e.g. Stripe" prefix={<MdBusiness size={14} style={{ color: '#94a3b8' }} />} className="arm-input" />
							</Form.Item>
							<Form.Item
								name="location"
								label="Location"
								rules={[{ required: true, message: 'Location is required' }]}
							>
								<Input placeholder="e.g. Bengaluru, India" prefix={<MdLocationOn size={14} style={{ color: '#94a3b8' }} />} className="arm-input" />
							</Form.Item>
						</div>

						{/* Work Mode + Job Type */}
						<div className="arm-row">
							<Form.Item
								name="work_mode"
								label="Work Mode"
								rules={[{ required: true, message: 'Select a work mode' }]}
							>
								<Select placeholder="Select" className="arm-select" popupClassName="arm-dropdown">
									<Select.Option value="remote">🌐 Remote</Select.Option>
									<Select.Option value="hybrid">🏢 Hybrid</Select.Option>
									<Select.Option value="onsite">📍 On-site</Select.Option>
								</Select>
							</Form.Item>
							<Form.Item
								name="job_type"
								label="Job Type"
								rules={[{ required: true, message: 'Select a job type' }]}
							>
								<Select placeholder="Select" className="arm-select" popupClassName="arm-dropdown">
									<Select.Option value="full-time">Full-time</Select.Option>
									<Select.Option value="part-time">Part-time</Select.Option>
									<Select.Option value="contract">Contract</Select.Option>
									<Select.Option value="internship">Internship</Select.Option>
								</Select>
							</Form.Item>
						</div>

						{/* Experience Level + Sector */}
						<div className="arm-row">
							<Form.Item
								name="experience_level"
								label="Experience Level"
								rules={[{ required: true, message: 'Select experience level' }]}
							>
								<Select placeholder="Select" className="arm-select" popupClassName="arm-dropdown">
									<Select.Option value="junior">Junior</Select.Option>
									<Select.Option value="mid">Mid</Select.Option>
									<Select.Option value="senior">Senior</Select.Option>
									<Select.Option value="lead">Lead</Select.Option>
									<Select.Option value="executive">Executive</Select.Option>
								</Select>
							</Form.Item>
							<Form.Item
								name="sector"
								label="Sector"
							>
								<Select placeholder="Select (optional)" className="arm-select" popupClassName="arm-dropdown">
									<Select.Option value="private">Private</Select.Option>
									<Select.Option value="public">Public</Select.Option>
									<Select.Option value="nonprofit">Non-profit</Select.Option>
									<Select.Option value="startup">Startup</Select.Option>
								</Select>
							</Form.Item>
						</div>

						{/* Salary + Apply URL */}
						<div className="arm-row">
							<Form.Item name="salary_range" label="Salary Range">
								<Select placeholder="Select salary range" className="arm-select" popupClassName="arm-dropdown" allowClear>
									<Select.Option value="₹3L – ₹6L / yr">₹3L – ₹6L / yr</Select.Option>
									<Select.Option value="₹6L – ₹10L / yr">₹6L – ₹10L / yr</Select.Option>
									<Select.Option value="₹10L – ₹15L / yr">₹10L – ₹15L / yr</Select.Option>
									<Select.Option value="₹15L – ₹25L / yr">₹15L – ₹25L / yr</Select.Option>
									<Select.Option value="₹25L – ₹40L / yr">₹25L – ₹40L / yr</Select.Option>
									<Select.Option value="₹40L – ₹60L / yr">₹40L – ₹60L / yr</Select.Option>
									<Select.Option value="₹60L – ₹80L / yr">₹60L – ₹80L / yr</Select.Option>
									<Select.Option value="₹80L+ / yr">₹80L+ / yr</Select.Option>
									<Select.Option value="$30K – $60K / yr">$30K – $60K / yr</Select.Option>
									<Select.Option value="$60K – $90K / yr">$60K – $90K / yr</Select.Option>
									<Select.Option value="$90K – $130K / yr">$90K – $130K / yr</Select.Option>
									<Select.Option value="$130K – $180K / yr">$130K – $180K / yr</Select.Option>
									<Select.Option value="$180K+ / yr">$180K+ / yr</Select.Option>
									<Select.Option value="$180K – $250K / yr">$180K – $250K / yr</Select.Option>
									<Select.Option value="$250K – $350K / yr">$250K – $350K / yr</Select.Option>
									<Select.Option value="$350K – $500K / yr">$350K – $500K / yr</Select.Option>
									<Select.Option value="$500K+ / yr">$500K+ / yr</Select.Option>
									<Select.Option value="Competitive">Competitive</Select.Option>
									<Select.Option value="Not disclosed">Not disclosed</Select.Option>
								</Select>
							</Form.Item>
							<Form.Item
								name="apply_url"
								label="Apply URL"
								rules={[
									{ required: true, message: 'Apply URL is required' },
									{ type: 'url', message: 'Enter a valid URL (https://…)' },
								]}
							>
								<Input placeholder="https://company.com/apply" prefix={<MdLink size={14} style={{ color: '#94a3b8' }} />} className="arm-input" />
							</Form.Item>
						</div>

						{/* Skills — tag input */}
						<Form.Item
							name="skills_required"
							label="Skills Required"
							rules={[{ required: true, message: 'Add at least one skill', type: 'array', min: 1 }]}
						>
							<Select
								mode="tags"
								placeholder="Type a skill and press Enter"
								className="arm-select"
								popupClassName="arm-dropdown"
								tokenSeparators={[',']}
								open={false}
							/>
						</Form.Item>

						{/* Description */}
						<Form.Item
							name="description"
							label="Job Description"
							style={{ marginBottom: 0 }}
							rules={[
								{ required: true, message: 'Description is required' },
								{ min: 20, message: 'Description should be at least 20 characters' },
							]}
						>
							<Input.TextArea rows={3} placeholder="What this role is about, the team, the mission…" className="arm-textarea" />
						</Form.Item>

						{/* Footer */}
						<div className="arm-footer">
							<button type="button" className="arm-btn-cancel" onClick={() => { setIsModalVisible(false); setEditingJob(null); setIsImported(false); setImportUrl(''); setImportUrlError(''); form.resetFields(); }}>
								Cancel
							</button>
							<button
								type="submit"
								className="arm-btn-submit"
								disabled={editAdminJobStatus || postAdminJobStatus}
							>
								{(editAdminJobStatus || postAdminJobStatus)
									? <><Spin size="small" style={{ marginRight: 6 }} />{editingJob ? 'Saving…' : 'Posting…'}</>
									: editingJob
										? <><MdEdit size={14} /> Save Changes</>
										: <><MdAdd size={14} /> Post Job</>
								}
							</button>
						</div>
					</Form>
				</Modal>

					{/* ── Import from URL Modal ── */}
					<Modal
						open={importUrlModal}
						onCancel={() => { setImportUrlModal(false); setImportUrl(''); setImportUrlError(''); dispatch(extractJobUrlReset()); }}
						footer={null}
						centered
						width={480}
						title={null}
						closable={false}
						className="import-url-modal"
					>
						<div className="ium-header">
							<div className="ium-header-icon">
								<MdCloudDownload size={20} />
							</div>
							<div className="ium-header-text">
								<h3 className="ium-title">Import Job from URL</h3>
								<p className="ium-sub">Paste a public job posting — AI extracts all details for you to review</p>
							</div>
							<button type="button" className="arm-close-btn" onClick={() => { setImportUrlModal(false); setImportUrl(''); setImportUrlError(''); dispatch(extractJobUrlReset()); }}>×</button>
						</div>

						<div className="ium-body">
							<label className="ium-label">Job posting URL</label>
							<Input
								className="ium-input"
								placeholder="https://careers.company.com/job/123"
								prefix={<MdLink size={15} style={{ color: '#94a3b8' }} />}
								value={importUrl}
								onChange={e => { setImportUrl(e.target.value); setImportUrlError(''); }}
								onPressEnter={() => {
									if (importUrl.trim()) {
										setImportUrlError('');
										dispatch(extractJobUrl({ url: importUrl.trim() }));
									}
								}}
								disabled={extractJobUrlStatus}
							/>

							{importUrlError && (
								<div className="ium-error">
									<MdLinkOff size={13} /> {importUrlError}
								</div>
							)}

							<div className="ium-hints">
								<span className="ium-hint-item">✓ Auto-fills title, company, skills &amp; more</span>
								<span className="ium-hint-item">✓ Checks robots.txt — only scrapes allowed sites</span>
							</div>
						</div>

						<div className="ium-footer">
							<button type="button" className="arm-btn-cancel" onClick={() => { setImportUrlModal(false); setImportUrl(''); setImportUrlError(''); dispatch(extractJobUrlReset()); }}>
								Cancel
							</button>
							<button
								type="button"
								className="arm-btn-submit ium-extract-btn"
								disabled={!importUrl.trim() || extractJobUrlStatus}
								onClick={() => {
									if (importUrl.trim()) {
										setImportUrlError('');
										dispatch(extractJobUrl({ url: importUrl.trim() }));
									}
								}}
							>
								{extractJobUrlStatus
									? <><Spin size="small" style={{ marginRight: 6 }} />Extracting…</>
									: <><MdCloudDownload size={14} style={{ marginRight: 4 }} />Extract Details</>
								}
							</button>
						</div>
					</Modal>

					{/* ── Fix URL Modal ── */}
					<Modal
						open={!!fixModalJob}
						onCancel={() => { setFixModalJob(null); setFixModalUrl(''); setFixModalCheckResult(null); dispatch(checkUrlReset()); }}
						footer={null}
						centered
						width={520}
						className="fix-url-modal"
						closable={!fixBrokenUrlStatus}
					>
						{fixModalJob && (
							<div className="fum-wrap">
					
								{/* Header */}
								<div className="fum-header">
									<div className="fum-icon-ring"><MdEditNote size={22} /></div>
									<div>
										<h3 className="fum-title">Fix Apply URL</h3>
										<p className="fum-sub">Check the new URL is reachable, then apply the fix.</p>
									</div>
								</div>
					
								{/* Job preview */}
								<div className="fum-job-pill">
									<div className="fum-job-logo" style={{ background: `linear-gradient(135deg, hsl(${fixModalJob.logoHue ?? 220},68%,54%), hsl(${(fixModalJob.logoHue ?? 220) + 35},62%,40%))` }}>
										{fixModalJob.company?.charAt(0) ?? '?'}
									</div>
									<div className="fum-job-info">
										<span className="fum-job-title">{fixModalJob.title}</span>
										<span className="fum-job-company">{fixModalJob.company}</span>
									</div>
									<Tag color={fixModalJob.url_note?.toLowerCase().includes('updated') ? 'green' : fixModalJob.url_status === 'unverified' ? 'orange' : 'red'} style={{ margin: 0 }}>
										{fixModalJob.url_note?.toLowerCase().includes('updated') ? 'URL Updated ✓' : fixModalJob.url_status}
									</Tag>
								</div>
					
								{/* Current broken URL */}
								<div className="fum-current-url">
									<span className="fum-current-label">Current URL</span>
									<div className="fum-url-chip">
										<MdLinkOff size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
										<span className="fum-url-text">{fixModalJob.apply_url}</span>
										<a href={fixModalJob.apply_url} target="_blank" rel="noreferrer" className="bl-open-btn"><MdOpenInNew size={13} /></a>
									</div>
								</div>
					
								{/* New URL input */}
								<div className="fum-input-section">
									<span className="fum-input-label">New Apply URL</span>
									<div className="fum-input-row">
										<Input
											placeholder="https://company.com/careers/job-id"
											value={fixModalUrl}
											onChange={(e) => { setFixModalUrl(e.target.value); setFixModalCheckResult(null); }}
											prefix={<MdLink size={14} style={{ color: '#94a3b8' }} />}
											className="fum-input"
											onPressEnter={() => { if (fixModalUrl.trim()) { setCheckingJobId(fixModalJob.job_id); dispatch(checkUrl(fixModalUrl.trim())); } }}
										/>
										<button
											type="button"
											className="bl-check-btn"
											disabled={checkUrlStatus || !fixModalUrl.trim()}
											onClick={() => { if (fixModalUrl.trim()) { setCheckingJobId(fixModalJob.job_id); dispatch(checkUrl(fixModalUrl.trim())); } }}
										>
											{checkUrlStatus ? <Spin size="small" /> : 'Check'}
										</button>
									</div>
					
									{/* Check result */}
									{fixModalCheckResult && (
										<div className={'fum-check-result' + (fixModalCheckResult?.live ? ' fum-check-result--ok' : ' fum-check-result--fail')}>
											{fixModalCheckResult?.live
												? <><span>✓</span> {fixModalCheckResult?.note || ('Status ' + fixModalCheckResult?.statusCode)}{fixModalCheckResult?.allowed === false ? ' · robots.txt blocked' : ''}</>
												: <><span>✗</span> Unreachable{fixModalCheckResult?.note ? ' — ' + fixModalCheckResult?.note : ''}</>
											}
										</div>
									)}
								</div>
					
								{/* Actions */}
								<div className="fum-actions">
									<button type="button" className="fum-btn fum-btn--cancel"
										onClick={() => { setFixModalJob(null); setFixModalUrl(''); setFixModalCheckResult(null); dispatch(checkUrlReset()); }}
									>Cancel</button>
									<button
										type="button"
										className="fum-btn fum-btn--apply"
										disabled={!fixModalUrl.trim() || fixBrokenUrlStatus || fixModalCheckResult?.live === false}
										onClick={() => { if (fixModalUrl.trim()) dispatch(fixBrokenUrl({ jobId: fixModalJob.job_id, apply_url: fixModalUrl.trim() })); }}
									>
										{fixBrokenUrlStatus ? <><Spin size="small" style={{ marginRight: 6 }} />Applying…</> : 'Apply Fix'}
									</button>
								</div>
					
							</div>
						)}
					</Modal>

					{/* ── Delete Confirmation Modal ── */}
					<Modal
						open={!!deleteConfirmJob}
						onCancel={() => setDeleteConfirmJob(null)}
						footer={null}
						centered
						width={420}
						closable={!deleteAdminJobStatus}
						className="admin-delete-modal"
					>
						{deleteConfirmJob && (
							<div className="adm-wrap">
								<div className="adm-icon-ring">
									<MdDeleteOutline size={28} />
								</div>
								<h3 className="adm-title">Delete this role?</h3>
								<p className="adm-sub">
									You are about to permanently remove this job from the cache.
									This action cannot be undone.
								</p>
								<div className="adm-job-pill">
									<div
										className="adm-job-logo"
										style={{ background: `linear-gradient(145deg, hsl(${deleteConfirmJob.logoHue},72%,56%), hsl(${deleteConfirmJob.logoHue + 35},68%,38%))` }}
									>
										{deleteConfirmJob.company.charAt(0)}
									</div>
									<div className="adm-job-info">
										<span className="adm-job-title">{deleteConfirmJob.title}</span>
										<span className="adm-job-company">{deleteConfirmJob.company} · {deleteConfirmJob.location}</span>
									</div>
								</div>
								<div className="adm-actions">
									<button
										type="button"
										className="adm-btn adm-btn--cancel"
										disabled={deleteAdminJobStatus}
										onClick={() => setDeleteConfirmJob(null)}
									>
										Cancel
									</button>
									<button
										type="button"
										className="adm-btn adm-btn--delete"
										disabled={deleteAdminJobStatus}
										onClick={() => {
											dispatch(deleteAdminJob(deleteConfirmJob.id));
											setDeleteConfirmJob(null);
										}}
									>
										{deleteAdminJobStatus && deletePendingJobId === deleteConfirmJob.id
											? <><Spin size="small" style={{ marginRight: 6 }} />Deleting…</>
											: <><MdDeleteOutline size={14} style={{ marginRight: 4 }} />Yes, delete</>
										}
									</button>
								</div>
							</div>
						)}
					</Modal>

				{/* Candidate Preview Modal */}
				<Modal
					open={!!previewJob}
					onCancel={() => setPreviewJob(null)}
					footer={null}
					centered
					className="job-search-job-preview-modal admin-preview-modal"
					wrapClassName="job-search-job-preview-modal-wrap"
					width="96vw"
					style={{ top: 2, paddingBottom: 0 }}
					title={null}
					closable
					destroyOnClose
					bodyStyle={{ padding: 0 }}
				>
					{previewJob && (
						<div className="job-search-preview">
							<div className="jd-scroll-area">

								{/* ── Dark gradient header (same as Career Acceleration) ── */}
								<header className="job-search-preview-head">
									<div className="jd-head-top">

										{/* Logo */}
										<div
											className="job-search-preview-logo"
											style={{ background: `linear-gradient(145deg, hsl(${previewJob.logoHue},72%,56%), hsl(${previewJob.logoHue + 35},68%,38%))` }}
										>
											<div className="logo-mesh-ring" />
											<div className="logo-mesh-ring logo-mesh-ring--2" />
											<span className="logo-monogram logo-monogram--lg">{previewJob.company.charAt(0)}</span>
										</div>

										{/* Identity block */}
										<div className="job-search-preview-head-copy">
											<div className="job-search-preview-title-row">
												<h2 className="job-search-preview-title">{previewJob.title}</h2>
												{previewJob.urlStatus === 'valid' && (
													<MdVerified size={18} className="jd-verified-icon" />
												)}
											</div>
											<p className="job-search-preview-company">
												<MdBusiness size={13} />{previewJob.company}
												{previewJob.location && (
													<><span className="job-search-job-dot"> · </span><MdLocationOn size={13} />{previewJob.location}</>
												)}
											</p>
											{/* Meta chips */}
											<div className="job-search-preview-meta-line">
												<span className="job-search-preview-chip">
													<MdWork size={10} />{EMP_LABELS[previewJob.employmentType]}
												</span>
												<span className="job-search-preview-chip job-search-preview-chip--muted">
													{WORK_MODE_LABELS[previewJob.workMode]}
												</span>
												{previewJob.experience && (
													<span className="job-search-preview-chip job-search-preview-chip--muted">
														<MdAccessTime size={10} />{previewJob.experience}
													</span>
												)}
												{previewJob.experienceLevel && (
													<span className="job-search-preview-chip job-search-preview-chip--muted" style={{ textTransform: 'capitalize' }}>
														{previewJob.experienceLevel}
													</span>
												)}
												{previewJob.salary && (
													<span className="job-search-preview-chip job-search-preview-chip--accent">
														<MdAttachMoney size={10} />{previewJob.currency ? `${previewJob.currency} ` : ''}{previewJob.salary}
													</span>
												)}
												{previewJob.sector && (
													<span className="job-search-preview-chip job-search-preview-chip--muted" style={{ textTransform: 'capitalize' }}>
														<MdBarChart size={10} />{previewJob.sector}
													</span>
												)}
												{previewJob.postedOn && (
													<span className="job-search-preview-chip job-search-preview-chip--muted">
														<MdCalendarToday size={10} />{previewJob.postedOn}
													</span>
												)}
												{previewJob.sourceKind && (
													<span className="job-search-preview-chip job-search-preview-chip--muted" style={{ textTransform: 'capitalize' }}>
														{previewJob.sourceKind}
													</span>
												)}
											</div>
										</div>
									</div>

								</header>

								{/* ── Body panels ── */}
								<div className="jd-body">

									{/* Left: blurred fit card */}
									<div className="jd-panels-stack">
										<div className="admin-fit-blur-wrap">
											{/* Fake fit card — blurred */}
											<div className="jd-panel jd-panel--fit jd-panel--full admin-fit-blurred">
												<h3 className="jd-panel-title">
													<MdWorkspacePremium size={16} className="jd-panel-title-icon jd-panel-title-icon--gold" />
													Your fit
												</h3>
												<div className="jd-fit-score-row">
													<div className="jd-fit-score-ring" style={{ '--score': 85 } as React.CSSProperties}>
														<span className="jd-fit-score-num">85%</span>
													</div>
													<div className="jd-fit-score-copy">
														<p className="jd-fit-score-title">AI Fit Score</p>
														<span className="jd-fit-bucket jd-fit-bucket--strong">Strong Fit</span>
													</div>
												</div>
												<div className="jd-fit-group">
													<p className="jd-fit-label jd-fit-label--match"><MdCheckCircle size={12} /> Skills matched</p>
													<div className="jd-fit-pills">
														{['React', 'TypeScript', 'Node.js', 'Python'].map(s => (
															<span key={s} className="jd-fit-pill jd-fit-pill--match"><MdCheckCircle size={11} />{s}</span>
														))}
													</div>
												</div>
												<div className="jd-fit-group">
													<p className="jd-fit-label jd-fit-label--gap"><MdSchool size={12} /> Skill gaps</p>
													<div className="jd-fit-pills">
														{['AWS', 'GraphQL'].map(s => (
															<span key={s} className="jd-fit-pill jd-fit-pill--gap"><MdSchool size={11} />{s}</span>
														))}
													</div>
												</div>
											</div>
											{/* Overlay */}
											<div className="admin-fit-overlay">
												<MdInsights size={24} style={{ color: '#2563eb', marginBottom: 8 }} />
												<p className="admin-fit-overlay-title">AI Fit Score</p>
												<p className="admin-fit-overlay-sub">Candidates see their AI-matched fit % and skill gap analysis for this role here.</p>
											</div>
										</div>

										{/* Source info */}
										{(previewJob.urlNote || previewJob.cachedAt || previewJob.source) && (
											<div className="jd-panel jd-panel--full" style={{ background: '#f8fafc' }}>
												<h3 className="jd-panel-title">
													<MdInfo size={15} className="jd-panel-title-icon jd-panel-title-icon--indigo" />
													Source info
												</h3>
												<div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
													{previewJob.urlNote && (
														<div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
															<MdLink size={14} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
															<span style={{ fontSize: 13, color: '#475569', lineHeight: 1.55 }}>{previewJob.urlNote}</span>
														</div>
													)}
													{previewJob.source && (
														<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
															<MdInfo size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
															<span style={{ fontSize: 13, color: '#64748b' }}>Source: <strong>{previewJob.source.replace(/_/g, ' ')}</strong></span>
														</div>
													)}
													{previewJob.cachedAt && (
														<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
															<MdHistory size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
															<span style={{ fontSize: 13, color: '#64748b' }}>Cached: {previewJob.cachedAt}</span>
														</div>
													)}
												</div>
											</div>
										)}
									</div>

									{/* Right: main content */}
									<div className="jd-body-left">

										{/* About the role — 3-sentence preview with Show more / Show less */}
										{(() => {
											const aboutText = parsedDesc.about;
											const fullText  = previewJob.description ?? '';
											const isTruncated = fullText.length > aboutText.length + 10;
											return aboutText ? (
												<div className="jd-section-block">
													<h4 className="jd-section-label">
														<span className="jd-section-icon jd-section-icon--violet"><MdListAlt size={12} /></span>
														About the role
													</h4>
													<p className="jd-head-desc-text jd-about-text">
														{showFullAbout ? fullText : aboutText}
													</p>
													{isTruncated && (
														<button
															type="button"
															className="jd-about-toggle"
															onClick={() => setShowFullAbout(v => !v)}
														>
															{showFullAbout ? 'Show less ↑' : 'Show more ↓'}
														</button>
													)}
												</div>
											) : null;
										})()}

										{/* Requirements + What you'll do — prefer API arrays, fallback to parsed */}
										{(() => {
											const resp = previewJob.responsibilities?.length > 0 ? previewJob.responsibilities : parsedDesc.responsibilities;
											const reqs = (previewJob.requirements && previewJob.requirements.length > 0) ? previewJob.requirements : parsedDesc.requirements;
											if (!resp.length && !reqs.length) return null;
											return (
												<div className="jd-two-col-block">
													{reqs.length > 0 && (
														<div className="jd-two-col-section">
															<h4 className="jd-section-label">
																<span className="jd-section-icon jd-section-icon--violet"><MdCheckCircle size={12} /></span>
																Requirements
															</h4>
															<ul className="jd-req-list">
																{reqs.map((r, i) => (
																	<li key={i} className="jd-req-item"><MdCheckCircle size={12} className="jd-req-check" />{r}</li>
																))}
															</ul>
														</div>
													)}
													{resp.length > 0 && (
														<div className="jd-two-col-section">
															<h4 className="jd-section-label">
																<span className="jd-section-icon jd-section-icon--violet"><MdWork size={12} /></span>
																What you'll do
															</h4>
															<ul className="jd-req-list">
																{resp.map((r, i) => (
																	<li key={i} className="jd-req-item"><span className="jd-req-dot" />{r}</li>
																))}
															</ul>
														</div>
													)}
												</div>
											);
										})()}

										{/* Skills */}
										{previewJob.skills.length > 0 && (
											<div className="jd-section-block">
												<h4 className="jd-section-label">
													<span className="jd-section-icon jd-section-icon--violet"><MdSchool size={12} /></span>
													Skills required
												</h4>
												<div className="jd-skills-row">
													{previewJob.skills.map((s) => (
														<Tooltip key={s} title={previewJob.skillsExplanations?.[s] || null} overlayStyle={{ maxWidth: 260 }}>
															<span className="job-search-preview-skill">{s}</span>
														</Tooltip>
													))}
												</div>
											</div>
										)}

										{/* Interview rounds — blurred placeholder */}
										<div className="jd-section-block jd-section-block--rounds admin-rounds-blur-wrap">
											{/* Blurred mock content */}
											<div className="admin-rounds-blurred">
												<h4 className="jd-section-label">
													<span className="jd-section-icon jd-section-icon--violet"><MdEmojiEvents size={12} /></span>
													Interview rounds
												</h4>
												<div className="jd-ivc-list">
													{[
														{ round: 1, name: 'HR Screening', type: 'Screening', duration: '30 min', description: 'Initial call to discuss background and role fit.', accent: '#06b6d4' },
														{ round: 2, name: 'Technical Interview', type: 'Technical', duration: '60 min', description: 'Deep dive into your technical skills and problem solving.', accent: '#6366f1' },
														{ round: 3, name: 'System Design', type: 'Technical', duration: '60 min', description: 'Design a scalable system from scratch.', accent: '#8b5cf6' },
														{ round: 4, name: 'Final Round', type: 'Behavioral', duration: '45 min', description: 'Culture fit and leadership principles discussion.', accent: '#10b981' },
													].map((rd) => (
														<div key={rd.round} className="jd-ivc-card" style={{ '--ivc-accent': rd.accent } as React.CSSProperties}>
															<div className="jd-ivc-card-left">
																<span className="jd-ivc-badge" style={{ background: rd.accent }}>{rd.round}</span>
																<div className="jd-ivc-connector" aria-hidden />
															</div>
															<div className="jd-ivc-card-body">
																<div className="jd-ivc-header">
																	<span className="jd-ivc-name">{rd.name}</span>
																	<span className="jd-ivc-type-chip" style={{ color: rd.accent, borderColor: rd.accent, background: `${rd.accent}18` }}>{rd.type}</span>
																</div>
																<span className="jd-ivc-duration"><MdAccessTime size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />{rd.duration}</span>
																<p className="jd-ivc-desc">{rd.description}</p>
															</div>
														</div>
													))}
												</div>
											</div>
											{/* Overlay */}
											<div className="admin-rounds-overlay">
												<MdEmojiEvents size={24} style={{ color: '#2563eb', marginBottom: 8 }} />
												<p className="admin-fit-overlay-title">Interview Rounds</p>
												<p className="admin-fit-overlay-sub">Candidates see AI-generated interview rounds and prep tips for this role here.</p>
											</div>
										</div>

									</div>
								</div>

							</div>{/* end jd-scroll-area */}

							{/* ── Footer ── */}
							<footer className="jd-footer">
								<a
									href={previewJob.applyLink}
									target="_blank"
									rel="noreferrer"
									className="jd-action-btn jd-action-btn--apply"
									style={{ textDecoration: 'none' }}
								>
									<span className="jd-action-icon jd-action-icon--apply"><MdOpenInNew size={16} /></span>
									<span className="jd-action-text">
										<span className="jd-action-label">Apply now</span>
										<span className="jd-action-sub">→ company site</span>
									</span>
								</a>
								<button
									type="button"
									className="jd-action-btn jd-action-btn--skills"
									onClick={() => {
										sessionStorage.setItem('lpPrefillJd', previewJob.description ?? '');
										window.open('/learn', '_blank', 'noopener,noreferrer');
									}}
								>
									<span className="jd-action-icon jd-action-icon--skills"><MdSchool size={16} /></span>
									<span className="jd-action-text">
										<span className="jd-action-label">Build skills</span>
										<span className="jd-action-sub">→ learning path</span>
									</span>
								</button>
							</footer>

						</div>
					)}
				</Modal>

				<div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
					<Button
						type="text"
						className="admin-back-btn"
						style={{
							borderRadius: '20px',
							padding: '8px 24px',
							background: 'rgba(255,255,255,0.5)',
							backdropFilter: 'blur(10px)',
							border: '1px solid rgba(148,163,184,0.1)'
						}}
						icon={<MdAutoAwesome style={{ marginRight: 8, color: '#6366f1' }} />}
						onClick={() => navigate('/dashboard')}
					>
						Return to Nebula
					</Button>
				</div>
			</div>
		</div>
	);
};

export default JobManagement;