import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;
/** Light density — reduced for smoother performance. */
const N = 48;

type Pt = {
	nx: number;
	ny: number;
	phase: number;
	spark: number;
	color: string;
};

function placeNormalized(): { nx: number; ny: number } {
	const r = Math.random();
	/* Rim + interior (16 nodes are always seeded top-right in initPoints) */
	if (r < 0.22) {
		return { nx: Math.random(), ny: Math.random() * 0.12 };
	}
	if (r < 0.42) {
		return { nx: Math.random(), ny: 0.75 + Math.random() * 0.25 };
	}
	if (r < 0.54) {
		return { nx: Math.random() * 0.09, ny: Math.random() };
	}
	if (r < 0.66) {
		return { nx: 0.91 + Math.random() * 0.09, ny: Math.random() };
	}
	return { nx: Math.random(), ny: Math.random() };
}

function initPoints(): Pt[] {
	const colors = [
		'14, 165, 233', // Sky Blue
		'6, 182, 212',  // Cyan
		'56, 189, 248', // Light Blue
		'34, 211, 238'  // Bright Cyan
	];

	const headerTopRight: Pt[] = Array.from({ length: 10 }, () => ({
		nx: 0.56 + Math.random() * 0.44,
		ny: 0.02 + Math.random() * 0.16,
		phase: Math.random() * TAU,
		spark: Math.random() * TAU,
		color: colors[Math.floor(Math.random() * colors.length)]
	}));
	const rest = Array.from({ length: N - headerTopRight.length }, () => {
		const { nx, ny } = placeNormalized();
		return {
			nx,
			ny,
			phase: Math.random() * TAU,
			spark: Math.random() * TAU,
			color: colors[Math.floor(Math.random() * colors.length)]
		};
	});
	return [...headerTopRight, ...rest];
}

type DashboardShellNetworkProps = {
	/** Extra class names (e.g. sidebar wrapper for scoped opacity). */
	className?: string;
	/** When true, stop the rAF loop (e.g. narrow sidebar rail — saves CPU during layout). */
	suspendLoop?: boolean;
};

/**
 * Plexus-style mesh (light cyan lines + small nodes) — matches airy tech / constellation reference.
 */
const DashboardShellNetwork = ({ className, suspendLoop = false }: DashboardShellNetworkProps) => {
	const wrapRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const ptsRef = useRef<Pt[]>(initPoints());
	const reduceMotionRef = useRef(false);

	useEffect(() => {
		if (suspendLoop) {
			return;
		}

		reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onMq = () => {
			reduceMotionRef.current = mq.matches;
		};
		mq.addEventListener('change', onMq);

		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		if (!wrap || !canvas) {
			mq.removeEventListener('change', onMq);
			return;
		}

		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) {
			mq.removeEventListener('change', onMq);
			return;
		}

		let raf = 0;
		/** Avoid resetting canvas buffer every rAF while parent width is animating (very expensive). */
		let lastBufW = -1;
		let lastBufH = -1;
		const dprCap = () => Math.min(window.devicePixelRatio || 1, 2);

		const draw = (t: number) => {
			const w = wrap.clientWidth;
			const h = wrap.clientHeight;
			if (w < 2 || h < 2) {
				raf = requestAnimationFrame(draw);
				return;
			}

			const rw = Math.round(w);
			const rh = Math.round(h);
			const dpr = dprCap();
			const nextBufW = Math.floor(rw * dpr);
			const nextBufH = Math.floor(rh * dpr);
			if (nextBufW !== lastBufW || nextBufH !== lastBufH) {
				lastBufW = nextBufW;
				lastBufH = nextBufH;
				canvas.width = nextBufW;
				canvas.height = nextBufH;
				canvas.style.width = `${rw}px`;
				canvas.style.height = `${rh}px`;
			}

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);

			const dark = document.body.classList.contains('dark-theme');
			const rm = reduceMotionRef.current;
			const amp = rm ? 0 : 1;
			let pts = ptsRef.current;
			if (pts.length !== N) {
				ptsRef.current = initPoints();
				pts = ptsRef.current;
			}

			const xs: number[] = new Array(N);
			const ys: number[] = new Array(N);
			for (let i = 0; i < N; i++) {
				const p = pts[i];
				xs[i] = p.nx * w + Math.sin(t * 0.00032 + p.phase) * 11 * amp;
				ys[i] = p.ny * h + Math.cos(t * 0.00026 + p.phase * 1.07) * 9 * amp;
			}

			const minDim = Math.min(w, h);
			const linkNear = minDim * 0.195;
			const linkFar = linkNear * 1.42;

			const lineRgb = dark ? '125, 211, 252' : '56, 189, 248';
			const lineRgbSoft = dark ? '186, 230, 253' : '125, 211, 252';

			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			for (let i = 0; i < N; i++) {
				for (let j = i + 1; j < N; j++) {
					const dx = xs[i] - xs[j];
					const dy = ys[i] - ys[j];
					const d = Math.hypot(dx, dy);
					if (d < linkNear) {
						const f = 1 - d / linkNear;
						const a = (dark ? 0.72 : 0.62) * f * f;
						ctx.strokeStyle = `rgba(${pts[i].color},${a.toFixed(4)})`;
						ctx.lineWidth = 1.0 + f * 0.8;
						ctx.beginPath();
						ctx.moveTo(xs[i], ys[i]);
						ctx.lineTo(xs[j], ys[j]);
						ctx.stroke();
					} else if (d < linkFar) {
						const f = 1 - (d - linkNear) / (linkFar - linkNear);
						const a = (dark ? 0.44 : 0.38) * f * f;
						ctx.strokeStyle = `rgba(${pts[j].color},${a.toFixed(4)})`;
						ctx.lineWidth = 0.75;
						ctx.beginPath();
						ctx.moveTo(xs[i], ys[i]);
						ctx.lineTo(xs[j], ys[j]);
						ctx.stroke();
					}
				}
			}

			for (let i = 0; i < N; i++) {
				const p = pts[i];
				const tw = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * 0.0028 + p.spark));
				const cx = xs[i];
				const cy = ys[i];
				const r = 2.2 + tw * 1.2;

				ctx.shadowBlur = rm ? 0 : 10 + tw * 14;
				ctx.shadowColor = `rgba(${p.color}, ${dark ? 0.75 + tw * 0.2 : 0.65 + tw * 0.3})`;

				ctx.fillStyle = dark ? `rgba(255, 255, 255, ${0.82 + tw * 0.18})` : `rgba(${p.color}, ${0.88 + tw * 0.12})`;
				ctx.beginPath();
				ctx.arc(cx, cy, r, 0, TAU);
				ctx.fill();

				ctx.shadowBlur = 0;
				ctx.fillStyle = '#fff';
				ctx.beginPath();
				ctx.arc(cx, cy, r * 0.45, 0, TAU);
				ctx.fill();
			}

			raf = requestAnimationFrame(draw);
		};

		raf = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(raf);
			mq.removeEventListener('change', onMq);
		};
	}, [suspendLoop]);

	return null; // node network disabled app-wide
};

export default DashboardShellNetwork;
