export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type EmploymentKind = 'fulltime' | 'contract' | 'parttime' | 'internship';

export type JobDetail = {
	employmentType: string;
	posted: string;
	salary?: string;
	description: string;
	responsibilities: string[];
	skills: string[];
};

export type JobItem = {
	id: string;
	title: string;
	company: string;
	location: string;
	logoHue: number;
	verified?: boolean;
	connections?: number;
	badges?: string[];
	hiringStatus?: string;
	employmentKind: EmploymentKind;
	workMode: WorkMode;
	/** Present when this role appears in “Matched for you” (learning-path alignment). */
	matchScore?: number;
	matchReasons?: string[];
	detail: JobDetail;
};

export const EMPLOYMENT_OPTIONS: { label: string; value: EmploymentKind }[] = [
	{ label: 'Full-time', value: 'fulltime' },
	{ label: 'Contract', value: 'contract' },
	{ label: 'Part-time', value: 'parttime' },
	{ label: 'Internship', value: 'internship' },
];

export const WORK_MODE_OPTIONS: { label: string; value: WorkMode }[] = [
	{ label: 'Remote', value: 'remote' },
	{ label: 'Hybrid', value: 'hybrid' },
	{ label: 'On-site', value: 'onsite' }
];

export const MOCK_JOBS: JobItem[] = [
	{
		id: '1',
		title: 'Frontend Engineer II',
		company: 'Amazon',
		location: 'Bengaluru',
		logoHue: 200,
		verified: true,
		connections: 9,
		badges: ['Promoted'],
		employmentKind: 'fulltime',
		workMode: 'onsite',
		matchScore: 94,
		matchReasons: ['Strong overlap with your React path', 'TypeScript matches saved skills'],
		detail: {
			employmentType: 'Full-time',
			posted: '2 days ago',
			salary: 'Competitive · RSU eligible',
			description:
				'Own customer-facing web experiences for internal tools used by thousands of operators. You will partner with design and backend teams to ship accessible, performant interfaces at scale.',
			responsibilities: [
				'Build and maintain React/TypeScript UIs with strong testing and observability.',
				'Collaborate on design systems, component libraries, and web performance budgets.',
				'Mentor peers through code review and lightweight technical design docs.'
			],
			skills: ['React', 'TypeScript', 'Web performance', 'Accessibility', 'GraphQL']
		}
	},
	{
		id: '2',
		title: 'Senior React Developer',
		company: 'Uden Tech',
		location: 'Remote',
		logoHue: 265,
		hiringStatus: 'Actively reviewing applicants',
		badges: ['Easy apply'],
		employmentKind: 'fulltime',
		workMode: 'remote',
		matchScore: 98,
		matchReasons: ['Top pick: aligns with your current learning path', 'Remote matches preference'],
		detail: {
			employmentType: 'Full-time · Remote',
			posted: 'Today',
			description:
				'Shape the learner-facing experience for our learning-path platform: dashboards, generators, and assessment flows. We value clarity, polish, and pragmatic delivery.',
			responsibilities: [
				'Implement features in React with Ant Design and our next-gen design system.',
				'Improve state management, API integration patterns, and error handling.',
				'Participate in roadmap input and lightweight UX iteration with design.'
			],
			skills: ['React', 'Redux', 'REST APIs', 'UI polish', 'Design systems']
		}
	},
	{
		id: '3',
		title: 'UI Engineer',
		company: 'Stripe',
		location: 'Dublin',
		logoHue: 280,
		verified: true,
		connections: 3,
		employmentKind: 'fulltime',
		workMode: 'hybrid',
		matchScore: 86,
		matchReasons: ['Design-system focus matches your UI modules', 'High craft bar similar to your goals'],
		detail: {
			employmentType: 'Full-time',
			posted: '1 week ago',
			salary: 'Market + equity',
			description:
				'Craft precise, trustworthy interfaces for financial products. You care about motion, typography, and resilient layouts across locales and devices.',
			responsibilities: [
				'Ship production UI with attention to edge cases and regulatory clarity.',
				'Partner with brand and content design on cohesive component behavior.',
				'Instrument and iterate using product analytics and qualitative feedback.'
			],
			skills: ['React', 'CSS', 'Design tokens', 'i18n', 'Figma handoff']
		}
	},
	{
		id: '4',
		title: 'Product Engineer',
		company: 'Linear',
		location: 'San Francisco',
		logoHue: 320,
		badges: ['Promoted', 'Easy apply'],
		employmentKind: 'fulltime',
		workMode: 'hybrid',
		matchScore: 79,
		matchReasons: ['Product + engineering blend fits your roadmap interest'],
		detail: {
			employmentType: 'Full-time · Hybrid',
			posted: '4 days ago',
			description:
				'Blend product sense with full-stack execution. You will own slices of the issue tracker from schema to UI, keeping the product fast and opinionated.',
			responsibilities: [
				'End-to-end delivery for features touching React, Node, and Postgres.',
				'Prototype quickly, then harden with tests and operational metrics.',
				'Collaborate with design on interaction details and keyboard workflows.'
			],
			skills: ['React', 'Node.js', 'PostgreSQL', 'Product thinking', 'Performance']
		}
	},
	{
		id: '5',
		title: 'DevOps Engineer',
		company: 'Datadog',
		location: 'Remote',
		logoHue: 40,
		employmentKind: 'contract',
		workMode: 'remote',
		matchScore: 62,
		matchReasons: ['Adjacent to your platform learning goals'],
		detail: {
			employmentType: 'Contract · Remote',
			posted: '3 days ago',
			salary: 'Contract · competitive day rate',
			description:
				'Help teams ship observable systems. Terraform, Kubernetes, and CI pipelines — you improve reliability without slowing delivery.',
			responsibilities: [
				'Maintain and evolve infra-as-code and deployment pipelines.',
				'Partner with product engineering on SLOs, alerts, and incident response.',
				'Document runbooks and reduce toil through automation.'
			],
			skills: ['Kubernetes', 'Terraform', 'CI/CD', 'AWS', 'Observability']
		}
	},
	{
		id: '6',
		title: 'UX Designer',
		company: 'Figma',
		location: 'New York',
		logoHue: 330,
		verified: true,
		employmentKind: 'fulltime',
		workMode: 'hybrid',
		matchScore: 81,
		matchReasons: ['Pairs with your UX fundamentals coursework'],
		detail: {
			employmentType: 'Full-time · Hybrid',
			posted: '5 days ago',
			description:
				'Design flows that feel obvious in hindsight. You prototype in the tool designers actually use and ship with engineering partners.',
			responsibilities: [
				'Lead discovery, journeys, and high-fidelity specs for growth surfaces.',
				'Run lightweight research and synthesize into clear decisions.',
				'Maintain quality through design QA and component adoption.'
			],
			skills: ['Figma', 'Prototyping', 'Research', 'Design systems', 'Storytelling']
		}
	},
	{
		id: '7',
		title: 'Engineering Manager',
		company: 'Notion',
		location: 'San Francisco',
		logoHue: 210,
		badges: ['Leadership'],
		employmentKind: 'fulltime',
		workMode: 'onsite',
		detail: {
			employmentType: 'Full-time',
			posted: '1 week ago',
			salary: 'Competitive + equity',
			description:
				'Grow a team building the workspace for modern teams. Balance people leadership with enough technical fluency to unblock decisions.',
			responsibilities: [
				'Hire, coach, and retain engineers across frontend and platform.',
				'Partner with product and design on roadmap and execution.',
				'Improve engineering practices: reviews, on-call, and career growth.'
			],
			skills: ['People leadership', 'React ecosystem', 'Roadmapping', 'Hiring', 'Communication']
		}
	},
	{
		id: '8',
		title: 'Backend Developer',
		company: 'Shopify',
		location: 'Remote',
		logoHue: 120,
		hiringStatus: 'New posting',
		badges: ['Easy apply'],
		employmentKind: 'fulltime',
		workMode: 'remote',
		matchScore: 74,
		matchReasons: ['REST/API module completion boosts match'],
		detail: {
			employmentType: 'Full-time · Remote',
			posted: 'Today',
			description:
				'Build APIs and services merchants rely on at scale. Ruby and Rails at the core with a growing polyglot edge.',
			responsibilities: [
				'Design and ship APIs with strong contracts and backwards compatibility.',
				'Improve reliability, performance, and data integrity.',
				'Collaborate with frontend partners on end-to-end features.'
			],
			skills: ['Ruby', 'Rails', 'REST', 'PostgreSQL', 'Scaling']
		}
	}
];

const norm = (s: string) => s.toLowerCase().trim();

export function jobMatchesQuery(job: JobItem, query: string): boolean {
	if (!query.trim()) return true;
	const q = norm(query);
	const skillBlob = job.detail.skills.map(norm).join(' ');
	const hay = [job.title, job.company, job.location, skillBlob, job.detail.description].map(norm).join(' ');
	return hay.includes(q);
}

export function filterJobsByEmployment(job: JobItem, kinds: EmploymentKind[]): boolean {
	if (!kinds.length) return true;
	return kinds.includes(job.employmentKind);
}

export function filterJobsByWorkMode(job: JobItem, modes: WorkMode[]): boolean {
	if (!modes.length) return true;
	return modes.includes(job.workMode);
}
