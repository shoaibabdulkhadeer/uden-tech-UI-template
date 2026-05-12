export function CircleProgress({ percentage }: any) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="circle-progress">
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle className="circle-bg" cx="25" cy="25" r={radius} strokeWidth="4" fill="transparent" />
        <circle
          className="circle-progress-value"
          cx="25"
          cy="25"
          r={radius}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text x="25" y="25" textAnchor="middle" dy=".3em" className="percentage-text">
          {percentage}%
        </text>
      </svg>
    </div>
  )
}
