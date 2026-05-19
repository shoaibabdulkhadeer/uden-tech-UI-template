import React from 'react';
import { Modal, Rate } from 'antd';
import './examCompleteModal.css';
import { CircularProgress } from './CircularProgress';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  MdCheckCircle,
  MdCancel,
  MdRadioButtonUnchecked,
  MdOutlineEmojiEvents,
  MdOutlineSchool,
  MdArrowBack,
  MdSearch,
  MdTrendingUp,
  MdTrendingDown,
} from 'react-icons/md';

export const ExamCompleteModal = ({
  setShowQuiz,
  setTopicId,
  QuizLPID,
  quizQuestions,
  submitQuizRes,
  submitQuizloading,
  setTopicWiseQuiz,
}: any) => {
  const [visible, setVisible] = React.useState(true);
  const navigate = useNavigate();

  const passed = (submitQuizRes?.score ?? 0) >= 40;

  const getPercentage = () => {
    if (!submitQuizRes?.score) return 0;
    const max = quizQuestions?.length > 10
      ? quizQuestions.length * 4
      : quizQuestions.length * 10;
    return parseFloat(((submitQuizRes.score / max) * 100).toFixed(2));
  };

  const handleCheckAnswers = () => setVisible(false);

  const handleBack = () => {
    if (QuizLPID) {
      navigate('/dashboard');
    } else {
      setShowQuiz(false);
      setTopicWiseQuiz(false);
      setTopicId('');
    }
  };

  return (
    <Modal
      open={visible}
      centered
      closable={false}
      footer={null}
      width={640}
      className="ecm-modal"
    >
      {submitQuizloading ? (
        <div className="ecm-loading">
          <LoadingOutlined style={{ fontSize: 36, color: '#6366f1' }} />
          <p>Calculating results…</p>
        </div>
      ) : (
        <div className="ecm-wrap">

          {/* ── Hero banner ── */}
          <div className={`ecm-hero ${passed ? 'ecm-hero--pass' : 'ecm-hero--fail'}`}>
            <img
              src={passed ? '../assets/images/happy.gif' : '../assets/images/sad_emoji.gif'}
              alt=""
              className="ecm-hero-gif"
            />
            <div className="ecm-hero-text">
              <p className="ecm-hero-status">{passed ? 'Congratulations!' : 'Keep Practicing!'}</p>
              <p className="ecm-hero-msg">{submitQuizRes?.report_status}</p>
            </div>
            <span className={`ecm-pass-pill ${passed ? 'ecm-pass-pill--pass' : 'ecm-pass-pill--fail'}`}>
              {passed ? <MdCheckCircle size={13} /> : <MdCancel size={13} />}
              {passed ? 'Passed' : 'Not Passed'}
            </span>
          </div>

          {/* ── Score + Stats row ── */}
          <div className="ecm-score-row">

            {/* Circular score */}
            <div className="ecm-score-tile">
              <CircularProgress percentage={getPercentage()} passed={passed} />
              <p className="ecm-score-label">Score: <strong>{submitQuizRes?.score ?? 0}/100</strong></p>
              <p className="ecm-pass-threshold">Pass threshold: 40 pts</p>
            </div>

            {/* Stats */}
            <div className="ecm-stats-grid">
              <div className="ecm-stat">
                <div className="ecm-stat-icon ecm-stat-icon--indigo">
                  <MdOutlineSchool size={16} />
                </div>
                <div>
                  <p className="ecm-stat-val">{submitQuizRes?.totalQuestions ?? 0}</p>
                  <p className="ecm-stat-lbl">Total Questions</p>
                </div>
              </div>
              <div className="ecm-stat">
                <div className="ecm-stat-icon ecm-stat-icon--violet">
                  <MdOutlineEmojiEvents size={16} />
                </div>
                <div>
                  <p className="ecm-stat-val">{submitQuizRes?.overall_score ?? 0}/5</p>
                  <p className="ecm-stat-lbl">Overall Rating</p>
                </div>
              </div>
              <div className="ecm-stat">
                <div className="ecm-stat-icon ecm-stat-icon--emerald">
                  <MdCheckCircle size={16} />
                </div>
                <div>
                  <p className="ecm-stat-val ecm-val--green">{submitQuizRes?.correctAnswers ?? 0}</p>
                  <p className="ecm-stat-lbl">Correct</p>
                </div>
              </div>
              <div className="ecm-stat">
                <div className="ecm-stat-icon ecm-stat-icon--rose">
                  <MdCancel size={16} />
                </div>
                <div>
                  <p className="ecm-stat-val ecm-val--red">{submitQuizRes?.WrongAnswers ?? 0}</p>
                  <p className="ecm-stat-lbl">Wrong</p>
                </div>
              </div>
              <div className="ecm-stat">
                <div className="ecm-stat-icon ecm-stat-icon--amber">
                  <MdRadioButtonUnchecked size={16} />
                </div>
                <div>
                  <p className="ecm-stat-val ecm-val--amber">{submitQuizRes?.unattemptedQuestions ?? 0}</p>
                  <p className="ecm-stat-lbl">Skipped</p>
                </div>
              </div>
              <div className="ecm-stat ecm-stat--rating">
                <Rate allowHalf disabled value={submitQuizRes?.overall_score ?? 0} className="ecm-stars" />
                <p className="ecm-stat-lbl ecm-rating-note">
                  {quizQuestions?.length > 10 ? '4 pts / correct' : '10 pts / correct'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Skill heatmap ── */}
          {submitQuizRes?.heat_map?.length > 0 && (
            <div className="ecm-heatmap">
              <p className="ecm-section-head">Skill Breakdown</p>
              <div className="ecm-heatmap-list">
                {submitQuizRes.heat_map.map((s: any, i: number) => {
                  const isGood =
                    (s.skill_type === 'Mandatory' && s.score >= 3) ||
                    (s.skill_type === 'Optional' && s.score >= 2);
                  const pct = (s.score / 5) * 100;
                  return (
                    <div key={i} className="ecm-skill-row">
                      <div className="ecm-skill-meta">
                        <span className="ecm-skill-name">
                          {s.skill}
                          {s.skill_type === 'Mandatory' && <span className="ecm-mandatory">*</span>}
                        </span>
                        <span className="ecm-skill-score">{s.score}/5</span>
                      </div>
                      <div className="ecm-skill-bar-track">
                        <div
                          className={`ecm-skill-bar-fill ${isGood ? 'ecm-bar--good' : 'ecm-bar--low'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {s.status && (
                        <p className={`ecm-skill-note ${isGood ? 'ecm-note--good' : 'ecm-note--low'}`}>
                          {isGood ? <MdTrendingUp size={12} /> : <MdTrendingDown size={12} />}
                          {s.status}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="ecm-actions">
            <button type="button" className="ecm-btn-check" onClick={handleCheckAnswers}>
              <MdSearch size={15} />
              Check Answers
            </button>
            <button type="button" className="ecm-btn-back" onClick={handleBack}>
              {QuizLPID ? (
                <>
                  <MdArrowBack size={15} />
                  Back to Dashboard
                </>
              ) : (
                <>
                  <MdArrowBack size={15} />
                  Back to Learning Path
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </Modal>
  );
};
