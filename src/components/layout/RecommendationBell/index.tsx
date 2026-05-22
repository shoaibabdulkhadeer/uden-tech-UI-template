import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdNotifications } from 'react-icons/md';
import { fetchRecommendations } from '../../../redux/features/notifications/recommendationsSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import './recommendation-bell.css';

function playNotificationSound(): void {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    const playTone = (
      frequency: number,
      startTime: number,
      duration: number,
      gainValue: number
    ) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.18, 0.25);
    playTone(1100, now + 0.12, 0.18, 0.2);
    playTone(1320, now + 0.24, 0.22, 0.18);
  } catch {
    // Web Audio API not available — fail silently
  }
}

function getBucketClass(fitBucket: string): string {
  const lower = fitBucket.toLowerCase();
  if (lower.includes('good')) return 'good';
  if (lower.includes('partial')) return 'partial';
  return 'low';
}

const LOGO_COLORS = ['0', '1', '2', '3'] as const;

const RecommendationBell = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { matches, total, status, fetched } = useSelector(
    (state: RootState) => (state as any).recommendationsReducer
  );

  const [open, setOpen] = useState(false);
  const soundPlayedRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Fetch on mount if not already fetched
  // useEffect(() => {
  //   if (!fetched) {
  //     dispatch(fetchRecommendations());
  //   }
  // }, [dispatch, fetched]);

  // Play sound once when data first arrives
  useEffect(() => {
    if (matches.length > 0 && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playNotificationSound();
    }
  }, [matches]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [open]);

  const count = total > 0 ? total : matches.length;

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  // Bell hidden — uncomment below (and re-enable fetch above) when ready
  return null;

  /* return (
    <div className="rec-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className="rec-bell-btn"
        onClick={toggle}
        aria-label="Job recommendations"
        aria-expanded={open}
      >
        <MdNotifications className="rec-bell-icon" />
        {count > 0 && (
          <span className="rec-bell-badge">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {open && (
        <div className="rec-bell-panel" ref={panelRef}>
          <div className="rec-bell-panel-header">
            <div className="rec-bell-panel-header-text">
              <p className="rec-bell-panel-title">Job Matches</p>
              <p className="rec-bell-panel-sub">AI-curated for your profile</p>
            </div>
            <button
              type="button"
              className="rec-bell-panel-close"
              onClick={close}
              aria-label="Close notifications"
            >
              &times;
            </button>
          </div>

          {status ? (
            <div className="rec-notif-loading">
              <div className="rec-notif-skeleton" />
              <div className="rec-notif-skeleton" />
              <div className="rec-notif-skeleton" />
            </div>
          ) : matches.length === 0 ? (
            <div className="rec-notif-empty">
              <MdNotifications className="rec-notif-empty-icon" />
              <p className="rec-notif-empty-text">No notifications for now</p>
            </div>
          ) : (
            <div className="rec-notif-list">
              {matches.map(
                (
                  match: {
                    job_id: string;
                    title: string;
                    company: string;
                    fit_score: number;
                    fit_bucket: string;
                  },
                  index: number
                ) => {
                  const logoColorIndex =
                    LOGO_COLORS[index % LOGO_COLORS.length];
                  const bucketClass = getBucketClass(match.fit_bucket);

                  return (
                    <div className="rec-notif-item" key={match.job_id}>
                      <div
                        className={`rec-notif-logo rec-notif-logo--${logoColorIndex}`}
                      >
                        {match.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="rec-notif-body">
                        <p className="rec-notif-title">{match.title}</p>
                        <p className="rec-notif-company">{match.company}</p>
                        <div className="rec-notif-meta">
                          <span className="rec-notif-score">
                            {match.fit_score}% fit
                          </span>
                          <span
                            className={`rec-notif-bucket--${bucketClass}`}
                          >
                            {match.fit_bucket}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  ); */
};

export default RecommendationBell;
