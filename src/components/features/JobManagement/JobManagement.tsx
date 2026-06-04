import React, { useState, useMemo, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { getAdminJobs, getAdminJobsReset } from '../../../redux/features/admin/getAdminJobsSlice';
import { editAdminJob, editAdminJobReset } from '../../../redux/features/admin/editAdminJobSlice';
import { postAdminJob, postAdminJobReset } from '../../../redux/features/admin/postAdminJobSlice';
import { deleteAdminJob, deleteAdminJobReset } from '../../../redux/features/admin/deleteAdminJobSlice';
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

	const PAGE_LIMIT = 10;
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

	// Lodash-debounced search — fires 500ms after the user stops typing
	const debouncedTitleSearch = useMemo(
		() => debounce((title: string) => {
			setAdminPage(1);
			dispatch(getAdminJobs(buildParams(1, title)));
		}, 500),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// Initial fetch on mount
	useEffect(() => {
		dispatch(getAdminJobs(buildParams(1)));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
							<div className="gx-mb-2" style={{ display: 'flex', gap: 8 }}>
								<div className="genz-pill vibrant">
									<MdAutoAwesome className="genz-icon" />
									Applicant Operations
								</div>
								<div className="genz-pill glow">
									<div className="dot" />
									Admin Access
								</div>
							</div>
							<h1 className="dash-next-page-title">Admin Nexus</h1>
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
										<span className="stat-number">{jobs.filter((j) => j.status === 'active').length}</span>
										<div className="stat-trend-box"><MdTrendingUp size={10} /><span className="stat-trend">98.9%</span></div>
									</div>
									<div className="stat-desc">Active Roles</div>
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
										<span className="pill-text">REACH FLOW</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">{jobs.reduce((a, j) => a + j.applicants, 0)}</span>
										<div className="stat-trend-box"><MdTrendingUp size={10} /><span className="stat-trend">+14.2%</span></div>
									</div>
									<div className="stat-desc">Total Applicants</div>
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
										<span className="pill-text">SYSTEM MODE</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">{jobs.filter(j => j.visibility === 'hidden').length}</span>
										<div className="stat-trend-box neutral"><span className="stat-trend">STABLE</span></div>
									</div>
									<div className="stat-desc">Stealth Mode</div>
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
								<div className="card-header-row">
									<div className="dot-wrapper"><span className="pulse-dot" /></div>
									<div className="glass-pill">
										<MdPeople className="pill-icon" />
										<span className="pill-text">PIPELINE</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">
											{jobs.length > 0 ? (jobs.reduce((a, j) => a + j.applicants, 0) / jobs.length).toFixed(1) : '0'}
										</span>
										<div className="stat-trend-box"><MdTrendingUp size={10} /><span className="stat-trend">+8.3%</span></div>
									</div>
									<div className="stat-desc">Avg. Applicants / Role</div>
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
												debouncedTitleSearch.cancel();
												setAdminPage(1);
												dispatch(getAdminJobs(buildParams(1, '')));
											} else {
												debouncedTitleSearch(val);
											}
										}}
										allowClear
									/>
									<Button
										type="primary"
										className="stalker-btn-primary admin-nexus-add-btn"
										icon={<MdAdd size={16} />}
										onClick={() => { setEditingJob(null); form.resetFields(); setIsModalVisible(true); }}
									>
										Add New Role
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
																debouncedTitleSearch.cancel();
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
						</div>
					</div>
				</motion.div>

				{/* Add / Edit Modal */}
				<Modal
					open={isModalVisible}
					onCancel={() => { setIsModalVisible(false); setEditingJob(null); }}
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
							{editingJob ? <MdEdit size={18} /> : <MdAdd size={18} />}
						</div>
						<div className="arm-header-text">
							<h3 className="arm-header-title">{editingJob ? 'Edit Role' : 'Add New Role'}</h3>
							<p className="arm-header-sub">{editingJob ? 'Update the role details below' : 'Fill in the details to publish a new role'}</p>
						</div>
						<button type="button" className="arm-close-btn" onClick={() => { setIsModalVisible(false); setEditingJob(null); }}>×</button>
					</div>

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
							<button type="button" className="arm-btn-cancel" onClick={() => { setIsModalVisible(false); setEditingJob(null); form.resetFields(); }}>
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
					width={760}
					title={null}
					closable
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

									{/* About + What you'll do — 2-col inside header */}
									<div className="jd-head-desc">
										<div className="jd-head-desc-col">
											<p className="jd-head-desc-label"><MdListAlt size={12} /> About the role</p>
											<p className="jd-head-desc-text">{previewJob.description}</p>
										</div>
										{previewJob.responsibilities && previewJob.responsibilities.length > 0 && (
											<div className="jd-head-desc-col">
												<p className="jd-head-desc-label"><MdWork size={12} /> What you'll do</p>
												<ul className="jd-head-resp-list">
													{previewJob.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
												</ul>
											</div>
										)}
									</div>
								</header>

								{/* ── Skills ── */}
								{previewJob.skills.length > 0 && (
									<div className="jd-skills-section">
										<h4 className="jd-section-label">
											<span className="jd-section-icon jd-section-icon--violet"><MdSchool size={12} /></span>
											Skills required
										</h4>
										<div className="jd-skills-row">
											{previewJob.skills.map((s) => (
												<Tooltip
													key={s}
													title={previewJob.skillsExplanations?.[s] || null}
													overlayStyle={{ maxWidth: 260 }}
												>
													<span className="job-search-preview-skill">{s}</span>
												</Tooltip>
											))}
										</div>
									</div>
								)}

								{/* ── Body panels ── */}
								<div className="jd-body">
									<div className="jd-panels-stack">

										{/* Requirements */}
										{previewJob.requirements && previewJob.requirements.length > 0 && (
											<div className="jd-panel jd-panel--full jd-panel--fit">
												<h3 className="jd-panel-title">
													<MdCheckCircle size={15} className="jd-panel-title-icon jd-panel-title-icon--gold" />
													Requirements
												</h3>
												<ul className="preview-resp-list">
													{previewJob.requirements.map((r, i) => (
														<li key={i} className="preview-resp-item">
															<MdCheckCircle size={13} className="resp-check" />{r}
														</li>
													))}
												</ul>
											</div>
										)}

										{/* Nice to have */}
										{previewJob.niceToHave && previewJob.niceToHave.length > 0 && (
											<div className="jd-panel jd-panel--full" style={{ background: 'linear-gradient(160deg,#fffbeb,#fef3c7,#fffde7)' }}>
												<h3 className="jd-panel-title">
													<MdStar size={15} className="jd-panel-title-icon" style={{ color: '#f59e0b' }} />
													Nice to have
												</h3>
												<ul className="preview-resp-list">
													{previewJob.niceToHave.map((n, i) => (
														<li key={i} className="preview-resp-item" style={{ color: '#92400e' }}>
															<MdStar size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />{n}
														</li>
													))}
												</ul>
											</div>
										)}

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