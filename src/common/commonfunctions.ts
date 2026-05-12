export const convertTimeGrains = (timeGrains: any) => {
	const TimeGrainEnum: any = {};
	timeGrains.forEach((grain: any) => {
		let label, minutes;
		if (grain.includes('H')) {
			const hours = parseInt(grain.replace(/\D/g, ''));
			label = `${hours} Hour${hours > 1 ? 's' : ''}`;
			minutes = hours * 60;
		} else if (grain.includes('D')) {
			const days = parseInt(grain.replace(/\D/g, ''));
			label = `${days} Day${days > 1 ? 's' : ''}`;
			minutes = days * 24 * 60;
		} else {
			minutes = parseInt(grain.replace(/\D/g, ''));
			label = minutes === 1440 ? '1 Day' : `${minutes} Minute${minutes > 1 ? 's' : ''}`;
		}
		TimeGrainEnum[grain] = { label, value: grain };
	});
	return timeGrains.map((grain: any) => TimeGrainEnum[grain] || { label: 'Unknown', value: grain });
};


export const truncateText = (text = '', maxLength = 250) =>
	text?.length > maxLength ? text?.slice(0, maxLength) + '...' : text;