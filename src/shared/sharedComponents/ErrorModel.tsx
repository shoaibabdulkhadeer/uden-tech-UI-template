import { CloseCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React from 'react';

interface ModalProps {
	title: string;
	message: string;
	visible: boolean;
	onOk: () => void;
}

const ErrorModel: React.FC<ModalProps> = ({ title, message, visible, onOk }) => {
	const { error } = Modal;

	React.useEffect(() => {
		if (visible) {
			showApprove();
		}
	}, [visible]);
	const showApprove = () => {
		error({
			title: title,
			icon: <CloseCircleOutlined />,
			okText: 'Ok',
			content: message,
			onOk: onOk
		});
	};

	return null;
};

export default ErrorModel;
