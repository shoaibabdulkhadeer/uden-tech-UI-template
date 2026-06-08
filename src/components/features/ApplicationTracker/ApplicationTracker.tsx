import { message, Pagination, Spin } from 'antd';
import { easeInOut, motion } from 'framer-motion';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import {
	MdDelete,
	MdDescription,
	MdEmojiEvents,
	MdListAlt,
	MdPsychology,
	MdSend,
	MdSyncAlt,
	MdViewList,
	MdViewModule,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { getTrackerApplications, trackerReset } from '../../../redux/features/jobSearch/trackerSlice';
import { deleteTracker, deleteTrackerReset } from '../../../redux/features/jobSearch/deleteTrackerSlice';
import { updateTracker, updateTrackerReset } from '../../../redux/features/jobSearch/updateTrackerSlice';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import { type JobItem } from '../JobSearch/jobSearchMock';
import JobPreviewModal from '../JobSearch/JobPreviewModal';
import '../JobSearch/job-search.css';
import '../../../styles/phase2-theme.css';
import '../../../styles/dashboard-nextgen.css';

const TRACKER_PAGE_LIMIT = 10;
const TRACKER_INITIAL_LIMIT = 40;
const KANBAN_STAGES = ['applied', 'screening', 'interview', 'offer'] as const;
type KanbanStage = typeof KANBAN_STAGES[number];

const STAGE_CFG: Record<KanbanStage, { label: string; color: string; bg: string; border: string; icon: JSX.Element }> = {
	applied:   { label: 'Applied',   color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <MdSend size={14}/> },
	screening: { label: 'Screening', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <MdListAlt size={14}/> },
	interview: { label: 'Interview', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: <MdPsychology size={14}/> },
	offer:     { label: 'Offer',     color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: <MdEmojiEvents size={14}/> },
};

const STATUS_MAP: Record<string, KanbanStage> = {
	applied:      'applied',
	shortlisted:  'screening',
	interviewing: 'interview',
	offer:        'offer',
	rejected:     'applied',
	withdrawn:    'applied',
};

const API_STATUS_MAP: Record<string, string> = {
	applied:   'applied',
	screening: 'shortlisted',
	interview: 'interviewing',
	offer:     'offer',
};

function mapEntry(entry: any, idx: number): JobItem {
	const snap = entry.job_snapshot ?? entry.job ?? {};
	const item = {
		...snap,
		job_id:   entry.job_id ?? snap.job_id ?? snap.id ?? snap._id,
		title:    snap.title   || snap.job_title   || entry.title   || 'Untitled Role',
		company:  snap.company || snap.company_name || entry.company || 'Unknown Company',
		location: snap.location || snap.city || entry.location || '',
	};
	return {
		id:             item.job_id || item._id || item.id || String(idx),
		title:          item.title,
		company:        item.company,
		location:       item.location,
		logoHue:        (idx * 47 + 180) % 360,
		verified:       item.url_status === 'valid' || item.verified || false,
		badges:         item.badges || [],
		hiringStatus:   item.hiringStatus || item.hiring_status || 'Actively Recruiting',
		sourceKind:     item.source_kind || item.sourceKind,
		employmentKind: (() => {
			const v = (item.job_type || item.employment_type || item.employmentType || '').toLowerCase();
			if (v.includes('part'))     return 'parttime';
			if (v.includes('intern'))   return 'internship';
			if (v.includes('contract')) return 'contract';
			return 'fulltime';
		})(),
		workMode: (() => {
			const v = (item.work_mode || item.workMode || '').toLowerCase();
			if (v.includes('remote'))  return 'remote';
			if (v.includes('hybrid'))  return 'hybrid';
			if (v.includes('on-site') || v.includes('onsite')) return 'onsite';
			return undefined;
		})(),
		skills:      item.skills_required || item.skills || item.required_skills || [],
		matchScore:  item.fit_score ?? item.fitScore ?? item.match_score ?? item.matchScore,
		detail: {
			description:      item.description || '',
			requirements:     item.requirements || '',
			employmentType:   item.job_type || item.employment_type || '',
			salary:           item.salary || item.salary_range || '',
			posted:           item.posted || item.posted_date || '',
			responsibilities: item.responsibilities || '',
			skills:           item.skills_required || item.skills || [],
		},
	} as unknown as JobItem;
}

const ApplicationTracker = () => {
	const dispatch = useDispatch<AppDispatch>();

	// Redux
	const { trackerData, status: trackerStatus, error: trackerError } = useSelector((s: any) => s.trackerReducer);
	const { savedJobsData } = useSelector((s: any) => s.getSavedJobsReducer);

	// Derive saved IDs from Redux (populated by JobPreviewModal or JobSearch)
	const savedIds: Set<string> = useMemo(() => {
		const raw: any[] = savedJobsData?.data?.saved_jobs ?? [];
		return new Set(raw.map((e: any) => e.job?.job_id ?? e.job?.id ?? e.job?._id).filter(Boolean));
	}, [savedJobsData]);
	const { deleteTrackerData, status: deleteTrackerStatus, error: deleteTrackerError } = useSelector((s: any) => s.deleteTrackerReducer);
	const { updateTrackerData, status: updateTrackerStatus, error: updateTrackerError } = useSelector((s: any) => s.updateTrackerReducer);

	// Tracker state
	const [trackerJobs, setTrackerJobs]       = useState<JobItem[]>([]);
	const [appStages, setAppStages]           = useState<Record<string, KanbanStage>>({});
	const [appliedIds, setAppliedIds]         = useState<Set<string>>(new Set());
	const [trackerIdMap, setTrackerIdMap]     = useState<Record<string, string>>({});
	const [trackerTotal, setTrackerTotal]     = useState(0);
	const [trackerPage, setTrackerPage]       = useState(1);
	const [trackerLoadingMore, setTrackerLoadingMore] = useState(false);
	const [previewJob, setPreviewJob]               = useState<JobItem | null>(null);

	// Drag state
	const [dragJobId, setDragJobId]   = useState<string | null>(null);
	const [dragOverCol, setDragOverCol] = useState<string | null>(null);
	const [dragPos, setDragPos]       = useState<{ x: number; y: number } | null>(null);
	const [dragMeta, setDragMeta]     = useState<{ offsetX: number; offsetY: number; w: number; h: number } | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [trackerView, setTrackerView]     = useState<'kanban' | 'progress'>('kanban');
	const [progressTab, setProgressTab]     = useState<KanbanStage>('applied');
	const [progressPage, setProgressPage]   = useState<Record<KanbanStage, number>>({ applied: 1, screening: 1, interview: 1, offer: 1 });
	const PROGRESS_PAGE_SIZE = 10;

	// Auto-fetch more when switching progress tabs if that tab is empty
	useEffect(() => {
		if (trackerView !== 'progress') return;
		const tabCount = trackerJobs.filter(j => (appStages[j.id] ?? 'applied') === progressTab).length;
		if (tabCount === 0 && trackerJobs.length < trackerTotal && !trackerStatus && !trackerLoadingMore) {
			setTrackerLoadingMore(true);
			dispatch(getTrackerApplications({ pageId: trackerPage + 1, pageLimit: TRACKER_PAGE_LIMIT }));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [progressTab, trackerView]);

	// Initial fetch
	useEffect(() => {
		dispatch(getTrackerApplications({ pageId: 1, pageLimit: TRACKER_INITIAL_LIMIT }));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Handle tracker fetch response
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
			const raw: any[]     = trackerData?.data?.entries ?? [];
			const total: number  = trackerData?.data?.total   ?? 0;
			const pageId: number = trackerData?.data?.pageId  ?? 1;
			setTrackerTotal(total);
			setTrackerPage(pageId);
			const offset = (pageId - 1) * TRACKER_PAGE_LIMIT;
			const mapped = raw.map((entry: any, idx: number) => mapEntry(entry, offset + idx));
			const newStages: Record<string, KanbanStage> = {};
			const newIdMap: Record<string, string> = {};
			raw.forEach((entry: any) => {
				const jobId = entry.job_id ?? entry.job_snapshot?.job_id ?? entry.job_snapshot?.id ?? entry.job?.id ?? entry.job?._id;
				if (jobId) {
					newStages[jobId] = STATUS_MAP[entry.status] ?? 'applied';
					if (entry.tracker_id) newIdMap[jobId] = entry.tracker_id;
				}
			});
			if (pageId === 1) {
				setTrackerJobs(mapped);
				setAppliedIds(new Set(mapped.map(j => j.id)));
				setAppStages(newStages);
				setTrackerIdMap(newIdMap);
			} else {
				setTrackerJobs(prev => [...prev, ...mapped]);
				setAppliedIds(prev => { const n = new Set(prev); mapped.forEach(j => n.add(j.id)); return n; });
				setAppStages(prev => ({ ...prev, ...newStages }));
				setTrackerIdMap(prev => ({ ...prev, ...newIdMap }));
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

	// Handle delete response
	useEffect(() => {
		if (deleteTrackerStatus) return;
		if (!deleteTrackerData && !deleteTrackerError) return;
		if (deleteTrackerError && !deleteTrackerData) {
			message.error(deleteTrackerError || 'Failed to remove from tracker');
			dispatch(deleteTrackerReset());
			return;
		}
		const code = deleteTrackerData?.statusCode ?? deleteTrackerData?.status;
		const removedId: string = deleteTrackerData?.trackerId;
		if (code === 200 || code === 201) {
			const jobId = Object.keys(trackerIdMap).find(k => trackerIdMap[k] === removedId);
			if (jobId) {
				setTrackerJobs(prev => prev.filter(j => j.id !== jobId));
				setAppliedIds(prev => { const n = new Set(prev); n.delete(jobId); return n; });
				setAppStages(prev => { const s = { ...prev }; delete s[jobId]; return s; });
				setTrackerIdMap(prev => { const m = { ...prev }; delete m[jobId]; return m; });
			}
			message.success(deleteTrackerData?.message || 'Removed from tracker');
		}
		dispatch(deleteTrackerReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteTrackerData, deleteTrackerStatus, deleteTrackerError]);

	// Handle update response
	useEffect(() => {
		if (updateTrackerStatus) return;
		if (!updateTrackerData && !updateTrackerError) return;
		if (updateTrackerError && !updateTrackerData) {
			message.error(updateTrackerError || 'Failed to update application status');
			dispatch(updateTrackerReset());
			return;
		}
		dispatch(updateTrackerReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateTrackerData, updateTrackerStatus, updateTrackerError]);

	// Scroll to load more
	const handleKanbanScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const el = e.currentTarget;
		const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
		if (nearBottom && trackerJobs.length < trackerTotal && !trackerLoadingMore && !trackerStatus) {
			setTrackerLoadingMore(true);
			dispatch(getTrackerApplications({ pageId: trackerPage + 1, pageLimit: TRACKER_PAGE_LIMIT }));
		}
	}, [trackerJobs.length, trackerTotal, trackerLoadingMore, trackerStatus, trackerPage, dispatch]);

	// Mouse drag
	useEffect(() => {
		if (!dragJobId) return;
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
				setAppStages(prev => ({ ...prev, [dragJobId]: target as KanbanStage }));
				const tid = trackerIdMap[dragJobId];
				if (tid) dispatch(updateTracker({ trackerId: tid, status: API_STATUS_MAP[target] as any }));
			}
			setDragJobId(null); setDragOverCol(null); setDragPos(null); setDragMeta(null);
			document.body.classList.remove('tracker-dragging');
		};
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dragJobId]);

	return (
		<div className="job-search-page phase2-dashboard dash-next dash-next-shell">
			<DashboardShellNetwork />
			<div className="job-search-page-inner">

				{/* ── Page Header ── */}
				<header className="dash-next-page-head">
					<div className="dash-next-page-head-row" style={{ alignItems: 'center' }}>
						<div className="dash-next-page-head-art-wrap">
							<DashboardPageHeadArt />
						</div>
						<div className="dash-next-page-head-copy">
							<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
								<h1 className="dash-next-page-title" style={{ margin: 0 }}>Application Tracker</h1>
								<span style={{
									display: 'inline-flex', alignItems: 'center', gap: 5,
									padding: '3px 10px', borderRadius: 999,
									background: '#eff6ff', border: '1px solid #bfdbfe',
									fontSize: 11, fontWeight: 600, color: '#2563eb',
								}}>
									<MdSend size={11} /> {appliedIds.size} application{appliedIds.size !== 1 ? 's' : ''}
								</span>
							</div>
							<p className="dash-next-page-lead">
								Track every application across the full hiring pipeline — drag cards between stages to update your progress in real time.
							</p>
						</div>
						{/* View toggle — pinned to right */}
						<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
							{trackerView === 'kanban' && (
								<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
									<MdSyncAlt size={13} /> Drag &amp; drop
								</span>
							)}
							<div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
								<button type="button" onClick={() => setTrackerView('kanban')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: trackerView === 'kanban' ? '#fff' : 'transparent', color: trackerView === 'kanban' ? '#0f172a' : '#64748b', boxShadow: trackerView === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', fontFamily: 'inherit' }}>
									<MdViewModule size={14} /> Kanban
								</button>
								<button type="button" onClick={() => setTrackerView('progress')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: trackerView === 'progress' ? '#fff' : 'transparent', color: trackerView === 'progress' ? '#0f172a' : '#64748b', boxShadow: trackerView === 'progress' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', fontFamily: 'inherit' }}>
									<MdViewList size={14} /> Progress
								</button>
							</div>
						</div>
					</div>
				</header>

				{/* ── Kanban Board ── */}
				<motion.div
					initial={{ y: 16, opacity: 0.7 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.35, ease: easeInOut }}
				>
					<div className="tracker-kanban application-tracker-page" style={{ padding: '0 4px' }}>

						{trackerView === 'kanban' && (
						<div className="tracker-kanban-columns">
							{KANBAN_STAGES.map((stage) => {
								const cfg = STAGE_CFG[stage];
								const jobs = trackerJobs.filter(j => (appStages[j.id] ?? 'applied') === stage);
								const isDragOver = dragOverCol === stage;
								const hasOverflow = jobs.length > 5;

								return (
									<div
										key={stage}
										className={`tracker-kanban-col${isDragOver ? ' tracker-kanban-col--drag-over' : ''}${hasOverflow ? ' tracker-kanban-col--scrollable' : ''}`}
										data-kanban-col={stage}
										style={isDragOver ? { outline: `2px dashed ${cfg.color}`, outlineOffset: '-2px', borderRadius: 12 } : undefined}
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
												return (
													<div
														key={job.id}
														className={`tracker-kanban-card${dragJobId === job.id ? ' tracker-kanban-card--dragging' : ''}`}
														style={dragJobId === job.id ? { opacity: 0, pointerEvents: 'none' } : undefined}
														onMouseDown={(e) => {
															if (confirmDeleteId) return;
															e.preventDefault();
															const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
															setDragMeta({ offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, w: rect.width, h: rect.height });
															setDragPos({ x: e.clientX, y: e.clientY });
															setDragJobId(job.id);
														}}
													>
														{/* Card top */}
														<div className="tracker-kanban-card-top">
															<span className="tracker-kanban-card-stage-pill" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
																{cfg.icon} {cfg.label}
															</span>
															<button
																type="button"
																className="tracker-kanban-card-remove"
																onMouseDown={(e) => e.stopPropagation()}
																onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(job.id); }}
																title="Remove"
															>
																<MdDelete size={13} />
															</button>
														</div>

														{/* Company + title */}
														<div className="tracker-kanban-card-identity">
															<div className="tracker-kanban-card-logo" style={{ background: `linear-gradient(135deg, hsl(${job.logoHue},70%,52%), hsl(${job.logoHue + 40},65%,42%))` }}>
																{job.company.charAt(0)}
															</div>
															<div>
																<p className="tracker-kanban-card-title">{job.title}</p>
																<p className="tracker-kanban-card-company">{job.company} · {job.location}</p>
															</div>
														</div>

														{/* Meta */}
														<div className="tracker-kanban-card-meta">
															{job.detail?.employmentType && <span className="tracker-kanban-meta-chip">{job.detail.employmentType}</span>}
															{job.workMode && <span className="tracker-kanban-meta-chip">{job.workMode}</span>}
															{job.matchScore != null && <span className="tracker-kanban-meta-chip tracker-kanban-meta-chip--fit">{job.matchScore}% fit</span>}
														</div>

											<div className="tracker-kanban-card-footer" onClick={(e) => e.stopPropagation()}>
												<div className="tracker-kanban-footer-row" style={{ justifyContent: 'flex-end' }}>
													<button
														type="button"
														className="tracker-kanban-view-btn"
														onMouseDown={(e) => e.stopPropagation()}
														onClick={(e) => { e.stopPropagation(); setPreviewJob(job); }}
													>
														<MdDescription size={11} /> View
													</button>
												</div>
											</div>
														{confirmDeleteId === job.id && (
															<div style={{
																display: 'flex', alignItems: 'center', justifyContent: 'space-between',
																marginTop: 6, padding: '6px 8px',
																background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 7,
																gap: 8,
															}} onMouseDown={(e) => e.stopPropagation()}>
																<span style={{ fontSize: 11, color: '#dc2626', fontWeight: 500, whiteSpace: 'nowrap' }}>Remove?</span>
																<div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
																	<button
																		type="button"
																		onMouseDown={(e) => e.stopPropagation()}
																		onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
																		style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#475569', lineHeight: '18px' }}
																	>Cancel</button>
																	<button
																		type="button"
																		onMouseDown={(e) => e.stopPropagation()}
																		onClick={(e) => { e.stopPropagation(); const tid = trackerIdMap[job.id]; if (tid) dispatch(deleteTracker(tid)); setConfirmDeleteId(null); }}
																		style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, border: 'none', background: '#ef4444', cursor: 'pointer', color: '#fff', fontWeight: 600, lineHeight: '18px' }}
																	>Remove</button>
																</div>
															</div>
														)}
													</div>
												);
											})}
										</div>

										{hasOverflow && (
											<div className="tracker-kanban-col-overflow">↕ Scroll to see all {jobs.length} in this stage</div>
										)}
										{stage === 'offer' && !trackerLoadingMore && trackerJobs.length < trackerTotal && (
											<div className="tracker-kanban-load-more" style={{ borderTop: '1px solid #f1f5f9' }}>
												<span style={{ color: '#94a3b8', fontSize: 11 }}>↓ {trackerTotal - trackerJobs.length} more — scroll any column to load</span>
											</div>
										)}
										{stage === 'offer' && trackerLoadingMore && (
											<div className="tracker-kanban-load-more"><Spin size="small" /> Loading more…</div>
										)}
									</div>
								);
							})}
						</div>
						)}

						{trackerView === 'progress' && (() => {
							const allTabJobs = trackerJobs.filter(j => (appStages[j.id] ?? 'applied') === progressTab);
							const currentPage = progressPage[progressTab];
							const tabJobs = allTabJobs.slice((currentPage - 1) * PROGRESS_PAGE_SIZE, currentPage * PROGRESS_PAGE_SIZE);
							const tabCfg = STAGE_CFG[progressTab];
							return (
							<div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
								{/* Stage tabs — progress bar stepper */}
								<div className="pipeline-stage-strip" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
									{KANBAN_STAGES.map((s, idx, arr) => {
										const sCfg = STAGE_CFG[s];
										const count = trackerJobs.filter(j => (appStages[j.id] ?? 'applied') === s).length;
										const activeIdx = KANBAN_STAGES.indexOf(progressTab);
										const isActive = s === progressTab;
										const isPast   = activeIdx > idx;
										const ICONS = [MdSend, MdListAlt, MdPsychology, MdEmojiEvents];
										const Icon  = ICONS[idx];
										return (
											<Fragment key={s}>
												<button
													type="button"
													className={`pipeline-stage-pill${isActive ? ' pipeline-stage-pill--active' : ''}${isPast ? ' pipeline-stage-pill--past' : ''}`}
													onClick={() => { setProgressTab(s); setProgressPage(prev => ({ ...prev, [s]: 1 })); }}
												>
													<span className="pipeline-stage-pill-icon"><Icon size={11} /></span>
													<span className="pipeline-stage-pill-text">
														<span className="pipeline-stage-pill-label">{sCfg.label}</span>
														{count > 0 && <span className="pipeline-stage-pill-count">{count}</span>}
													</span>
												</button>
												{idx < arr.length - 1 && (
													<span className={`pipeline-stage-connector${isPast ? ' pipeline-stage-connector--filled' : ''}`} />
												)}
											</Fragment>
										);
									})}
								</div>

								{/* Job list for selected tab */}
								{tabJobs.length === 0 ? (
									<div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>
										<span style={{ fontSize: 28, display: 'block', marginBottom: 8, opacity: 0.4 }}>{tabCfg.icon}</span>
										No applications in {tabCfg.label}
									</div>
								) : tabJobs.map((job) => {
									const stage = appStages[job.id] ?? 'applied';
									const cfg = STAGE_CFG[stage];
									const currentIdx = KANBAN_STAGES.indexOf(stage);
									const nextStage = currentIdx < KANBAN_STAGES.length - 1 ? KANBAN_STAGES[currentIdx + 1] : null;
									const nextCfg = nextStage ? STAGE_CFG[nextStage] : null;
									return (
										<div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', borderRadius: 10, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
											{/* Logo */}
											<div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg, hsl(${job.logoHue},70%,52%), hsl(${job.logoHue+40},65%,42%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
												{job.company.charAt(0)}
											</div>
											{/* Info */}
											<div style={{ flex: 1, minWidth: 0 }}>
												<p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
												<p style={{ margin: 0, fontSize: 11.5, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}{job.location ? ` · ${job.location}` : ''}</p>
											</div>
											{/* Stage badge */}
											<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>
												{cfg.icon} {cfg.label}
											</span>
											{/* View button */}
											<button
												type="button"
												style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#2563eb', fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}
												onClick={() => setPreviewJob(job)}
											>
												<MdDescription size={12} /> View
											</button>
											{/* Move to next stage */}
											{nextCfg && nextStage && (
												<button
													type="button"
													style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1px solid ${nextCfg.border}`, background: nextCfg.bg, color: nextCfg.color, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}
													onClick={() => {
														setAppStages(prev => ({ ...prev, [job.id]: nextStage }));
														const tid = trackerIdMap[job.id];
														if (tid) dispatch(updateTracker({ trackerId: tid, status: API_STATUS_MAP[nextStage] as any }));
													}}
												>
													{nextCfg.icon} Move to {nextCfg.label}
												</button>
											)}
										</div>
									);
								})}

								{trackerLoadingMore ? (
									<div style={{ textAlign: 'center', paddingTop: 8, color: '#94a3b8', fontSize: 12 }}>
										<Spin size="small" /> Loading…
									</div>
								) : allTabJobs.length > PROGRESS_PAGE_SIZE && (
									<div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
										<Pagination
											current={currentPage}
											pageSize={PROGRESS_PAGE_SIZE}
											total={allTabJobs.length}
											size="small"
											showSizeChanger={false}
											onChange={(page) => setProgressPage(prev => ({ ...prev, [progressTab]: page }))}
										/>
									</div>
								)}
							</div>
							);
						})()}
					</div>
				</motion.div>

			</div>

			{/* ── Job Preview Modal ── */}
			<JobPreviewModal previewJob={previewJob} onClose={() => setPreviewJob(null)} />

			{/* Floating drag ghost */}
			{dragJobId && dragPos && dragMeta && (() => {
				const dj = trackerJobs.find(j => j.id === dragJobId);
				if (!dj) return null;
				return ReactDOM.createPortal(
					<div style={{
						position: 'fixed',
						left: dragPos.x - dragMeta.offsetX,
						top:  dragPos.y - dragMeta.offsetY,
						width: dragMeta.w,
						zIndex: 99999,
						pointerEvents: 'none',
						transform: 'rotate(3deg) scale(1.05)',
						boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
						borderRadius: 8,
						background: '#fff',
						border: '1px solid #94a3b8',
						padding: '9px 10px',
					}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
							<div style={{
								width: 28, minWidth: 28, height: 28, borderRadius: 6,
								background: `linear-gradient(135deg, hsl(${dj.logoHue},70%,52%), hsl(${dj.logoHue + 40},65%,42%))`,
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
							}}>
								{dj.company.charAt(0)}
							</div>
							<div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
								<p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dj.title}</p>
								<p style={{ margin: 0, fontSize: 10.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dj.company} · {dj.location}</p>
							</div>
						</div>
					</div>,
					document.body
				);
			})()}
		</div>
	);
};

export default ApplicationTracker;
