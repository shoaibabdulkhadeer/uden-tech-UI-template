import React, { useState, useMemo } from 'react';
import {
	Table,
	Tag,
	Space,
	Button,
	Input,
	Select,
	Card,
	Row,
	Col,
	Tooltip,
	message,
	Avatar,
	Badge,
	Dropdown,
	Menu
} from 'antd';
import {
	MdPeopleOutline,
	MdAdminPanelSettings,
	MdPersonOutline,
	MdMoreVert,
	MdSearch,
	MdFilterList,
	MdVerifiedUser,
	MdAutoAwesome,
	MdArrowBack,
	MdOutlineSecurity,
	MdTrendingUp,
	MdMonitorHeart
} from 'react-icons/md';
import { motion, easeInOut, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardShellNetwork from '../Dashboard/DashboardShellNetwork';
import DashboardPageHeadArt from '../Dashboard/DashboardPageHeadArt';
import './user-management.css';
import '../../../styles/phase2-theme.css';
import '../../../styles/dashboard-arena.css';

interface UserEntry {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'learner' | 'mentor';
	status: 'active' | 'suspended';
	risk: 'low' | 'medium' | 'high';
	lastLogin: string;
	avatar?: string;
}

const MOCK_USERS: UserEntry[] = [
	{
		id: '1',
		name: 'Sarah K.',
		email: 'sarah.k@udentech.com',
		role: 'admin',
		status: 'active',
		risk: 'low',
		lastLogin: 'Today, 10:30',
		avatar: 'https://i.pravatar.cc/150?u=sarah'
	},
	{
		id: '2',
		name: 'Alex Rivera',
		email: 'alex.r@gmail.com',
		role: 'learner',
		status: 'active',
		risk: 'medium',
		lastLogin: 'Yesterday, 18:45',
		avatar: 'https://i.pravatar.cc/150?u=alex'
	},
	{
		id: '3',
		name: 'Jordan Smith',
		email: 'jordan.s@outlook.com',
		role: 'mentor',
		status: 'active',
		risk: 'low',
		lastLogin: 'Today, 09:15',
		avatar: 'https://i.pravatar.cc/150?u=jordan'
	},
	{
		id: '4',
		name: 'Priya Sharma',
		email: 'priya.s@udentech.com',
		role: 'learner',
		status: 'suspended',
		risk: 'high',
		lastLogin: 'Apr 30, 14:20',
		avatar: 'https://i.pravatar.cc/150?u=priya'
	},
	{
		id: '5',
		name: 'Marcus Chen',
		email: 'm.chen@tech.edu',
		role: 'learner',
		status: 'active',
		risk: 'low',
		lastLogin: 'Today, 11:05',
		avatar: 'https://i.pravatar.cc/150?u=marcus'
	}
];

const UserManagement = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState<UserEntry[]>(MOCK_USERS);
	const [searchText, setSearchText] = useState('');

	const filteredUsers = useMemo(() => {
		return users.filter(
			(u) =>
				u.name.toLowerCase().includes(searchText.toLowerCase()) ||
				u.email.toLowerCase().includes(searchText.toLowerCase())
		);
	}, [users, searchText]);

	const changeRole = (id: string, newRole: UserEntry['role']) => {
		setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
		message.success(`User role updated to ${newRole}`);
	};

	const toggleStatus = (id: string) => {
		setUsers(
			users.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
		);
		message.info('User status toggled');
	};

	const columns = [
		{
			title: 'Identity',
			key: 'identity',
			render: (_: any, record: UserEntry) => (
				<div className="user-identity-cell">
					<Avatar src={record.avatar} size={32} className="user-avatar" />
					<div className="user-info">
						<div className="user-name">{record.name}</div>
						<div className="user-email">{record.email}</div>
					</div>
				</div>
			)
		},
		{
			title: 'Current Role',
			key: 'role',
			render: (_: any, record: UserEntry) => {
				const colors: any = { admin: '#6366f1', learner: '#10b981', mentor: '#f59e0b' };
				return (
					<Tag color={colors[record.role]} className="role-tag">
						{record.role.toUpperCase()}
					</Tag>
				);
			}
		},
		{
			title: 'Risk Level',
			key: 'risk',
			render: (_: any, record: UserEntry) => {
				const riskMap: any = {
					low: { color: 'cyan', label: 'STABLE' },
					medium: { color: 'gold', label: 'REVIEW' },
					high: { color: 'volcano', label: 'ALERT' }
				};
				const { color, label } = riskMap[record.risk];
				return (
					<Tag color={color} className="risk-tag-nexus">
						<MdOutlineSecurity size={10} />
						{label}
					</Tag>
				);
			}
		},
		{
			title: 'Access Status',
			key: 'status',
			render: (_: any, record: UserEntry) => (
				<Badge status={record.status === 'active' ? 'processing' : 'default'} text={record.status.toUpperCase()} className={`status-badge ${record.status}`} />
			)
		},
		{
			title: 'Last Pulse',
			dataIndex: 'lastLogin',
			key: 'lastLogin',
			render: (text: string) => <span className="pulse-text">{text}</span>
		},
		{
			title: 'Command',
			key: 'action',
			render: (_: any, record: UserEntry) => (
				<Space size="middle">
					<Select 
						value={record.role} 
						size="small" 
						onChange={(val) => changeRole(record.id, val as any)}
						className="role-select"
						dropdownClassName="role-select-dropdown"
					>
						<Select.Option value="admin">Admin</Select.Option>
						<Select.Option value="mentor">Mentor</Select.Option>
						<Select.Option value="learner">Learner</Select.Option>
					</Select>
					<Dropdown 
						overlay={
							<Menu>
								<Menu.Item onClick={() => toggleStatus(record.id)} danger={record.status === 'active'}>
									{record.status === 'active' ? 'Suspend Access' : 'Activate Access'}
								</Menu.Item>
								<Menu.Item>View Activity Logs</Menu.Item>
							</Menu>
						} 
						trigger={['click']}
					>
						<Button type="text" icon={<MdMoreVert />} className="nexus-action-btn" />
					</Dropdown>
				</Space>
			)
		}
	];

	return (
		<div className="user-mgmt-page phase2-dashboard dash-next dash-next-shell">
			<DashboardShellNetwork />

			<div className="user-mgmt-page-inner">
				<header className="dash-next-page-head">
					<div className="dash-next-page-head-row">
						<div className="dash-next-page-head-art-wrap">
							<DashboardPageHeadArt />
						</div>
						<div className="dash-next-page-head-copy">
							<div className="gx-mb-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
								<div className="genz-pill vibrant">
									<MdAdminPanelSettings className="genz-icon" />
									User Orchestration
								</div>
								<div className="genz-pill glow">
									<div className="dot" />
									Root Access
								</div>
								<div className="genz-pill outline">
									<MdMonitorHeart className="genz-icon" />
									System Health: 98%
								</div>
							</div>
							<h1 className="dash-next-page-title">User Management</h1>
							<p className="dash-next-page-lead">
								Comprehensive user oversight and role orchestration for the Nebula ecosystem.
							</p>
						</div>
					</div>
				</header>

				<Row gutter={[16, 16]} className="user-stats-row">
					<Col xs={24} sm={12} lg={6}>
						<motion.div 
							whileHover={{ scale: 1.02, y: -5 }} 
							transition={{ type: 'spring', stiffness: 300 }}
						>
							<div className="admin-stat-card nexus-premium-card card-live shimmer-card">
								<div className="card-glow-accent" />
								<div className="shimmer-effect" />
								<div className="card-header-row">
									<div className="dot-wrapper">
										<span className="pulse-dot" />
									</div>
									<div className="glass-pill">
										<MdPeopleOutline className="pill-icon" />
										<span className="pill-text">TOTAL ENTITIES</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">{users.length}</span>
										<div className="stat-trend-box">
											<MdTrendingUp size={10} />
											<span className="stat-trend">+12%</span>
										</div>
									</div>
									<div className="stat-desc">Registry Members</div>
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
						<motion.div 
							whileHover={{ scale: 1.02, y: -5 }} 
							transition={{ type: 'spring', stiffness: 300 }}
						>
							<div className="admin-stat-card nexus-premium-card card-reach shimmer-card">
								<div className="card-glow-accent" />
								<div className="shimmer-effect" />
								<div className="card-header-row">
									<div className="dot-wrapper">
										<span className="pulse-dot" />
									</div>
									<div className="glass-pill">
										<MdAdminPanelSettings className="pill-icon" />
										<span className="pill-text">ADMIN CORE</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
										<div className="stat-trend-box neutral">
											<span className="stat-trend">ROOT</span>
										</div>
									</div>
									<div className="stat-desc">Verified Operators</div>
									<div className="sparkline-container">
										<div className="spark-bar" style={{ height: '30%' }} />
										<div className="spark-bar" style={{ height: '30%' }} />
										<div className="spark-bar" style={{ height: '40%' }} />
										<div className="spark-bar" style={{ height: '35%' }} />
										<div className="spark-bar" style={{ height: '30%' }} />
									</div>
								</div>
							</div>
						</motion.div>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<motion.div 
							whileHover={{ scale: 1.02, y: -5 }} 
							transition={{ type: 'spring', stiffness: 300 }}
						>
							<div className="admin-stat-card nexus-premium-card card-system shimmer-card">
								<div className="card-glow-accent" />
								<div className="shimmer-effect" />
								<div className="card-header-row">
									<div className="dot-wrapper">
										<span className="pulse-dot" />
									</div>
									<div className="glass-pill">
										<MdAutoAwesome className="pill-icon" />
										<span className="pill-text">LEARNERS</span>
									</div>
								</div>
								<div className="card-content">
									<div className="stat-main">
										<span className="stat-number">{users.filter(u => u.role === 'learner').length}</span>
										<div className="stat-trend-box">
											<MdTrendingUp size={10} />
											<span className="stat-trend">+5.2%</span>
										</div>
									</div>
									<div className="stat-desc">Active Talent</div>
									<div className="sparkline-container">
										<div className="spark-bar" style={{ height: '20%' }} />
										<div className="spark-bar" style={{ height: '45%' }} />
										<div className="spark-bar" style={{ height: '80%' }} />
										<div className="spark-bar" style={{ height: '65%' }} />
										<div className="spark-bar" style={{ height: '95%' }} />
									</div>
								</div>
							</div>
						</motion.div>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<motion.div 
							whileHover={{ scale: 1.02, y: -5 }} 
							transition={{ type: 'spring', stiffness: 300 }}
						>
							<div className="admin-stat-card nexus-premium-card card-security shimmer-card">
								<div className="card-glow-accent" />
								<div className="shimmer-effect" />
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
										<span className="stat-number">99.4</span>
										<div className="stat-trend-box">
											<span className="stat-trend">STABLE</span>
										</div>
									</div>
									<div className="stat-desc">System Integrity</div>
									<div className="sparkline-container">
										<div className="spark-bar" style={{ height: '90%' }} />
										<div className="spark-bar" style={{ height: '88%' }} />
										<div className="spark-bar" style={{ height: '92%' }} />
										<div className="spark-bar" style={{ height: '91%' }} />
										<div className="spark-bar" style={{ height: '94%' }} />
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
					className="user-main-content"
				>
					<div className="admin-main-card stalker-card">
						<div className="admin-table-toolbar">
							<div className="toolbar-left">
								<h3 className="toolbar-title">Registry Members</h3>
								<Input
									placeholder="Scan names or emails..."
									prefix={<MdSearch size={18} />}
									className="admin-search"
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
								/>
							</div>
							<div className="toolbar-right">
								<Button icon={<MdFilterList />} className="nexus-btn-ghost">Filter</Button>
								<Button type="primary" className="stalker-btn-primary">Add New User</Button>
							</div>
						</div>

						<Table
							columns={columns}
							dataSource={filteredUsers}
							rowKey="id"
							pagination={{ pageSize: 6 }}
							className="admin-table user-table"
						/>
					</div>
				</motion.div>

				<div className="user-mgmt-footer">
					<Button
						type="text"
						className="admin-back-btn"
						icon={<MdArrowBack />}
						onClick={() => navigate('/dashboard')}
					>
						Return to Command Center
					</Button>
				</div>
			</div>
		</div>
	);
};

export default UserManagement;
