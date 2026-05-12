import React from 'react';
import { Modal, Typography, Button, Tag, Card, Rate, Progress, Avatar } from 'antd';
import './examCompleteModal.css';
import { CircularProgress } from './CircularProgress';
import { FaCheckCircle, FaTimesCircle, FaRegCircle } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import Title from 'antd/lib/typography/Title';
import { useNavigate } from 'react-router-dom';

const { Paragraph } = Typography;

interface ExamCompleteModalProps {
  score: number;
  totalQuestions: number;
}

export const ExamCompleteModal = ({ setShowQuiz, setTopicId, QuizLPID, quizQuestions, submitQuizRes, submitQuizloading, setTopicWiseQuiz }: any) => {
  const [visible, setVisible] = React.useState(true);
  const navigate = useNavigate()
  const handleClose = () => {
    setVisible(false);
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  const getPercentage = () => {
    if (submitQuizRes?.score === 0) return 0;
    const percentage = quizQuestions?.length > 10 ? (submitQuizRes?.score / Number(quizQuestions?.length * 4)) * 100 : (submitQuizRes?.score / Number(quizQuestions?.length * 10)) * 100;
    return percentage.toFixed(2);
  }

  const passScore = 40;

  return (
    <Modal
      open={visible}
      centered
      closable={false}
      footer={null}
      width='600px'
      className="exam-complete-modal gx-py-0"
      style={{ top: '10px', height: '700px', padding: '0' }}
    >
      {submitQuizloading ?
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            width: '100%',
          }}
        >
          <LoadingOutlined style={{ fontSize: 32 }} />
        </div> :
        (<>
          <div className="gx-d-flex gx-flex-column gx-align-items-center">
            <div className='gx-d-flex'>
              <Avatar src={submitQuizRes?.score >= 40 ? "../assets/images/happy.gif" : "../assets/images/sad_emoji.gif"} size={32} className='gx-mr-1' />
              <Paragraph className="exam-complete-message gx-mt-2">{submitQuizRes?.report_status}</Paragraph>
            </div>
          </div>
          <Card className='quiz-cardshadow gx-w-100 gx-mb-2'>
            <div className='gx-d-flex gx-justify-content-between gx-align-items-center gx-mb-0'>
              <div className='gx-flex-column gx-justify-content-center'>
                <h1>Overall Rating</h1>
                <Title level={2} className='gx-m-0'>{submitQuizRes?.overall_score}/5</Title>
                <Rate
                  allowHalf
                  disabled
                  value={submitQuizRes?.overall_score || 0}
                />
                <div className='gx-d-flex gx-pt-3 gx-mr-2 gx-px-2 gx-mt-4 gx-mb-2 gx-align-items-center' style={{ backgroundColor: "#f1f5f9", height: '38px', borderRadius: "10px" }}>
                  <p>Based on Correct answers {submitQuizRes?.totalQuestions > 10 ? '(each correct answer = 4 points)' : '(each correct answer = 10 points)'}</p>
                </div>
              </div>
              <div>
                <div className="gx-w-100 gx-mb-0" style={{ width: '280px', minHeight: '100px', maxHeight: '240px', overflowY: 'auto', overflowX: 'hidden' }}>
                  {submitQuizRes?.heat_map?.map((IndividualSkill: any, index: number) => (
                    <div key={index} className="skill-row" style={{ width: '100%', padding: '2px 0', marginBottom: '2px' }}>
                      <div className="skill-info gx-flex-column">
                        <div className="skill-info-header gx-d-flex gx-justify-content-between  gx-mb-0 gx-pb-0" style={{ width: '250px' }}>
                          <p
                            className="skill-name"
                            style={{
                              color: IndividualSkill?.skill_type === 'Mandatory' ? 'green' : 'inherit',
                            }}
                          >
                            {IndividualSkill?.skill}
                            {IndividualSkill?.skill_type === 'Mandatory' && <span style={{ color: 'red' }}> *</span>}
                          </p>
                          <p className="skill-rating">{IndividualSkill?.score}/5</p>
                        </div>
                        <Progress
                          percent={IndividualSkill?.score * 20}
                          showInfo={false}
                          strokeColor="#FADB14"
                          size='default'
                          className='gx-mb-0 gx-pb-0'
                        />
                        {IndividualSkill?.status && <p
                          style={{
                            textAlign: 'start',
                            color:
                              (IndividualSkill?.skill_type === 'Mandatory' && IndividualSkill?.score >= 3) ||
                                (IndividualSkill?.skill_type === 'Optional' && IndividualSkill?.score >= 2)
                                ? '#0586f7'
                                : '#d46b08',
                          }}
                          className="gx-mb-0 gx-mt-0 skill-note"
                        >
                          {IndividualSkill.status}
                        </p>}

                      </div>
                      <hr className='gx-mt-2 gx-mb-1' />
                    </div>

                  ))}

                </div>
              </div>
            </div>
          </Card>
          <div className='gx-d-flex gx-align-items-center gx-justify-content-between gx-m-0 gx-pt-0'>
            <Card className='gx-w-50 quiz-cardshadow gx-mr-2 gx-mb-3 gx-d-flex gx-justify-content-center' size='small'>
              <div >
                <CircularProgress percentage={getPercentage()} />
                <h3 className="gx-mb-1 gx-font-weight-semi-bold gx-mr-4">Score : {submitQuizRes?.score}/100</h3>
              </div>
            </Card>
            <Card className='gx-w-50 quiz-cardshadow gx-d-flex gx-mb-3 gx-justify-content-center gx-align-items-center' style={{ height: '180px' }} size='small'>
              <div className="quiz-summary gx-d-flex gx-flex-column gx-align-items-start ">
                <div>
                  <Tag color='orange' className='gx-ml-2 gx-mb-1'>Total Questions : {submitQuizRes?.totalQuestions}</Tag>
                </div>
                <div style={{ marginLeft: "13px" }}>
                  <Tag color='geekblue' className='gx-ml-2 gx-mb-1'>Pass Score : {40}</Tag>
                </div>
                <p className="gx-d-flex gx-align-items-center quiz-summary-item">
                  <FaCheckCircle className="quiz-icon correct-icon" />
                  {submitQuizRes?.correctAnswers === 1 ? '1 Correct answer' : `${submitQuizRes?.correctAnswers} Correct answers`} 
                </p>
                <p className="gx-d-flex gx-align-items-center quiz-summary-item">
                  <FaTimesCircle className="quiz-icon wrong-icon" />
                  {submitQuizRes?.WrongAnswers === 1 ? '1 Wrong answer' : `${submitQuizRes?.WrongAnswers} Wrong answers` }
                </p>
                <p className="gx-d-flex gx-align-items-center quiz-summary-item">
                  <FaRegCircle className="quiz-icon unanswered-icon" />
                  {submitQuizRes?.unattemptedQuestions} Unanswered
                </p>
              </div>
            </Card>
          </div>

          <div className="gx-d-flex gx-justify-content-end gx-m-0" style={{ marginLeft: '80px' }}>
            <div>
              <Button onClick={handleClose} className='gx-mb-0'>Check Answers</Button>
            </div>
            {QuizLPID ? <Button className='back-button-new gx-mb-0' onClick={() => { handleDashboard() }}>Back to Dashboard</Button>
              : <div>
                <Button className='back-button-new gx-mb-0' onClick={() => { setShowQuiz(false), setTopicWiseQuiz(false), setTopicId('') }}>Back to learning path</Button>
              </div>}
          </div>

        </>)}
    </Modal>
  );
};
