export const specialCharactersNotAllowed = '/<>?\'"+(){}[]-*\\/&|^<>=!#;:`-';

export default {
	specialCharactersNotAllowedMessage: `Please ensure your message does not include any special characters such as: ${specialCharactersNotAllowed}`,
	maxLengthAllowedMessage:`Please ensure your message does not exceed 5000 characters`
};
