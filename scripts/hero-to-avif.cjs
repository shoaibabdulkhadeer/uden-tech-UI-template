/**
 * PNG → AVIF for paths hero art.
 * 1. Save ai-learning-path-cluster.png under public/assets/images/
 * 2. npm i -D sharp
 * 3. npm run hero:avif
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const input = path.join(root, 'public/assets/images/ai-learning-path-cluster.png');
const output = path.join(root, 'public/assets/images/ai-learning-path-cluster.avif');

if (!fs.existsSync(input)) {
	console.error('Missing:', input);
	process.exit(1);
}

// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
const sharp = require('sharp');

sharp(input)
	.avif({ quality: 62, effort: 6 })
	.toFile(output)
	.then(() => console.log('Wrote', output))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
