import { Avatar, Card, Checkbox, Modal, Popover, Radio, Tag, Tooltip } from "antd";
import { GiSplitCross } from "react-icons/gi";
import Ribbon from "antd/lib/badge/Ribbon";
import '../Quiz/QuizModal.css'
import { InfoCircleOutlined, QuestionCircleFilled } from "@ant-design/icons";
import { BsEmojiFrown, BsEmojiFrownFill, BsEmojiSmile, BsEmojiSmileFill, BsFillRecordFill } from "react-icons/bs";
import { BiBadgeCheck, BiInfoCircle } from "react-icons/bi";

type Option = {
    [key: string]: string | boolean;
    is_correct: boolean;
};

type QuizQuestion = {
    Option_type: "radio" | "checkbox";
    Options: Option[];
    Question_id: string;
    Question_name: string;
    Selected_answer: string[];
    Skills: string;
    correct_answer: string[];
    explanation: string;
    is_correct: boolean;
};


const AttemptedQuizModal = ({ openModal, setShowQuizAttemptModal, individualQuizData }: any) => {
    const QuestionData = individualQuizData?.assessmentDetails
    return (
        <div className="modal">
            <Modal

                closeIcon={<GiSplitCross title="close" size={18} className="gx-m-0 gx-p-0 gx-fs-sm gx-text-danger" />}
                centered
                open={openModal}
                // onOk={() => setOpen(false)}
                onCancel={() => setShowQuizAttemptModal(false)}
                width={1000}
                zIndex={10000}
                footer={null}
                style={{ top: '10px', overflowY: 'auto', height: '95vh' }}
            >
                <div>
                    <div className="quiz-header">
                        <div className='gx-d-flex gx-mb-0 gx-mt-0 gx-align-items-center gx-justify-content-between card-titles'>
                            <div className="gx-d-flex gx-align-items-center gx-mb-0 gx-mt-0">
                                <img
                                    src="/assets/images/pipeline.gif"
                                    className="gx-mr-1"
                                    alt="success-img"
                                    style={{
                                        width: 35,
                                        height: 35
                                    }}
                                />
                                {individualQuizData?.assessmentDetails?.length === 10 ? 'Skill Wise Quiz' : 'Main Quiz'}({individualQuizData?.attempt}) -
                                <div className="gx-ml-2 gx-d-flex gx-align-items-center">
                                    {individualQuizData?.score < 40 ? <BsEmojiFrown color="orange" size={20} className="sad-emoji" />
                                        : <BsEmojiSmile color="#5eeb2f" size={20} className="sad-emoji" />}

                                    <span className="attempted-quiz-status">{individualQuizData?.status}</span>
                                </div>
                            </div>
                            <div className="gx-mr-4 gx-d-flex gx-align-items-center">
                                <div>
                                    {individualQuizData?.assessmentSubmitTime ? (
                                        <div className="gx-d-flex gx-align-items-center">
                                            {/* <BsCalendar2Event color="purple" size={24} className="gx-pb-2 gx-pr-1"/> */}
                                            <img src="/assets/images/date.png" style={{ height: '18px', width: '18px' }} className="gx-mr-1" />
                                            <h5 style={{ color: 'purple' }} className="gx-mb-0 gx-mt-1">
                                                <span className="date-day">{new Date(individualQuizData?.assessmentSubmitTime).getDate()}/</span>
                                                <span className="date-month">{new Date(individualQuizData?.assessmentSubmitTime).toLocaleString('default', { month: 'short' })}/</span>
                                                <span className="date-year">{new Date(individualQuizData?.assessmentSubmitTime).getFullYear()}
                                                </span>
                                            </h5>
                                        </div>
                                    ) : (
                                        'N/A'
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="gx-d-flex gx-w-100 gx-justify-content-between gx-align-items-center gx-mb-2 gx-mt-2">
                            <div className='gx-d-flex'>
                                <Tag className="quiz-info-card gx-d-flex gx-align-items-center">
                                    <QuestionCircleFilled color="purple" style={{ marginRight: 3 }} />
                                    <p className="quiz-info-text">Total Questions - {individualQuizData?.assessmentDetails?.length}</p>
                                </Tag>
                                <Tag className="quiz-info-card gx-d-flex gx-align-items-center">
                                    <BsFillRecordFill color="orange" size={18} style={{ marginRight: 3 }} />
                                    <p className="quiz-info-text">Unattempted : {individualQuizData?.unattemptedQuestions}</p>
                                </Tag>
                                <Tag className="quiz-info-card gx-d-flex gx-align-items-center" style={{ padding: '4px 8px' }}>
                                    <Avatar
                                        src="../assets/images/green.png"
                                        size={18}
                                        style={{ marginRight: 6 }}
                                    />
                                    <p className="quiz-info-text" style={{ margin: 0, fontSize: 13 }}>
                                        Correct answers: {individualQuizData?.correctAnswers}
                                    </p>
                                    {/* <Tooltip title="For skill-wise quiz, each correct answer carries 10 marks">
                                        <div>
                                            <BiInfoCircle color="green" size={18} style={{ marginLeft: 8, cursor: 'pointer' }} />
                                        </div>
                                    </Tooltip> */}

                                </Tag>

                                <Tag className="quiz-info-card gx-d-flex gx-align-items-center">

                                    <Avatar src="../assets/images/circle.png" size={18} style={{ marginRight: 3 }} />
                                    <p className="quiz-info-text">Wrong answers : {individualQuizData?.wrongAnswers}</p>
                                </Tag>
                                <Tag color="purple" style={{ paddingTop: '3px' }}>
                                    Pass Score - 40
                                </Tag>

                            </div>
                            <div className='gx-d-flex gx-align-items-center'>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src="../assets/images/star.png"
                                        alt="star"
                                        style={{
                                            position: 'absolute',
                                            left: '-1px',
                                            height: '29px',
                                            zIndex: 1,

                                        }}
                                    />
                                   <Tag
                                        className="quiz-score-card gx-d-flex gx-align-items-center"
                                        style={{
                                            paddingLeft: '31px',
                                            position: 'relative',
                                            height: '30px',
 
                                        }}
                                        color="#e9f7da"
                                    >
                                        <h2 className="quiz-info-text" style={{ fontSize: '15px', color: '#6b7280' }}>
                                            Score: <span>{individualQuizData?.score}</span>/100
                                        </h2>
                                    </Tag>
                                </div>



                            </div>
                        </div>
                    </div>
                    <div>

                        <div className="quiz-container">
                            {QuestionData?.map((question: QuizQuestion, index: number) => (
                                <div key={question?.Question_id}>
                                    <Ribbon text={`Skill : ${question?.Skills}`} className="gx-bg-purple">
                                        <Card className="gx-m-0 gx-p-2 gx-mb-4 quiz-cardshadow" size="small">
                                            <div
                                                className="gx-d-flex gx-align-items-center gx-fs-md gx-py-2 gx-px-2 gx-m-0 gx-mb-3 gx-pt-1 gx-align-items-center"
                                                style={{ backgroundColor: "#f1f5f9", minHeight: "35px", borderRadius: "10px" }}
                                            >
                                                <div>
                                                    <p className="gx-font-weight-semi-bold" style={{ margin: 0 }}>
                                                        {index + 1}. {question?.Question_name}
                                                    </p>
                                                </div>
                                                <Popover
                                                    trigger="hover"
                                                    overlayClassName="explanation-popover"
                                                    content={
                                                        <div>
                                                            <Tag
                                                                color="green"
                                                                style={{

                                                                    whiteSpace: 'normal',
                                                                    wordBreak: 'break-word',

                                                                }}

                                                                className="gx-align-items-center quiz-summary-item gx-m-0"
                                                            >
                                                                Correct Answer: {
                                                                    Array.isArray(QuestionData[index]?.correct_answer)
                                                                        ? QuestionData[index]?.correct_answer.join(', ')
                                                                        : QuestionData[index]?.correct_answer || ''
                                                                }
                                                            </Tag>

                                                            <p className="gx-mt-2">Reason: {QuestionData[index]?.explanation}</p>
                                                        </div>
                                                    }
                                                    placement="top"
                                                    getPopupContainer={(triggerNode) => triggerNode.parentElement!} // 👈 this keeps it inside the modal
                                                >
                                                    <span style={{ marginLeft: '2px', color: '#FE9900', cursor: 'pointer' }} className="gx-ml-2">    Check Explanation</span>

                                                </Popover>

                                            </div>
                                            {question?.Option_type === "radio" && (
                                                <Radio.Group
                                                    value={question?.Selected_answer?.[0] || undefined}
                                                    className="quiz-options gx-d-flex gx-flex-column"
                                                    disabled={true}
                                                >
                                                    {question?.Options?.map((optionObj: any, idx: number) => {
                                                        const optionKey: any = Object.keys(optionObj).find(key => key.startsWith("option"));
                                                        const value = optionObj[optionKey];
                                                        const isCorrect = optionObj.is_correct;
                                                        const isSelected = question?.Selected_answer?.includes(value);
                                                        let optionClass = "";

                                                        if (isCorrect) optionClass = "correct";
                                                        else if (isSelected && !isCorrect) optionClass = "wrong";

                                                        return (
                                                            <Radio
                                                                key={idx}
                                                                value={value}
                                                                className={`quiz-option gx-m-0 gx-p-1 ${optionClass}`}
                                                            >
                                                                {String(value)}
                                                            </Radio>
                                                        );
                                                    })}
                                                </Radio.Group>
                                            )}

                                            {question?.Option_type === "checkbox" && (
                                                <Checkbox.Group
                                                    value={question?.Selected_answer || []}
                                                    className="quiz-options gx-d-flex gx-flex-column"
                                                    disabled={true}
                                                >
                                                    {question?.Options?.map((optionObj: any, idx: number) => {
                                                        const optionKey: any = Object.keys(optionObj).find(key => key.startsWith("option"));
                                                        const value = optionObj[optionKey];
                                                        const isCorrect = optionObj.is_correct;
                                                        const isSelected = question?.Selected_answer?.includes(value);
                                                        let optionClass = "";

                                                        if (isCorrect) optionClass = "correct";
                                                        else if (isSelected && !isCorrect) optionClass = "wrong";

                                                        return (
                                                            <Checkbox
                                                                key={idx}
                                                                value={value}
                                                                className={`quiz-option small-checkbox gx-m-0 gx-p-1 ${optionClass}`}
                                                            >
                                                                {String(value)}
                                                            </Checkbox>
                                                        );
                                                    })}
                                                </Checkbox.Group>
                                            )}

                                        </Card>
                                    </Ribbon>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </Modal>
        </div>
    );
}

export default AttemptedQuizModal;