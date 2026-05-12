import { useId } from 'react';

/**
 * Dashboard header art — stylized launch rocket + trail (distinct from the metrics-cube motif).
 */
const DashboardPageHeadArt = ({ className = '' }: { className?: string }) => {
	const uid = useId().replace(/:/g, '');

	return (
		<svg
			className={className}
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			focusable="false"
		>
			<defs>
				<radialGradient id={`${uid}-sky`} cx="50%" cy="30%" r="75%">
					<stop offset="0%" stopColor="#e0f2fe" stopOpacity="1" />
					<stop offset="45%" stopColor="#bae6fd" stopOpacity="0.55" />
					<stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
				</radialGradient>
				<linearGradient id={`${uid}-nose`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#fb7185" />
					<stop offset="100%" stopColor="#f97316" />
				</linearGradient>
				<linearGradient id={`${uid}-hull`} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="#f8fafc" />
					<stop offset="50%" stopColor="#e2e8f0" />
					<stop offset="100%" stopColor="#cbd5e1" />
				</linearGradient>
				<linearGradient id={`${uid}-fin`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#0ea5e9" />
					<stop offset="100%" stopColor="#0284c7" />
				</linearGradient>
				<linearGradient id={`${uid}-flame`} x1="50%" y1="0%" x2="50%" y2="100%">
					<stop offset="0%" stopColor="#fde047" />
					<stop offset="45%" stopColor="#fb923c" />
					<stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
				</linearGradient>
				<linearGradient id={`${uid}-trail`} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
					<stop offset="35%" stopColor="#22d3ee" stopOpacity="0.45" />
					<stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
				</linearGradient>
				<filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
					<feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#312e81" floodOpacity="0.2" />
				</filter>
				<filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="1.2" result="b" />
					<feMerge>
						<feMergeNode in="b" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<circle cx="50" cy="50" r="48" fill={`url(#${uid}-sky)`} />

			{/* Motion arc behind rocket */}
			<path
				d="M14 72 C 22 48, 38 32, 52 28"
				stroke={`url(#${uid}-trail)`}
				strokeWidth="5"
				strokeLinecap="round"
				fill="none"
				opacity="0.85"
			/>
			<path
				d="M14 72 C 22 48, 38 32, 52 28"
				stroke="white"
				strokeWidth="1.2"
				strokeDasharray="3 5"
				strokeLinecap="round"
				fill="none"
				opacity="0.35"
			/>

			{/* Sparkles */}
			<circle cx="24" cy="36" r="1.8" fill="#38bdf8" opacity="0.9" />
			<circle cx="78" cy="30" r="1.2" fill="#06b6d4" opacity="0.85" />
			<circle cx="82" cy="52" r="1.4" fill="#22d3ee" opacity="0.75" />

			<g filter={`url(#${uid}-soft)`}>
				{/* Exhaust bloom */}
				<ellipse cx="50" cy="79" rx="10" ry="5" fill="#22d3ee" fillOpacity="0.15" />

				{/* Flame */}
				<path
					d="M44 74 Q50 92 56 74 Q52 68 50 72 Q48 68 44 74 Z"
					fill={`url(#${uid}-flame)`}
					filter={`url(#${uid}-glow)`}
				/>

				{/* Fins */}
				<path d="M38 68 L30 78 L40 76 Z" fill={`url(#${uid}-fin)`} stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
				<path d="M62 68 L70 78 L60 76 Z" fill={`url(#${uid}-fin)`} stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />

				{/* Main body */}
				<path
					d="M43 44 L57 44 L56.5 72 L43.5 72 Z"
					fill={`url(#${uid}-hull)`}
					stroke="rgba(148,163,184,0.45)"
					strokeWidth="0.6"
				/>
				<path d="M44 52 L56 52" stroke="rgba(148,163,184,0.35)" strokeWidth="0.5" strokeLinecap="round" />

				{/* Window */}
				<circle cx="50" cy="58" r="5" fill="#0ea5e9" fillOpacity="0.35" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
				<circle cx="50" cy="58" r="2.8" fill="#e0f2fe" fillOpacity="0.95" />

				{/* Nose */}
				<path
					d="M50 24 L58 44 L42 44 Z"
					fill={`url(#${uid}-nose)`}
					stroke="rgba(255,255,255,0.35)"
					strokeWidth="0.5"
					strokeLinejoin="round"
				/>
				<path d="M50 30 L54 40 L46 40 Z" fill="white" fillOpacity="0.22" />
			</g>
		</svg>
	);
};

export default DashboardPageHeadArt;
