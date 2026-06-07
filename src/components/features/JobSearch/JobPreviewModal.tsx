import { message, Modal, Skeleton, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import {
	MdAccessTime,
	MdAttachMoney,
	MdAutoAwesome,
	MdAutoGraph,
	MdBarChart,
	MdBookmark,
	MdBookmarkBorder,
	MdBusiness,
	MdCheckCircle,
	MdCode,
	MdDescription,
	MdEmojiEvents,
	MdFactCheck,
	MdInsights,
	MdLocationOn,
	MdOutlineAssignment,
	MdSchool,
	MdThumbUp,
	MdTrendingUp,
	MdVerified,
	MdWarning,
	MdWorkOutline,
	MdWorkspacePremium,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { getJobById, getJobByIdReset } from '../../../redux/features/jobSearch/getJobByIdSlice';
import { getInterviewRounds, getInterviewRoundsReset } from '../../../redux/features/jobSearch/getInterviewRoundsSlice';
import { saveJob, saveJobReset } from '../../../redux/features/jobSearch/saveJobSlice';
import { unsaveJob, unsaveJobReset } from '../../../redux/features/jobSearch/unsaveJobSlice';
import { getSavedJobs, getSavedJobsReset } from '../../../redux/features/jobSearch/getSavedJobsSlice';
import { type JobItem } from './jobSearchMock';
import './job-search.css';
import '../../../styles/phase2-theme.css';

// ---------------------------------------------------------------------------
// Minimal local mapper — mirrors what JobSearch does when it receives jobByIdData
// ---------------------------------------------------------------------------
function mapApiJobToJobItem(item: any, idx: number): JobItem {
	const rawSalary = item.salary || item.salary_range || '';
	const salary =
		rawSalary.replace(/[^a-z0-9$£€\s,.\-–]/gi, '').trim().length > 3
			? rawSalary
			: undefined;

	const skills: string[] = item.skills_required || item.skills || item.required_skills || [];

	const fitScore: number | undefined = item.fit_score ?? item.fitScore;
	const matchScore: number | undefined =
		fitScore != null
			? fitScore
			: item.score != null
			? Math.min(100, Math.round(Number(item.score) * 100))
			: item.match_score ?? item.matchScore;

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
			if (v.includes('part'))     return 'parttime';
			if (v.includes('intern'))   return 'internship';
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
		matchReasons:     item.match_reasons || item.matchReasons || [],
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
	} as unknown as JobItem;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface JobPreviewModalProps {
	previewJob: JobItem | null;
	onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const JobPreviewModal = ({ previewJob, onClose }: JobPreviewModalProps) => {
	const dispatch = useDispatch<AppDispatch>();

	// Redux state
	const { jobByIdData, status: jobByIdStatus, error: jobByIdError } = useSelector(
		(state: any) => state.getJobByIdReducer
	);
	const { interviewRoundsData, status: interviewRoundsStatus, error: interviewRoundsError } = useSelector(
		(state: any) => state.getInterviewRoundsReducer
	);
	const { saveJobData, status: saveJobStatus, error: saveJobError } = useSelector(
		(state: any) => state.saveJobReducer
	);
	const { unsaveJobData, status: unsaveJobStatus, error: unsaveJobError, pendingId: unsavePendingId } = useSelector(
		(state: any) => state.unsaveJobReducer
	);
	const { savedJobsData, status: savedJobsStatus } = useSelector(
		(state: any) => state.getSavedJobsReducer
	);

	// Local state
	const [livePreviewJob, setLivePreviewJob] = useState<JobItem | null>(null);
	const [liveInterviewRounds, setLiveInterviewRounds] = useState<any[]>([]);
	const [interviewDataAvailable, setInterviewDataAvailable] = useState<boolean | null>(null);
	const [interviewNotFoundMsg, setInterviewNotFoundMsg] = useState<string | null>(null);
	const [interviewDisclaimer, setInterviewDisclaimer] = useState<string | null>(null);
	const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

	// The job data to display — live (API-enriched) if available, else the prop
	const job = livePreviewJob ?? previewJob;

	// ── Effect: when previewJob changes, kick off API calls ──
	useEffect(() => {
		if (previewJob) {
			setLivePreviewJob(null);
			setLiveInterviewRounds([]);
			setInterviewDataAvailable(null);
			setInterviewNotFoundMsg(null);
			setInterviewDisclaimer(null);
			dispatch(getJobById(previewJob.id));
			if (previewJob.company && previewJob.title) {
				dispatch(getInterviewRounds({ company: previewJob.company, role: previewJob.title }));
			}
		} else {
			setLivePreviewJob(null);
			setLiveInterviewRounds([]);
			setInterviewDataAvailable(null);
			setInterviewNotFoundMsg(null);
			setInterviewDisclaimer(null);
			dispatch(getJobByIdReset());
			dispatch(getInterviewRoundsReset());
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [previewJob]);

	// ── Effect: handle getJobById response ──
	useEffect(() => {
		if (jobByIdStatus) return;
		if (!jobByIdData && !jobByIdError) return;

		if (jobByIdError && !jobByIdData) {
			dispatch(getJobByIdReset());
			return;
		}

		const code = jobByIdData?.statusCode ?? jobByIdData?.status;
		if (code === 200 || code === 201) {
			const raw = jobByIdData?.data;
			if (raw) {
				setLivePreviewJob(mapApiJobToJobItem(raw, 0));
			}
		}

		dispatch(getJobByIdReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jobByIdData, jobByIdStatus, jobByIdError]);

	// ── Effect: handle getInterviewRounds response ──
	useEffect(() => {
		if (interviewRoundsStatus) return;
		if (!interviewRoundsData && !interviewRoundsError) return;

		if (interviewRoundsError && !interviewRoundsData) {
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

	// ── Fetch saved jobs on mount to populate savedIds ──
	useEffect(() => {
		dispatch(getSavedJobs({ pageId: 1, pageLimit: 50 }));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (savedJobsStatus) return;
		if (!savedJobsData) return;
		const code = savedJobsData?.statusCode ?? savedJobsData?.status;
		if (code === 200 || code === 201) {
			const raw: any[] = savedJobsData?.data?.saved_jobs ?? [];
			const ids = new Set<string>(
				raw.map((e: any) => e.job?.job_id ?? e.job?.id ?? e.job?._id ?? e.job_id ?? e.id).filter(Boolean)
			);
			setSavedIds(ids);
		}
		dispatch(getSavedJobsReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedJobsData, savedJobsStatus]);

	useEffect(() => {
		if (saveJobStatus) return;
		if (!saveJobData && !saveJobError) return;
		const code = saveJobData?.statusCode ?? saveJobData?.status;
		if (code === 200 || code === 201) {
			if (saveJobData?.data?.job_id) setSavedIds(prev => new Set(prev).add(saveJobData.data.job_id));
			message.success(saveJobData?.message || 'Job saved');
		} else if (saveJobError) {
			message.error(saveJobError || 'Failed to save job');
		}
		dispatch(saveJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [saveJobData, saveJobStatus, saveJobError]);

	useEffect(() => {
		if (unsaveJobStatus) return;
		if (!unsaveJobData && !unsaveJobError) return;
		const code = unsaveJobData?.statusCode ?? unsaveJobData?.status;
		if (code === 200 || code === 201) {
			const removedId = unsaveJobData?.data?.job_id ?? unsaveJobData?.jobId;
			if (removedId) setSavedIds(prev => { const s = new Set(prev); s.delete(removedId); return s; });
			message.success(unsaveJobData?.message || 'Job removed from saved');
		} else if (unsaveJobError) {
			message.error(unsaveJobError || 'Failed to unsave job');
		}
		dispatch(unsaveJobReset());
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [unsaveJobData, unsaveJobStatus, unsaveJobError]);

	const toggleSave = (jobId: string) => {
		if (savedIds.has(jobId)) {
			dispatch(unsaveJob(jobId));
		} else {
			dispatch(saveJob(jobId));
		}
	};

	// ── Helper: open /learn in a new tab pre-filled with content ──
	const openLearnTab = (jd: string) => {
		const access  = sessionStorage.getItem('accessToken');
		const refresh = sessionStorage.getItem('refreshToken');
		if (access)  localStorage.setItem('_crossTabToken',   access);
		if (refresh) localStorage.setItem('_crossTabRefresh', refresh);
		localStorage.setItem('lpPrefillJd', jd);
		window.open('/learn', '_blank', 'noopener,noreferrer');
	};

	// ── Render ──
	return (
		<Modal
			title={null}
			footer={null}
			visible={!!previewJob}
			onCancel={onClose}
			width="96vw"
			style={{ top: 2, paddingBottom: 0 }}
			centered
			destroyOnClose
			className="job-search-job-preview-modal"
			wrapClassName="job-search-job-preview-modal-wrap"
		>
			{job ? (
				<div className="job-search-preview">

					{/* ── Scrollable area: header + body ── */}
					<div className="jd-scroll-area">

					{/* ── Hero header ── */}
					<header className="job-search-preview-head">
						{/* Top row: logo + identity */}
						<div className="jd-head-top">
							<div
								className="job-search-preview-logo"
								style={{ background: `linear-gradient(135deg, hsl(${job.logoHue}, 70%, 52%), hsl(${job.logoHue + 40}, 65%, 42%))` }}
								aria-hidden
							>
								<div className="logo-mesh-ring" />
								<div className="logo-mesh-ring logo-mesh-ring--2" />
								<span className="logo-monogram logo-monogram--lg">{job.company.charAt(0)}</span>
							</div>
							<div className="job-search-preview-head-copy">
								<div className="job-search-preview-title-row">
									<h2 className="job-search-preview-title">{job.title}</h2>
									{job.verified ? (
										<Tooltip title="Verified employer">
											<MdVerified size={20} className="jd-verified-icon" aria-label="Verified" />
										</Tooltip>
									) : null}
									{(job as any).fitScore != null ? (
										<span className="jd-match-badge">
											<MdInsights size={12} style={{marginRight:3,verticalAlign:'middle'}}/>
											{(job as any).fitScore}% fit
											{(job as any).fitBucket ? ` · ${(job as any).fitBucket}` : ''}
										</span>
									) : job.matchScore != null ? (
										<span className="jd-match-badge"><MdInsights size={12} style={{marginRight:3,verticalAlign:'middle'}}/>{job.matchScore}% match</span>
									) : null}
								</div>
								<p className="job-search-preview-company">
									<MdBusiness size={13} style={{marginRight:4,verticalAlign:'middle',opacity:0.7}}/>
									{job.company}
									<span className="job-search-job-dot"> · </span>
									<MdLocationOn size={13} style={{marginRight:2,verticalAlign:'middle',opacity:0.7}}/>
									{job.location}
								</p>
								<div className="job-search-preview-meta-line">
									<span className="job-search-preview-chip"><MdWorkOutline size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{job.detail.employmentType}</span>
									<span className="job-search-preview-chip job-search-preview-chip--muted"><MdAccessTime size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{job.detail.posted}</span>
									{job.detail.salary ? (
										<span className="job-search-preview-chip job-search-preview-chip--accent"><MdAttachMoney size={10} style={{marginRight:1,verticalAlign:'middle'}}/>{job.detail.salary}</span>
									) : null}
									{(job.detail as any).experience ? (
										<span className="job-search-preview-chip job-search-preview-chip--muted"><MdBarChart size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{(job.detail as any).experience}</span>
									) : null}
									{job.sourceKind ? (
										<span className="job-search-preview-chip job-search-preview-chip--muted">
											{job.sourceKind === 'ats' ? '🏢 ATS Listing' : job.sourceKind === 'direct' ? '✅ Direct Apply' : job.sourceKind}
										</span>
									) : null}
									{job.hiringStatus ? (
										<span className="job-search-preview-chip jd-chip--hiring"><MdTrendingUp size={10} style={{marginRight:3,verticalAlign:'middle'}}/>{job.hiringStatus}</span>
									) : null}
								</div>
							</div>
						</div>
					</header>

					{/* ── Scrollable body — Skills + Fit + Rounds ── */}
					<div className="jd-body">

						{/* Left column */}
						<div className="jd-body-left">

						{/* About the role */}
						{!jobByIdStatus && job.detail.description && (
							<div className="jd-section-block">
								<h4 className="jd-section-label">
									<span className="jd-section-icon jd-section-icon--violet"><MdDescription size={12}/></span>
									About the role
								</h4>
								<p style={{margin:0,fontSize:'13px',lineHeight:1.7,color:'#374151'}}>{job.detail.description}</p>
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
								) : (job.detail.requirements ?? []).length > 0 ? (
									<ul className="jd-req-list">
										{(job.detail.requirements ?? []).map((r: string) => (
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
								) : (job.detail as any).responsibilities?.length > 0 ? (
									<ul className="jd-head-resp-list">
										{((job.detail as any).responsibilities as string[]).map((r) => (
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
									{job.detail.skills.map((s) => (
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
								const rounds = liveInterviewRounds.length > 0 ? liveInterviewRounds : (job.detail as any).interviewRounds ?? [];
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
								{((job as any).fitScore != null || job.matchScore != null) ? (() => {
									const displayScore = (job as any).fitScore ?? job.matchScore ?? 0;
									const bucketStr    = (job as any).fitBucket || '';
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
													{(job as any).fitScore != null ? 'AI Fit Score' : 'Profile match score'}
												</p>
												{bucketCls && (
													<span className={`jd-fit-bucket jd-fit-bucket--${bucketCls}`}>
														{bucketStr}
													</span>
												)}
												{(job as any).skillCoveragePct != null && (
													<div className="jd-coverage-wrap">
														<div className="jd-coverage-track">
															<div className="jd-coverage-fill" style={{width: `${(job as any).skillCoveragePct}%`}} />
														</div>
														<span className="jd-coverage-label">{(job as any).skillCoveragePct}% skill coverage</span>
													</div>
												)}
											</div>
										</div>
									);
								})() : null}

								{/* Skills breakdown — use skills_breakdown if available, else matched/gaps */}
								{(job.detail as any).skillsBreakdown?.length ? (() => {
									const matched  = ((job.detail as any).skillsBreakdown as any[]).filter((s: any) => s.matched);
									const gaps     = ((job.detail as any).skillsBreakdown as any[]).filter((s: any) => !s.matched);
									return (
										<>
											{matched.length > 0 && (
												<div className="jd-fit-group">
													<p className="jd-fit-label jd-fit-label--match">
														<MdThumbUp size={12}/> Skills matched
													</p>
													<div className="jd-fit-pills">
														{matched.map(({skill}: any) => (
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
														{gaps.map(({skill, explanation}: any) => (
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
										{(job.detail as any).skillsMatched?.length ? (
											<div className="jd-fit-group">
												<p className="jd-fit-label jd-fit-label--match">
													<MdThumbUp size={12}/> Skills matched
												</p>
												<div className="jd-fit-pills">
													{((job.detail as any).skillsMatched as string[]).map((s) => (
														<span key={s} className="jd-fit-pill jd-fit-pill--match"><MdCheckCircle size={11}/>{s}</span>
													))}
												</div>
											</div>
										) : null}

										{(job.detail as any).skillGaps?.length ? (
											<div className="jd-fit-group">
												<p className="jd-fit-label jd-fit-label--gap">
													<MdWarning size={12}/> Gaps to bridge
												</p>
												<div className="jd-fit-pills">
													{((job.detail as any).skillGaps as string[]).map((s) => (
														<span key={s} className="jd-fit-pill jd-fit-pill--gap"><MdSchool size={11}/>{s}</span>
													))}
												</div>
											</div>
										) : null}
									</>
								)}

								{/* AI analysis — single string (fitExplanation) or legacy list */}
								{(job as any).fitExplanation ? (
									<div className="jd-fit-group">
										<p className="jd-fit-label"><MdAutoAwesome size={12}/> AI analysis</p>
										<p className="jd-fit-explanation">{(job as any).fitExplanation}</p>
									</div>
								) : (job as any).matchReasons?.length ? (
									<div className="jd-fit-group">
										<p className="jd-fit-label"><MdAutoAwesome size={12}/> AI explanation</p>
										<ul className="jd-fit-reasons">
											{((job as any).matchReasons as string[]).map((r) => (
												<li key={r}>{r}</li>
											))}
										</ul>
									</div>
								) : null}

								{(job.detail as any).eligibility?.length ? (
									<div className="jd-fit-group">
										<p className="jd-fit-label"><MdFactCheck size={12}/> Eligibility checklist</p>
										<ul className="jd-fit-checklist">
											{((job.detail as any).eligibility as string[]).map((e) => (
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

					{/* ── Footer ── */}
					<footer className="jd-footer">
						<button
							type="button"
							className={`jd-action-btn jd-action-btn--save ${savedIds.has(job.id) ? 'jd-action-btn--saved' : ''} ${unsavePendingId === job.id ? 'jd-action-btn--loading' : ''}`}
							disabled={unsavePendingId === job.id}
							onClick={() => toggleSave(job.id)}
						>
							{unsavePendingId === job.id
								? <Spin size="small" />
								: <><span className="jd-action-icon jd-action-icon--save">{savedIds.has(job.id) ? <MdBookmark size={16}/> : <MdBookmarkBorder size={16}/>}</span><span className="jd-action-text"><span className="jd-action-label">{savedIds.has(job.id) ? 'Saved' : 'Save for later'}</span><span className="jd-action-sub">→ saved list</span></span></>
							}
						</button>
						<button
							type="button"
							className="jd-action-btn jd-action-btn--skills"
							onClick={() => {
								const jdText = [
									job.title && `Role: ${job.title}`,
									job.company && `Company: ${job.company}`,
									job.detail?.description,
								].filter(Boolean).join('\n\n');
								openLearnTab(jdText);
							}}
						>
							<span className="jd-action-icon jd-action-icon--skills"><MdSchool size={16}/></span>
							<span className="jd-action-text"><span className="jd-action-label">Build skills</span><span className="jd-action-sub">→ full learning path</span></span>
						</button>
					</footer>
				</div>
			) : null}
		</Modal>
	);
};

export default JobPreviewModal;
