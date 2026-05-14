import { Alert, Avatar, Button, Checkbox, Drawer, Empty, Input, message, Modal, Popover, Radio, Segmented, Select, Skeleton, Tabs, Tooltip, Upload } from 'antd';
import { CheckCircleFilled, InboxOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { easeInOut, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { SiBookstack } from 'react-icons/si';
import { Typewriter } from 'react-simple-typewriter';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import { LocationFilter } from './LocationFilter';
import {
	EMPLOYMENT_OPTIONS,
	filterJobsByEmployment,
	filterJobsByWorkMode,
	jobMatchesQuery,
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

function JobSearch() {
	const navigate = useNavigate();
	const location = useLocation();
	const [activeView, setActiveView] = useState<ActiveView>('matches');
	const [searchQuery, setSearchQuery] = useState('');
	const [empFilter, setEmpFilter] = useState<EmploymentKind[]>([]);
	const [workFilter, setWorkFilter] = useState<WorkMode[]>([]);
	const [expFilter, setExpFilter] = useState<string | undefined>(undefined);
	const [sectorFilter, setSectorFilter] = useState<string | undefined>(undefined);
	const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [locationResetKey, setLocationResetKey] = useState(0);
	const [savedIds, setSavedIds] = useState<Set<string>>(loadSavedIds);
	const [appliedIds, setAppliedIds] = useState<Set<string>>(loadAppliedIds);
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
	const [uploadedFile, setUploadedFile] = useState<any>(null);
	const [aiSteps, setAiSteps] = useState<string[]>([]);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [showFullResume, setShowFullResume] = useState(false);
	const [detectedFilters, setDetectedFilters] = useState<{ skills: string[]; expLevel: string | null; workMode: WorkMode | null; source: 'resume' | 'jd' } | null>(null);
	const [filtersJustApplied, setFiltersJustApplied] = useState(false);
	const [showFindTour, setShowFindTour] = useState(false);
	const [tourStep, setTourStep] = useState<1 | 2>(1);
	const [tourBubblePos, setTourBubblePos] = useState<{ top: number; left: number; width: number } | null>(null);
	const [tourCardRect, setTourCardRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
	const findBtnRef = useRef<HTMLButtonElement>(null);
	const filterCardRef = useRef<HTMLElement>(null);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [submittedFilters, setSubmittedFilters] = useState<{
		searchQuery: string; empFilter: EmploymentKind[]; workFilter: WorkMode[];
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
			} else {
				setUploadedFile(info.file);
			}
		}

		if (status === 'done') {
			setMatchLoading(true);
			
			const steps = [
				'AI is scanning document structure...',
				'Extracting skills and experience...',
				'Parsing career trajectory...',
				'Cross-referencing with live roles...',
				'Generating compatibility scores...'
			];

			let currentStep = 0;
			const interval = setInterval(() => {
				if (currentStep < steps.length) {
					setAiSteps((prev:any) => [...prev, steps[currentStep]]);
					currentStep++;
				} else {
					clearInterval(interval);
					setMatchLoading(false);
					setAiSteps([]);
					setDetectedFilters({ skills: ['React', 'TypeScript', 'Node.js', 'System Design'], expLevel: 'mid', workMode: 'remote', source: 'resume' });
				}
			}, 800);
		} else if (status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
			setMatchLoading(false);
		}
	};

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
			setDetectedFilters({ skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'], expLevel: 'senior', workMode: 'hybrid', source: 'jd' });
		}, 1500);
	};

	useEffect(() => {
		sessionStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(savedIds)));
	}, [savedIds]);

	useEffect(() => {
		sessionStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(Array.from(appliedIds)));
	}, [appliedIds]);

	useEffect(() => {
		if (!showFindTour) { setTourBubblePos(null); setTourCardRect(null); return; }
		const selector = tourStep === 1
			? '.job-search-sidebar .skill-filter'
			: '.job-search-sidebar .js-filter-cta-row';

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
			return MOCK_JOBS.filter((j) => savedIds.has(j.id));
		}
		if (activeView === 'applied') {
			return MOCK_JOBS.filter((j) => appliedIds.has(j.id));
		}
		if (activeView === 'matches') {
			return [...MOCK_JOBS]
				.filter((j) => j.matchScore != null)
				.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
		}
		return MOCK_JOBS;
	}, [activeView, savedIds, appliedIds]);

	const filteredJobs = useMemo(() => {
		let list = baseJobs;
		if (activeView !== 'saved') {
			list = list.filter((j) => !dismissedIds.has(j.id));
		}
		const f = submittedFilters;
		if (!f) return list;
		list = list.filter((j) => jobMatchesQuery(j, f.searchQuery));
		list = list.filter((j) => filterJobsByEmployment(j, f.empFilter));
		list = list.filter((j) => filterJobsByWorkMode(j, f.workFilter));
		return list;
	}, [baseJobs, dismissedIds, submittedFilters, activeView]);

	const toggleSave = useCallback((id: string, e?: React.MouseEvent) => {
		e?.stopPropagation();
		setSavedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
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

	const activeFilterCount = [
		searchQuery.trim() !== '',
		empFilter.length > 0,
		workFilter.length > 0,
		expFilter != null,
		sectorFilter != null,
		skillsFilter.length > 0,
	].filter(Boolean).length;

	const handleFindJobs = useCallback(() => {
		if (activeFilterCount === 0) return;
		setShowReviewModal(true);
	}, [activeFilterCount]);

	const handleConfirmSearch = () => {
		setShowReviewModal(false);
		setListLoading(true);
		setSubmittedFilters({ searchQuery, empFilter, workFilter, expFilter, sectorFilter, skillsFilter });
		// TODO: dispatch AI matching API here
		const t = window.setTimeout(() => setListLoading(false), 900 + Math.floor(Math.random() * 400));
		return () => clearTimeout(t);
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
		setDetectedFilters(null);
		setFiltersJustApplied(true);
		setTourStep(1);
		setShowFindTour(true);
		setTimeout(() => setFiltersJustApplied(false), 3000);
	}, [detectedFilters]);

	const resetFilters = useCallback(() => {
		setSearchQuery('');
		setEmpFilter([]);
		setWorkFilter([]);
		setExpFilter(undefined);
		setSectorFilter(undefined);
		setSkillsFilter([]);
		setSkillInput('');
		setLocationResetKey((k) => k + 1);
		setDismissedIds(new Set());
		setSubmittedFilters(null);
		setUiPreview('normal');
	}, []);

	const openJobPreview = useCallback((job: JobItem) => setPreviewJob(job), []);
	const closeJobPreview = useCallback(() => setPreviewJob(null), []);

	const showSkeleton = uiPreview === 'loading' || (listLoading && uiPreview === 'normal');
	const showError = uiPreview === 'error';
	const showForcedEmpty = uiPreview === 'empty';
	const listToRender = showForcedEmpty ? [] : filteredJobs;

	const feedTitle =
		activeView === 'matches'
			? 'Matched for you'
			: activeView === 'saved'
				? 'Saved jobs'
				: 'Applied jobs';

	const feedSub =
		activeView === 'matches'
			? 'Ranked by fit with your learning path and saved skills (mock scoring).'
			: activeView === 'saved'
				? 'Roles you bookmarked for later. Same detail view as search and matches.'
				: 'Applications you have started or submitted through the portal.';

	const emptyDescription =
		activeView === 'saved'
			? 'Save jobs from matches with the bookmark control.'
			: activeView === 'matches'
				? 'No recommended roles match your filters — try widening work mode or employment type.'
				: 'You havent applied to any roles yet';

	const previewPanel = (
		<div className="job-search-state-preview">
			<p className="job-search-state-preview-hint">Stakeholder preview (no API)</p>
			<Button type="link" size="small" onClick={() => setUiPreview('loading')}>
				Loading
			</Button>
			<Button type="link" size="small" onClick={() => setUiPreview('empty')}>
				Empty list
			</Button>
			<Button type="link" size="small" onClick={() => setUiPreview('error')}>
				Error + retry
			</Button>
			<Button type="link" size="small" onClick={() => setUiPreview('normal')}>
				Reset
			</Button>
		</div>
	);

	const filtersBlock = useMemo(() => (
		<div className="job-search-filters-block">
			<div className="js-filter-top-group">
			<p className="job-search-filters-label">
				<span className="filter-label-icon filter-label-icon--indigo"><MdWorkOutline size={12} /></span>
				Employment
			</p>
			<Checkbox.Group
				className="job-search-checkbox-group"
				options={EMPLOYMENT_OPTIONS}
				value={empFilter}
				onChange={(v) => setEmpFilter(v as EmploymentKind[])}
			/>
			<p className="job-search-filters-label">
				<span className="filter-label-icon filter-label-icon--cyan"><MdLaptop size={12} /></span>
				Work Mode
			</p>
			<Checkbox.Group
				className="job-search-checkbox-group"
				options={WORK_MODE_OPTIONS}
				value={workFilter}
				onChange={(v) => setWorkFilter(v as WorkMode[])}
			/>
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
							<span key={skill} className={`skill-badge skill-badge--${idx % 8}`}>
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
			<LocationFilter key={locationResetKey} />
			<div className="js-filter-cta-row">
			<Button type="link" size="small" className="job-search-filters-reset" onClick={resetFilters}><MdRestartAlt size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />Reset</Button>
			<button
				ref={findBtnRef}
				type="button"
				className={`js-find-btn${activeFilterCount === 0 ? ' js-find-btn--disabled' : ''}${filtersJustApplied ? ' js-find-btn--glow' : ''}${showFindTour ? ' js-find-btn--tour-target' : ''}`}
				onClick={() => { setShowFindTour(false); handleFindJobs(); }}
				disabled={activeFilterCount === 0}
			>
				<MdAutoAwesome size={13} />
				Find AI Matches
				{activeFilterCount > 0 && <span className="js-find-btn-badge">{activeFilterCount}</span>}
			</button>
		</div>
		</div>
	), [empFilter, workFilter, expFilter, sectorFilter, skillInput, skillsFilter, locationResetKey, activeFilterCount, filtersJustApplied, showFindTour, resetFilters, handleFindJobs]);

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
					initial={{ y: 24, opacity: 0.6 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.75, ease: easeInOut }}
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
											<button type="button"
												className={`view-tab view-tab--emerald${activeView === 'applied' ? ' view-tab--active' : ''}`}
												onClick={() => setActiveView('applied')}>
												<span className="view-tab-icon"><MdCheckCircle size={13} /></span>
												<span className="view-tab-label">Applied</span>
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
									</div>									{activeView === 'matches' && (
										<div className="job-search-card stalker-card match-engine-container">
										
											{/* <div className="match-engine-header">
												<div className="match-icon-box" style={{ background: '#f97316' }}>
													<MdWorkOutline size={24} color="white" />
												</div>
												<div className="match-title-group">
													<h3>Match Engine</h3>
													<p>Real-time AI matching</p>
												</div>
											</div> */}

											<div className="match-engine-nav">
												<button 
													type="button"
													className={`match-engine-nav-item ${matchEngineTab === 'resume' ? 'active' : ''}`}
													onClick={() => setMatchEngineTab('resume')}
												>
													<MdAutoAwesome className="match-nav-icon" />
													<span>Upload Resume</span>
												</button>
												<button 
													type="button"
													className={`match-engine-nav-item ${matchEngineTab === 'jd' ? 'active' : ''}`}
													onClick={() => setMatchEngineTab('jd')}
												>
													<MdInsights className="match-nav-icon" />
													<span>Paste JD</span>
												</button>
												{matchEngineTab === 'jd' && jdResult && (
													<button
														type="button"
														className="match-engine-nav-toggle"
														onClick={() => setShowJdInput((v) => !v)}
														aria-pressed={showJdInput}
													>
														<span className="jd-toggle-label">Input</span>
														<span className={`jd-toggle-track${showJdInput ? ' on' : ''}`}>
															<span className="jd-toggle-knob" />
														</span>
													</button>
												)}
												{matchEngineTab === 'jd' && (pastedJd || jdResult) && (
													<button
														type="button"
														className="jd-reset-btn jd-reset-btn--nav"
														onClick={() => { setPastedJd(''); setJdResult(''); setShowJdInput(true); }}
													>
														<MdRestartAlt size={11} />
														Reset
													</button>
												)}
											</div>

											<div className="match-engine-content">
												{matchEngineTab === 'resume' ? (
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
																				<div key={idx} className="thinking-text">{step}</div>
																			))}
																		</div>
																	</div>
																)}
															</div>
														)}
													</motion.div>
												) : (
													<motion.div 
														key="jd"
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														className="match-jd-zone"
													>
														{showJdInput && (
															<>
															<div className="jd-input-wrapper">
																<div className="jd-input-label">
																	<MdContentPaste size={11} className="jd-input-label-icon" />
																	<span>Paste job description</span>
																</div>
																<Input.TextArea
																	rows={3}
																	placeholder="Paste job description here to match roles…"
																	value={pastedJd}
																	onChange={(e) => {
																		setPastedJd(e.target.value);
																		if (jdResult) { setJdResult(''); setShowJdInput(true); }
																	}}
																	className="premium-textarea"
																	style={{ width: '100%' }}
																/>
															</div>
															<Button
																type="primary"
																block
																loading={matchLoading}
																onClick={handleMatchJd}
																className="match-submit-btn"
															>
																{!matchLoading && <MdAutoAwesome size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />}
																Find Matches
															</Button>
															</>
														)}

														{jdResult && (
															<motion.div
																initial={{ opacity: 0, y: 8 }}
																animate={{ opacity: 1, y: 0 }}
																transition={{ duration: 0.4 }}
															>
																<div className="jd-result-card">
																	<div className="jd-result-header">
																		<span className="jd-result-dot" />
																		<span className="jd-result-dot jd-result-dot--2" />
																		<span className="jd-result-dot jd-result-dot--3" />
																		<span className="jd-result-header-label">
																			<SiBookstack size={10} />
																			JD Summary
																		</span>
																		<Tooltip placement="right" title="AI will use this to surface matching roles.">
																			<InfoCircleTwoTone className="jd-result-info-icon" />
																		</Tooltip>
																	</div>
																	<div className="jd-result-body">
																		<Typewriter words={[jdResult]} typeSpeed={18} cursor cursorColor="#6366f1" />
																	</div>
																</div>
															</motion.div>
														)}
													</motion.div>
												)}
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
												</div>
												<button type="button" className="js-ai-apply-btn" onClick={applyDetectedFilters}>
													<MdBolt size={12} />
													Apply to filters
												</button>
											</div>
										)}
									</div>
									)}

									<div className="job-search-toolbar">
										<Input.Search
											className="job-search-search-input"
											placeholder="Search titles, companies, skills…"
											allowClear
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
										<Popover content={previewPanel} title="UI states" trigger="click" placement="bottomRight">
											<Button size="small" type="link" className="job-search-preview-states-btn">
												Preview states
											</Button>
										</Popover>
									</div>
									<div className="job-search-feed-head-copy">
										<h2 className="job-search-feed-title">
											<span className={`filter-label-icon filter-label-icon--${activeView === 'matches' ? 'indigo' : activeView === 'saved' ? 'amber' : 'emerald'}`} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }}>
												{activeView === 'matches' && <MdAutoAwesome size={13} />}
												{activeView === 'saved' && <MdBookmark size={13} />}
												{activeView === 'applied' && <MdSend size={13} />}
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

								{showSkeleton ? (
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

								{!showSkeleton && !showError ? (
									<ul className="job-search-job-list">
										{matchLoading ? (
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
														<MdBusiness size={12} className="job-meta-icon" aria-hidden />{job.company} <span className="job-search-job-dot">·</span> <MdLocationOn size={12} className="job-meta-icon" aria-hidden />{job.location}
														<span className="job-search-job-dot"> · </span>
														<span className="job-search-job-kind">
															{EMPLOYMENT_OPTIONS.find((o) => o.value === job.employmentKind)?.label}
														</span>
														<span className="job-search-job-dot"> · </span>
														<span className="job-search-job-kind">
															{WORK_MODE_OPTIONS.find((o) => o.value === job.workMode)?.label}
														</span>
													</p>
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

								{!showSkeleton && !showError && listToRender.length === 0 ? (
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
							<button type="button" className="jd-action-btn jd-action-btn--apply" onClick={() => { setAppliedIds((prev) => new Set(prev).add(previewJob.id)); message.success('Application submitted!'); }} disabled={appliedIds.has(previewJob.id)}>
								<span className="jd-action-icon jd-action-icon--apply">{appliedIds.has(previewJob.id) ? <MdCheckCircle size={16}/> : <MdRocketLaunch size={16}/>}</span>
								<span className="jd-action-text"><span className="jd-action-label">{appliedIds.has(previewJob.id) ? 'Applied ✓' : 'Apply now'}</span><span className="jd-action-sub">→ tracker</span></span>
							</button>

							<button type="button" className={`jd-action-btn jd-action-btn--save ${savedIds.has(previewJob.id) ? 'jd-action-btn--saved' : ''}`} onClick={() => toggleSave(previewJob.id)}>
								<span className="jd-action-icon jd-action-icon--save">{savedIds.has(previewJob.id) ? <MdBookmark size={16}/> : <MdBookmarkBorder size={16}/>}</span>
								<span className="jd-action-text"><span className="jd-action-label">{savedIds.has(previewJob.id) ? 'Saved' : 'Save for later'}</span><span className="jd-action-sub">→ saved list</span></span>
							</button>

							<button type="button" className="jd-action-btn jd-action-btn--skills" onClick={() => message.info('Opening learning path…')}>
								<span className="jd-action-icon jd-action-icon--skills"><MdSchool size={16}/></span>
								<span className="jd-action-text"><span className="jd-action-label">Build skills</span><span className="jd-action-sub">→ full learning path</span></span>
							</button>

							<button type="button" className="jd-action-btn jd-action-btn--prepare" onClick={() => message.info('Opening round prep…')}>
								<span className="jd-action-icon jd-action-icon--prepare"><MdPsychology size={16}/></span>
								<span className="jd-action-text"><span className="jd-action-label">Prepare round</span><span className="jd-action-sub">→ round learning path</span></span>
							</button>
						</footer>
					</div>
				) : null}
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
							{tourStep === 1 ? (
								<>
									<p className="js-tour-bubble-eyebrow"><MdAutoAwesome size={11} />Step 1 of 2</p>
									<p className="js-tour-bubble-text">
										These filters have been <strong>pre-filled from your resume / JD</strong>. Feel free to tweak them to better match what you're looking for.
									</p>
									<div className="js-tour-bubble-footer">
										<span className="js-tour-bubble-dots"><span className="js-tour-dot js-tour-dot--active" /><span className="js-tour-dot" /></span>
										<button type="button" className="js-tour-bubble-cta" onClick={() => {
											setTourCardRect(null);
											setTourBubblePos(null);
											setTourStep(2);
											setTimeout(() => {
												const btn = document.querySelector('.job-search-sidebar .js-find-btn') as HTMLElement | null;
												btn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
											}, 100);
										}}>Next →</button>
									</div>
								</>
							) : (
								<>
									<p className="js-tour-bubble-eyebrow"><MdAutoAwesome size={11} />Step 2 of 2</p>
									<p className="js-tour-bubble-text">
										Happy with your filters? Click <strong>Find AI Matches</strong> to run your personalised AI job search.
									</p>
									<div className="js-tour-bubble-footer">
										<span className="js-tour-bubble-dots"><span className="js-tour-dot" /><span className="js-tour-dot js-tour-dot--active" /></span>
										<button type="button" className="js-tour-bubble-cta" onClick={() => setShowFindTour(false)}>Got it ✓</button>
									</div>
								</>
							)}
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
						<div className="js-review-hero-bg" aria-hidden />
						<div className="js-review-hero-icon"><MdAutoAwesome size={22} /></div>
						<div>
							<p className="js-review-eyebrow">AI Match Engine</p>
							<h2 className="js-review-title">Review your filters</h2>
							<p className="js-review-sub">Make sure these look right before we run the search — each query uses AI matching.</p>
						</div>
					</div>

					<div className="js-review-filters">
						{searchQuery.trim() && (
							<div className="js-review-row">
								<span className="js-review-row-label">Search</span>
								<span className="js-review-chip js-review-chip--blue">{searchQuery}</span>
							</div>
						)}
						{empFilter.length > 0 && (
							<div className="js-review-row">
								<span className="js-review-row-label">Employment</span>
								<div className="js-review-chips">
									{empFilter.map((e) => <span key={e} className="js-review-chip js-review-chip--indigo">{e}</span>)}
								</div>
							</div>
						)}
						{workFilter.length > 0 && (
							<div className="js-review-row">
								<span className="js-review-row-label">Work mode</span>
								<div className="js-review-chips">
									{workFilter.map((w) => <span key={w} className="js-review-chip js-review-chip--cyan">{w}</span>)}
								</div>
							</div>
						)}
						{expFilter && (
							<div className="js-review-row">
								<span className="js-review-row-label">Experience</span>
								<span className="js-review-chip js-review-chip--amber">{expFilter}</span>
							</div>
						)}
						{sectorFilter && (
							<div className="js-review-row">
								<span className="js-review-row-label">Sector</span>
								<span className="js-review-chip js-review-chip--emerald">{sectorFilter}</span>
							</div>
						)}
						{skillsFilter.length > 0 && (
							<div className="js-review-row">
								<span className="js-review-row-label">Skills</span>
								<div className="js-review-chips">
									{skillsFilter.map((s) => <span key={s} className="js-review-chip js-review-chip--violet">{s}</span>)}
								</div>
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
						<button type="button" className="js-review-confirm-btn" onClick={handleConfirmSearch}>
							<MdRocketLaunch size={14} />
							Find my matches
						</button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default JobSearch;
