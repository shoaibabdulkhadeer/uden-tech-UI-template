import React from 'react';
import { motion } from 'framer-motion';
import './wave.css';

export type WaveAnimationVariant = 'default' | 'fullWidth';

type WaveAnimationProps = {
	/** `fullWidth`: stretch SVG to container (Skill Badges card footer). */
	variant?: WaveAnimationVariant;
};

const pathsFull = {
	start: 'M0,100 Q87.5,40 165,100 T380,90 V400 H0 Z',
	p1: 'M0,100 Q87.5,120 165,100 T380,90 V400 H0 Z',
	p2: 'M0,100 Q87.5,60 165,100 T380,90 V400 H0 Z',
	p3: 'M0,100 Q87.5,110 165,100 T380,90 V400 H0 Z',
	p4: 'M0,100 Q87.9,40 165,100 T380,90 V400 H0 Z'
};

const pathsDefault = {
	start: 'M0,100 Q87.5,40 165,100 T350,90 V400 H0 Z',
	p1: 'M0,100 Q87.5,120 165,100 T350,90 V400 H0 Z',
	p2: 'M0,100 Q87.5,60 165,100 T350,90 V400 H0 Z',
	p3: 'M0,100 Q87.5,110 165,100 T350,90 V400 H0 Z',
	p4: 'M0,100 Q87.9,40 165,100 T350,90 V400 H0 Z'
};

const WaveAnimation: React.FC<WaveAnimationProps> = ({ variant = 'default' }) => {
	const p = variant === 'fullWidth' ? pathsFull : pathsDefault;
	const fullWidth = variant === 'fullWidth';

	return (
		<div className={`wave-wrapper${fullWidth ? ' wave-wrapper--full-width' : ''}`}>
			<svg
				className="wave"
				viewBox="0 0 380 170"
				preserveAspectRatio={fullWidth ? 'none' : 'xMidYMax meet'}
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id={fullWidth ? 'waveGradientFull' : 'waveGradient'} x1="0" y1="0" x2="1" y2="0">
						<stop offset="10%" stopColor="#bfdbfe" stopOpacity="0.9" />
						<stop offset="95%" stopColor="#2563eb" stopOpacity="0.9" />
					</linearGradient>
				</defs>
				<motion.path
					className="wave-path"
					fill={fullWidth ? 'url(#waveGradientFull)' : 'url(#waveGradient)'}
					animate={{
						d: [p.start, p.p1, p.p2, p.p3, p.p4]
					}}
					transition={{
						repeat: Infinity,
						repeatType: 'reverse',
						duration: 8,
						ease: 'easeInOut'
					}}
				/>
			</svg>
		</div>
	);
};

export default WaveAnimation;
