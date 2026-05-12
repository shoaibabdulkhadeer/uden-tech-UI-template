/**
 * Decorative hero — colorful 3D-style cube cluster (app-store / clay vibe), AI + learning hints.
 * Bright faces on soft studio backdrop; works without raster assets.
 */
const AiLearningPathsHeroArt = ({ className = '' }: { className?: string }) => (
	<svg
		className={className}
		viewBox="0 0 200 200"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden
	>
		<defs>
			<radialGradient id="ai-hero-studio" cx="50%" cy="42%" r="65%">
				<stop offset="0%" stopColor="#f8fafc" />
				<stop offset="45%" stopColor="#eef2ff" />
				<stop offset="100%" stopColor="#e0e7ff" />
			</radialGradient>
			<linearGradient id="ai-hero-floor" x1="50%" y1="0%" x2="50%" y2="100%">
				<stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
				<stop offset="40%" stopColor="#a78bfa" stopOpacity="0.15" />
				<stop offset="100%" stopColor="#f472b6" stopOpacity="0.08" />
			</linearGradient>
			<linearGradient id="ai-hero-cube-body" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#64748b" />
				<stop offset="100%" stopColor="#475569" />
			</linearGradient>
			<linearGradient id="ai-hero-cube-top" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stopColor="#94a3b8" />
				<stop offset="100%" stopColor="#64748b" />
			</linearGradient>
			<linearGradient id="ai-hero-cube-side" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stopColor="#78716c" />
				<stop offset="100%" stopColor="#57534e" />
			</linearGradient>
			{/* Center “hero” face — electric purple → cyan */}
			<linearGradient id="ai-hero-face-main" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#a855f7" />
				<stop offset="50%" stopColor="#6366f1" />
				<stop offset="100%" stopColor="#22d3ee" />
			</linearGradient>
			<linearGradient id="ai-hero-face-coral" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#fb7185" />
				<stop offset="100%" stopColor="#f97316" />
			</linearGradient>
			<linearGradient id="ai-hero-face-sky" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#38bdf8" />
				<stop offset="100%" stopColor="#3b82f6" />
			</linearGradient>
			<linearGradient id="ai-hero-face-mint" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#4ade80" />
				<stop offset="100%" stopColor="#22c55e" />
			</linearGradient>
			<linearGradient id="ai-hero-face-violet" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#c084fc" />
				<stop offset="100%" stopColor="#818cf8" />
			</linearGradient>
			<filter id="ai-hero-shadow" x="-25%" y="-25%" width="150%" height="150%">
				<feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.12" />
			</filter>
			<filter id="ai-hero-glow-soft" x="-30%" y="-30%" width="160%" height="160%">
				<feGaussianBlur stdDeviation="2" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		{/* Studio backdrop */}
		<rect x="0" y="0" width="200" height="200" rx="28" fill="url(#ai-hero-studio)" />
		<ellipse cx="100" cy="172" rx="78" ry="14" fill="url(#ai-hero-floor)" opacity="0.85" />

		{/* Back left cube — coral “tile” */}
		<g filter="url(#ai-hero-shadow)">
			<path
				d="M36 90 L56 80 L76 90 L76 114 L56 124 L36 114 Z"
				fill="url(#ai-hero-cube-body)"
				stroke="rgba(255,255,255,0.2)"
				strokeWidth="0.6"
			/>
			<path d="M56 80 L76 90 L76 114 L56 104 Z" fill="url(#ai-hero-cube-top)" />
			<path d="M36 90 L56 80 L56 104 L36 114 Z" fill="url(#ai-hero-cube-side)" />
			<path d="M44 96 L68 96 L68 112 L44 112 Z" fill="url(#ai-hero-face-coral)" opacity="0.95" />
			<circle cx="56" cy="104" r="5" fill="white" fillOpacity="0.35" />
		</g>

		{/* Back right cube — sky “tile” */}
		<g filter="url(#ai-hero-shadow)">
			<path
				d="M126 84 L148 72 L170 84 L170 110 L148 122 L126 110 Z"
				fill="url(#ai-hero-cube-body)"
				stroke="rgba(255,255,255,0.18)"
				strokeWidth="0.6"
			/>
			<path d="M148 72 L170 84 L170 110 L148 98 Z" fill="url(#ai-hero-cube-top)" />
			<path d="M126 84 L148 72 L148 98 L126 110 Z" fill="url(#ai-hero-cube-side)" />
			<path d="M134 88 L162 88 L162 106 L134 106 Z" fill="url(#ai-hero-face-sky)" opacity="0.95" />
			<path d="M142 92 L154 102 M154 92 L142 102" stroke="white" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
		</g>

		{/* Center hero cube — large gradient face */}
		<g filter="url(#ai-hero-shadow)">
			<path
				d="M70 58 L100 42 L130 58 L130 98 L100 114 L70 98 Z"
				fill="url(#ai-hero-cube-body)"
				stroke="rgba(255,255,255,0.22)"
				strokeWidth="0.75"
			/>
			<path d="M100 42 L130 58 L130 98 L100 82 Z" fill="url(#ai-hero-cube-top)" />
			<path d="M70 58 L100 42 L100 82 L70 98 Z" fill="url(#ai-hero-cube-side)" />
			<path d="M76 62 L100 50 L124 62 L124 90 L100 102 L76 90 Z" fill="url(#ai-hero-face-main)" />
			<path d="M82 56 L108 54 L98 64 Z" fill="white" fillOpacity="0.28" />
			{/* Neural nodes */}
			<circle cx="88" cy="82" r="4.5" fill="white" fillOpacity="0.9" />
			<circle cx="100" cy="74" r="3.8" fill="white" fillOpacity="0.85" />
			<circle cx="112" cy="84" r="3.8" fill="white" fillOpacity="0.88" />
			<path
				d="M88 82 L100 74 M100 74 L112 84 M88 82 L112 84"
				stroke="white"
				strokeOpacity="0.55"
				strokeWidth="1.3"
				strokeLinecap="round"
			/>
		</g>

		{/* Front left — mint + book lines */}
		<g filter="url(#ai-hero-shadow)">
			<path
				d="M42 120 L60 110 L78 120 L78 144 L60 154 L42 144 Z"
				fill="url(#ai-hero-cube-body)"
				stroke="rgba(255,255,255,0.2)"
				strokeWidth="0.6"
			/>
			<path d="M60 110 L78 120 L78 144 L60 134 Z" fill="url(#ai-hero-cube-top)" />
			<path d="M42 120 L60 110 L60 134 L42 144 Z" fill="url(#ai-hero-cube-side)" />
			<path d="M48 124 L72 124 L72 140 L48 140 Z" fill="url(#ai-hero-face-mint)" opacity="0.95" />
			<path d="M52 128 L68 128 M52 132 L64 132" stroke="white" strokeOpacity="0.65" strokeWidth="1.4" strokeLinecap="round" />
		</g>

		{/* Front right — violet chip */}
		<g filter="url(#ai-hero-shadow)">
			<path
				d="M120 126 L142 114 L164 126 L164 152 L142 164 L120 152 Z"
				fill="url(#ai-hero-cube-body)"
				stroke="rgba(255,255,255,0.2)"
				strokeWidth="0.6"
			/>
			<path d="M142 114 L164 126 L164 152 L142 140 Z" fill="url(#ai-hero-cube-top)" />
			<path d="M120 126 L142 114 L142 140 L120 152 Z" fill="url(#ai-hero-cube-side)" />
			<path d="M128 130 L156 130 L156 148 L128 148 Z" fill="url(#ai-hero-face-violet)" opacity="0.96" />
			<rect x="136" y="134" width="12" height="10" rx="1.5" stroke="white" strokeOpacity="0.5" strokeWidth="1" fill="none" />
		</g>

		{/* Subtle rim light */}
		<ellipse cx="100" cy="188" rx="56" ry="6" fill="#22d3ee" fillOpacity="0.06" filter="url(#ai-hero-glow-soft)" />
	</svg>
);

export default AiLearningPathsHeroArt;
