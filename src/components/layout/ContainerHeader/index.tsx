import React from 'react';

const ContainerHeader = ({ title }: any) => {
	return (
		<div className="gx-page-heading">
			<h2 className="gx-page-title">{title}</h2>
		</div>
	);
};

export default ContainerHeader;
