// src/components/QuizModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Radio, Checkbox, Popover, Modal, Typography, message } from 'antd';
import './QuizModal.css';
import { InfoCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { ExamCompleteModal } from './examCompleteModal';
import { useNavigate } from 'react-router-dom';
import { easeInOut, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { resetgetQuiz } from '../../../redux/features/Quiz/getQuiz';
import { resetsubmitQuiz, submitQuizAPI } from '../../../redux/features/Quiz/submitQuiz';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import {
    MdArrowBack,
    MdArrowForward,
    MdClose,
    MdCheckCircle,
    MdCancel,
    MdInfoOutline,
    MdOutlineEmojiEvents,
    MdLightbulbOutline,
} from 'react-icons/md';
import { BsBuilding } from 'react-icons/bs';

interface QuizModalProps {
    onClose: () => void;
}

const difficultyMeta: Record<string, { label: string; cls: string }> = {
    low:    { label: 'Easy',   cls: 'qm-diff--easy'   },
    medium: { label: 'Medium', cls: 'qm-diff--medium'  },
    high:   { label: 'Hard',   cls: 'qm-diff--hard'    },
};

export const QuizModal = ({ setShowQuiz, topicId, setTopicId, quizQuestions, LPID, QuizLPID, quizTitle, setTopicWiseQuiz }: any) => {
    const [currentQuestion, setCurrentQuestion] = useState(0),
        [selectedAnswers, setSelectedAnswers] = useState<any>([]),
        [submitted, setSubmitted] = useState(false),
        { submitQuizRes, submitQuizloading } = useSelector((state: any) => state?.submitQuiz),
        [submitQuizResponse, setSubmitQuizResponse] = useState<any>([]),
        [questionAnswers, setQuestionAnswers] = useState<any>([]),
        [quitQuestionAnswers, setQuitQuestionAnswers] = useState<any>([]),
        [quitModalVisible, setQuitModalVisible] = useState(false),
        [showSubmitModal, setShowSubmitModal] = useState(false),
        [clickedNext, setClickedNext] = useState(false),
        [clickedPrev, setClickedPrev] = useState(false),
        dispatch: AppDispatch = useDispatch(),
        navigate = useNavigate();

    useEffect(() => {
        if (!submitQuizloading && submitQuizRes && submitQuizRes?.statusCode === 200) {
            setSubmitQuizResponse(submitQuizRes?.data);
            dispatch(resetsubmitQuiz());
        } else if (!submitQuizloading && submitQuizRes && submitQuizRes?.statusCode === 400) {
            message.warning(submitQuizRes?.message);
            dispatch(resetsubmitQuiz());
        } else if (!submitQuizloading && submitQuizRes && submitQuizRes?.statusCode === 500) {
            message.error(submitQuizRes?.message);
            dispatch(resetsubmitQuiz());
        }
    }, [submitQuizRes, submitQuizloading, dispatch]);

    const cleanedObj: any = {};
    let emptyCount = 0;
    for (const key in selectedAnswers) {
        if (Array.isArray(selectedAnswers[key]) && selectedAnswers[key].length === 0) {
            emptyCount++;
        } else {
            cleanedObj[key] = selectedAnswers[key];
        }
    }

    const apiPayload = {
        learningPathID: QuizLPID ? QuizLPID : LPID,
        submittedAt: new Date().toISOString(),
        subtopicId: topicId ? topicId : '',
        submit: quitModalVisible || showSubmitModal ? quitQuestionAnswers : questionAnswers,
    };

    useEffect(() => {
        if (quizQuestions?.length > 0) {
            const initialAnswers = quizQuestions.map((question: any) => ({
                Question_id: question.Question_Id ?? '',
                Selected_answer: [""],
            }));
            setQuitQuestionAnswers(initialAnswers);
        }
    }, [quizQuestions]);

    const handleAnswerChange = (e: any) => {
        const value = e.target.value;
        const normalizedValue = Array.isArray(value) ? value : [value];
        const updatedSelectedAnswers = { ...selectedAnswers, [currentQuestion]: normalizedValue };
        setSelectedAnswers(updatedSelectedAnswers);
        setQuestionAnswers((prevAnswers: any) => {
            const newAnswers = [...prevAnswers];
            newAnswers[currentQuestion] = {
                Question_id: quizQuestions[currentQuestion]?.Question_Id,
                Selected_answer: normalizedValue,
            };
            return newAnswers;
        });
        const allUpdatedAnswers = quizQuestions.map((question: any, index: number) => {
            const selected = updatedSelectedAnswers[index];
            return {
                Question_id: question.Question_Id ?? '',
                Selected_answer: Array.isArray(selected) && selected.length > 0 ? selected : [""],
            };
        });
        setQuitQuestionAnswers(allUpdatedAnswers);
    };

    const handleNext = () => { if (currentQuestion < quizQuestions?.length - 1) setCurrentQuestion(currentQuestion + 1); };
    const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };

    const handleFinalSubmit = () => {
        setSubmitted(true);
        setCurrentQuestion(0);
        setShowSubmitModal(false);
        dispatch(submitQuizAPI(apiPayload));
    };

    const handleSubmit = () => {
        setShowSubmitModal(true);
        setQuestionAnswers((prevAnswers: any) => {
            const newAnswers = [...prevAnswers];
            const selected = selectedAnswers[currentQuestion];
            newAnswers[currentQuestion] = {
                Question_id: quizQuestions[currentQuestion]?.Question_Id ?? '',
                Selected_answer: Array.isArray(selected) && selected.length > 0 ? selected : [""],
            };
            return newAnswers;
        });
    };

    const handleNextClick = () => {
        setClickedNext(true);
        setTimeout(() => setClickedNext(false), 300);
        handleNext();
    };

    const handlePreviousClick = () => {
        setClickedPrev(true);
        handlePrevious();
        setTimeout(() => setClickedPrev(false), 300);
    };

    const handleQuitAssessment = () => {
        if (Object.keys(selectedAnswers).length > 0) {
            setSubmitted(true);
            dispatch(submitQuizAPI(apiPayload));
            setCurrentQuestion(0);
            setShowSubmitModal(false);
            setQuitModalVisible(false);
        } else {
            setQuitModalVisible(false);
            setTopicWiseQuiz(false);
            setTopicId('');
            QuizLPID ? navigate('/dashboard') : setShowQuiz(false);
            resetgetQuiz();
        }
    };

    const ensureArray = (val: unknown): CheckboxValueType[] => Array.isArray(val) ? val : [];

    const correctAnswer = submitQuizResponse?.results?.[currentQuestion]?.correct_answer || [];
    const selectedAnswer = submitQuizResponse?.results?.[currentQuestion]?.Selected_answer || [];
    const q = quizQuestions[currentQuestion];
    const total = quizQuestions?.length || 1;
    const progress = ((currentQuestion + 1) / total) * 100;
    const diffKey = q?.level?.toLowerCase() || 'medium';
    const diff = difficultyMeta[diffKey] || difficultyMeta.medium;
    const companies: string[] = q?.company || [];
    const answeredCount = Object.keys(cleanedObj).length;

    const getOptionState = (value: string) => {
        if (!submitted) return '';
        const isCorrect = correctAnswer.includes(value);
        const isSelected = selectedAnswer.includes(value);
        if (isCorrect) return 'correct';
        if (isSelected && !isCorrect) return 'wrong';
        return '';
    };

    return (
        <motion.div
            className="qm-root"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: easeInOut }}
        >
            <div className="qm-card">

                {/* ── Header ── */}
                <div className="qm-header">
                    <div className="qm-header-left">
                        <img src="/assets/images/startup.gif" alt="" className="qm-header-gif" />
                        <div>
                            <p className="qm-header-title">
                                Multiple Choice Question Test
                                {quizTitle && <span className="qm-header-topic"> · {quizTitle}</span>}
                            </p>
                            <p className="qm-header-sub">
                                Question {currentQuestion + 1} of {total}
                            </p>
                        </div>
                    </div>
                    <div className="qm-header-right">
                        {!submitted ? (
                            <button
                                type="button"
                                className="qm-quit-btn"
                                title="Quit Assessment"
                                onClick={() => setQuitModalVisible(true)}
                            >
                                <MdClose size={17} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="qm-quit-btn"
                                title={QuizLPID ? 'Back to dashboard' : 'Back to learning path'}
                                onClick={() => { QuizLPID ? navigate('/dashboard') : setShowQuiz(false); setTopicWiseQuiz(false); setTopicId(''); }}
                            >
                                <MdArrowBack size={17} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Progress bar ── */}
                <div className="qm-progress-track">
                    <div className="qm-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* ── Meta row ── */}
                <div className="qm-meta-row">
                    <span className={`qm-diff-badge ${diff.cls}`}>{diff.label}</span>
                    {q?.skill && (
                        <span className="qm-skill-badge">
                            <MdOutlineEmojiEvents size={12} />
                            {q.skill}
                        </span>
                    )}
                    <span className="qm-answered-badge">
                        {answeredCount}/{total} answered
                    </span>
                </div>

                {/* ── Question ── */}
                <div className="qm-body">
                    <div className="qm-question-box">
                        <span className="qm-q-num">{currentQuestion + 1}</span>
                        <p className="qm-q-text">{q?.Question}</p>
                    </div>

                    {/* ── Options ── */}
                    <div className="qm-options">
                        {q?.Option_type === 'radio' && (
                            <Radio.Group
                                onChange={handleAnswerChange}
                                value={selectedAnswers[currentQuestion]?.[0] || undefined}
                                className="qm-radio-group"
                                disabled={submitted}
                            >
                                {Object.entries(q?.Options?.[0] || {}).map(([key, value]: any, idx: number) => {
                                    const state = getOptionState(value);
                                    const letter = String.fromCharCode(65 + idx);
                                    return (
                                        <Radio
                                            key={key}
                                            value={value}
                                            className={`qm-option ${state ? `qm-option--${state}` : ''}`}
                                        >
                                            <span className="qm-option-letter">{letter}</span>
                                            <span className="qm-option-text">{value}</span>
                                            {submitted && state === 'correct' && <MdCheckCircle className="qm-option-icon qm-icon--correct" size={16} />}
                                            {submitted && state === 'wrong'   && <MdCancel        className="qm-option-icon qm-icon--wrong"   size={16} />}
                                        </Radio>
                                    );
                                })}
                            </Radio.Group>
                        )}

                        {q?.Option_type === 'checkbox' && (
                            <Checkbox.Group
                                value={ensureArray(selectedAnswers[currentQuestion])}
                                onChange={(vals) => handleAnswerChange({ target: { value: vals } })}
                                className="qm-radio-group"
                                disabled={submitted}
                            >
                                {Object.entries(q?.Options?.[0] || {}).map(([key, value]: any, idx: number) => {
                                    const state = getOptionState(value);
                                    const letter = String.fromCharCode(65 + idx);
                                    return (
                                        <Checkbox
                                            key={key}
                                            value={value}
                                            className={`qm-option ${state ? `qm-option--${state}` : ''}`}
                                        >
                                            <span className="qm-option-letter">{letter}</span>
                                            <span className="qm-option-text">{value}</span>
                                            {submitted && state === 'correct' && <MdCheckCircle className="qm-option-icon qm-icon--correct" size={16} />}
                                            {submitted && state === 'wrong'   && <MdCancel        className="qm-option-icon qm-icon--wrong"   size={16} />}
                                        </Checkbox>
                                    );
                                })}
                            </Checkbox.Group>
                        )}
                    </div>

                    {/* ── Companies tag ── */}
                    {companies.length > 0 && (
                        <div className="qm-companies-tag">
                            <BsBuilding size={12} />
                            <span>Asked in: <strong>{companies.join(', ')}</strong></span>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="qm-footer">
                    <button
                        type="button"
                        className={`qm-nav-btn qm-nav-btn--prev ${currentQuestion === 0 ? 'qm-nav-btn--disabled' : ''} ${clickedPrev ? 'qm-nav-btn--pulse' : ''}`}
                        onClick={handlePreviousClick}
                        disabled={currentQuestion === 0}
                    >
                        <span className="qm-nav-circle"><MdArrowBack size={15} /></span>
                        <span>Prev</span>
                    </button>

                    <div className="qm-footer-center">
                        {submitQuizResponse.length !== 0 && (
                            <Popover
                                trigger="hover"
                                overlayClassName="qm-explanation-popover"
                                placement="topRight"
                                content={
                                    <div className="qm-explanation-content">
                                        <div className="qm-explanation-answer">
                                            <MdCheckCircle size={14} color="#10b981" />
                                            <span>Correct: {(submitQuizResponse?.results?.[currentQuestion]?.correct_answer || []).join(', ')}</span>
                                        </div>
                                        <p className="qm-explanation-text">{submitQuizResponse?.results?.[currentQuestion]?.explanation}</p>
                                    </div>
                                }
                            >
                                <button type="button" className="qm-explain-btn">
                                    <MdLightbulbOutline size={15} />
                                    Explanation
                                </button>
                            </Popover>
                        )}
                    </div>

                    {currentQuestion < total - 1 ? (
                        <button
                            type="button"
                            className={`qm-nav-btn qm-nav-btn--next ${clickedNext ? 'qm-nav-btn--pulse' : ''}`}
                            onClick={handleNextClick}
                        >
                            <span>Next</span>
                            <span className="qm-nav-circle"><MdArrowForward size={15} /></span>
                        </button>
                    ) : !submitted ? (
                        <button type="button" className="qm-submit-btn" onClick={handleSubmit}>
                            <img src="/assets/images/submit-img.png" alt="" style={{ width: 16, height: 16 }} />
                            Submit
                        </button>
                    ) : <div />}
                </div>
            </div>

            {/* ── Results overlay ── */}
            {submitted && (
                <div className="qm-result-wrap">
                    <ExamCompleteModal
                        setTopicId={setTopicId}
                        quizQuestions={quizQuestions}
                        setTopicWiseQuiz={setTopicWiseQuiz}
                        submitQuizRes={submitQuizResponse}
                        QuizLPID={QuizLPID}
                        submitQuizloading={submitQuizloading}
                        totalQuestions={quizQuestions?.length}
                        setShowQuiz={setShowQuiz}
                    />
                </div>
            )}

            {/* ── Quit modal ── */}
            <Modal open={quitModalVisible} footer={null} width={420} closable={false} maskClosable={false} className="qm-confirm-modal">
                <div className="qm-confirm-body">
                    <div className="qm-confirm-icon qm-confirm-icon--warn">
                        <MdInfoOutline size={24} />
                    </div>
                    <h4 className="qm-confirm-title">Quit Assessment?</h4>
                    <p className="qm-confirm-text">
                        {quizQuestions?.length !== Object.keys(cleanedObj).length
                            ? Object.keys(selectedAnswers).length === 0
                                ? 'You have not attempted at least one question. Are you sure you want to quit?'
                                : `You have ${quizQuestions?.length - Object.keys(cleanedObj).length} unanswered question(s). Quitting now will submit your current answers.`
                            : 'Are you sure you want to quit and submit the assessment?'}
                    </p>
                    <div className="qm-confirm-actions">
                        <button type="button" className="qm-confirm-cancel" onClick={() => setQuitModalVisible(false)}>Stay</button>
                        <button type="button" className="qm-confirm-ok qm-confirm-ok--danger" onClick={handleQuitAssessment}>Quit & Submit</button>
                    </div>
                </div>
            </Modal>

            {/* ── Submit modal ── */}
            <Modal open={showSubmitModal} footer={null} width={420} closable={false} maskClosable={false} className="qm-confirm-modal">
                <div className="qm-confirm-body">
                    <div className="qm-confirm-icon qm-confirm-icon--success">
                        <MdCheckCircle size={24} />
                    </div>
                    <h4 className="qm-confirm-title">Submit Assessment?</h4>
                    <p className="qm-confirm-text">
                        {quizQuestions?.length - Object.keys(selectedAnswers).length > 0
                            ? Object.keys(selectedAnswers).length === 0
                                ? 'You have not attempted at least one question. Are you sure you want to submit?'
                                : `${quizQuestions?.length - Object.keys(cleanedObj).length} question(s) are unanswered. Are you sure you want to submit?`
                            : 'You have answered all questions. Are you sure you want to submit?'}
                    </p>
                    <div className="qm-confirm-actions">
                        <button type="button" className="qm-confirm-cancel" onClick={() => setShowSubmitModal(false)}>Review</button>
                        <button type="button" className="qm-confirm-ok" onClick={handleFinalSubmit}>Yes, Submit</button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};
