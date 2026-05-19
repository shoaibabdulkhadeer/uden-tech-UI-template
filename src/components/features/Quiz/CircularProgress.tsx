import { useEffect, useState } from 'react';
import { Progress } from 'antd';

export const CircularProgress = ({ percentage, passed }: { percentage: number; passed?: boolean }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setPercent(0);
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= percentage) { clearInterval(interval); return percentage; }
        return prev + 1;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [percentage]);

  const strokeColor = passed
    ? { '0%': '#6366f1', '100%': '#10b981' }
    : { '0%': '#f43f5e', '100%': '#f59e0b' };

  return (
    <Progress
      type="circle"
      percent={percent}
      strokeColor={strokeColor}
      strokeWidth={9}
      size={[120, 120] as any}
      format={() => (
        <span style={{ color: passed ? '#6366f1' : '#f43f5e', fontWeight: 700, fontSize: '22px' }}>
          {Math.round(percent)}%
        </span>
      )}
    />
  );
};
