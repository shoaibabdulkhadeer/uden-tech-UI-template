import * as Forge from 'node-forge';
import { isExpired, decodeToken } from 'react-jwt';
import { environment } from '../environments/environment';
import moment from 'moment';
import config from '../util/config';

export const tokenDecoder = (token: any) => {
	const myDecodedToken: any = decodeToken(token);
	const expTokenTime: boolean = isExpired(token);
	return { myDecodedToken, expTokenTime };
};

export function parseDateTime(dateTimeString: string) {
	const options: any = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'Asia/Kolkata',
		hour12: true
	};

	const formattedDateTime = new Intl.DateTimeFormat('en-IN', options)?.format(new Date(dateTimeString));
	return formattedDateTime?.toUpperCase();
}

export const encryptInput = (data: string) => {
	try {
		const rsaPublicKey = Forge.pki.publicKeyFromPem('');

		const encryptedData = rsaPublicKey.encrypt(data, 'RSA-OAEP', {
			md: Forge.md.sha256.create(),
			mgf1: {
				md: Forge.md.sha256.create()
			}
		});

		const encryptedBase64 = Forge.util.encode64(encryptedData);

		return encryptedBase64;
	} catch (error) {
		console.error('Encryption error:', error);
		throw error;
	}
};

export const shortText = (text: string, limit: number) => {
	const maxLength = limit;
	const trimmedText = text?.length > maxLength ? text?.substring(0, maxLength) + '...' : text;
	return trimmedText;
};

export const disabledDate = (current: any) => {
	if (current && current > moment().endOf('day')) {
		return true;
	}
	return current && current < moment().subtract(config.ActivitiesMonthRangeLimit, 'months').startOf('day');
};
