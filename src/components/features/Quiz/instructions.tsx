// src/components/Instructions.tsx
import { Button, Card, Modal, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { QuizModal } from './QuizModal';
import { motion } from 'framer-motion';
import { easeInOut } from 'framer-motion';
import './instructions.css';
import { CiMemoPad } from 'react-icons/ci';
import { BiSolidChalkboard } from 'react-icons/bi';
import { IoShieldCheckmarkSharp } from 'react-icons/io5';
import { DoubleLeftOutlined, TagOutlined } from '@ant-design/icons';
import { BsClipboardCheckFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import Ribbon from 'antd/lib/badge/Ribbon';

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
	const handleStartQuiz = () => {
		setShowMainQuiz(true);
	};

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
		<div className="phase2-quiz-focus">
			<motion.div initial={{ x: -300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: easeInOut }}>
				{!showQuiz && (
					<div className="instructions-container gx-d-flex gx-justify-content-center gx-align-items-center">
						{/* <Badge.Ribbon text={<div className="gx-d-flex gx-align-items-center gx-p-1" ><PiTimerBold className="gx-mr-1" style={{ marginBottom: "2px" }} /> <p className="gx-p-0 gx-m-0 gx-fs-sm " style={{ color: "white", marginBottom: "1px" }}> 24 Mins </p> </div>} color="purple"> */}
						<Ribbon
							text={`Attempt - ${
								typeof assesmentcount === 'number'
									? assesmentcount + 1
									: topicId && typeof skillWiseQuiz === 'number'
										? skillWiseQuiz + 1
										: Array.isArray(totalQuiz)
											? totalQuiz.length + 1
											: 1
							}`}
							placement="start"
							color="purple"
						>
							<Card
								className="instructions-card gx-p-3 gx-px-5 shadow gx-d-flex gx-align-items-center phase2-glass phase2-card-interactive"
								size="small"
								style={{ borderLeft: '5px solid green' }}
							>
								<div>
									<div className="gx-d-flex gx-justify-content-center ">
										<p className="gx-fs-xl gx-mb-2 gx-pr-3  gx-font-weight-bold">
											<img
												src="/assets/images/artificial.gif"
												className="gx-mx-1 gx-ml-4"
												alt="success-img"
												style={{
													width: 60,
													height: 60
												}}
											/>
											Assessment Instructions
										</p>
									</div>
									<ul className="instructions-list gx-d-flex gx-flex-column gx-m-0 gx-p-0">
										<div>
											{quizTitle && (
												<li>
													<TagOutlined className="gx-link" style={{ fontSize: '18px' }} /> <strong>Topic:</strong> {quizTitle}
												</li>
											)}
											<li>
												<BiSolidChalkboard className="gx-link" size={22} /> <strong>Type of Questions:</strong> Multiple Choice (MCQs)
											</li>
											<li>
												<CiMemoPad className="gx-link" size={22} /> <strong>Number of Questions:</strong> {quizQuestions?.length}
											</li>
											<li>
												<IoShieldCheckmarkSharp className="gx-link" size={22} /> <strong>Marking:</strong>{' '}
												<Tag color="green" className="gx-m-1">
													Each correct point = {quizQuestions?.length > 10 ? '4 marks' : '10 marks'}
												</Tag>
												<Tag color="orange" className="gx-m-1">
													No negative marking
												</Tag>
											</li>
										</div>
									</ul>

									<div className="instructions-button-wrapper gx-d-flex gx-justify-content-center gx-mt-2" style={{ width: '100%' }}>
										<Button
											type="default"
											className="gx-mr-2"
											onClick={() => {
												setGoBackModal(true);
											}}
											icon={<DoubleLeftOutlined />}
										>
											Go Back
										</Button>{' '}
										<Button
											type="primary"
											size="middle"
											onClick={handleStartQuiz}
											className="gx-d-flex gx-align-items-center gx-m-0 gx-ml-3 btnhover"

											// className="start-quiz-button"
										>
											Start Assessment
											<BsClipboardCheckFill size={15} className="gx-ml-1 gx-mb-1" color="white" />
										</Button>
									</div>
								</div>
							</Card>
						</Ribbon>
						{/* </Badge.Ribbon> */}
					</div>
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
			</motion.div>
			<Modal open={openGoBackModal} footer={null} width={420} closable={false} maskClosable={false}>
				<div>
				<p>
                   Are you sure you want to go back? A token has already been deducted for attempting the exam.
               </p>
					<div className="gx-d-flex gx-justify-content-end gx-mb-0 gx-pb-0">
						<Button size="small" className="gx-mb-0" onClick={() => setGoBackModal(false)}>
							No
						</Button>
						<Button type="primary" className="gx-mb-0" size="small" onClick={handleBack}>
							Yes
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default Instructions;
