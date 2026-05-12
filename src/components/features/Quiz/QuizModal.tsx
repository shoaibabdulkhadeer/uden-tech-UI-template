// src/components/QuizModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Card, Radio, Button, Tag, Avatar, Tooltip, Modal, Typography, message, Checkbox, Popover, Badge } from 'antd';
import './QuizModal.css';
import { ArrowLeftOutlined, ArrowRightOutlined, EyeInvisibleOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ExamCompleteModal } from './examCompleteModal';
import { useNavigate } from 'react-router-dom';
import { easeInOut, motion } from 'framer-motion';
import { MdTouchApp } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { resetgetQuiz } from '../../../redux/features/Quiz/getQuiz';
import Ribbon from 'antd/lib/badge/Ribbon';
import { resetsubmitQuiz, submitQuizAPI } from '../../../redux/features/Quiz/submitQuiz';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

interface QuizModalProps {
    onClose: () => void;
}

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
            // message.success(submitQuizRes?.message);
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
        // userId: "6836bb0a76f470f3574cb2cb",
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

        // Step 1: Update selectedAnswers
        const updatedSelectedAnswers = {
            ...selectedAnswers,
            [currentQuestion]: normalizedValue,
        };
        setSelectedAnswers(updatedSelectedAnswers);

        // Step 2: Update questionAnswers (immediate per-question save)
        setQuestionAnswers((prevAnswers: any) => {
            const newAnswers = [...prevAnswers];

            newAnswers[currentQuestion] = {
                Question_id: quizQuestions[currentQuestion]?.Question_Id,
                Selected_answer: normalizedValue,
            };

            return newAnswers;
        });

        // Step 3: Update quitQuestionAnswers for all questions
        const allUpdatedAnswers = quizQuestions.map((question: any, index: number) => {
            const selected = updatedSelectedAnswers[index];
            const normalizedAnswer =
                Array.isArray(selected) && selected.length > 0
                    ? selected
                    : [""];

            return {
                Question_id: question.Question_Id ?? '',
                Selected_answer: normalizedAnswer,
            };
        });

        setQuitQuestionAnswers(allUpdatedAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < quizQuestions?.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }

    };



    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleFinalSubmit = () => {
        setSubmitted(true);
        setCurrentQuestion(0);
        setShowSubmitModal(false);
        dispatch(submitQuizAPI(apiPayload))
    };

    const handleSubmit = () => {
        setShowSubmitModal(true);
        setQuestionAnswers((prevAnswers: any) => {
            const newAnswers = [...prevAnswers];

            const selected = selectedAnswers[currentQuestion];
            const normalizedAnswer = Array.isArray(selected) && selected.length > 0
                ? selected
                : [""]

            newAnswers[currentQuestion] = {
                Question_id: quizQuestions[currentQuestion]?.Question_Id ?? '',
                Selected_answer: normalizedAnswer,
            };

            return newAnswers;
        });
    }


    const handleNextClick = () => {
        setClickedNext(true);
        setTimeout(() => setClickedNext(false), 300);
        handleNext();
    };

    const handlePreviousClick = () => {
        setClickedPrev(true);
        handlePrevious()
        setTimeout(() => setClickedPrev(false), 300);
    };



    const handleQuitAssessment = () => {
        if (Object.keys(selectedAnswers).length > 0) {
            setSubmitted(true);
            dispatch(submitQuizAPI(apiPayload))
            setCurrentQuestion(0);
            setShowSubmitModal(false);
            setQuitModalVisible(false);

        } else {
            setQuitModalVisible(false);
            setTopicWiseQuiz(false)
            setTopicId('')

            QuizLPID ? navigate('/dashboard') : setShowQuiz(false);
            resetgetQuiz();
        }
    };


    const ensureArray = (val: unknown): CheckboxValueType[] => {
        return Array.isArray(val) ? val : [];
    };

    const correctAnswer = submitQuizResponse?.results?.[currentQuestion]?.correct_answer || [];
    const selectedAnswer = submitQuizResponse?.results?.[currentQuestion]?.Selected_answer || [];
    const optionsObj = quizQuestions[currentQuestion]?.Options?.[0] || {};

    const getTagColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'low':
                return 'green';
            case 'medium':
                return 'blue';
            case 'high':
                return 'volcano';
            default:
                return 'default';
        }
    };


    return (
        <motion.div className="phase2-quiz-modal-root" initial={{ x: 300, opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, ease: easeInOut }}>
            <Card size='small' className='shadow phase2-glass phase2-card-interactive' title={<div className='quiz-card-main-title'>
                <div className='gx-d-flex gx-align-items-center'>
                    <img
                        src="/assets/images/startup.gif"
                        className="gx-mr-1"
                        alt="success-img"
                        style={{
                            width: 40,
                            height: 35
                        }}
                    /> <p className='card-titles gx-p-0 gx-m-0 gx-mt-1'>Multiple Choice Question Test {quizTitle && <span style={{ color: 'brown' }}> - {quizTitle}</span>}</p>
                </div>
                {!submitted ?
                    <Tooltip title="Quit Assessment" placement="topLeft">
                        <Button
                            type="text"
                            onClick={() => setQuitModalVisible(true)}
                            style={{ border: 'none', backgroundColor: 'transparent' }}
                            className='gx-pt-2'
                            size='small'
                        >
                            <img
                                src="../assets/images/quit.png"
                                className="quit-image"
                                alt="Quit"
                            />
                        </Button>
                    </Tooltip>
                    :
                    <div>
                        <Tooltip title={QuizLPID ? "Back to dashboard " : "Back to learning path"} placement="topLeft">
                            <img
                                src="../assets/images/back.png"
                                className="back-image"
                                onClick={() => (QuizLPID ? navigate('/dashboard') : setShowQuiz(false), setTopicWiseQuiz(false), setTopicId(''))}
                                style={{ cursor: 'pointer' }}
                            />
                        </Tooltip>
                    </div>}
            </div>}>
                <div className="">
                    <div className="quiz-container">
                        <div className='gx-d-flex gx-justify-content-between gx-mb-1 gx-px-2 gx-py-1' style={{ width: "100%" }}>
                        <p className="gx-fs-md gx-p-0 gx-m-0 gx-d-flex gx-align-items-center"><MdTouchApp size={20} className='gx-mr-1 gx-m-0 gx-p-0' color='#0469B9' /> Choose the appropriate option among the following.</p>
                        instructions

                            <div className='gx-d-flex'>
                                <p className='gx-m-0 gx-mr-2 gx-pt-1 gx-mt-1' style={{ color: 'purple' }}>
                                    Question {currentQuestion + 1} - {quizQuestions?.length}
                                </p>
                                <Tag
                                    className='gx-mt-1'
                                    color={getTagColor(quizQuestions[currentQuestion]?.level)}
                                >
                                    Difficulty Level - {quizQuestions[currentQuestion]?.level}
                                </Tag>
                            </div>
                        </div>
                        <Ribbon
                            text={
                                <span>
                                    Skill : {quizQuestions[currentQuestion]?.skill}
                                </span>
                            }
                            className="gx-bg-purple"
                        >
                            <Card className="gx-m-0 gx-p-1 quiz-cardshadow phase2-quiz-question-card" size="small" key={quizQuestions[currentQuestion]?.Question_id}>
                                <div className='gx-d-flex gx-fs-md gx-py-2 gx-px-2 gx-mr-2 gx-m-0 gx-mb-3 gx-pt-1 gx-align-items-center' style={{ backgroundColor: "#f1f5f9", minHeight: '35px', borderRadius: "10px" }}>
                                    <p className="gx-font-weight-semi-bold " style={{ margin: 0, paddingRight: '14px' }}>
                                        {currentQuestion + 1}. {quizQuestions[currentQuestion]?.Question}
                                    </p>
                                </div>
                                {quizQuestions[currentQuestion]?.Option_type === 'radio' &&
                                    <Radio.Group
                                        onChange={handleAnswerChange}
                                        value={selectedAnswers[currentQuestion]?.[0] || undefined}
                                        className="quiz-options gx-d-flex gx-flex-column"
                                        disabled={submitted}
                                    >
                                        {
                                            Object.entries(quizQuestions[currentQuestion]?.Options[0] || {}).map(([key, value]: any) => {
                                                const isCorrect = correctAnswer.includes(value);
                                                const isSelected = selectedAnswer.includes(value);
                                                let optionClass = '';

                                                if (submitted) {
                                                    if (isCorrect) optionClass = 'correct';
                                                    else if (isSelected && !isCorrect) optionClass = 'wrong';
                                                }
                                                return (
                                                    <Radio
                                                        key={key}
                                                        value={value}
                                                        className={`quiz-option gx-m-0 gx-p-1 ${optionClass}`}
                                                    >
                                                        {value}
                                                    </Radio>
                                                );
                                            })
                                        }
                                    </Radio.Group>}
                                {quizQuestions[currentQuestion]?.Option_type === 'checkbox' && (
                                    <Checkbox.Group
                                        value={ensureArray(selectedAnswers[currentQuestion])}
                                        onChange={(checkedValues) =>
                                            handleAnswerChange({ target: { value: checkedValues } })
                                        }
                                        className="quiz-options gx-d-flex gx-flex-column"
                                        disabled={submitted}
                                    >
                                        {Object.entries(quizQuestions[currentQuestion]?.Options[0] || {}).map(
                                            ([key, value]: any) => {
                                                const currentResult = submitQuizResponse?.results?.[currentQuestion];
                                                const isCorrect = correctAnswer.includes(value);
                                                const isSelected = selectedAnswer.includes(value);
                                                let optionClass = '';
                                                if (submitted) {
                                                    if (isCorrect) optionClass = 'correct';
                                                    else if (isSelected && !isCorrect) optionClass = 'wrong';
                                                }
                                                return (
                                                    <Checkbox
                                                        key={key}
                                                        value={value}
                                                        className={`quiz-option small-checkbox gx-m-0 gx-pl-2 gx-p-1 ${optionClass}`}
                                                    >
                                                        {value}
                                                    </Checkbox>
                                                );
                                            }
                                        )}
                                    </Checkbox.Group>
                                )}
                                {/* {quizQuestions[currentQuestion]?.Option_type === 'checkbox' && (
                                    <div className="quiz-options gx-d-flex gx-flex-column">
                                        {Object.entries(quizQuestions[currentQuestion]?.Options[0] || {}).map(([key, value]: any) => {
                                            const currentResult = submitQuizResponse?.results?.[currentQuestion];
                                            const isCorrect = correctAnswer.includes(value);
                                            const isSelected = selectedAnswer.includes(value);
                                            let optionClass = '';
                                            if (submitted) {
                                                if (isCorrect) optionClass = 'correct';
                                                else if (isSelected && !isCorrect) optionClass = 'wrong';
                                            }

                                            const checked = ensureArray(selectedAnswers[currentQuestion])?.includes(value);

                                            return (
                                                <label
                                                    key={key}
                                                    className={`quiz-option gx-m-0 gx-p-1 ${optionClass}`}
                                                    style={{ cursor: submitted ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={value}
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            if (submitted) return;
                                                            const prevAnswers = ensureArray(selectedAnswers[currentQuestion]) || [];
                                                            const updatedAnswers = e.target.checked
                                                                ? [...prevAnswers, value]
                                                                : prevAnswers.filter((ans) => ans !== value);
                                                            handleAnswerChange({ target: { value: updatedAnswers } });
                                                        }}
                                                        disabled={submitted}
                                                        style={{ marginRight: '8px' }}
                                                    />
                                                    {value}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )} */}

                                <Tag
                                    icon={<InfoCircleOutlined style={{ paddingTop: '4px', paddingLeft: "2px" }} />}
                                    className="gx-mb-0 gx-mt-3"
                                    color="orange"
                                    style={{
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        padding: '2px',
                                    }}
                                >
                                    <span style={{ paddingRight: "2px" }}>This question was also asked in top companies such as {(quizQuestions?.[currentQuestion]?.company || []).join(', ')}
                                    </span>
                                </Tag>
                            </Card>
                        </Ribbon>
                        <div className="quiz-footer">
                            <div className={`fancy-button-wrapper prev ${clickedPrev ? 'clicked' : ''}`} onClick={handlePreviousClick}
                            >
                                <div className={`circle gx-mr-1 ${currentQuestion === 0 ? 'disabled-icon' : ''}`}>
                                    <ArrowLeftOutlined />
                                </div>
                                <Button
                                    type="text"
                                    size="small"
                                    disabled={currentQuestion === 0}
                                    className="label gx-pt-2"
                                >
                                    {'Prev'}
                                </Button>
                            </div>
                            <div className='gx-d-flex'>
                                <div>
                                    <Popover trigger="hover"
                                        overlayClassName="explanation-popover"
                                        content={<div>
                                            <Tag color='green'
                                                style={{
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word',

                                                }} className="gx-align-items-center quiz-summary-item gx-m-0">
                                                Correct Answer: {(submitQuizResponse?.results?.[currentQuestion]?.correct_answer || []).join(', ')}
                                            </Tag>
                                            <p className='gx-mt-3'>Reason: {submitQuizResponse?.results?.[currentQuestion]?.explanation}</p>
                                        </div>}
                                        placement="topRight">
                                        <div className='gx-mr-2'>
                                            {submitQuizResponse.length !== 0 && <Button icon={<EyeOutlined />} style={{ borderRadius: '50px', color: 'black' }}>Check Explanation</Button>}
                                        </div>
                                    </Popover>
                                </div>
                                {
                                    currentQuestion < quizQuestions?.length - 1 ? (
                                        <div className='gx-d-flex'>


                                            <div
                                                className={`fancy-button-wrapper next ${clickedNext ? 'clicked' : ''}`}
                                                onClick={handleNextClick}
                                            >
                                                <div className="circle gx-ml-1">
                                                    <ArrowRightOutlined size={35} />
                                                </div>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    className="label gx-pt-2 gx-p-1 gx-mr-1"
                                                    style={{ color: 'white' }}
                                                >
                                                    {'Next'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : !submitted ? (
                                        <Button
                                            onClick={handleSubmit}
                                            className="submit-button"
                                            style={{ backgroundColor: "#73d13d", color: "white", borderRadius: '50px' }}

                                        >
                                            <img
                                                src="/assets/images/submit-img.png"
                                                className="submit-image gx-mr-1 gx-mb-1"
                                                alt="submit"
                                            />
                                            <span className="button-text">Submit</span>
                                        </Button>
                                    ) : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    title={<div><Avatar src="../assets/images/quit-img.gif" size={35} />Quit Assessment</div>}
                    open={quitModalVisible}
                    centered
                    width={400}
                    onOk={() => {
                        handleQuitAssessment();
                    }}
                    onCancel={() => setQuitModalVisible(false)}
                    okText="Yes, Quit"
                    cancelText="No"
                    okButtonProps={{ size: 'small', color: 'red' }}
                    cancelButtonProps={{ size: 'small' }}
                >
               <div>
                    {quizQuestions?.length !== Object.keys(cleanedObj).length ?     <p>You have not attempted {Object.keys(selectedAnswers).length === 0 ? 'atleast one question. are you sure you want to quit the assessment?' : <span>
                        <span style={{ color: 'brown', fontSize: '15px' }}>{quizQuestions?.length - Object.keys(cleanedObj).length === 1 ? '1 question. ' : `${quizQuestions?.length - Object.keys(cleanedObj).length} questions. `} </span>are you sure you want to quit and submit the assessment?
                        </span>} </p> : 'Are you sure you want to quit and submit the assessment ?'}
                    </div>
                </Modal>
                <Modal
                    title={<div><Avatar src="../assets/images/ok.gif" size={35} />Submit Assessment</div>}
                    open={showSubmitModal}
                    onOk={() => {
                        handleFinalSubmit()
                    }}
                    centered
                    width={400}
                    onCancel={() => setShowSubmitModal(false)}
                    okText="Yes, Submit"
                    cancelText="No"
                    okButtonProps={{ size: 'small' }}
                    cancelButtonProps={{ size: 'small' }}
                >
                     <Typography.Text>
                        {quizQuestions?.length - Object.keys(selectedAnswers).length > 0 ? (
                            <p>
                                You have not attempted{" "}
                                {Object.keys(selectedAnswers).length === 0 ? 'atleast one question.' : <span style={{ color: 'brown', fontSize: '15px' }}>
                                    {quizQuestions?.length - Object.keys(cleanedObj).length === 1 ? '1 question. ' : `${quizQuestions?.length - Object.keys(cleanedObj).length} questions. ` } 
                                </span>}
                                are you sure you want to submit the assessment?
                            </p>
                        ) : <p>Are you sure you want to submit the assessment?</p>}
                    </Typography.Text>

                </Modal>

                {submitted && (
                    <div className="quiz-result">
                        <ExamCompleteModal setTopicId={setTopicId} quizQuestions={quizQuestions} setTopicWiseQuiz={setTopicWiseQuiz} submitQuizRes={submitQuizResponse} QuizLPID={QuizLPID} submitQuizloading={submitQuizloading} totalQuestions={quizQuestions?.length} setShowQuiz={setShowQuiz} />
                    </div>
                )}

            </Card>
        </motion.div>
    );
};
