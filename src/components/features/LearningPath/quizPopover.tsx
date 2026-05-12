// quizAttempts.tsx
import { Button, Popover, Avatar, Progress, Tooltip } from 'antd';
import React from 'react';
import '../LearningPath/quizPopover.css';
import { InfoCircleTwoTone, LoadingOutlined, TrophyFilled } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { viewEachQuizAPI } from '../../../redux/features/Quiz/viewIndividualQuiz';
import { BiChevronRight } from 'react-icons/bi';
import { FaRegEye } from 'react-icons/fa';
interface QuizAttemptsProps {
  setShowQuizAttemptsModal: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  questionsLength: number;
  totalQuiz: any;
  singleSkill?: any;
  viewEachQuizloading: any;
  setMainQuizTitle?: any;
}

const QuizAttempts: React.FC<QuizAttemptsProps> = ({ children, singleSkill, setMainQuizTitle, questionsLength, viewEachQuizloading, setShowQuizAttemptsModal, totalQuiz }: QuizAttemptsProps) => {
  const dispatch = useDispatch();

  const [viewLoadingId, setViewLoadingId] = React.useState(null);

  const handleQuizCompleteModal = (id: any) => {
    { !viewEachQuizloading && setShowQuizAttemptsModal(true) };
    setViewLoadingId(id?.assessmentId);
    dispatch(
      viewEachQuizAPI({
        ...id
      })
    );
  };

  function getScoreColor(score: any) {
    if (score >= 90) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  }
  return (
    <Popover
      overlayClassName="quiz-attempt-popover"
      zIndex={10000}

      content={
        <div className="popover-content gx-p-0">
          <div className="popover-header">
            <div>
              <h3 className="gx-d-flex gx-align-items-center">
                <Avatar
                  src="../assets/images/quiz_test.gif"
                  size={23}
                  className="gx-mr-2 gx-m-0 gx-p-0"
                />
                {singleSkill ? (
                  <span className="gx-d-flex gx-align-items-center">
                    Skill Wise Quiz Attempts - ({singleSkill})
                    <Tooltip
                      placement="top"
                      title={`This is the list of all quizzes you have attempted related to the Main Quiz that covers all topics`}
                    >
                      <InfoCircleTwoTone className="gx-ml-1" />
                    </Tooltip>
                  </span>
                ) : (
                  <span className="gx-d-flex gx-align-items-center">
                    Quiz Attempts
                    <Tooltip
                      placement="top"
                      title={`This is the list of all quizzes you have attempted related to the Main Quiz that covers all topics`}

                    >
                      <InfoCircleTwoTone className="gx-ml-1" />
                    </Tooltip>
                  </span>
                )}
              </h3>
            </div>


          </div>
          <div className="popover-content">
            {totalQuiz?.map((attempt: any, index: any) => (
              <div key={attempt?.id} className="attempt-item">
                <div className="attempt-content">
                  <div className="score-indicator">
                    <div className={`score-circle ${getScoreColor(attempt?.score)}`}>{attempt?.score}</div>
                    {/* <div className={`score-circle`}>{attempt.score}</div> */}
                    <span className="attempt-number">#{index + 1}</span>
                  </div>
                  <div className="attempt-details">
                    <div className="attempt-score">
                      <span className="gx-fs-sm">Score - {attempt?.score}/100</span>
                      {attempt?.score >= 90 && <TrophyFilled className="trophy-icon" />}
                    </div>
                    <div className="attempt-meta">
                      <span>
                        {new Date(attempt?.assessmentSubmitTime)?.toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <div style={{ width: '100%' }} className="gx-d-flex gx-align-items-center">
                      <Progress percent={attempt?.score} status="active" strokeColor="green" format={() => ''} />
                    </div>
                  </div>
                  <Button
                    className="view-button"
                    onClick={() =>
                      handleQuizCompleteModal({
                        attempt: attempt?.attempts,
                        assessmentId: attempt?.assessmentId
                      })
                    }
                  >
                    {(viewEachQuizloading && viewLoadingId === attempt?.assessmentId) ? <LoadingOutlined size={12} /> : <FaRegEye size={12} className="gx-mr-1" />}
                    <span>View</span>
                    <BiChevronRight className="chevron-icon" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      trigger="hover"
      placement="leftTop"
    >
      {children}
    </Popover>
  );
};

export default QuizAttempts;
