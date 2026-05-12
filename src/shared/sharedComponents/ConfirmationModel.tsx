import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ModalProps {
	title: string;
	message: string;
	visible: boolean;
	onOk: () => void;
	onCancel: () => void;
}

const ConfirmationModel: React.FC<ModalProps> = ({ title, message, visible, onOk, onCancel }) => {
	const { confirm } = Modal;

	React.useEffect(() => {
		if (visible) {
			showApprove();
		}
	}, [visible]);
	const showApprove = () => {
		confirm({
			title: title,
			icon: <ExclamationCircleOutlined />,
			okText: 'Yes',
			cancelText: 'No',
			content: message,
			onOk: onOk,
			onCancel: onCancel
		});
	};

	return null;
};

export default ConfirmationModel;
