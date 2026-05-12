import React, { useState, useMemo } from 'react';
import {
	Table,
	Tag,
	Space,
	Button,
	Switch,
	Input,
	Modal,
	Form,
	Card,
	Row,
	Col,
	Statistic,
	Tabs,
	Tooltip,
	message,
	Popconfirm,
	Badge,
	Progress,
	Avatar
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
	MdFilterList
} from 'react-icons/md';
import { motion, easeInOut } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import './job-management.css';
import '../../../styles/phase2-theme.css';
import '../../../styles/dashboard-arena.css';

const { TabPane } = Tabs;

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
}

const MOCK_ADMIN_JOBS: JobEntry[] = [
	{
		id: '1',
		title: 'Frontend Engineer II',
		company: 'Amazon',
		location: 'Bengaluru',
		status: 'active',
		visibility: 'visible',
		applyLink: 'https://amazon.jobs/123',
		applicants: 45,
		postedOn: '2026-05-01'
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
		postedOn: '2026-05-05'
	},
	{
		id: '3',
		title: 'UI Engineer',
		company: 'Stripe',
		location: 'Dublin',
		status: 'disabled',
		visibility: 'visible',
		applyLink: 'https://stripe.com/jobs/3',
		applicants: 12,
		postedOn: '2026-04-28'
	},
	{
		id: '4',
		title: 'Product Engineer',
		company: 'Linear',
		location: 'San Francisco',
		status: 'active',
		visibility: 'hidden',
		applyLink: 'https://linear.app/jobs/4',
		applicants: 89,
		postedOn: '2026-05-03'
	}
];

