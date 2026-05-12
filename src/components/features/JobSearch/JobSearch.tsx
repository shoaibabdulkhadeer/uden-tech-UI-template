import { Alert, Avatar, Button, Checkbox, Drawer, Empty, Input, message, Modal, Popover, Radio, Segmented, Select, Skeleton, Tabs, Tooltip, Upload } from 'antd';
import { CheckCircleFilled, InboxOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { easeInOut, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
	MdPeople,
	MdSend,
	MdBolt,
	MdFlashOn,
	MdLeaderboard,
	MdTrendingUp,
	MdCheckCircle,
	MdRestartAlt,
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
					message.success('AI Matching complete! Your feed has been updated.');
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
			message.success('AI Matching complete! Your feed has been updated.');
		}, 1500);
	};

	useEffect(() => {
		sessionStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(savedIds)));
	}, [savedIds]);

	useEffect(() => {
		sessionStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(Array.from(appliedIds)));
	}, [appliedIds]);

	/* Deep-link from Dashboard (e.g. /job-search?tab=matches) */
	useEffect(() => {
		const tab = new URLSearchParams(location.search).get('tab');
		if (tab === 'matches' || tab === 'saved' || tab === 'applied') {
			setActiveView(tab as ActiveView);
		}
	}, [location]);

	useEffect(() => {
		if (uiPreview !== 'normal') return;
		setListLoading(true);
		const t = window.setTimeout(() => setListLoading(false), 480 + Math.floor(Math.random() * 220));
		return () => clearTimeout(t);
	}, [searchQuery, empFilter, workFilter, activeView, uiPreview]);

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
		list = list.filter((j) => jobMatchesQuery(j, searchQuery));
		list = list.filter((j) => filterJobsByEmployment(j, empFilter));
		list = list.filter((j) => filterJobsByWorkMode(j, workFilter));
		return list;
	}, [baseJobs, dismissedIds, searchQuery, empFilter, workFilter, activeView]);

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
				: 'You haven’t applied to any roles yet.';

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

	const filtersBlock = (
		<div className="job-search-filters-block">
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
						Add
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
			<Button type="link" size="small" className="job-search-filters-reset" onClick={resetFilters}>
				Reset search & filters
			</Button>
		</div>
	);

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
								</div>
							</section>


							<section className="job-search-card job-search-filters-card" aria-label="Job filters">
								<div className="job-search-filters-card-head">
									<MdTune className="job-search-filters-card-icon" aria-hidden />
									<h3 className="job-search-filters-card-title">Filters</h3>
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
										<Radio.Group
											className="job-search-view-toggle"
											value={activeView}
											onChange={(e) => setActiveView(e.target.value as ActiveView)}
											buttonStyle="solid"
										>
											<Radio.Button value="matches">Matched</Radio.Button>
											<Radio.Button value="saved">Saved</Radio.Button>
											<Radio.Button value="applied">Applied</Radio.Button>
										</Radio.Group>
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
																<p className="ant-upload-drag-icon">
																	<div className="ncs-wave-container">
																		<div className="ncs-wave-ring" />
																		<div className="ncs-wave-ring" />
																		<div className="ncs-wave-ring" />
																		<div className="ncs-wave-ring" />
																		<InboxOutlined />
																	</div>
																</p>
																<p className="ant-upload-text">Drag resume here or click to browse</p>
																<p className="ant-upload-hint">Support for PDF, DOCX (Max 5MB)</p>
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
															<Input.TextArea
																rows={4}
																placeholder="Paste the job description here to find matching roles in your profile..."
																value={pastedJd}
																onChange={(e) => {
																	setPastedJd(e.target.value);
																	if (jdResult) { setJdResult(''); setShowJdInput(true); }
																}}
																className="premium-textarea"
																style={{ width: '100%', marginBottom: 16 }}
															/>
															<Button
																type="primary"
																block
																loading={matchLoading}
																onClick={handleMatchJd}
																className="match-submit-btn"
															>
																Find Matches via AI
															</Button>
															</>
														)}

														{jdResult && (
															<motion.div
																initial={{ opacity: 0, y: 8 }}
																animate={{ opacity: 1, y: 0 }}
																transition={{ duration: 0.4 }}
																style={{ marginTop: 16 }}
															>
																<Alert
																	message={
																		<div className="jd-summary-inner">
																			<div className="jd-summary-heading">
																				<div className="jd-summary-icon" aria-hidden>
																					<SiBookstack className="jd-summary-icon-svg" />
																				</div>
																				<div className="jd-summary-heading-copy">
																					<p className="jd-summary-eyebrow">Job Description</p>
																					<p className="jd-summary-title">
																						Summarized version
																						<Tooltip
																							placement="right"
																							title="This is the job description you pasted. AI matching will use this to surface relevant roles."
																						>
																							<InfoCircleTwoTone className="jd-summary-info-icon" style={{ marginLeft: 8 }} />
																						</Tooltip>
																					</p>
																				</div>
																			</div>
																			<div className="jd-summary-body">
																				<Typewriter words={[jdResult]} typeSpeed={18} cursor={true} cursorColor="#059669" />
																			</div>
																		</div>
																	}
																	type="success"
																	className="jd-summary-alert"
																	showIcon={false}
																/>
															</motion.div>
														)}
													</motion.div>
												)}
											</div>
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
											message="Couldn’t load jobs"
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
												/>
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
													{job.connections != null ? (
														<div className="job-search-job-social">
															<span className="job-search-job-avatars" aria-hidden>
																<span />
																<span />
																<span />
															</span>
															<MdPeople size={13} className="job-meta-icon" aria-hidden /><span>{job.connections} connections work here</span>
														</div>
													) : null}
													{job.hiringStatus || appliedIds.has(job.id) ? (
														<p className="job-search-job-status">
															<span className="job-search-job-status-dot" aria-hidden />
															{appliedIds.has(job.id) ? 'Application submitted' : job.hiringStatus}
														</p>
													) : null}
													{job.badges?.length ? (
														<div className="job-search-job-badges">
															{job.badges.map((b) => (
																<span key={b} className="job-search-pill">
																	{b === 'Promoted' && <MdBolt size={11} className="badge-inline-icon" aria-hidden />}
																	{b === 'Easy apply' && <MdFlashOn size={11} className="badge-inline-icon" aria-hidden />}
																	{b === 'Leadership' && <MdLeaderboard size={11} className="badge-inline-icon" aria-hidden />}
																	{b === 'New posting' && <MdTrendingUp size={11} className="badge-inline-icon" aria-hidden />}
																	{b}
																</span>
															))}
														</div>
													) : null}
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
				width={560}
				centered
				destroyOnClose
				className="job-search-job-preview-modal"
				wrapClassName="job-search-job-preview-modal-wrap"
			>
				{previewJob ? (
					<div className="job-search-preview">
						<header className="job-search-preview-head">
							<div
								className="job-search-preview-logo"
								style={{
									background: `linear-gradient(135deg, hsl(${previewJob.logoHue}, 70%, 52%), hsl(${previewJob.logoHue + 40}, 65%, 42%))`
								}}
								aria-hidden
							/>
							<div className="job-search-preview-head-copy">
								<div className="job-search-preview-title-row">
									<h2 id="job-search-preview-title" className="job-search-preview-title">
										{previewJob.title}
									</h2>
									{previewJob.verified ? (
										<Tooltip title="Verified employer">
											<span className="job-search-job-shield" aria-label="Verified">
												✓
											</span>
										</Tooltip>
									) : null}
								</div>
								<p className="job-search-preview-company">
									{previewJob.company}
									<span className="job-search-job-dot"> · </span>
									{previewJob.location}
								</p>
								<div className="job-search-preview-meta-line">
									<span className="job-search-preview-chip">{previewJob.detail.employmentType}</span>
									<span className="job-search-preview-chip job-search-preview-chip--muted">{previewJob.detail.posted}</span>
									{previewJob.detail.salary ? (
										<span className="job-search-preview-chip job-search-preview-chip--accent">{previewJob.detail.salary}</span>
									) : null}
								</div>
								{previewJob.matchScore != null ? (
									<div className="job-search-preview-match">
										<span className="job-search-preview-match-score">{previewJob.matchScore}% match</span>
										<span className="job-search-preview-match-note">Mock ranking until matching API ships</span>
									</div>
								) : null}
								{previewJob.matchReasons?.length ? (
									<div className="job-search-preview-badges job-search-preview-match-badges">
										{previewJob.matchReasons.map((r) => (
											<span key={r} className="job-search-pill job-search-pill--match">
												{r}
											</span>
										))}
									</div>
								) : null}
								{previewJob.badges?.length ? (
									<div className="job-search-preview-badges">
										{previewJob.badges.map((b) => (
											<span key={b} className="job-search-pill">
												{b === 'Promoted' && <MdBolt size={11} className="badge-inline-icon" aria-hidden />}
												{b === 'Easy apply' && <MdFlashOn size={11} className="badge-inline-icon" aria-hidden />}
												{b === 'Leadership' && <MdLeaderboard size={11} className="badge-inline-icon" aria-hidden />}
												{b}
											</span>
										))}
									</div>
								) : null}
							</div>
						</header>

						<div className="job-search-preview-body">
							<section className="job-search-preview-section">
								<h3 className="job-search-preview-section-title preview-section-title--flex"><span className="filter-label-icon filter-label-icon--indigo" style={{ width: 18, height: 18 }}><MdDescription size={11} /></span>About the role</h3>
								<p className="job-search-preview-text">{previewJob.detail.description}</p>
							</section>
							<section className="job-search-preview-section">
								<h3 className="job-search-preview-section-title preview-section-title--flex"><span className="filter-label-icon filter-label-icon--cyan" style={{ width: 18, height: 18 }}><MdListAlt size={11} /></span>What you&apos;ll do</h3>
								<ul className="job-search-preview-list">
									{previewJob.detail.responsibilities.map((line) => (
										<li key={line}>{line}</li>
									))}
								</ul>
							</section>
							<section className="job-search-preview-section">
								<h3 className="job-search-preview-section-title preview-section-title--flex"><span className="filter-label-icon filter-label-icon--violet" style={{ width: 18, height: 18 }}><MdCode size={11} /></span>Skills</h3>
								<div className="job-search-preview-skills">
									{previewJob.detail.skills.map((s) => (
										<span key={s} className="job-search-preview-skill">
											{s}
										</span>
									))}
								</div>
							</section>
						</div>

						<footer className="job-search-preview-footer">
							<Button onClick={closeJobPreview}>Close</Button>
							<button
								type="button"
								className={`job-search-preview-save ${savedIds.has(previewJob.id) ? 'job-search-preview-save--on' : ''}`}
								aria-pressed={savedIds.has(previewJob.id)}
								onClick={() => toggleSave(previewJob.id)}
							>
								<span className="job-search-preview-save-inner">
									{savedIds.has(previewJob.id) ? (
										<MdBookmark className="job-search-preview-save-ico" size={18} />
									) : (
										<MdBookmarkBorder className="job-search-preview-save-ico" size={18} />
									)}
									<span className="job-search-preview-save-text">
										{savedIds.has(previewJob.id) ? 'Saved to tracker' : 'Save job'}
									</span>
								</span>
							</button>
							<Button
								type="primary"
								className="job-search-preview-apply"
								onClick={() => {
									setAppliedIds((prev) => new Set(prev).add(previewJob.id));
									message.success('Application submitted successfully!');
								}}
								disabled={appliedIds.has(previewJob.id)}
							>
								{appliedIds.has(previewJob.id) ? (
									<><MdCheckCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />Applied</>
								) : (
									<><MdSend size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />Apply (API)</>
								)}
							</Button>
						</footer>
					</div>
				) : null}
			</Modal>
		</>
	);
}

export default JobSearch;
