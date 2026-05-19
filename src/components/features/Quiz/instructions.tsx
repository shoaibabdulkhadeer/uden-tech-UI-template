import { Modal } from 'antd';
import { useState } from 'react';
import { QuizModal } from './QuizModal';
import { motion, easeInOut } from 'framer-motion';
import './instructions.css';
import { TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
	MdOutlineQuiz,
	MdCheckCircleOutline,
	MdArrowBack,
	MdPlayArrow,
	MdInfoOutline,
	MdFormatListNumbered,
	MdOutlineEmojiEvents,
	MdOutlineTimer,
} from 'react-icons/md';
import { BsShieldCheck } from 'react-icons/bs';

const Instructions = ({
	setShowQuiz,
	assesmentcount,
	skillWiseQuiz,
	totalQuiz,
	setQuizQuestions,
	quizTitle,
	quizQuestions,
	LPID,
	backToDashboard,
	QuizLPID,
	topicId,
	setTopicId,
	setTopicWiseQuiz
}: any) => {
	const [showQuiz, setShowMainQuiz] = useState(false);
	const [openGoBackModal, setGoBackModal] = useState(false);
	const navigate = useNavigate();

	const attemptNum =
		typeof assesmentcount === 'number'
			? assesmentcount + 1
			: topicId && typeof skillWiseQuiz === 'number'
				? skillWiseQuiz + 1
				: Array.isArray(totalQuiz)
					? totalQuiz.length + 1
					: 1;

	const marksPerQ = quizQuestions?.length > 10 ? 4 : 10;
	const totalMarks = (quizQuestions?.length || 0) * marksPerQ;

	const handleBack = () => {
		if (backToDashboard === true) {
			navigate('/dashboard');
		} else {
			setShowQuiz(false);
			setShowMainQuiz(false);
			setTopicWiseQuiz(false);
			setTopicId('');
			setQuizQuestions([]);
		}
	};

	return (
		<div className="qi-page">
			{!showQuiz && (
				<motion.div
					className="qi-wrap"
					initial={{ opacity: 0, y: 28 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.55, ease: easeInOut }}
				>
					<div className="qi-card">

						{/* ── Header ── */}
						<div className="qi-header">
							<div className="qi-header-left">
								<div className="qi-header-icon">
									<img src="/assets/images/artificial.gif" alt="" style={{ width: 38, height: 38 }} />
								</div>
								<div>
									<h2 className="qi-title">Assessment Instructions</h2>
									<p className="qi-subtitle">Read carefully before you begin</p>
								</div>
							</div>
							<span className="qi-attempt-badge">
								<MdOutlineEmojiEvents size={13} />
								Attempt #{attemptNum}
							</span>
						</div>

						{/* ── Stat tiles ── */}
						<div className="qi-stats-grid">
							{quizTitle && (
								<div className="qi-stat-tile">
									<div className="qi-stat-icon qi-icon--indigo"><TagOutlined /></div>
									<div className="qi-stat-body">
										<p className="qi-stat-label">Topic</p>
										<p className="qi-stat-value">{quizTitle}</p>
									</div>
								</div>
							)}
							<div className="qi-stat-tile">
								<div className="qi-stat-icon qi-icon--violet"><MdFormatListNumbered size={16} /></div>
								<div className="qi-stat-body">
									<p className="qi-stat-label">Questions</p>
									<p className="qi-stat-value">{quizQuestions?.length ?? 0} MCQs</p>
								</div>
							</div>
							<div className="qi-stat-tile">
								<div className="qi-stat-icon qi-icon--emerald"><MdCheckCircleOutline size={16} /></div>
								<div className="qi-stat-body">
									<p className="qi-stat-label">Per Correct Answer</p>
									<p className="qi-stat-value">+{marksPerQ} marks</p>
								</div>
							</div>
							<div className="qi-stat-tile">
								<div className="qi-stat-icon qi-icon--amber"><MdOutlineEmojiEvents size={16} /></div>
								<div className="qi-stat-body">
									<p className="qi-stat-label">Total Marks</p>
									<p className="qi-stat-value">{totalMarks} pts</p>
								</div>
							</div>
							<div className="qi-stat-tile">
								<div className="qi-stat-icon qi-icon--rose"><BsShieldCheck size={15} /></div>
								<div className="qi-stat-body">
									<p className="qi-stat-label">Negative Marking</p>
									<p className="qi-stat-value qi-val--safe">None</p>
								</div>
							</div>
							<div className="qi-stat-tile">
								<div className="qi-stat-icon qi-icon--cyan"><MdOutlineTimer size={16} /></div>
								<div className="qi-stat-body">
									<p className="qi-stat-label">Time Limit</p>
									<p className="qi-stat-value">Untimed</p>
								</div>
							</div>
						</div>

						{/* ── Rules ── */}
						<div className="qi-rules">
							<div className="qi-rules-head">
								<MdInfoOutline size={15} />
								Guidelines
							</div>
							<ul className="qi-rules-list">
								<li><span className="qi-rule-dot" />Each question has exactly one correct answer.</li>
								<li><span className="qi-rule-dot" />You can review and change answers before submitting.</li>
								<li><span className="qi-rule-dot" />A token is deducted when the assessment begins.</li>
								<li><span className="qi-rule-dot" />Do not refresh or close the tab during the assessment.</li>
								<li><span className="qi-rule-dot" />Results are shown immediately after submission.</li>
							</ul>
						</div>

						{/* ── Actions ── */}
						<div className="qi-actions">
							<button type="button" className="qi-btn-back" onClick={() => setGoBackModal(true)}>
								<MdArrowBack size={15} />
								Go Back
							</button>
							<button type="button" className="qi-btn-start" onClick={() => setShowMainQuiz(true)}>
								<MdPlayArrow size={17} />
								Start Assessment
							</button>
						</div>
					</div>
				</motion.div>
			)}

			{showQuiz && (
				<QuizModal
					topicId={topicId}
					quizTitle={quizTitle}
					setShowQuiz={setShowQuiz}
					quizQuestions={quizQuestions}
					setTopicWiseQuiz={setTopicWiseQuiz}
					setTopicId={setTopicId}
					LPID={LPID}
					QuizLPID={QuizLPID}
				/>
			)}

			{/* Go-back confirmation modal */}
			<Modal open={openGoBackModal} footer={null} width={400} closable={false} maskClosable={false} className="qi-confirm-modal">
				<div className="qi-confirm-body">
					<div className="qi-confirm-icon"><MdInfoOutline size={24} /></div>
					<h4 className="qi-confirm-title">Leave Assessment?</h4>
					<p className="qi-confirm-text">
						A token has already been deducted for this attempt. Going back will not refund it.
					</p>
					<div className="qi-confirm-actions">
						<button type="button" className="qi-confirm-cancel" onClick={() => setGoBackModal(false)}>Stay</button>
						<button type="button" className="qi-confirm-ok" onClick={handleBack}>Leave anyway</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default Instructions;
