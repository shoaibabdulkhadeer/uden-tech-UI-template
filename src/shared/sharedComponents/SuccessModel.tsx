import { CheckCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React from 'react';

interface ModalProps {
	title: string;
	message: string;
	visible: boolean;
	onOk: () => void;
}

const SuccessModel: React.FC<ModalProps> = ({ title, message, visible, onOk }) => {
	const { success } = Modal;

	React.useEffect(() => {
		if (visible) {
			showApprove();
		}
	}, [visible]);
	const showApprove = () => {
		success({
			title: title,
			icon: <CheckCircleOutlined />,
			okText: 'Ok',
			content: message,
			onOk: onOk
		});
	};

	return null;
};

export default SuccessModel;
