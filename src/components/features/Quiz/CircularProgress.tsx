import { useEffect, useState } from 'react';
import { Progress } from 'antd';

export const CircularProgress = ({ percentage }: any) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setPercent(0);
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= percentage) {
          clearInterval(interval);
          return percentage;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [percentage]);

  return (
    <div style={{ width: 200 }}>
      <Progress
        type="circle"
        percent={percent}
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
        strokeWidth={10}
        format={() => (
          <span style={{ color: '#fa541c', fontWeight: 400, fontSize: '20px' }}>
            {Math.round(percent)}%
          </span>
        )}
      />
    </div>
  );
};
