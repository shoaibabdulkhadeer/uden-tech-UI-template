import React, { useState, useMemo } from 'react';
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
	Select
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
	MdLaptopMac
} from 'react-icons/md';
import { motion, easeInOut } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import './job-management.css';
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

const JobManagement = () => {
	const navigate = useNavigate();
	const [jobs, setJobs] = useState<JobEntry[]>(MOCK_ADMIN_JOBS);
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
			setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...values } : j)));
			message.success('Job updated successfully');
		} else {
			const newJob: JobEntry = {
				id: Math.random().toString(36).substr(2, 9),
				status: 'active',
				visibility: 'visible',
				applicants: 0,
				postedOn: new Date().toISOString().split('T')[0],
				logoHue: Math.floor(Math.random() * 360),
				description: values.description || '',
				responsibilities: [],
				workMode: values.workMode || 'remote',
				employmentType: values.employmentType || 'full-time',
				salary: values.salary || '',
				skills: [],
				badges: [],
				...values
			};
			setJobs([newJob, ...jobs]);
			message.success('New role added successfully');
		}
		setIsModalVisible(false);
		form.resetFields();
		setEditingJob(null);
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
										placeholder="Scan roles, companies, locations..."
										prefix={<MdSearch size={15} style={{ color: '#94a3b8' }} />}
										className="admin-search admin-nexus-search"
										value={searchText}
										onChange={(e) => setSearchText(e.target.value)}
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
													{(statusFilter.length > 0 || visibilityFilter.length > 0 || workModeFilter.length > 0 || empTypeFilter.length > 0 || applicantsFilter || postedFilter || skillsFilter.length > 0) && (
														<button type="button" className="afc-reset-btn"
															onClick={() => { setStatusFilter([]); setVisibilityFilter([]); setWorkModeFilter([]); setEmpTypeFilter([]); setApplicantsFilter(''); setPostedFilter(''); setSkillsFilter([]); setSkillInput(''); }}
														>
															<MdRestartAlt size={12} /> Clear
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

												{/* Applicants */}
												<div className="afc-section">
													<div className="afc-section-head">
														<span className="afc-section-icon afc-section-icon--emerald"><MdPeople size={9} /></span>
														Applicants
														{applicantsFilter && <span className="afc-active-badge">1</span>}
													</div>
													{([
														{ val: '0',    label: 'None' },
														{ val: '1-20', label: '1 – 20' },
														{ val: '21-50',label: '21 – 50' },
														{ val: '50+',  label: '50+' },
													]).map(({ val, label }) => (
														<button key={val} type="button"
															className={`afc-option afc-option--emerald${applicantsFilter === val ? ' afc-option--active' : ''}`}
															onClick={() => setApplicantsFilter(p => p === val ? '' : val)}
														>
															<span className="afc-option-dot" />
															<span className="afc-option-label">{label}</span>
															<MdCheckCircle size={13} className="afc-option-check" aria-hidden />
														</button>
													))}
												</div>

												{/* Posted */}
												<div className="afc-section">
													<div className="afc-section-head">
														<span className="afc-section-icon afc-section-icon--rose"><MdCalendarToday size={9} /></span>
														Date Posted
														{postedFilter && <span className="afc-active-badge">1</span>}
													</div>
													{([
														{ val: '7',  label: 'Last 7 days' },
														{ val: '14', label: 'Last 14 days' },
														{ val: '30', label: 'Last 30 days' },
													]).map(({ val, label }) => (
														<button key={val} type="button"
															className={`afc-option afc-option--rose${postedFilter === val ? ' afc-option--active' : ''}`}
															onClick={() => setPostedFilter(p => p === val ? '' : val)}
														>
															<span className="afc-option-dot" />
															<span className="afc-option-label">{label}</span>
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
										{filteredJobs.length === 0 ? (
											<li className="admin-role-empty">
												<MdWorkOutline size={32} />
												<p>No roles match your filters</p>
											</li>
										) : filteredJobs.map((job) => (
											<li key={job.id} className="admin-role-card">

												{/* Company logo */}
												<div
													className="admin-role-logo"
													style={{ background: `linear-gradient(135deg, hsl(${job.logoHue},70%,52%), hsl(${job.logoHue + 40},65%,42%))` }}
												>
													<div className="logo-mesh-ring" />
													<div className="logo-mesh-ring logo-mesh-ring--2" />
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
																	onClick={() => { setEditingJob(job); form.setFieldsValue(job); setIsModalVisible(true); }}
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
															<Popconfirm title="Delete this role?" onConfirm={() => deleteJob(job.id)} okText="Delete" cancelText="Cancel" okType="danger">
																<button type="button" className="admin-action-chip admin-action-chip--danger">
																	<MdDeleteOutline size={13} />
																</button>
															</Popconfirm>
														</div>
													</div>
												</div>
											</li>
										))}
									</ul>
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

						{/* Title — full width */}
						<Form.Item name="title" label="Job Title" rules={[{ required: true, message: 'Required' }]}>
							<Input placeholder="e.g. Senior Software Engineer" className="arm-input" />
						</Form.Item>

						{/* Company + Location — side by side */}
						<div className="arm-row">
							<Form.Item name="company" label="Company" rules={[{ required: true, message: 'Required' }]}>
								<Input placeholder="e.g. Stripe" prefix={<MdBusiness size={14} style={{ color: '#94a3b8' }} />} className="arm-input" />
							</Form.Item>
							<Form.Item name="location" label="Location" rules={[{ required: true, message: 'Required' }]}>
								<Input placeholder="e.g. Remote" prefix={<MdLocationOn size={14} style={{ color: '#94a3b8' }} />} className="arm-input" />
							</Form.Item>
						</div>

						{/* Work Mode + Employment Type — side by side */}
						<div className="arm-row">
							<Form.Item name="workMode" label="Work Mode">
								<Select placeholder="Select" className="arm-select" popupClassName="arm-dropdown">
									<Select.Option value="remote">🌐 Remote</Select.Option>
									<Select.Option value="hybrid">🏢 Hybrid</Select.Option>
									<Select.Option value="onsite">📍 On-site</Select.Option>
								</Select>
							</Form.Item>
							<Form.Item name="employmentType" label="Employment Type">
								<Select placeholder="Select" className="arm-select" popupClassName="arm-dropdown">
									<Select.Option value="full-time">Full-time</Select.Option>
									<Select.Option value="part-time">Part-time</Select.Option>
									<Select.Option value="contract">Contract</Select.Option>
								</Select>
							</Form.Item>
						</div>

						{/* Salary + Apply URL — side by side */}
						<div className="arm-row">
							<Form.Item name="salary" label="Salary Range">
								<Input placeholder="e.g. $90K – $120K / yr" className="arm-input" />
							</Form.Item>
							<Form.Item name="applyLink" label="Apply URL" rules={[{ required: true, type: 'url', message: 'Enter a valid URL' }]}>
								<Input placeholder="https://company.com/apply" prefix={<MdLink size={14} style={{ color: '#94a3b8' }} />} className="arm-input" />
							</Form.Item>
						</div>

						{/* Description — full width */}
						<Form.Item name="description" label="Job Description" style={{ marginBottom: 0 }}>
							<Input.TextArea rows={3} placeholder="What this role is about, the team, the mission…" className="arm-textarea" />
						</Form.Item>

						{/* Footer */}
						<div className="arm-footer">
							<button type="button" className="arm-btn-cancel" onClick={() => { setIsModalVisible(false); setEditingJob(null); }}>
								Cancel
							</button>
							<button type="submit" className="arm-btn-submit">
								{editingJob ? <><MdEdit size={14} /> Save Changes</> : <><MdAdd size={14} /> Create Role</>}
							</button>
						</div>
					</Form>
				</Modal>

				{/* Candidate Preview Modal */}
				<Modal
					open={!!previewJob}
					onCancel={() => setPreviewJob(null)}
					footer={null}
					centered
					className="admin-preview-modal"
					width={680}
					title={
						<div className="preview-modal-header">
							<span className="preview-modal-badge">
								<MdRemoveRedEye size={13} />
								Candidate View
							</span>
							<span className="preview-modal-note">This is exactly how candidates see this role</span>
						</div>
					}
				>
					{previewJob && (
						<div className="preview-job-card">
							{/* Logo + title */}
							<div className="preview-top">
								<div
									className="preview-logo"
									style={{ background: `linear-gradient(135deg, hsl(${previewJob.logoHue},70%,52%), hsl(${previewJob.logoHue + 40},65%,42%))` }}
								>
									<div className="logo-mesh-ring" />
									<div className="logo-mesh-ring logo-mesh-ring--2" />
									<span className="logo-monogram">{previewJob.company.charAt(0)}</span>
								</div>
								<div className="preview-title-block">
									<h2 className="preview-job-title">{previewJob.title}</h2>
									<p className="preview-job-meta">
										<MdBusiness size={13} />
										{previewJob.company}
										<span className="role-dot">·</span>
										<MdLocationOn size={13} />
										{previewJob.location}
										<span className="role-dot">·</span>
										{EMP_LABELS[previewJob.employmentType]}
										<span className="role-dot">·</span>
										{WORK_MODE_LABELS[previewJob.workMode]}
									</p>
									<p className="preview-salary">{previewJob.salary}</p>
								</div>
								<a
									href={previewJob.applyLink}
									target="_blank"
									rel="noreferrer"
									className="preview-apply-btn"
								>
									Apply Now
									<MdOpenInNew size={13} />
								</a>
							</div>

							{/* Badges */}
							{previewJob.badges && previewJob.badges.length > 0 && (
								<div className="preview-badges">
									{previewJob.badges.map((b) => (
										<span key={b} className="preview-badge">{b}</span>
									))}
								</div>
							)}

							<div className="preview-divider" />

							{/* About */}
							<div className="preview-section">
								<h3 className="preview-section-title">About the role</h3>
								<p className="preview-section-body">{previewJob.description}</p>
							</div>

							{/* Responsibilities */}
							{previewJob.responsibilities.length > 0 && (
								<div className="preview-section">
									<h3 className="preview-section-title">What you'll do</h3>
									<ul className="preview-resp-list">
										{previewJob.responsibilities.map((r, i) => (
											<li key={i} className="preview-resp-item">
												<MdCheckCircle size={14} className="resp-check" />
												{r}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Skills */}
							{previewJob.skills.length > 0 && (
								<div className="preview-section">
									<h3 className="preview-section-title">Skills</h3>
									<div className="preview-skills">
										{previewJob.skills.map((s) => (
											<span key={s} className="preview-skill-tag">{s}</span>
										))}
									</div>
								</div>
							)}

							{/* Footer */}
							<div className="preview-footer">
								<span className="preview-stat"><MdPeople size={13} /> {previewJob.applicants} applicants</span>
								<span className="preview-stat">
									<MdCalendarToday size={12} />
									Posted {new Date(previewJob.postedOn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
								</span>
							</div>
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