const JobManagement = () => {
	const navigate = useNavigate();
	const [jobs, setJobs] = useState<JobEntry[]>(MOCK_ADMIN_JOBS);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingJob, setEditingJob] = useState<JobEntry | null>(null);
	const [activeTab, setActiveTab] = useState('1');
	const [searchText, setSearchText] = useState('');

	const filteredJobs = useMemo(() => {
		return jobs.filter(
			(j) =>
				j.title.toLowerCase().includes(searchText.toLowerCase()) ||
				j.company.toLowerCase().includes(searchText.toLowerCase())
		);
	}, [jobs, searchText]);

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
				...values
			};
			setJobs([newJob, ...jobs]);
			message.success('New job added successfully');
		}
		setIsModalVisible(false);
		form.resetFields();
		setEditingJob(null);
	};

	const toggleStatus = (id: string) => {
		setJobs(
			jobs.map((j) => (j.id === id ? { ...j, status: j.status === 'active' ? 'disabled' : 'active' } : j))
		);
	};

	const toggleVisibility = (id: string) => {
		setJobs(
			jobs.map((j) => (j.id === id ? { ...j, visibility: j.visibility === 'visible' ? 'hidden' : 'visible' } : j))
		);
	};

	const deleteJob = (id: string) => {
		setJobs(jobs.filter((j) => j.id !== id));
		message.info('Job entry removed');
	};

	const columns = [
		{
			title: 'Job Details',
			key: 'details',
			render: (_: any, record: JobEntry) => (
				<div className="admin-job-info">
					<div className="admin-job-title">{record.title}</div>
					<div className="admin-job-company">
						<MdBusiness size={14} style={{ marginRight: 4 }} />
						{record.company} · {record.location}
					</div>
				</div>
			)
		},
		{
			title: 'Activity',
			key: 'applicants',
			render: (_: any, record: JobEntry) => (
				<div className="admin-job-activity">
					<div className="activity-stats">
						<span className="count">{record.applicants}</span>
						<span className="label">Applicants</span>
					</div>
					<Progress 
						percent={Math.min((record.applicants / 200) * 100, 100)} 
						size="small" 
						showInfo={false}
						strokeColor={{
							'0%': '#6366f1',
							'100%': '#a855f7',
						}}
						trailColor="rgba(0,0,0,0.05)"
					/>
				</div>
			)
		},
		{
			title: 'Posted',
			dataIndex: 'postedOn',
			key: 'postedOn',
			render: (date: string) => (
				<div className="admin-date-cell">
					<span className="date-text">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
				</div>
			)
		},
		{
			title: 'Live Status',
			key: 'status',
			render: (_: any, record: JobEntry) => (
				<div className="admin-status-cell">
					<div className={`status-indicator ${record.status}`}>
						<span className="indicator-dot" />
						<span className="indicator-text">{record.status.toUpperCase()}</span>
					</div>
					<Switch
						size="small"
						className="nexus-switch"
						checked={record.status === 'active'}
						onChange={() => toggleStatus(record.id)}
					/>
				</div>
			)
		},
		{
			title: 'Control',
			key: 'control',
			render: (_: any, record: JobEntry) => (
				<Space size="middle">
					<Tooltip title={record.visibility === 'visible' ? 'Publicly Visible' : 'Private/Stealth'}>
						<div 
							className={`nexus-visibility-btn ${record.visibility}`}
							onClick={() => toggleVisibility(record.id)}
						>
							{record.visibility === 'visible' ? <MdVisibility /> : <MdVisibilityOff />}
						</div>
					</Tooltip>
					<div className="admin-action-group">
						<Tooltip title="Edit Entry">
							<div className="admin-action-btn" onClick={() => {
								setEditingJob(record);
								form.setFieldsValue(record);
								setIsModalVisible(true);
							}}>
								<MdEdit size={16} />
							</div>
						</Tooltip>
						<Tooltip title="External Link">
							<a href={record.applyLink} target="_blank" rel="noreferrer" className="admin-action-btn">
								<MdLink size={16} />
							</a>
						</Tooltip>
						<Popconfirm title="Permanent Delete?" onConfirm={() => deleteJob(record.id)} okText="Yes" cancelText="No">
							<div className="admin-action-btn danger">
								<MdDeleteOutline size={16} />
							</div>
						</Popconfirm>
					</div>
				</Space>
			)
		}
	];

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
									<div className="dot-wrapper">
										<span className="pulse-dot" />
									</div>
									<div className="glass-pill">
										<MdAutoAwesome className="pill-icon" />
										<span className="pill-text">LIVE METRICS</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">{jobs.filter((j) => j.status === 'active').length}</span>
										<div className="stat-trend-box">
											<MdTrendingUp size={10} />
											<span className="stat-trend">98.9%</span>
										</div>
									</div>
									<div className="stat-desc">Active Roles</div>
									<div className="sparkline-container">
										<div className="spark-bar" style={{ height: '40%' }} />
										<div className="spark-bar" style={{ height: '70%' }} />
										<div className="spark-bar" style={{ height: '50%' }} />
										<div className="spark-bar" style={{ height: '90%' }} />
										<div className="spark-bar" style={{ height: '60%' }} />
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
									<div className="dot-wrapper">
										<span className="pulse-dot" />
									</div>
									<div className="glass-pill">
										<MdBarChart className="pill-icon" />
										<span className="pill-text">REACH FLOW</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">{jobs.reduce((acc, curr) => acc + curr.applicants, 0)}</span>
										<div className="stat-trend-box">
											<MdTrendingUp size={10} />
											<span className="stat-trend">+14.2%</span>
										</div>
									</div>
									<div className="stat-desc">Global Reach</div>
									<div className="sparkline-container">
										<div className="spark-bar" style={{ height: '30%' }} />
										<div className="spark-bar" style={{ height: '55%' }} />
										<div className="spark-bar" style={{ height: '45%' }} />
										<div className="spark-bar" style={{ height: '80%' }} />
										<div className="spark-bar" style={{ height: '70%' }} />
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
									<div className="dot-wrapper">
										<span className="pulse-dot" />
									</div>
									<div className="glass-pill">
										<MdMonitorHeart className="pill-icon" />
										<span className="pill-text">SYSTEM MODE</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">1</span>
										<div className="stat-trend-box neutral">
											<span className="stat-trend">STABLE</span>
										</div>
									</div>
									<div className="stat-desc">Stealth Mode</div>
									<div className="sparkline-container">
										<div className="spark-bar" style={{ height: '20%' }} />
										<div className="spark-bar" style={{ height: '25%' }} />
										<div className="spark-bar" style={{ height: '22%' }} />
										<div className="spark-bar" style={{ height: '28%' }} />
										<div className="spark-bar" style={{ height: '24%' }} />
									</div>
								</div>
							</div>
						</motion.div>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
							<div className="admin-stat-card nexus-premium-card card-security">
								<div className="card-glow-accent" />
								<div className="card-header-row">
									<div className="dot-wrapper">
										<span className="pulse-dot" />
									</div>
									<div className="glass-pill">
										<MdOutlineSecurity className="pill-icon" />
										<span className="pill-text">SECURITY</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">99.8</span>
										<div className="stat-trend-box">
											<span className="stat-trend">OPTIMAL</span>
										</div>
									</div>
									<div className="stat-desc">Network Health</div>
									<div className="sparkline-container">
										<div className="spark-bar" style={{ height: '95%' }} />
										<div className="spark-bar" style={{ height: '98%' }} />
										<div className="spark-bar" style={{ height: '92%' }} />
										<div className="spark-bar" style={{ height: '96%' }} />
										<div className="spark-bar" style={{ height: '99%' }} />
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
						<Tabs 
							activeKey={activeTab} 
							onChange={(key) => setActiveTab(key)}
							className="admin-tabs"
						>
							<TabPane
								tab={
									<span className="admin-tab-label">
										<MdListAlt size={18} />
										Manage Jobs
									</span>
								}
								key="1"
							/>
							<TabPane
								tab={
									<span className="admin-tab-label">
										<MdHistory size={18} />
										Activity Monitor
									</span>
								}
								key="2"
							/>
						</Tabs>

						<div className="admin-tab-content-area">
							{activeTab === '1' && (
								<motion.div
									key="table"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.4, ease: easeInOut }}
								>
									<div className="admin-table-toolbar">
										<div className="toolbar-left">
											<h3 className="toolbar-title">Registry Overview</h3>
											<Input
												placeholder="Scan roles, companies, locations..."
												prefix={<MdSearch size={18} />}
												className="admin-search"
												value={searchText}
												onChange={(e) => setSearchText(e.target.value)}
											/>
										</div>
										<div className="toolbar-right">
											<Space size="small">
												<Button icon={<MdFilterList />} className="nexus-btn-ghost">Filter</Button>
												<Button 
													type="primary" 
													className="stalker-btn-primary" 
													icon={<MdAdd />}
													onClick={() => {
														setEditingJob(null);
														form.resetFields();
														setIsModalVisible(true);
													}}
												>
													Add New Role
												</Button>
											</Space>
										</div>
									</div>

									<Table
										columns={columns}
										dataSource={filteredJobs}
										rowKey="id"
										pagination={{ pageSize: 6 }}
										className="admin-table user-table"
									/>
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
											{/* Application Trend Chart */}
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
															{[40, 70, 45, 90, 65, 85, 50, 75, 40, 60, 80, 55].map((h, i) => (
																<div 
																	key={i}
																	className="pulse-bar-gradient" 
																	style={{ height: `${h}%` }}
																/>
															))}
														</div>
														<div className="pulse-labels">
															<span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
														</div>
													</div>
												</div>
											</Col>

											{/* Quick Stats */}
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
															<div className="conversion-meta">
																<span className="label">Click-to-Apply</span>
																<span className="value">12.4%</span>
															</div>
															<Progress percent={72} strokeColor="#6366f1" showInfo={false} size="small" className="nexus-progress" />
														</div>
														<div className="conversion-item">
															<div className="conversion-meta">
																<span className="label">Engagement</span>
																<span className="value">88%</span>
															</div>
															<Progress percent={88} strokeColor="#a855f7" showInfo={false} size="small" className="nexus-progress" />
														</div>
														<div className="conversion-item">
															<div className="conversion-meta">
																<span className="label">Retention</span>
																<span className="value">94%</span>
															</div>
															<Progress percent={94} strokeColor="#10b981" showInfo={false} size="small" className="nexus-progress" />
														</div>
													</div>
												</div>
											</Col>

											{/* Recent Activity Feed */}
											<Col xs={24} md={12}>
												<div className="monitor-card nexus-card-glass">
													<div className="monitor-card-header">
														<div className="header-label">
															<span className="kicker">LOGS</span>
															<h3>Live Event Stream</h3>
														</div>
													</div>
													<div className="activity-feed">
														{[
															{ user: 'Sarah K.', action: 'Applied to', target: 'Frontend Engineer', time: '2m ago', color: '#6366f1' },
															{ user: 'Alex M.', action: 'Saved', target: 'UX Designer', time: '15m ago', color: '#a855f7' },
															{ user: 'Nexus Bot', action: 'Scraped', target: '12 New Jobs', time: '1h ago', color: '#10b981' },
															{ user: 'Admin', action: 'Hidden', target: 'Intern Role', time: '3h ago', color: '#f43f5e' }
														].map((item, idx) => (
															<div className="feed-item-nexus" key={idx}>
																<Avatar style={{ backgroundColor: item.color }} size={32} className="feed-avatar-nexus">
																	{item.user[0]}
																</Avatar>
																<div className="feed-copy">
																	<div className="feed-text">
																		<strong>{item.user}</strong> {item.action} <span className="highlight">{item.target}</span>
																	</div>
																	<div className="time">{item.time}</div>
																</div>
															</div>
														))}
													</div>
												</div>
											</Col>

											{/* Trending Jobs */}
											<Col xs={24} md={12}>
												<div className="monitor-card nexus-card-glass">
													<div className="monitor-card-header">
														<div className="header-label">
															<span className="kicker">POPULAR</span>
															<h3>Hot Opportunities</h3>
														</div>
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
																	+{(Math.random() * 20).toFixed(1)}%
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

				<Modal
					title={editingJob ? 'Edit Job Entry' : 'Add Manual Job'}
					visible={isModalVisible}
					onCancel={() => {
						setIsModalVisible(false);
						setEditingJob(null);
					}}
					footer={null}
					centered
					className="admin-modal"
				>
					<Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
						<Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
							<Input placeholder="e.g. Senior Software Engineer" />
						</Form.Item>
						<Form.Item name="company" label="Company Name" rules={[{ required: true }]}>
							<Input placeholder="e.g. Digiverve" />
						</Form.Item>
						<Form.Item name="location" label="Location" rules={[{ required: true }]}>
							<Input placeholder="e.g. Remote or Bengaluru" />
						</Form.Item>
						<Form.Item name="applyLink" label="Apply URL" rules={[{ required: true, type: 'url' }]}>
							<Input placeholder="https://..." prefix={<MdLink />} />
						</Form.Item>
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
							<Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
							<Button type="primary" htmlType="submit">
								{editingJob ? 'Save Changes' : 'Create Entry'}
							</Button>
						</div>
					</Form>
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
